import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { getById, getHolidayCalendarByLocationId } from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'

const ViewTimeSheet = () => {
    // Fetching user details from redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    const [loading, setLoading] = useState(false) // State for managing the loading state

    const navigate = useNavigate() // For navigation after closing the modal
    const onCloseHandler = () => {
        navigate('/timesheetsweeklyReports') // Navigating back to timesheets weekly report view
    }
   

    useEffect(() => {
        // Fetch the timesheet data, previous days, and holidays when the component mounts
        getTimeSheet()
        handlePreviousDays()
        getAllHolidays()
    }, [])

    const location = useLocation().state // Getting the location state passed to this component
    const [byIdList, setByIdList] = useState([]) // State for storing the timesheet data
    const getTimeSheet = () => {
        // Fetching timesheet data by ID
        getById({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            id: location.row.id
        }).then((res) => {
            setLoading(false) // Set loading to false after data is fetched
            if (res.statusCode == 200) {
                setByIdList(res.data.timesheetRows) // Storing the timesheet data
            }
        })
    }

    const [days, setDays] = useState([]) // State for storing the previous 7 days
    const handlePreviousDays = () => {
        let result = []
        for (let i = 0; i < 7; i++) {
            let d = new Date(location.row.weekendDate)
            d.setDate(d.getDate() - i) // Adjusting the date for each day of the week
            result.push(moment(d).format('YYYY-MM-DD'))
        }
        setDays(result) // Storing the previous 7 days
    }

    const [holidays, setHolidays] = useState([]) // State for storing holiday data
    const year = new Date().getFullYear() // Current year for holiday data
    const getAllHolidays = () => {
        // Fetching holiday calendar for the employee
        getHolidayCalendarByLocationId({
            entity: 'holidays',
            year: year,
            empId: location.row.employeeId,
            organizationId: userDetails.organizationId,
        }).then((res) => {
            setHolidays(res.data ? res.data.map((e) => e.date) : []) // Storing holiday dates
            console.log(res, 'chckingresponse')
        })
    }

    const getDayName = (e) => {
        // Function to get the weekday name (e.g., Monday, Tuesday)
        let locale = 'en-US'
        return e.toLocaleDateString(locale, { weekday: 'long' })
    }

    const compareDates = days ? days.filter((e) => holidays.includes(e)) : [] // Filtering holidays that match the previous 7 days
    const dateGet = compareDates ? compareDates.map((e) => getDayName(new Date(e))) : []
    const dayName = dateGet ? dateGet.map((e) => e.toLowerCase()) : [] // Extracting lowercase weekday names

    // Filtering specific weekdays (e.g., Monday, Tuesday)
    const mon = dayName.filter((e) => e == 'monday')
    const sund = dayName.filter((e) => e == 'sunday')
    const tue = dayName.filter((e) => e == 'tuesday')
    const wed = dayName.filter((e) => e == 'wednesday')
    const thur = dayName.filter((e) => e == 'thursday')
    const frid = dayName.filter((e) => e == 'friday')
    const satr = dayName.filter((e) => e == 'saturday')

    // Summing up the timesheet hours for each day of the week
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

    const toatal = su + mo + tu + we + thu + fri + sat // Calculating the total hours worked for the week

    // Column configuration for the timesheet table
    const COLUMNS = [
        {
            Header: 'Project Name',
            accessor: 'projectName',
            Cell: () => (
                <>
                    <Tooltip title={location.row.projectName} open>
                        {location.row.projectName}
                    </Tooltip>
                    <div className="tableLength">{location.row.projectName}</div>
                </>
            )
        },

        {
            Header: (
                <div className="header text-left" style={{ width: '200px' }}>
                    Task
                </div>
            ),
            accessor: 'task',
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.task} open>
                        {row.original.task}
                    </Tooltip>

                    <div className="taskLength">{row.original.task}</div>
                </>
            )
        },
        {
            Header: <div className="text-wrap text-center textBold">Sun</div>,
            accessor: 'sunday',
            Cell: ({ row }) => (
                <div
                    style={{ backgroundColor: sund && 'sunday' == 'sunday' ? 'lightgray' : '' }}
                    className="text-wrap text-center"
                >
                    {row.original.sunday}
                </div>
            ),
            Footer: <div className=" text-center text-bold">{su}</div>
        },
        {
            Header: <div className="text-wrap text-center textBold">Mon</div>,
            accessor: 'monday',
            Cell: ({ row }) => (
                <div
                    style={{ backgroundColor: mon == 'monday' ? 'lightgray' : '' }}
                    className="text-wrap text-center"
                >
                    {row.original.monday}
                </div>
            ),
            Footer: <div className=" text-center text-bold">{mo}</div>
        },
        {
            Header: <div className="text-wrap text-center textBold">Tue</div>,
            accessor: 'tuesday',
            Cell: ({ row }) => (
                <div
                    style={{ backgroundColor: tue == 'tuesday' ? 'lightgray' : '' }}
                    className="text-wrap text-center"
                >
                    {row.original.tuesday}
                </div>
            ),
            Footer: <div className=" text-center text-bold">{tu}</div>
        },
        {
            Header: <div className="text-wrap text-center textBold">Wed</div>,
            accessor: 'wednesday',
            Cell: ({ row }) => (
                <div
                    style={{ backgroundColor: wed == 'wednesday' ? 'lightgray' : '' }}
                    className="text-wrap text-center"
                >
                    {row.original.wednesday}
                </div>
            ),
            Footer: <div className=" text-center text-bold">{we}</div>
        },
        {
            Header: <div className="text-wrap text-center textBold">Thu</div>,
            accessor: 'thursday',
            Cell: ({ row }) => (
                <div
                    style={{ backgroundColor: thur == 'thursday' ? 'lightgray' : '' }}
                    className="text-wrap text-center"
                >
                    {row.original.thursday}
                </div>
            ),
            Footer: <div className=" text-center text-bold">{thu}</div>
        },
        {
            Header: <div className="text-wrap text-center textBold">Fri</div>,
            accessor: 'friday',
            Cell: ({ row }) => (
                <div
                    style={{ backgroundColor: frid == 'friday' ? 'lightgray' : '' }}
                    className="text-wrap text-center"
                >
                    {row.original.friday}
                </div>
            ),
            Footer: <div className=" text-center text-bold">{fri}</div>
        },
        {
            Header: <div className="text-wrap text-center textBold">Sat</div>,
            accessor: 'saturday',
            Cell: ({ row }) => (
                <div
                    style={{ backgroundColor: satr && 'saturday' == 'saturday' ? 'lightgray' : '' }}
                    className="text-wrap text-center"
                >
                    {row.original.saturday}
                </div>
            ),
            Footer: <div className=" text-center text-bold">{sat}</div>
        },

        {
            Header: 'Status',
            accessor: 'status'
        },
        {
            Header: <div className="text-wrap text-center textBold">Total</div>,
            accessor: 'totalHours',
            Cell: ({ row }) => (
                <div className="text-wrap text-center">
                    {Number(row.original.monday) +
                        Number(row.original.tuesday) +
                        Number(row.original.wednesday) +
                        Number(row.original.thursday) +
                        Number(row.original.friday) +
                        Number(row.original.saturday) +
                        Number(row.original.sunday)}
                </div>
            ),
            Footer: <div className=" text-center text-bold">{toatal.toFixed(1)}</div>
        }
    ]
  


    
    return (
        <>
            {/* Main content section */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle="View Employee TimeSheet" />
                                <div style={{ marginBottom: '2px' }}>
                                    <span
                                        style={{ marginLeft: '2px' }}
                                        className="add col-sm-5 leftSideHeading"
                                    >
                                        Employee Name - {location.row.employeeName}
                                    </span>
                                    <span
                                        style={{ float: 'right', marginRight: '2%' }}
                                        className="leftSideHeading"
                                    >
                                        Weekend Date -{' '}
                                        {<DateFormate date={location.row.weekendDate} />}
                                    </span>
                                </div>{' '}
                                <div className="card-body">
                                    {
                                        loading ? (
                                            <div className="loader"></div>
                                        ) : (
                                            <Table
                                                columns={COLUMNS}
                                                data={byIdList}
                                                footer={true}
                                                pageSize="10"
                                            />
                                        ) // Loading or Table rendering
                                    }
                                    <div className="btnCenter mb-3">
                                        {/* Close button to navigate back */}
                                        <Button
                                            
                                            className="button"
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


        </>
    )
}
export default ViewTimeSheet
