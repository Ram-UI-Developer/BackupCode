import React, { useState, useEffect } from 'react'
import { Button, Col, Form, Modal, Row, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import {
    getDayCapturedHours,
    getHolidayCalendarByLocationId
} from '../../Common/Services/OtherServices'
import DateFormate from '../../Common/CommonComponents/DateFormate'
import { toast } from 'react-toastify'
import moment from 'moment'
import {
    TimesheetRejectById,
    approveTimesheet,
    getAllByOrgIdAndEmpId,
    getAllSubmittedTimesheets,
} from '../../Common/Services/CommonService'
import { ViewFile } from '../../Common/CommonIcons/CommonIcons'
import FileViewer from '../../Common/CommonComponents/FileViewer'
import TimeSheetTable from '../../Common/Table/TimeSheetTable'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'

const ReviewTimeSheet = () => {
    // Login user details
    const userDetails = useSelector((state) => state.user.userDetails)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const onCloseHandler = () => {
        navigate('/authorizeTimesheet')
    }
    const hadleClose = () => {
        setFormData({})
        setShow(false)
        setCharCount(0)
        setVis(false)
    }

    useEffect(() => {
        getTimeSheet()
        handlePreviousDays()
        getAllHolidays()
        onGetHandler()
        getAllDayCapturedHours()
    }, [])

    const [byIdList, setByIdList] = useState([])

    const checkingStatus = byIdList.map((e) => e.status)[0]
    const location = useLocation().state

    const [projectId, setProjectId] = useState()
    const [totalHours, setTotalHours] = useState()
    const [capturedHours, setCapturedHours] = useState({})

    const getAllDayCapturedHours = () => {
        setLoading(true)
        getDayCapturedHours({
            entity: 'attendance',
            weekendDate: location.row.weekendDate,
            organizationId: userDetails.organizationId,
            emplId: location.row.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setCapturedHours(res.data && res.data)
                }
            })
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }
    const dayHours = Object.values(capturedHours).reduce((total, hours) => total + hours, 0)
    const [files, setFiles] = useState([])
    const getTimeSheet = () => {
        getAllSubmittedTimesheets({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            id: location.row.managerId,
            timeSheetId: location.row.id,
            weekendDate: location.row.weekendDate
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setByIdList(res.data ? res.data.timesheetRows : [])
                setTotalHours(res.data && res.data.totalHours)
                setFiles(res.data.files)
                setProjectId(res.data.timesheetRows.map((e) => e.projectId))
            }
            // setDate(res.data.weekendDate)
        })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    const [days, setDays] = useState([])
    const handlePreviousDays = () => {
        let result = []
        for (let i = 0; i < 7; i++) {
            let d = new Date(location.row.weekendDate)
            d.setDate(d.getDate() - i)
            result.push(moment(d).format('YYYY-MM-DD'))
        }
        setDays(result)
        // return (result.join(','));
    }

    const [holidays, setHolidays] = useState([])
    const getAllHolidays = () => {
        // userDetails.locationId
        getHolidayCalendarByLocationId({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            year: '2024',
            locationId: userDetails.locationId
        }).then((res) => {
            setHolidays(res.data ? res.data.map((e) => e.date) : [])
            // setHolidays(res ? res.data : [])
        })
         .catch((err) => {
                console.log(err, 'error')
            })
    }
    const getDayName = (e) => {
        let locale = 'en-US'
        return e.toLocaleDateString(locale, { weekday: 'long' })
    }
    const compareDates = days ? days.filter((e) => holidays.includes(e)) : []
    const dateGet = compareDates ? compareDates.map((e) => getDayName(new Date(e))) : []
    const dayName = dateGet ? dateGet.map((e) => e.toLowerCase()) : []
    const mon = dayName.filter((e) => e == 'monday')
    const tue = dayName.filter((e) => e == 'tuesday')
    const wed = dayName.filter((e) => e == 'wednesday')
    const thur = dayName.filter((e) => e == 'thursday')
    const frid = dayName.filter((e) => e == 'friday')
    const satr = dayName.filter((e) => e == 'saturday')
    const sund = dayName.filter((e) => e == 'sunday')

    const s = byIdList.map((e) => e.sunday)
    const su = s.reduce((a, b) => Number(a) + Number(b), 0)

    const m = byIdList.map((e) => e.monday)
    const mo = m.reduce((a, b) => Number(a) + Number(b), 0)

    const t = byIdList.map((e) => e.tuesday)
    const tu = t.reduce((a, b) => Number(a) + Number(b), 0)

    const w = byIdList.map((e) => e.wednesday)
    const we = w.reduce((a, b) => Number(a) + Number(b), 0)

    const th = byIdList.map((e) => e.thursday)
    const thu = th.reduce((a, b) => Number(a) + Number(b), 0)

    const f = byIdList.map((e) => e.friday)
    const fri = f.reduce((a, b) => Number(a) + Number(b), 0)

    const sa = byIdList.map((e) => e.saturday)
    const sat = sa.reduce((a, b) => Number(a) + Number(b), 0)

    const toatal = su + mo + tu + we + thu + fri + sat

    const getMonthDayName = (e) => {
        let locale = 'en-US'
        return e.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
    }
    const dateMonth = days ? days.map((e) => getMonthDayName(new Date(e))) : []

    // const dayLengt = "july 2"
    // const newString = dateMonth[4].slice(0, 5) + "0" + dateMonth[4].slice(5);

    const newString = dateMonth.map((e) => {
        if (e.length == 5) {
            return e.slice(0, 4) + '0' + e.slice(4)
        }
    })

    const getDatesBetween = (startDate, endDate) => {
        const start = new Date(startDate)
        const end = new Date(endDate)

        const dates = []

        let currentDate = start
        while (currentDate <= end) {
            dates.push(moment(currentDate).format('YYYY-MM-DD'))
            currentDate.setDate(currentDate.getDate() + 1) // Move to the next date
        }

        return dates
    }

    const [leaveList, setLeavesList] = useState([])

    const dates = leaveList.map((e) => getDatesBetween(e.fromDate, e.toDate))

    const lastModifiedDates = dates && dates.flatMap((e) => e)
    const compareLeavDates = days && days.filter((e) => lastModifiedDates.includes(e))

    const dateGets = compareLeavDates ? compareLeavDates.map((e) => getDayName(new Date(e))) : []

    const dayNames = dateGets ? dateGets.map((e) => e.toLowerCase()) : []

    const leaveOnMonady = dayNames.filter((e) => e == 'monday')
    const leaveOnTuseDay = dayNames.filter((e) => e == 'tuesday')
    const leaveOnWed = dayNames.filter((e) => e == 'wednesday')
    const leaveOnThur = dayNames.filter((e) => e == 'thursday')
    const leaveOnFri = dayNames.filter((e) => e == 'friday')

    const onGetHandler = () => {
        setLoading(true)
        getAllByOrgIdAndEmpId({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            empId: location.row.employeeId
        })
            .then((res) => {
                console.log(res.data, 'checkingResponseData')
                if (res.statusCode == 200) {
                    setLeavesList(
                        res.data.filter((e) => {
                            if (e.status == 'Approved') {
                                return e
                            }
                        })
                    )
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    const COLUMNS = [
        {
            Header: (
                <div>
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            Project
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'projectName',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.projectName} open>
                        {row.original.projectName}
                    </Tooltip>
                    <div className="tableLength" style={{ marginLeft: '0.8rem' }}>
                        {row.original.projectName}
                    </div>
                </>
            )
        },

        {
            Header: (
                <div>
                    {dayHours != 0 ? (
                        <>
                            {' '}
                            <tr>
                                <th
                                    style={{
                                        borderBottom: 'none',
                                        borderTop: 'none',
                                        paddingBottom: '0px',
                                        position: 'absolute',
                                        left: '2',
                                        top: '5.2rem',
                                        zIndex: '1'
                                    }}
                                >
                                    Captured Hours
                                </th>
                            </tr>
                            <hr className="timeSheetHeaderLineAuth" style={{ width: '97.9%' }} />
                            <hr className="timeSheetHeaderLineUpAuth" style={{ width: '97.9%' }} />
                            <div class="rectangleForAuth"></div>
                        </>
                    ) : (
                        ''
                    )}

                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            Task Name
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'task',
            Cell: ({ row }) => (
                <>
                    {
                        <Tooltip title={row.original.task} open>
                            {row.original.task}
                        </Tooltip>
                    }

                    <div className="taskLength" style={{ marginLeft: '0.8rem' }}>
                        {row.original.task}
                    </div>
                </>
            )
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor: sund && 'sunday' == 'sunday' ? 'lightgray' : '',
                        color: sund && 'sunday' == 'sunday' ? '#691ACF' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {newString[6] != undefined ? newString[6] : dateMonth[6]}
                        <br />
                    </span>{' '}
                    Sun
                    {dayHours != 0 ? (
                        <tr style={{ background: 'none' }}>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    padding: '0px 0px 10px 14px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.sunday).toFixed(1)}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'sunday',
            Cell: ({ row }) => (
                <div
                    style={{
                        backgroundColor: sund && 'sunday' == 'sunday' ? 'lightgray' : '',
                        color: sund && 'sunday' == 'sunday' ? '#691ACF' : '',
                        borderColor: 'black'
                    }}
                    className="text-wrap text-center widthOfReviewTimeSheet"
                >
                    {row.original.sunday}
                </div>
            ),
            Footer: <div className="text-center text-bold  text-white">{su}</div>
        },

        {
            Header: (
                <div
                    className=" text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnMonady == 'monday' || mon == 'monday' ? 'lightgray' : '',
                        color: leaveOnMonady == 'monday' || mon == 'monday' ? '#691ACF' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {newString[5] != undefined ? newString[5] : dateMonth[5]}
                        <br />
                    </span>{' '}
                    Mon
                    {dayHours != 0 ? (
                        <tr style={{ background: 'none' }}>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    padding: '0px 0px 10px 14px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {capturedHours && Number(capturedHours.monday).toFixed(1)}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'monday',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div
                    className="text-center widthOfReviewTimeSheet"
                    style={{
                        backgroundColor:
                            leaveOnMonady == 'monday' || mon == 'monday' ? 'lightgray' : '',
                        color: leaveOnMonady == 'monday' || mon == 'monday' ? '#691ACF' : '',
                        borderColor: 'black'
                    }}
                >
                    {row.original.monday}
                </div>
            ),
            Footer: <div className=" text-center text-bold text-white">{mo}</div>
        },
        {
            Header: (
                <div
                    className=" text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? 'lightgray' : '',
                        color: leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? '#691ACF' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {newString[4] != undefined ? newString[4] : dateMonth[4]}
                        <br />
                    </span>{' '}
                    Tue
                    {dayHours != 0 ? (
                        <tr style={{ background: 'none' }}>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    padding: '0px 0px 10px 14px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.tuesday).toFixed(1)}{' '}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'tuesday',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div
                    className="text-center widthOfReviewTimeSheet"
                    style={{
                        backgroundColor:
                            leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? 'lightgray' : '',
                        color: leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? '#691ACF' : '',
                        borderColor: 'black'
                    }}
                >
                    {row.original.tuesday}
                </div>
            ),
            Footer: <div className=" text-center text-bold  text-white">{tu}</div>
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnWed == 'wednesday' || wed == 'wednesday' ? 'lightgray' : '',
                        color: leaveOnWed == 'wednesday' || wed == 'wednesday' ? '#691ACF' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {newString[3] != undefined ? newString[3] : dateMonth[3]}
                        <br />
                    </span>{' '}
                    Wed
                    {dayHours != 0 ? (
                        <tr style={{ background: 'none' }}>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    padding: '0px 0px 10px 14px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.wednesday).toFixed(1)}{' '}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'wednesday',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div
                    className="text-center widthOfReviewTimeSheet"
                    style={{
                        backgroundColor:
                            leaveOnWed == 'wednesday' || wed == 'wednesday' ? 'lightgray' : '',
                        color: leaveOnWed == 'wednesday' || wed == 'wednesday' ? '#691ACF' : '',
                        borderColor: 'black'
                    }}
                >
                    {row.original.wednesday}
                </div>
            ),
            Footer: <div className=" text-center text-bold text-white">{we}</div>
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnThur == 'thursday' || thur == 'thursday' ? 'lightgray' : '',
                        color: leaveOnThur == 'thursday' || thur == 'thursday' ? '#691ACF' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {newString[2] != undefined ? newString[2] : dateMonth[2]}
                    </span>
                    <br /> Thu
                    {dayHours != 0 ? (
                        <tr style={{ background: 'none' }}>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    padding: '0px 0px 10px 14px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.thursday).toFixed(1)}{' '}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'thursday',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div
                    className="text-center widthOfReviewTimeSheet"
                    style={{
                        backgroundColor:
                            leaveOnThur == 'thursday' || thur == 'thursday' ? 'lightgray' : '',
                        color: leaveOnThur == 'thursday' || thur == 'thursday' ? '#691ACF' : '',
                        borderColor: 'black'
                    }}
                >
                    {row.original.thursday}
                </div>
            ),
            Footer: <div className=" text-center text-bold  text-white">{thu}</div>
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnFri == 'friday' || frid == 'friday' ? 'lightgray' : '',
                        color: leaveOnFri == 'friday' || frid == 'friday' ? '#691ACF' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {newString[1] != undefined ? newString[1] : dateMonth[1]}
                    </span>
                    <br /> Fri
                    {dayHours != 0 ? (
                        <tr style={{ background: 'none' }}>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    padding: '0px 0px 10px 14px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.friday).toFixed(1)}{' '}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'friday',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div
                    className="text-center widthOfReviewTimeSheet"
                    style={{
                        backgroundColor:
                            leaveOnFri == 'friday' || frid == 'friday' ? 'lightgray' : '',
                        color: leaveOnFri == 'friday' || frid == 'friday' ? '#691ACF' : '',
                        borderColor: 'black'
                    }}
                >
                    {row.original.friday}
                </div>
            ),
            Footer: <div className=" text-center text-bold  text-white">{fri}</div>
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor: satr && 'saturday' == 'saturday' ? 'lightgray' : '',
                        color: satr && 'saturday' == 'saturday' ? '#691ACF' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {newString[0] != undefined ? newString[0] : dateMonth[0]}
                    </span>
                    <br /> Sat
                    {dayHours != 0 ? (
                        <tr style={{ background: 'none' }}>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    padding: '0px 0px 10px 14px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.saturday).toFixed(1)}{' '}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'saturday',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div
                    className="text-center widthOfReviewTimeSheet"
                    style={{
                        backgroundColor: satr && 'saturday' == 'saturday' ? 'lightgray' : '',
                        color: satr && 'saturday' == 'saturday' ? '#691ACF' : '',
                        borderColor: 'black'
                    }}
                >
                    {row.original.saturday}
                </div>
            ),
            Footer: <div className=" text-center text-bold  text-white">{sat}</div>
        },

        {
            Header: (
                <div>
                    {dayHours != 0 ? (
                        <>
                            <tr>
                                <th
                                    style={{
                                        borderBottom: 'none',
                                        borderTop: 'none',
                                        paddingBottom: '0px',
                                        position: 'absolute',
                                        right: byIdList.length == 0 ? '10' : '0.5rem',
                                        top: '5.21rem',
                                        zIndex: '1'
                                    }}
                                >
                                    {dayHours.toFixed(1)}
                                </th>
                            </tr>
                        </>
                    ) : (
                        ''
                    )}

                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            Status
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'status',
            Cell: (row) => {
                if (row.value == 'Rejected') {
                    return <span className="text-danger">Rejected</span>
                } else if (row.value == 'Approved') {
                    return <span className="text-success">Approved</span>
                } else if (row.value == 'Submitted') {
                    return <span className="">Submitted</span>
                } else if (row.value == 'Saved') {
                    return <div className="text-center">Saved</div>
                }
            }
        },

        {
            // Header: <div className="header text-center" >Total</div>,
            Header: (
                <div
                    className="text-center header"
                    style={{
                        whiteSpace: 'wrap',
                        top: '3.5rem',
                        right: '1rem',
                        position: 'absolute'
                    }}
                >
                    {' '}
                    Total
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'totalHours',
            Cell: ({ row }) => {
                const totalH =
                    Number(row.original.monday) +
                    Number(row.original.tuesday) +
                    Number(row.original.wednesday) +
                    Number(row.original.thursday) +
                    Number(row.original.friday) +
                    Number(row.original.saturday) +
                    Number(row.original.sunday)
                return <div className="text-wrap text-center">{totalH.toFixed(2)}</div>
            },
            Footer: <div className=" text-center text-bold  text-white">{toatal.toFixed(2)}</div>
        }
    ]
    const [show, setShow] = useState(false)
    const [status, setStatus] = useState(null)
    const [formData, setFormData] = useState('')

    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const [charCount, setCharCount] = useState(
        formData && formData.reason ? formData.reason.length : 0
    )

    const handleInputChange = (event) => {
        const { value } = event.target
        if (value.length <= 250) {
            setCharCount(value.length)
            onChangeHandler(event)
        }
    }

    const onAuthorizeHandler = (status) => {
        setShow(true)
        setStatus(status)
    }

    const onApproveHandler = () => {
        setLoading(true)
        approveTimesheet({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            id: location.row.id,
            proid: projectId,
            reason: formData.reason
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    toast.success('Timesheet approved successfully.')
                    // setShow(false)
                    navigate('/authorizeTimesheet')
                } else {
                    setLoading(false)
                    toast.error(res.message)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }
    const [vis, setVis] = useState(false)
    const onRejectHandler = () => {
        if (!formData.reason || formData.reason.trim() === '') {
            setVis(true)
        }
         else {
            setLoading(true)
            TimesheetRejectById({
                entity: 'timesheets',
                organizationId: userDetails.organizationId,
                id: location.row.id,
                proid: projectId,
                reason: formData.reason
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        toast.success('Timesheet rejected successfully.')
                        // setShow(false)
                        navigate('/authorizeTimesheet')
                    } else {
                        setLoading(false)
                        toast.error(res.errorMessage)
                    }
                })
                .catch((error) => {
                    setLoading(false)
                    console.log(error)
                })
        }
    }

    const [fileShow, setFileShow] = useState(false)
    const handleFileView = () => {
        setFileShow(true)
    }
    const handleFileViewCloseHandler = () => {
        setFileShow(false)
    }
    return (
        <>
            <section className="section">
                {loading ? <DetailLoader /> : ''}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle="Review Timesheet" />
                                {/* <div style={{ marginBottom: "2px" }}> */}
                                <span
                                    className="add col-sm-5 leftSideHeading"
                                    style={{ marginLeft: '-1.3%' }}
                                >
                                    Employee Name -
                                    <span style={{ fontWeight: '500' }}>
                                        {' '}
                                        {location.row.employeeName}
                                    </span>
                                </span>
                                <span
                                    style={{ float: 'right', marginRight: '2%' }}
                                    className="leftSideHeading"
                                >
                                    Weekend Date -{' '}
                                    <span style={{ fontWeight: '500' }}>
                                        {' '}
                                        {<DateFormate date={location.row.weekendDate} />}
                                    </span>
                                </span>
                                {/* </div>{" "} */}
                                <div className="card-body">
                                    <TimeSheetTable
                                        columns={COLUMNS}
                                        data={byIdList}
                                        tableClasses={true}
                                        footer={true}
                                        timeSheetClassName={'authTimeSheetRow'}
                                        trfooter={'trfooter'}
                                        footerStyle={'timeSheetFooter'}
                                        pageSize="10"
                                    />
                                    {files && files.length > 0 ? (
                                        <span type="button" onClick={() => handleFileView()}>
                                            <ViewFile size="40px" />
                                        </span>
                                    ) : (
                                        ''
                                    )}

                                    <div className="btnCenter" style={{ marginTop: '7%' }}>
                                        <Button
                                            variant="addbtn"
                                            className="Button"
                                            type="button"
                                            disabled={
                                                location.row.status == 'Rejected' ||
                                                location.row.status == 'Approved' ||
                                                checkingStatus == 'Rejected' ||
                                                checkingStatus == 'Approved'
                                            }
                                            onClick={() => onAuthorizeHandler('APPROVED')}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            style={{ marginLeft: '1%' }}
                                            variant="addbtn"
                                            className="Button"
                                            type="button"
                                            disabled={
                                                location.row.status == 'Rejected' ||
                                                location.row.status == 'Approved' ||
                                                checkingStatus == 'Rejected' ||
                                                checkingStatus == 'Approved'
                                            }
                                            onClick={() => onAuthorizeHandler('REJECTED')}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            style={{ marginLeft: '1%' }}
                                            className="Button"
                                            variant="secondary"
                                            type="button"
                                            onClick={onCloseHandler}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal
                show={fileShow}
                onHide={handleFileViewCloseHandler}
                backdrop="static"
                size="lg"
                keyboard={false}
            >
                <Modal.Header closeButton={handleFileViewCloseHandler}>
                    <Modal.Title>Uploaded Files</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="modalBody">
                        <FileViewer documents={files ? files : []} />
                    </div>
                </Modal.Body>

                <div style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '3%' }}>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={handleFileViewCloseHandler}
                    >
                        Close
                    </Button>
                </div>
            </Modal>

            <Modal show={show} onHide={hadleClose} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={hadleClose}>
                    <Modal.Title>
                        {status == 'APPROVED' ? 'Approve' : 'Reject'} Timesheet
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {dayHours != 0 ? (
                        <>
                            {status == 'APPROVED' ? (
                                <>
                                    {totalHours > dayHours ? (
                                        <div className="modalBody">
                                            <div>
                                                The submitted hours are more than the captured hours
                                                for the below timesheet(s)
                                            </div>{' '}
                                            <div>
                                                {' '}
                                                Click on "Approve" if you still want to approve
                                            </div>{' '}
                                            <div>Or</div>{' '}
                                            <div>Click on "Close" to stay on this page.</div>
                                        </div>
                                    ) : (
                                        <div class="col-12">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column md={4}>
                                                    Reason
                                                </Form.Label>
                                                <Col md={7}>
                                                    <Form.Control
                                                        as="textarea"
                                                        required
                                                        maxLength={250}
                                                        onChange={handleInputChange}
                                                        name="reason"
                                                        type="text"
                                                    />
                                                    <div className="d-flex justify-content-end">
                                                        <small>{charCount} / 250 </small>
                                                    </div>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <form onSubmit={onRejectHandler}>
                                    <div class="col-12">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column md={4}>
                                                Reason{' '}
                                                {status == 'REJECTED' && (
                                                    <span className="error">*</span>
                                                )}
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    as="textarea"
                                                    required
                                                    maxLength={250}
                                                    onChange={handleInputChange}
                                                    name="reason"
                                                    type="text"
                                                />
                                                <div className="d-flex justify-content-end">
                                                    <small>{charCount} / 250 </small>
                                                </div>
                                                <p className="error">{vis && 'Required'}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                </form>
                            )}
                        </>
                    ) : (
                        <form onSubmit={onRejectHandler}>
                            <div class="col-12">
                                <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                    <Form.Label column md={4}>
                                        Reason{' '}
                                        {status == 'REJECTED' && <span className="error">*</span>}
                                    </Form.Label>
                                    <Col md={7}>
                                        <Form.Control
                                            as="textarea"
                                            required
                                            maxLength={250}
                                            onChange={handleInputChange}
                                            name="reason"
                                            type="text"
                                        />
                                        <div className="d-flex justify-content-end">
                                            <small>{charCount} / 250 </small>
                                        </div>
                                        <p className="error">{vis && 'Required'}</p>
                                    </Col>
                                </Form.Group>
                            </div>
                        </form>
                    )}
                </Modal.Body>

                <div className="delbtn">
                    {status == 'APPROVED' ? (
                        <Button variant="addbtn" className="Button" onClick={onApproveHandler}>
                            Approve
                        </Button>
                    ) : (
                        <Button
                            variant="addbtn"
                            type="submit"
                            className="Button"
                            onClick={onRejectHandler}
                        >
                            Reject
                        </Button>
                    )}
                    <Button className="Button" variant="secondary" onClick={hadleClose}>
                        Close
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default ReviewTimeSheet
