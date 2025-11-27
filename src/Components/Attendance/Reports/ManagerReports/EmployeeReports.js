import React, { useEffect, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import Loader from '../../../../Common/CommonComponents/Loader'
import { getAllAttendaceReports } from '../../../../Common/Services/OtherServices'
import Graph from '../../Graphs/Graph'

const EmployeeReports = ({ empObj, employeeList }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // get userdetails from redux
    const [duration, setDuration] = useState(2) // State for duration (e.g day, week, month)
    const [counter, setCounter] = useState(0) // State for prev and next
    const [employee, setEmployee] = useState({
        label: empObj.employeeName,
        value: empObj.employeeId
    }) // State for employee details
    const [attendanceList, setAttendanceList] = useState(null) // State for Attendance list
    const [timesArray, setTimesArray] = useState([]) // State for y-axis times
    const [arrayOfLocalTimes, setArrayOfLocalTimes] = useState([]) // State for local times on y-axis
    const [loading, setLoading] = useState(true) // State for handling loader

    // Fetch attendance with on click
    const onEmployeeSelect = (e) => {
        setEmployee(e)
        getAllEmployeeAttendance(e.value, duration, counter)
    }

    // Fetch attendace to component on mount
    useEffect(() => {
        getAllEmployeeAttendance(empObj.employeeId, duration, counter)
    }, [])

    const getAllEmployeeAttendance = (employeeId, duration, counter) => {
        setLoading(true)
        getAllAttendaceReports({
            entity: 'todayattendance',
            organizationId: userDetails.organizationId,
            employeeId: employeeId,
            duration: duration,
            counter: counter
        })
            .then((res) => {
                if (res) {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        setAttendanceList(res.data)
                        setTimesArray(
                            generateHourlyArray(
                                res.data.maxTime ? res.data.minTime : '18:30',
                                res.data.maxTime ? res.data.maxTime : '42:30'
                            )
                        )
                        setArrayOfLocalTimes(
                            generateHourlyArray1(
                                res.data.maxTime ? res.data.minTime : '18:30',
                                res.data.maxTime ? res.data.maxTime : '42:30'
                            )
                        )
                    }
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // function for change the time period
    const onDurationChange = (value) => {
        setDuration(value)
        getAllEmployeeAttendance(employee.value, value, 0)
        setCounter(0)
    }

    // Function for change the previous state
    const onPrevHandler = () => {
        setCounter(counter + 1)
        getAllEmployeeAttendance(employee.value, duration, counter + 1)
    }

    // Function for change the next state
    const onNextHandler = () => {
        setCounter(counter - 1)
        getAllEmployeeAttendance(employee.value, duration, counter - 1)
    }

    function normalizeTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return {
            hours: hours % 24,
            minutes,
            totalHours: hours
        }
    }

    function roundDownToNearestHour(date) {
        const newDate = new Date(date) // clone to avoid mutation
        newDate.setMinutes(0, 0, 0)
        return newDate
    }

    function generateHourlyArray(startTime, endTime) {
        const start = normalizeTime(startTime)
        const end = normalizeTime(endTime)

        // Create and round start date
        const startDate = roundDownToNearestHour(
            new Date(new Date().setHours(start.hours, start.minutes, 0, 0))
        )

        // Create and round end date
        const rawEndDate = new Date()
        rawEndDate.setHours(end.hours, end.minutes, 0, 0)
        rawEndDate.setDate(rawEndDate.getDate() + Math.floor(end.totalHours / 24))
        let endDate = roundDownToNearestHour(rawEndDate)

        if (end.minutes > 0) {
            endDate.setHours(endDate.getHours() + 1)
        }

        const timeArray = []

        for (
            let current = new Date(startDate);
            current <= endDate;
            current = new Date(current.getTime() + 60 * 60 * 1000) // Add 1 hour
        ) {
            timeArray.push(current.toTimeString().slice(0, 5)) // Format as HH:MM
        }

        return timeArray
    }

    // generation of hours with local time
    function generateHourlyArray1(startTime, endTime) {
        const localStartTime = startTime
        const localEndTime = endTime
        const parseTime = (time) => {
            const [hours, minutes] = time.split(':').map(Number)
            return { hours, minutes }
        }

        const formatTime = (hours, minutes) => {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        }

        const start = parseTime(localStartTime)
        const end = parseTime(localEndTime)

        // Round down the start time to the nearest hour
        const startHour = start.hours
        // Round up the end time to the nearest hour
        const endHour = end.minutes > 0 ? end.hours + 1 : end.hours

        const result = []
        for (let h = startHour; h <= endHour; h++) {
            result.push(formatTime(h, 0)) // Append each hour with ":00"
        }

        return result
    }

    return (
        <>
            <div>
                {/* filter component */}
                <div className="justify-content mb-1">
                    <div style={{ width: '25%', paddingTop: '13px' }}>
                        {employeeList.length > 0 && (
                            <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                <Form.Label column md={6}>
                                    Employee
                                </Form.Label>
                                <Col sm={6}>
                                    <Select
                                        className="datePickerforBetweenDates statusSelect"
                                        classNamePrefix="mySelect"
                                        placeholder=""
                                        defaultValue={employee}
                                        options={employeeList}
                                        onChange={onEmployeeSelect}
                                    />
                                </Col>
                            </Form.Group>
                        )}
                    </div>
                    <div>
                        <div className="text-center">
                            ( {attendanceList && attendanceList.fromDate} &ensp; to &ensp;{' '}
                            {attendanceList && attendanceList.toDate} )
                        </div>
                        <div className="justify-content">
                            <button
                                type="button"
                                className="doubleArrows"
                                onClick={() => onPrevHandler()}
                            >
                                <BsChevronDoubleLeft size={20} />
                            </button>
                            <div
                                className={`timePeriod ${duration == 1 ? 'timePeriodSelected' : ''}`}
                                onClick={() => onDurationChange(1)}
                            >
                                Day
                            </div>
                            <div
                                className={`timePeriod ${duration == 2 ? 'timePeriodSelected' : ''}`}
                                onClick={() => onDurationChange(2)}
                            >
                                Week
                            </div>
                            <div
                                className={`timePeriod ${duration == 3 ? 'timePeriodSelected' : ''}`}
                                onClick={() => onDurationChange(3)}
                            >
                                Month
                            </div>
                            {/* <div className={`timePeriod ${duration == 4 ? 'timePeriodSelected' : ""}`} onClick={() => onDurationChange(4)} >Pay Period</div> */}
                            <button
                                type="button"
                                className="doubleArrows"
                                disabled={counter == 0}
                                onClick={() => onNextHandler()}
                            >
                                <BsChevronDoubleRight
                                    color={counter == 0 && 'lightgray'}
                                    size={20}
                                />
                            </button>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ height: '70vh' }}
                    >
                        <Loader />
                    </div>
                ) : (
                    <div style={{ maxHeight: '72vh', overflowY: 'scroll', paddingTop: '18px' }}>
                        {attendanceList != null && (
                            <Graph
                                dataList={attendanceList.dayWiseList}
                                timesArray={timesArray.reverse()}
                                maxTime={
                                    arrayOfLocalTimes.length > 0
                                        ? arrayOfLocalTimes[arrayOfLocalTimes.length - 1]
                                        : '24:00'
                                }
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default EmployeeReports
