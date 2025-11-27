import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Loader from '../../../Common/CommonComponents/Loader'
import {
    getHolidayCalendarByLocationId,
    getUpcomingHolidaysByLocationId
} from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'

const HolidayCardList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetails form redux
    const [data, setData] = useState([]) // State for holidays in the dashboard
    const getDayAbbreviation = (date) =>
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
            date.getDay()
        ] // define all week days
    const [show, setShow] = useState(false) // State for modal
    const [holidays, setHolidays] = useState([]) // State for holiday calendar
    const [loading, setLoading] = useState(true) // State for handling Loader

    // Fetch holidays on component mount
    useEffect(() => {
        if (userDetails.upcomingHolidays) {
            getHolidays()
        } else {
            setLoading(false)
        }
    }, [])

    let year = new Date().getFullYear() // get year
    const getHolidays = () => {
        getUpcomingHolidaysByLocationId({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            employeeId: userDetails.employeeId,
            year: year
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    if (res.data.length > 3) {
                        setData(res.data.slice(0, 3))
                    } else {
                        setData(res.data)
                    }
                } else {
                    setData([])
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Close modal
    const onCloseHandler = () => {
        setShow(false)
        setLoading(false)
    }

    // Fetch holiday calendar by on click
    const onGetHolidayCalendarHandler = () => {
        setLoading(true)
        setShow(true)
        getHolidayCalendarByLocationId({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId,
            year: year
        }).then((res) => {
            if (res.statusCode == 200) {
                setHolidays(res.data)
            } else {
                setHolidays([])
            }
            setLoading(false)
        })
        .catch(() => {
            setLoading(false)
            setHolidays([])
        })
    }

    // get day
    const GetDay = (data) => {
        let fullDate = new Date(data).toString()
        let day = fullDate.slice(0, 3)
        return day
    }

    // columns for Table
    const COLUMNS = [
        {
            Header: 'Date',
            accessor: 'date',
            width: '250'
        },
        {
            Header: 'Day',
            accessor: '',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap">{GetDay(row.original.date)}</div>
                </>
            )
        },
        {
            Header: 'Name',
            accessor: 'name'
        },

        {
            Header: 'Optional',
            accessor: 'optional',
            Cell: ({ row }) => (
                <>
                    <div className="tableNameData">{row.original.optional ? 'Yes' : 'No'}</div>
                </>
            )
        },

        {
            Header: 'Description',
            accessor: 'description',
            Cell: ({ row }) => (
                <>
                    <div className="tableDescriptionData3">{row.original.description}</div>
                </>
            )
        }
    ]

    return (
        <>
            <div class="card detailBackground" style={{ height: '223px' }}>
                <div class="card-header dashboardHeading">Upcoming Holidays</div>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center vh-100">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {data.length > 0 ? (
                            <div class="card-body" style={{ paddingTop: '3px' }}>
                                {data.map((holiday) => (
                                    <>
                                        <div key={holiday.date}>
                                            <span className="holidayDateInDashboard">
                                                {holiday.date}
                                            </span>{' '}
                                            <span className="holidayDayInDashboard">
                                                {' '}
                                                {getDayAbbreviation(new Date(holiday.date))}
                                            </span>
                                        </div>
                                        <div className="holidayDayInDashboard">
                                            {holiday.name} {holiday.optional ? '(Optional)' : ''}
                                        </div>
                                        <hr className="hrtagforHoliday" />
                                    </>
                                ))}
                            </div>
                        ) : (
                            <div className="padding-1rem  text-center align-items-center textBold">
                                No Upcoming Holidays
                            </div>
                        )}
                        {/* handling seemore conditionally */}
                        <div className="text-right padding-1rem">
                            {data && data.length >= 3 ? (
                                <a
                                    onClick={() => onGetHolidayCalendarHandler()}
                                    className="themeColor"
                                    style={{ fontSize: '11px' }}
                                >
                                    {' '}
                                    See more{' '}
                                </a>
                            ) : (
                                ''
                            )}
                        </div>
                    </>
                )}
            </div>
            {/* Modal for holiday calendar */}
            <Modal show={show} size="lg" onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Holiday Calendar </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        {holidays == null ? (
                            <h4 className="modalBody">No Holidays Available</h4>
                        ) : loading ? (
                            <div
                                className="d-flex justify-content-center align-items-center "
                                style={{ height: '50vh' }}
                            >
                                <Loader />
                            </div>
                        ) : (
                            <Table
                                key={holidays.length}
                                columns={COLUMNS}
                                data={holidays}
                                serialNumber={true}
                                pageSize="10"
                            />
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default HolidayCardList
