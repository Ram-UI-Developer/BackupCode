import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Table from '../../../Common/Table/Table'
import { useSelector } from 'react-redux'
import { EditIcon } from '../../../Common/CommonIcons/CommonIcons'

import moment from 'moment'
import DataBetweenDates from '../../../Common/CommonComponents/DataBetweenDates'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import {
    getAllSheetsByDate,
    getAllSheetsByLocationId
} from '../../../Common/Services/OtherServices'
import { getAllByOrgId } from '../../../Common/Services/CommonService'

const ReimburseList = () => {
    // Fetches user details from the Redux store (includes org, emp ID, etc.)
    const userDetails = useSelector((state) => state.user.userDetails)
    // Generic loading state for showing spinners or disabling UI elements during async calls
    const [loading, setLoading] = useState(false)
    // React Router hook for programmatically navigating to other screens/routes
    const navigate = useNavigate()
    // Stores current selected status for filtering or submission (e.g., Approved, Rejected)
    const [status, setStatus] = useState()
    // Stores the selected "From Date" range for filtering or form input
    const [fromDate, setFromDate] = useState([])
    // Holds the list of expense items to be authorized (fetched from API or filtered)
    const [authList, setAuthList] = useState([])
    // Stores any error message (validation/API/etc.) to display in the UI
    const [, setError] = useState('')
    // Boolean flag to track if at least one item has been authorized (e.g., validation flag)
    const [, setAuth] = useState(false)
    // Stores the selected "To Date" for range selection (usually for filtering/search)
    const [toDate, setToDate] = useState(null)
    //Stores the list of locations fetched from the API
    const [locations, setLocations] = useState([])

    useEffect(() => {
        getLocationsList()
        getReimburse()
        const defaultdate = moment().subtract(30, 'days').toDate()
        setFromDate(moment(defaultdate).format('YYYY-MM-DD'))
        const presentdate = moment()
        setToDate(moment(presentdate).format('YYYY-MM-DD'))
    }, [])

    const getLocationsList = () => {
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then(
                (res) => {
                    const locationIds = res.data.map(location => location.id);
                    setLocations(locationIds);
                },
                (error) => {
                    console.log(error);
                }
            )
            .catch((err) => {
                console.log(err);
            });
    }

    // Fetches reimbursable expense sheets based on selected date range and status
    const getReimburseExpenseList = () => {
        setLoading(true)
        getAllSheetsByDate({
            entity: 'expensesheets',
            fromDate: fromDate,
            toDate: toDate,
            status: status ? status : 'Approved',
            organizationId: userDetails.organizationId,
            locationId: userDetails.accessible == null ? userDetails.allowedLocations : locations
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setAuthList(res.data)
            } else {
                setLoading(false)
                setAuthList([])
            }
        })
    }
    // Fetches all expense sheets for user's location and filters for approved/partially approved ones
    const getReimburse = () => {
        setLoading(true)
        getAllSheetsByLocationId({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            locationId: userDetails.accessible == null ? userDetails.allowedLocations : locations
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setAuthList(
                    res.data.filter((e) => {
                        if (e.status == 'Approved' || e.status == 'Partially_Approved') {
                            return e
                        }
                    })
                )
            } else {
                setLoading(false)
                setAuth(true)
                setError('You Are Not Authourized To Access')
            }
        })
    }

    const expenseSheetOptions = [
        { label: 'All', value: 'All' },
        { label: 'Reimbursed', value: 'Reimbursed' },
        { label: 'Repudiated', value: 'Repudiated' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Partially Approved', value: 'Partially_Approved' }
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'Repudiated':
                return 'red'
            case 'Reimbursed':
                return 'green'
            default:
                return 'black'
        }
    }

    const COLUMN = [
        {
            Header: 'Expense Id',
            accessor: 'id',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '65%' }}>
                    {row.original.id}
                </div>
            )
        },
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },

        {
            Header: 'Submitted Date',
            accessor: 'submittedDate',
            Cell: ({ row }) => (
                <div className="text-left">{<DateFormate date={row.original.submittedDate} />}</div>
            )
        },

        {
            Header: 'Approval Date',
            accessor: 'approvedDate',
            Cell: ({ row }) => (
                <div className="text-left">{<DateFormate date={row.original.approvedDate} />}</div>
            )
        },

        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => (
                <div style={{ color: getStatusColor(row.original.status) }}>
                    {row.original.status}
                </div>
            )
        },

        {
            Header: () => <div className="header text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-center actionsWidth">
                    <Button
                        variant=""
                        onClick={() => navigate('/Reimburse', { state: row.original })}
                    >
                        <EditIcon />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="  ">
                                <PageHeader pageTitle="Reimburse Expenses" />
                                <div className="card-body">
                                    <div class="card-body" style={{ marginBottom: '2%' }}>
                                        <DataBetweenDates
                                            setFromDate={setFromDate}
                                            setToDate={setToDate}
                                            setStatus={setStatus}
                                            options={expenseSheetOptions}
                                            handleGo={getReimburseExpenseList}
                                            defaultValue={{ label: 'Approved' }}
                                        />
                                    </div>
                                    <br />
                                    <br />

                                    <>
                                        {' '}
                                        <div
                                            style={{
                                                marginTop: '-4%',
                                                position: 'absolute',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {authList.length > 10 ? (
                                                <span>No. of Records : {authList.length}</span>
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                        <Table
                                            columns={COLUMN}
                                            serialNumber={true}
                                            data={authList}
                                            key={authList.length}
                                            pageSize="10"
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
export default ReimburseList
