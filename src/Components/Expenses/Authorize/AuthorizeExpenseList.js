import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Table from '../../../Common/Table/Table'

import DataBetweenDates from '../../../Common/CommonComponents/DataBetweenDates'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    getAllExpensesByManagerId,
    getExpensesBetweenDatesByMngId
} from '../../../Common/Services/CommonService'

const AuthorizeExpenseList = () => {
    // login user details
    const userDetails = useSelector((state) => state.user.userDetails)
    // State to store the list of expense sheets
    const [expensesList, setexpenseList] = useState([])
    const navigate = useNavigate()
    // state for from date
    const [startDate, setStartDate] = useState([])

    const [, setAuth] = useState(false)
    // State to store error messages, if any occur during operations
    const [, setError] = useState('')
    //state for Todate
    const [endDate, setEndDate] = useState()
    // State to manage loading state for API calls or initial data fetching
    const [loading, setLoading] = useState(true)
    // State to store the status of the expense sheet (e.g., Draft, Submitted, Approved)
    const [expenseSheetStatus, setexpenseSheetStatus] = useState()

    useEffect(() => {
        dftData()
        const pastdate = moment().subtract(30, 'days').toDate()
        setStartDate(moment(pastdate).format('YYYY-MM-DD'))
        const presentdate = moment()
        setEndDate(moment(presentdate).format('YYYY-MM-DD'))
    }, [])

    const onGetHandler = () => {
        setLoading(true)
        getExpensesBetweenDatesByMngId({
            entity: 'expensesheets',
            empId: userDetails.employeeId,
            organizationId: userDetails.organizationId,
            fromDate: startDate,
            toDate: endDate,
            status: expenseSheetStatus ? expenseSheetStatus : 'Submitted'
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setexpenseList(res.data)
            } else {
                setLoading(false)
                setexpenseList([])
            }
        })
    }
    const dftData = () => {
        setLoading(true)
        getAllExpensesByManagerId({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setexpenseList(res.data)
                setStartDate(res.fromDate)
                setexpenseList(
                    res.data.filter((e) => {
                        if (e.status == 'Submitted') {
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

    const ExpenseSheetOptions = [
        { label: 'All', value: 'All' },
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Reimbursed', value: 'Reimbursed' },
        { label: 'Partially Approved', value: 'Partially_Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Repudiated', value: 'Repudiated' }
    ]

    // table colums for table
    const COLUMNS = [
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
            accessor: 'employeeName',

            Cell: ({ row }) => <div className="text-left ">{row.original.employeeName}</div>
        },

        {
            Header: 'Submitted Date',
            accessor: 'submittedDate',
            Cell: ({ row }) => <div>{moment(row.original.submittedDate).format('DD MMM YYYY')}</div>
        },

        {
            Header: () => (
                <div className="text-left header" style={{ paddingLeft: '30px' }}>
                    Status
                </div>
            ),
            accessor: 'status',

            Cell: ({ row }) => (
                <>
                    <div
                        className={`text-left  ${
                            row.original.status === 'Rejected' ||
                            row.original.status === 'Repudiated'
                                ? 'text-red'
                                : row.original.status === 'Submitted'
                                  ? ''
                                  : 'text-green'
                        }`}
                        style={{ paddingLeft: '30px' }}
                    >
                        {row.original.status}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="header text-right actions">Actions</div>,
            accessor: 'actions',
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-center actionsWidth">
                        <Button
                            variant=""
                            onClick={() => navigate('/AuthorizeExpense', { state: row.original })}
                        >
                            <EditIcon />
                        </Button>
                    </div>
                </>
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
                            <div className="card-primary">
                                <div className="">
                                    <PageHeader pageTitle={'Authorize Expenses'} />
                                    <div class="card-body" style={{ marginBottom: '2%' }}>
                                        <DataBetweenDates
                                            setFromDate={setStartDate}
                                            setToDate={setEndDate}
                                            setStatus={setexpenseSheetStatus}
                                            options={ExpenseSheetOptions}
                                            handleGo={onGetHandler}
                                            defaultValue={{ label: 'Submitted' }}
                                        />
                                    </div>
                                    <br></br>

                                    <>
                                        {' '}
                                        <div
                                            style={{
                                                marginBottom: '-1%',
                                                fontWeight: '500',
                                                marginLeft: '0.3%'
                                            }}
                                        >
                                            {expensesList.length > 10 ? (
                                                <span>No. of Records : {expensesList.length}</span>
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                        <br />
                                        <Table
                                            columns={COLUMNS}
                                            data={expensesList}
                                            key={expensesList.length}
                                            serialNumber={true}
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
export default AuthorizeExpenseList
