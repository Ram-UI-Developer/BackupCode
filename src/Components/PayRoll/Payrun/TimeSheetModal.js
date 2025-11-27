import React, { useEffect, useState } from 'react'
import { Tooltip } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import { useSelector } from 'react-redux'
import Loader from '../../../Common/CommonComponents/Loader'
import { getAllTimeSheetRowForPayrun } from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'

const TimeSheetModal = ({ fromDate, toDate, id }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get user details from redux
    const [data, setData] = useState([]) // State for timesheets
    const [loading, setLoading] = useState(true) // State for handling loader

    // Fetch Timesheet when component on mount
    useEffect(() => {
        getTimeSheets()
    }, [])

    const getTimeSheets = () => {
        setLoading(true)
        getAllTimeSheetRowForPayrun({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            employeeId: id,
            fromDate: fromDate,
            toDate: toDate
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setData(res.data.map((e) => e.timesheetRows))
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }
    // State to manage current index
    const [currentIndex, setCurrentIndex] = useState(0)

    // sum of hours
    const sumFunction = (day) => {
        const sun = data[currentIndex]
        const sunMap = sun && sun.map((e) => e[day])
        const sunSum = sunMap && sunMap.reduce((a, b) => Number(a) + Number(b), 0)
        return sunSum
    }

    // columns for table
    const columns = [
        {
            Header: () => <div className="text-left header">Project Name</div>,
            accessor: 'projectName',
            Cell: ({ row }) => <div className="text-left">{row.original.projectName}</div>
        },
        {
            Header: () => <div className="text-left header">Project Manager Name</div>,
            accessor: 'projectManagerName',
            Cell: ({ row }) => <div className="text-left">{row.original.projectManagerName}</div>
        },

        {
            Header: () => <div className="text-left header">Task</div>,
            accessor: 'task',
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.task} open>
                        {row.original.task}
                    </Tooltip>
                    <div className="taskLengthPay">{row.original.task}</div>
                </>
            )
        },
        {
            Header: () => <div className="text-right header">Sun</div>,
            accessor: 'sunday',
            Cell: ({ row }) => <div className="text-center">{row.original.sunday}</div>,
            Footer: <div className="text-bold text-center">{sumFunction('sunday')}</div>
        },
        {
            Header: () => <div className="text-right header">Mon</div>,
            accessor: 'monday',
            Cell: ({ row }) => <div className="text-center">{row.original.monday}</div>,
            Footer: <div className="text-bold text-center">{sumFunction('monday')}</div>
        },
        {
            Header: () => <div className="text-right header">Tue</div>,
            accessor: 'tuesday',
            Cell: ({ row }) => <div className="text-center">{row.original.tuesday}</div>,
            Footer: <div className="text-bold text-center">{sumFunction('tuesday')}</div>
        },
        {
            Header: () => <div className="text-right header">Wed</div>,
            accessor: 'wednesday',
            Cell: ({ row }) => <div className="text-center">{row.original.wednesday}</div>,
            Footer: <div className="text-bold text-center">{sumFunction('wednesday')}</div>
        },
        {
            Header: () => <div className="text-right header">Thu</div>,
            accessor: 'thursday',
            Cell: ({ row }) => <div className="text-center">{row.original.thursday}</div>,
            Footer: <div className="text-bold text-center">{sumFunction('thursday')}</div>
        },
        {
            Header: () => <div className="text-right header">Fri</div>,
            accessor: 'friday',
            Cell: ({ row }) => <div className="text-center">{row.original.friday}</div>,
            Footer: <div className="text-bold text-center">{sumFunction('friday')}</div>
        },
        {
            Header: () => <div className="text-right header">Sat</div>,
            accessor: 'saturday',
            Cell: ({ row }) => <div className="text-center">{row.original.saturday}</div>,
            Footer: <div className="text-center text-bold">{sumFunction('saturday')}</div>
        },
        {
            Header: () => <div className="text-right header">Status</div>,
            accessor: 'status',
            Cell: ({ row }) => <div className="text-right">{row.original.status}</div>
        },
        {
            Header: <div className="text-wrap text-center textBold">Total</div>,
            accessor: 'totalHours',
            Cell: ({ row }) => (
                <div className="text-bold text-center">
                    {Number(row.original.monday) +
                        Number(row.original.tuesday) +
                        Number(row.original.wednesday) +
                        Number(row.original.thursday) +
                        Number(row.original.friday) +
                        Number(row.original.saturday) +
                        Number(row.original.sunday)}
                </div>
            ),
            Footer: <div className="text-bold text-center">{sumFunction('totalRowHours')}</div>
        }
    ]

    // Handlers for button clicks
    const handleNext = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, data.length - 1))
    }

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
    }

    return (
        <div>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            ) : (
                <>
                    <div className="tables-wrapper">
                        <div
                            className="tables-container"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {data &&
                                data.map((document) => (
                                    <div className="table-item" key={document.id}>
                                        <div style={{ fontWeight: '700', float: 'right' }}>
                                            {' '}
                                            Weekend Date :{' '}
                                            {document.length == 0 ? '' : document[0].weekendDate}
                                        </div>
                                        <Table
                                            key={document.length}
                                            data={document}
                                            columns={columns}
                                            serialNumber={false}
                                            footer={true}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div>
                        <Button
                            variant="addbtn"
                            className="Button"
                            onClick={handlePrevious}
                            disabled={currentIndex == 0}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="addbtn"
                            className="Button"
                            onClick={handleNext}
                            disabled={currentIndex >= data.length - 1}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default TimeSheetModal
