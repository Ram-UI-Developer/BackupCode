// Importing required dependencies and libraries
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

// API services
import {
    getAllByOrgIdAndEmpId,
    getDataBetweenDatesByEmpId,
    save
} from '../../Common/Services/CommonService'

// Redux store for user data
import { useSelector } from 'react-redux'

// Common UI components
import { toast } from 'react-toastify'
import DataBetweenDates from '../../Common/CommonComponents/DataBetweenDates'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { EditIcon } from '../../Common/CommonIcons/CommonIcons'
import Table from '../../Common/Table/Table'

const TimeSheetList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get current logged-in user details
    const navigate = useNavigate() // React Router navigation

    const handleNavigate = (row) => {
        // Navigate to the new timesheet page with selected row data
        navigate('/newTimeSheet', { state: { row } })
    }

    // State to hold selected timesheet status
    const [timeSheetStatus, setTimeSheetStatus] = useState('All')

    // States for date filters
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)

    // Dropdown options for timesheet status
    const timeSheetOptions = [
        { value: 'All', label: 'All' },
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Partial', value: 'Partial' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Saved', value: 'Saved' },
        { label: 'Generate', value: 'Generate' }
    ]

    const [timesheetList, setTimeSheetList] = useState([]) // Stores fetched timesheet data
    const [loading, setLoading] = useState(true) // Loading spinner toggle

    // Fetch timesheet data based on selected date range and status
    const getAllTimeSheet = () => {
        setLoading(true)
        getDataBetweenDatesByEmpId({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId,
            fromDate: fromDate,
            toDate: toDate,
            status: timeSheetStatus
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setTimeSheetList(res.data)
                    setLoading(false)
                } else {
                    setTimeSheetList([])
                }
            })
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }

    // Triggered when 'Go' button is clicked
    const onHandleGo = () => {
        getAllTimeSheet()
    }

    // Initial API call to fetch all timesheets for the employee
    useEffect(() => {
        getAllTimeSheetById()
    }, [])

    const getAllTimeSheetById = () => {
        getAllByOrgIdAndEmpId({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setTimeSheetList(res.data)
                    setLoading(false)
                } else {
                    setTimeSheetList([])
                    setLoading(false)
                }
            })
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }

    // Function to generate a new timesheet for the selected weekend date
    const handleAddClick = (weekendDate) => {
        setLoading(true)
        const obj = {
            status: 'Saved',
            employeeId: userDetails.employeeId,
            organizationId: userDetails.organizationId,
            locationId: userDetails.locationId,
            weekendDate: weekendDate
        }

        save({
            entity: 'timesheets',
            body: obj,
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    toast.success('Generated successfully.')
                    setLoading(false)
                    getAllTimeSheet() // Refresh list
                } else if (res) {
                    toast.error(res.errorMessage)
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    // Define table columns
    const COLUMN = [
        {
            Header: 'Timesheet Id',
            accessor: 'id',
            headerAlign: 'right',
            Cell: ({ row }) => <div className="numericData">{row.original.id}</div>
        },
        {
            Header: 'Week ending on',
            accessor: 'weekendDate',
            Cell: ({ row }) => (
                <>
                    {row.original.status ? (
                        <>{row.original.weekendDate}</>
                    ) : (
                        <a className="" onClick={() => handleAddClick(row.original.weekendDate)}>
                            <u style={{ fontSize: '14px' }}>{row.original.weekendDate}</u>
                        </a>
                    )}
                </>
            )
        },
        {
            Header: 'No.of Hours',
            accessor: 'totalHours',
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original.id == null ? '' : row.original.totalHours.toFixed(2)}
                </div>
            )
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => (
                <>
                    {row.original.status ? (
                        <>{row.original.status}</>
                    ) : (
                        <div>
                            <span>
                                <a
                                    className=""
                                    onClick={() => handleAddClick(row.original.weekendDate)}
                                >
                                    <u style={{ fontSize: '14px' }}>Generate</u>
                                </a>
                            </span>
                        </div>
                    )}
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <div className="text-center actionsWidth">
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        disabled={row.original && row.original.id == null}
                        onClick={() => handleNavigate(row.original)}
                    >
                        <EditIcon />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <>
            <section className="section">
                {loading ? <DetailLoader /> : ''}
                <div className="" style={{ marginTop: '4rem' }}>
                    <DataBetweenDates
                        setFromDate={setFromDate}
                        setToDate={setToDate}
                        setStatus={setTimeSheetStatus}
                        options={timeSheetOptions}
                        handleGo={onHandleGo}
                        defaultValue={{ label: 'All' }}
                        dateOfJoining={userDetails.dateOfJoining}
                    />
                </div>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <PageHeader pageTitle="Timesheets" />
                            <div className="card-body">
                                {/* Record Count */}
                                <div className="glbnoOfRecrds">
                                    {timesheetList.length > 10 ? (
                                        <span>No. of Records : {timesheetList.length}</span>
                                    ) : (
                                        ''
                                    )}
                                </div>

                                {/* Timesheet Table */}
                                <Table
                                    columns={COLUMN}
                                    serialNumber={true}
                                    data={timesheetList}
                                    pageSize="10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
export default TimeSheetList
