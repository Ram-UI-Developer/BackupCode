import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DataBetweenDates from '../../../Common/CommonComponents/DataBetweenDates'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { AddIcon, Cancelation, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    cancelApi,
    deleteById,
    getById,
    getDataBetweenDatesByEmpId
} from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'

const LeavesList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //getting user details
    const [loading, setLoading] = useState(true) //state for loader
    const [leavesList, setLeavesList] = useState([]) //state for storing the leaves data
    const navigate = useNavigate() //for redirect
    const [fromDate, setFromDate] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD')) // state for from date
    const [toDate, setToDate] = useState(null) //state for Todate
    const [show, setShow] = useState(false) //state for displaying modals (pop ups)
    const [cancelShow, setCancelShow] = useState(false) //state for viewing pop up during cancellation
    const [selectedId, setSelectedId] = useState() //state for storing the id during deletion
    const [refresh, setRefresh] = useState(true) //state for refreshing data
    const [leaveStatus, setLeaveStatus] = useState('All') //state for handling leave statuses
    //resolved 1761 jira ticket
    //resolved 1783 jira ticker
    const onCloseHandler = () => {
        setShow(false)
        setCancelShow(false)
        setFormData({})
        setFormErrors({})
        setCharCount(0)
    }
    //resolved 1783 jira ticker

    const [charCount, setCharCount] = useState(0) // state for character count

    // handling date picker for todate
    const options = [
        { value: 'All', label: 'All' },
        { value: 'Saved', label: 'Saved' },
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Cancelled', label: 'Cancelled' }
    ]

    //api handling for getting leaves data between dates
    const onGetLeavesBetweenDatesHandler = () => {
        setLoading(true)
        getDataBetweenDatesByEmpId({
            entity: 'leaves',
            empId: userDetails.employeeId,
            organizationId: userDetails.organizationId,
            fromDate: fromDate,
            toDate: toDate ? toDate : '2099-12-31', // <-- use future date if toDate is null
            status: leaveStatus
        }).then((res) => {
            setLoading(false)
            if (res.statusCode == 200) {
                setLeavesList(res.data ? res.data : [])
            } else {
                toast.error(res.errorMessage)
                setLeavesList([])
            }
        })
    }

    useEffect(() => {
        if (refresh) {
            if (!fromDate) {
                setFromDate(moment().subtract(30, 'days').format('YYYY-MM-DD'))
            }

            onGetLeavesBetweenDatesHandler()
        }
    }, [])

    const onEditHandler = (id) => {
        navigate('/leave', { state: { id } })
    }

    const onDeleteHandler = (id) => {
        setSelectedId(id)
        setShow(true)
    }

    //api handling for delete leave record
    const proceedDeleteHandler = () => {
        deleteById({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            id: selectedId
        }).then((res) => {
            if (res.statusCode == 200) {
                toast.success('Record Deleted Successfully.')
                onCloseHandler()
                onGetLeavesBetweenDatesHandler()
                setRefresh(true)
            } else {
                toast.error(res.message)
            }
        })
        .catch((err) => {
            toast.error(err.message)
        })
    }

    const onCancelationHandler = (row, id) => {
        setCancelShow(true)
        onGetLeaveHandler(id)
    }

    //api handling for leaves get By id
    const [leaveBody, setLeaveBody] = useState({})
    const onGetLeaveHandler = (id) => {
        getById({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            id: id
        }).then((res) => {
            if (res.statusCode == 200) {
                setLeaveBody(res.data)
            }
        })
    }
    //state to store form data
    const [formData, setFormData] = useState('')
   

    //state for handling form errors during validation
    const [formErrors, setFormErrors] = useState({})

    //validate object
    const validate = (values) => {
        const errors = {}

        if (!values.cancellatoinRemarks) {
            errors.cancellatoinRemarks = 'Required'
        }
        return errors
    }
    // api handling for cancelled leave object
    const cancelationHandler = () => {
        const levaeObj = {
            approvedBy: leaveBody.approvedBy,
            approvedDate: leaveBody.approvedDate,
            cancellatoinRemarks: formData.cancellatoinRemarks,
            cancelledBy: userDetails.employeeId,
            cancelledDate: leaveBody.cancelledDate,
            createdBy: leaveBody.createdBy,
            createdDate: leaveBody.createdDate,
            employeeId: leaveBody.employeeId,
            employeeName: leaveBody.employeeName,
            fromDate: leaveBody.fromDate,
            fromSession: leaveBody.fromSession,
            id: leaveBody.id,
            leavetypeId: leaveBody.leavetypeId,
            leavetypeName: leaveBody.leavetypeName,
            locationId: leaveBody.locationId,
            locationName: leaveBody.locationName,
            managerId: leaveBody.managerId,
            managerName: leaveBody.managerName,
            modifiedBy: userDetails.employeeId,
            numberofDays: leaveBody.numberofDays,
            organizationId: leaveBody.organizationId,
            organizationName: leaveBody.organizationName,
            reason: leaveBody.reason,
            remarks: leaveBody.remarks,
            status: 'Cancelled',
            submittedDate: leaveBody.submittedDate,
            toDate: leaveBody.toDate,
            toSession: leaveBody.toSession
        }
        if (!levaeObj.cancellatoinRemarks) {
            setFormErrors(validate(levaeObj))
        } else {
            cancelApi({
                entity: 'leaves',
                organizationId: userDetails.organizationId,
                id: levaeObj.id,
                body: levaeObj
            }).then((res) => {
                if (res.statusCode == 200) {
                    setRefresh(true)
                    onGetLeavesBetweenDatesHandler()
                    onCloseHandler()
                    toast.success('Leave Cancelled Successfully.')
                    setFormData({})
                } else {
                    toast.error(res.errorMessage)
                }
            })
        }
    }

    //for date
    const date = new Date()
    const currentDate = moment(date).format('YYYY-MM-DD')
    // table colums for table
    const COLUMNS = [
        {
            Header: 'From Date',
            accessor: 'fromDate',
            Cell: ({ row }) => (
                <div>
                    <DateFormate date={row.original.fromDate} />
                </div>
            )
        },
        {
            Header: 'To Date (No. of Days)',
            accessor: 'toDate',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap " style={{ display: 'flex' }}>
                        {<DateFormate date={row.original.toDate} />} ({row.original.numberofDays})
                    </div>
                </>
            )
        },
        {
            Header: 'Leave Type',
            accessor: 'leavetypeName'
        },
        {
            Header: 'Reason',
            accessor: 'reason',
            Cell: ({ row }) => (
                <>
                    <div className="tableData">{row.original.reason}</div>
                </>
            )
        },
        {
            Header: 'Remarks',
            accessor: 'remarks',
            Cell: ({ row }) => (
                <>
                    <div className="tableData">{row.original.remarks}</div>
                </>
            )
        },

        {
            Header: 'Status',
            accessor: 'status'
        },
        {
            Header: () => <div className="header text-right holidayActions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-right ">
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            disabled={
                                currentDate > row.original.fromDate ||
                                row.original.status == 'Cancelled'
                            }
                            onClick={() => onCancelationHandler(row.original, row.original.id)}
                        >
                            <Cancelation />
                        </Button>
                        |
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            disabled={
                                row.original.status == 'Submitted' ||
                                row.original.status == 'Approved'
                            }
                            onClick={() => onEditHandler(row.original.id)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
                            disabled={row.original.status !== 'Saved'}
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
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Leaves'} />
                                <div className="card-body">
                                    <div style={{ marginBottom: '2%' }}>
                                        <DataBetweenDates
                                            setFromDate={setFromDate}
                                            setToDate={setToDate}
                                            setStatus={setLeaveStatus}
                                            options={options}
                                            handleGo={onGetLeavesBetweenDatesHandler}
                                            defaultValue={{ label: 'All' }}
                                            showEmptyToDate={true}
                                        />
                                    </div>
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => navigate('/leave', { state: { id: null } })}
                                    >
                                        <AddIcon />
                                    </Button>{' '}
                                    <>
                                        <div className="noOfRecords">
                                            {leavesList.length > 10 ? (
                                                <span>No. of Records : {leavesList.length}</span>
                                            ) : (
                                                ''
                                            )}
                                        </div>{' '}
                                        <Table
                                            key={leavesList.length}
                                            columns={COLUMNS}
                                            serialNumber={true}
                                            data={leavesList}
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
                    <Modal.Title>Delete?</Modal.Title>
                    {/* <Button variant="secondary" onClick={onCloseHandler}>X</Button> */}
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure that you want to delete this leave request?
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
            <Modal show={cancelShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={onCloseHandler}>
                    <Modal.Title>Cancel Leave ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <div class="col-">
                        <Form.Group
                            as={Row}
                            className="mb-3 justify-content-center"
                            controlId="formGroupToDate"
                        >
                            <Form.Label column sm={3}>
                                Remarks <span className="error">*</span>
                            </Form.Label>
                            <Col md={7}>
                                {/* resolved 1783 jira ticket */}
                                <Form.Control
                                    name="cancellatoinRemarks"
                                    type="text"
                                    maxLength={250}
                                    value={formData.cancellatoinRemarks || ''}
                                    onChange={(e) => {
                                        const { value } = e.target
                                        if (value.length <= 250) {
                                            setFormData({ ...formData, cancellatoinRemarks: value })
                                            setCharCount(value.length)
                                            if (formErrors.cancellatoinRemarks) {
                                                setFormErrors({
                                                    ...formErrors,
                                                    cancellatoinRemarks: ''
                                                })
                                            }
                                        }
                                    }}
                                />
                                <div className="d-flex justify-content-end">
                                    <small>{charCount} / 250 </small>
                                </div>
                                <p className="modalError">{formErrors.cancellatoinRemarks}</p>
                            </Col>
                        </Form.Group>
                    </div>
                </Modal.Body>
                <div className="delbtn">
                    <Button className="Button" variant="addbtn" onClick={cancelationHandler}>
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

export default LeavesList
