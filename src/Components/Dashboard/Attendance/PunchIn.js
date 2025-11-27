import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import moment from 'moment-timezone'
import Form from 'react-bootstrap/Form'
import {
    getAllPunchInsByDate,
    getAllPunchInsByEmployeeId
} from '../../../Common/Services/OtherServices'
import { save } from '../../../Common/Services/CommonService'
import Modal from 'react-bootstrap/Modal'
import RecentStatistics from './RecentStatistics'
import Loader from '../../../Common/CommonComponents/Loader'
import tzLookup from 'tz-lookup'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { punchInLocationError } from '../../../Common/CommonComponents/CustomizedErrorToastMessages'
import { punchInSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'

const PunchIn = () => {
    // Get user and notification info from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    const { notificationMessages, lastUpdated } = useSelector((state) => state.notificationMessages)
    // State variables
    const [showComment, setShowComment] = useState(false) // Controls comment input for punch out
    const [show, setShow] = useState(false) // Controls modal visibility
    const [timeDifference, setTimeDifference] = useState('00 : 00 : 00') // Real-time punch-in timer
    const [timeDifferenceTotal, setTimeDifferenceTotal] = useState('00 : 00 : 00') // Total work time
    const intervalRef = useRef(null) // For clearing setInterval
    const [data, setData] = useState([]) // Punch-in records
    const [punchIn, setPunchIn] = useState(null) // Is the user currently punched in
    const [lastPunchIn, setLastPunchIn] = useState(null) // Last punch-in/out info
    const [comment, setComment] = useState(null) // User comment on punch-out
    const [loading, setLoading] = useState(true) // Loader state
    const [dayStart, setDayStart] = useState(null) // Start of workday
    const [dayEnd, setDayEnd] = useState(null) // End of workday
    // Re-fetch punch data if notification changes
    useEffect(() => {
        if (typeof notificationMessages === 'string' && notificationMessages.trim() !== '') {
            getCurrentPunch()
            setLoading(true)
        }
    }, [notificationMessages, lastUpdated])
    // Converts date to timezone-specific ISO string
    const dateFormatter = (dateParam, location) => {
        try {
            return moment(dateParam).tz(location.timezone).format('YYYY-MM-DDTHH:mm:ssZ')
        } catch (error) {
            return moment(dateParam).format('YYYY-MM-DDTHH:mm:ssZ')
        }
    }
    // Close modal
    const handleClose = () => {
        setShow(false)
    }

    // Setup punch timer and calculate time difference
    useEffect(() => {
        if (lastPunchIn) {
            if (lastPunchIn.punchIn == false) {
                // If user is punched out
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
                setTimeDifference('00 : 00 : 00')
                setTimeDifferenceTotal(lastPunchIn.workingHours || '00 : 00 : 00')
                setLoading(false)
                return
            }

            if (lastPunchIn.workingHours) {
                // Calculate total time if already recorded
                setTimeDifferenceTotal(
                    getTimeDifferenceNew(lastPunchIn.serverPunchTime, lastPunchIn.workingHours)
                )
            } else {
                setTimeDifferenceTotal('00 : 00 : 00')
            }
            setTimeDifference(getTimeDifference(lastPunchIn.serverPunchTime))
            setLoading(false)
            if (intervalRef.current) clearInterval(intervalRef.current)
            // Start timer to update time difference every second
            intervalRef.current = setInterval(() => {
                const currentTimeDiff = getTimeDifference(lastPunchIn.serverPunchTime)
                const currentTimeDiffTotal = lastPunchIn.workingHours
                    ? getTimeDifferenceNew(lastPunchIn.serverPunchTime, lastPunchIn.workingHours)
                    : currentTimeDiff
                setTimeDifference(currentTimeDiff)
                setTimeDifferenceTotal(currentTimeDiffTotal)
            }, 1000)

            return () => clearInterval(intervalRef.current)
        }
    }, [lastPunchIn])
    // Handles punch in/out click
    const punchInHandler = () => {
        if (punchIn) {
            // Show comment input before punching out
            setShowComment(true)
        } else {
            // Directly punch in
            punchInOut(true)
        }
    }
    // Load current punch data on mount
    useEffect(() => {
        getCurrentPunch()
        setLoading(true)
    }, [])
    // Fetch all punch-ins for selected date
    const getPunchingActivity = () => {
        getAllPunchInsByDate({
            entity: 'attendance',
            id: userDetails.employeeId,
            fromDate: dayStart,
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setData(res.data)
                    setShow(true)
                }
            })
            .catch((err) => {
                if (userDetails.employeeId != 1) {
                    ToastError(err.message)
                }
            })
    }
    // Fetch the current punch-in status for user
    const getCurrentPunch = async () => {
        try {
            const response = await getAllPunchInsByEmployeeId({
                entity: 'attendance',
                organizationId: userDetails.organizationId,
                id: userDetails.employeeId,
                toastErrorMessage:
                    'There seems to be an error in Punch in. Please try after sometime.'
            })

            const data = response.data
            if (data) {
                setLastPunchIn(data)
                setPunchIn(data.punchIn)
                setDayStart(data.dayStart)
                setDayEnd(data.dayEnd)
                setShowComment(false)
                setTimeDifference('00 : 00 : 00')
                setTimeDifferenceTotal('00 : 00 : 00')
            } else {
                // No punch-in data found
                setPunchIn(false)
                setLoading(false)
                setTimeDifference('00 : 00 : 00')
                setTimeDifferenceTotal('00 : 00 : 00')
            }
        } catch (error) {
            setLoading(false)
            if (userDetails.employeeId != 1) {
                ToastError(error.message)
            }
        }
    }
    // Helper to validate if working hours > 0
    const isWorkingHoursValid = (workingHours) => {
        const [hours, minutes, seconds] = workingHours.split(':').map(Number)

        const totalMinutes = hours * 60 + minutes + seconds / 60

        return totalMinutes > 0
    }
    // Get geolocation and timezone
    const getLocation = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                ToastError('Location is not enabled. Please enable location permissions.')
                resolve({ latitude: null, longitude: null, timezone: null })
                return
            }
            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => {
                    try {
                        const timezone = tzLookup(latitude, longitude)

                        resolve({ latitude, longitude, timezone })
                    } catch (error) {
                        ToastError(punchInLocationError)
                        resolve({ latitude, longitude, timezone: null })
                    }
                },
                () => {
                    ToastError(punchInLocationError)
                    resolve({ latitude: null, longitude: null, timezone: null })
                }
            )
        })
    }
    // Handles punch out submit
    const saveAttendance = (e) => {
        e.preventDefault()

        punchInOut(false)
        setComment('')
    }
    // Save punch-in or punch-out to backend
    const punchInOut = async (isPunchIn) => {
        try {
            const location = await getLocation() //this is used get user latitude and longitude

            const obj = {
                employeeId: userDetails.employeeId,
                comment: isPunchIn ? '' : comment,
                latitude: location ? location.latitude : null,
                longitude: location ? location.longitude : null,
                clientPunchTime: dateFormatter(new Date(), location),
                punchIn: isPunchIn,
                shiftTime: userDetails.shiftTime
            }

            const response = await save({
                entity: 'attendance',
                organizationId: userDetails.organizationId,
                screenName: 'Attendance',
                toastSuccessMessage: punchInSuccess({ punched: isPunchIn }),
                body: obj
            })

            if (response) {
                setTimeout(() => {
                    getCurrentPunch();
                }, 500);
            }
            if (response.message) {
                ToastSuccess(response.message)
            }
        } catch (error) {
            ToastError(error.message)
        }
    }
    // Set comment state on input change
    const onInputChange = (e) => {
        setComment(e.target.value)
    }
    // Calculate elapsed time from punch in
    const getTimeDifference = (lastPunchIn) => {
        if (!lastPunchIn) return '00 : 00 : 00' // Handle null or undefined values

        const parts = lastPunchIn.split(' ')
        const timeZone = parts.slice(2).join(' ')
        const now = moment.tz(new Date(), 'YYYY-MM-DD HH:mm:ss', timeZone) // Current time
        const punchInTimeNew = moment.tz(lastPunchIn, 'YYYY-MM-DD HH:mm:ss', timeZone)

        if (!punchInTimeNew || !punchInTimeNew.isValid()) {

            return '00 : 00 : 00' // Return default value for invalid format
        }

        const duration = moment.duration(now.diff(punchInTimeNew))
        const hours = Math.floor(duration.asHours()).toString().padStart(2, '0')
        const minutes = duration.minutes().toString().padStart(2, '0')
        const seconds = duration.seconds().toString().padStart(2, '0')
        return `${hours} : ${minutes} : ${seconds}`
    }
    // Convert working hours string to moment duration
    const parseWorkingHours = (workingHours) => {
        const [hours, minutes, seconds] = workingHours.split(':').map(Number)
        return moment.duration({
            hours,
            minutes,
            seconds
        })
    }
    // Add elapsed time and working time to get total duration
    const getTimeDifferenceNew = (serverPunchTime, workingHours) => {
        const parts = serverPunchTime.split(' ')
        const timeZone = parts.slice(2).join(' ')
        const now = moment.tz(new Date(), 'YYYY-MM-DD HH:mm:ss', timeZone) // Current time
        const punchInTimeNew = moment.tz(serverPunchTime, 'YYYY-MM-DD HH:mm:ss', timeZone)

        if (!punchInTimeNew || !punchInTimeNew.isValid()) {
            return null
        }
        const timeDiffDuration = moment.duration(now.diff(punchInTimeNew))
        const totalDuration = timeDiffDuration.add(parseWorkingHours(workingHours))
        const totalHours = Math.floor(totalDuration.asHours()).toString().padStart(2, '0')
        const totalMinutes = totalDuration.minutes().toString().padStart(2, '0')
        const totalSeconds = totalDuration.seconds().toString().padStart(2, '0')

        const totalWorkingHours = `${totalHours}:${totalMinutes}:${totalSeconds}`
        return totalWorkingHours
    }
    // Format server punch time to readable format
    const serverPunchTimeFormatting = (punch, outputFormat = 'YYYY-MM-DD HH:mm:ss') => {
        try {
            const parts = punch.split(' ')
            const date = parts[0]
            const time = parts[1]
            const timeZone = parts.slice(2).join(' ')
            const dateTimeString = `${date} ${time}`
            const formattedTime = moment
                .tz(dateTimeString, 'YYYY-MM-DD HH:mm:ss', timeZone)
                .format(outputFormat)

            if (!formattedTime || formattedTime === 'Invalid date') {

                return '00 : 00 : 00' // Default value for invalid data
            }

            return formattedTime
        } catch (error) {

            return '00 : 00 : 00' // Default value for errors
        }
    }

    return (
        <>
            <div>
                {/* Main card for Punch In/Out section */}
                <div className="card dashboardPunchInCard">
                    {/* Show loader while data is loading */}
                    {loading ? (
                        <center>
                            <Loader />{' '}
                        </center>
                    ) : (
                        <>
                            {/* Display time since last punch-in if data is available */}
                            <div style={{ paddingBottom: '2px' }}>
                                {punchIn && lastPunchIn && (
                                    <>
                                        {/* Show duration since the last punch-in */}
                                        <span
                                            className="currentTime"
                                            style={{ paddingLeft: '8px' }}
                                        >
                                            {timeDifference}
                                        </span>
                                        {/* Show exact punch-in time formatted */}
                                        <div
                                            className="currentTime"
                                            style={{ fontSize: '11px', paddingLeft: '22px' }}
                                        >
                                            (Since{' '}
                                            {serverPunchTimeFormatting(
                                                lastPunchIn.serverPunchTime,
                                                'HH:mm:ss'
                                            )}
                                            )
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Button to punch in or punch out */}
                            <div
                                className="punchinText"
                                type="button"
                                onClick={userDetails.employeeId !== 1 ? punchInHandler : null}
                            >
                                {punchIn ? 'Punch Out' : 'Punch In'}
                            </div>
                            {/* Comment input form shown conditionally */}
                            <div className="punchInComment">
                                {showComment && (
                                    <form onSubmit={saveAttendance} className="comment-form">
                                        <div className="comment-input-container">
                                            {/* Input field for remarks */}
                                            <div className="input-wrapper">
                                                <Form.Control
                                                    className="comment-input"
                                                    value={comment || ''}
                                                    type="text"
                                                    name="remarks"
                                                    placeholder="Remarks"
                                                    maxLength={30}
                                                    onChange={onInputChange}
                                                />
                                            </div>

                                            {/* Buttons to the right */}
                                            <div className="d-flex buttons-wrapper">
                                                <div
                                                    className="buttons-container"
                                                    style={{ marginRight: '5px' }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={saveAttendance}
                                                        className="action-button green-btn"
                                                    >
                                                        <img src="/dist/SVGs/tick.svg" />
                                                    </button>
                                                </div>
                                                <div className="buttons-container">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowComment(false)}
                                                        className="action-button grey-btn"
                                                    >
                                                        <img src="/dist/SVGs/cross.svg" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                            {/* Link to view full punching activity if working hours are valid */}
                            {lastPunchIn &&
                                lastPunchIn.workingHours &&
                                isWorkingHoursValid(lastPunchIn.workingHours) ? (
                                <div className="link-container">
                                    <a className="recent-statistics" onClick={getPunchingActivity}>
                                        Punching Activity (Total: {timeDifferenceTotal})
                                    </a>
                                </div>
                            ) : (
                                <></>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* Modal to show punching activity in a detailed view */}
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                dialogClassName="employee-custom-model-graph"
            >
                <Modal.Header className="attendanceHeader" closeButton>
                    {/* Modal title with formatted date */}
                    <Modal.Title>
                        Punching Activity for (
                        {lastPunchIn &&
                            serverPunchTimeFormatting(lastPunchIn.serverPunchTime, 'YYYY-MM-DD')}
                        )
                    </Modal.Title>
                </Modal.Header>
                {/* Modal body with chart/component for punching stats */}
                <Modal.Body style={{ paddingTop: '0px', height: '91vh' }}>
                    <div className="center" style={{ paddingLeft: '2%', paddingRight: '2%' }}>
                        {/* RecentStatistics component displays graph/chart based on punch-in data */}
                        <RecentStatistics
                            data={data}
                            dayStart={dayStart}
                            dayEnd={dayEnd}
                            workingHours={lastPunchIn && lastPunchIn.workingHours}
                            breakHours={lastPunchIn && lastPunchIn.breakHours}
                        />
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default PunchIn
