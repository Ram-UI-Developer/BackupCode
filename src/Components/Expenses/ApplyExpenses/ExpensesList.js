import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DataBetweenDates from '../../../Common/CommonComponents/DataBetweenDates'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    deleteById,
    getAllByOrgIdAndEmpId,
    getDataBetweenDatesByEmpId
} from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'
import { FaEye } from 'react-icons/fa6'

const ExpensesList = () => {
    // login user details
    const userDetails = useSelector((state) => state.user.userDetails)
    // Controls loading spinner visibility during data fetch/submit
    const [isLoading, setIsLoading] = useState(true)
    // Stores the list of fetched expense sheets
    const [expensesList, setexpenseList] = useState([])
    // Holds current status filter or selected status of expense sheets
    const [expenseSheetStatus, setexpenseSheetStatus] = useState()
    const navigate = useNavigate()
    // state for from date
    const [fromDate, setFromDate] = useState(null)
    // Controls the visibility of a confirmation/modal (e.g., delete popup)
    const [show, setShow] = useState(false)
    // Stores the ID of the selected expense item (e.g., for deletion or editing)
    const [selectedId, setSelectedId] = useState()
    //state for Todate
    const [toDate, setToDate] = useState(null)

    const onCloseHandler = () => {
        setShow(false)
    }

    useEffect(() => {
        const pastdate = moment().subtract(30, 'days').toDate()
        setFromDate(moment(pastdate).format('YYYY-MM-DD'))
        const presentdate = moment()
        setToDate(moment(presentdate).format('YYYY-MM-DD'))
        onGetHandler(pastdate, presentdate)
    }, [])

    // api handling for get Expense by empid and year
    const onGetHandler = (pastdate, presentdate) => {
        setIsLoading(true)
        getDataBetweenDatesByEmpId({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            fromDate: fromDate ? fromDate : moment(pastdate).format('YYYY-MM-DD'),
            toDate: toDate ? toDate : moment(presentdate).format('YYYY-MM-DD'),
            empId: userDetails.employeeId,
            status: expenseSheetStatus ? expenseSheetStatus : 'All'
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    setexpenseList(res.data)
                } else {
                    setexpenseList([])
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const onGetExpHandler = () => {
        getAllByOrgIdAndEmpId({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    setexpenseList(res.data)
                } else {
                    setexpenseList([])
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const onEditHandler = (id, status) => {
        navigate('/expenseAdd', { state: { id, status } })
    }

    const onDeleteHandler = (id) => {
        setSelectedId(id)
        setShow(true)
    }

    // delete row data
    const proceedDeleteHandler = () => {
        setIsLoading(true)
        deleteById({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            id: selectedId
        }).then((res) => {
            if (res.statusCode == 200) {
                setIsLoading(false)
                toast.success('Record deleted successfully.')
                onCloseHandler()
                onGetExpHandler()
            } else {
                setIsLoading(false)
                toast.error(res.errorMessage)
            }
        })
    }

    const ExpenseSheetOptions = [
        { label: 'All', value: 'All' },
        { label: 'Saved', value: 'Saved' },
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Repudiated', value: 'Repudiated' },
        { label: 'Reimbursed', value: 'Reimbursed' },
        { label: 'Partially Approved', value: 'Partially_Approved' }
    ]

    // table colums for table
    const COLUMNS = [
        {
            Header: 'Submitted Date',
            accessor: 'submittedDate',
            Cell: ({ row }) => (
                <div className="text-left">{<DateFormate date={row.original.submittedDate} />}</div>
            )
        },
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
            Header: 'Authorized By',
            accessor: 'managerName',
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.approvedAmount ||
                    row.original.approvedAmount == 0 ||
                    row.original.status === 'Rejected' ||
                    row.original.status === 'Partially_Approved' ||
                    row.original.status === 'Approved' ||
                    row.original.status === 'Reimbursed'
                        ? row.original.managerName
                        : '---'}
                </div>
            )
        },

        {
            Header: 'Reimbursed By',
            accessor: 'accountantName',
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.reimbursedAmount ||
                    row.original.reimbursedAmount == 0 ||
                    row.original.status === 'Repudiated' ||
                    row.original.status === 'Reimbursed'
                        ? row.original.accountantName
                        : '---'}
                </div>
            )
        },

        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => (
                <>
                    <div
                        className={`text-left ${
                            row.original.status === 'Rejected' ||
                            row.original.status === 'Repudiated'
                                ? 'text-red'
                                : row.original.status === 'Submitted' ||
                                    row.original.status === 'Saved'
                                  ? ''
                                  : 'text-green'
                        }`}
                    >
                        {row.original.status}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-right actionsWidth">
                        {['Submitted', 'Approved', 'Reimbursed',"Repudiated","Partially_Approved"].includes(row.original.status) ? (
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                style={{
                                    paddingBottom: '10px',
                                    marginLeft: '2px',
                                    color: '#1055b2',
                                    fontSize: '1.10rem'
                                }}
                                onClick={() => onEditHandler(row.original.id, row.original.status)}
                            >
                                <FaEye />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                onClick={() => onEditHandler(row.original.id, row.original.status)}
                            >
                                <EditIcon />
                            </Button>
                        )}
                        |
                        <Button
                            type="button"
                            disabled={row.original.status != 'Saved'}
                            variant=""
                            className="iconWidth"
                            onClick={() => onDeleteHandler(row.original.id)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]
    return (
        <>
            {isLoading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Expenses'} />
                                <div className="card-body">
                                    <form>
                                        <div class="" style={{ marginBottom: '2%' }}>
                                            <DataBetweenDates
                                                setFromDate={setFromDate}
                                                setToDate={setToDate}
                                                setStatus={setexpenseSheetStatus}
                                                options={ExpenseSheetOptions}
                                                handleGo={onGetHandler}
                                                defaultValue={{ label: 'All' }}
                                                dateOfJoining={userDetails.dateOfJoining}
                                            />
                                        </div>
                                    </form>
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => navigate('/expenseAdd')}
                                    >
                                        <AddIcon />
                                    </Button>{' '}
                                    <>
                                        {' '}
                                        <div className="noOfRecords">
                                            {expensesList.length > 10 ? (
                                                <span>No. of Records : {expensesList.length}</span>
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                        <Table
                                            columns={COLUMNS}
                                            data={expensesList}
                                            serialNumber={true}
                                            key={expensesList.length}
                                            name={'expenses'}
                                            pageSize="10"
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={onCloseHandler}>
                    {isLoading ? <DetailLoader /> : ''}
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="delbtn">
                    <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default ExpensesList
