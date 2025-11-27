import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { getById } from '../../../Common/Services/CommonService'
import { ApproveById, getLeaveBalance, RejectById } from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import Loader from '../../../Common/CommonComponents/Loader'

const AuthorizeLeaveDetails = () => {
    const [formData, setFormData] = useState('') //state to store form data
    const leaveId = useLocation().state //state for storing leave id
    console.log(leaveId, "Leave ID from location state")
    const [leave, setLeave] = useState({}) //state for handling leave data
    const [status, setStatus] = useState(null) //state for handling leave status
    const [selectedId, setSelectedId] = useState(null) //state for storing the id
    const [loading, setLoading] = useState(true) //state for loader displaying
    const userDetails = useSelector((state) => state.user.userDetails) //user details storing
    const [formErrors, setFormErrors] = useState({}) //state  for handling form errors during validation
    const [show, setShow] = useState(false) //state for modal pop ups
    const [leaveBalance, setLeaveBalance] = useState([]) //state for setting employee leave balance data
    const [leaveBalanceShow, setLeaveBalanceShow] = useState(false) //state for showing leave balance pop up
    const navigate = useNavigate() //for redirect
    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value.trimStart().replace(/\s+/g, ' ')
        })
    }

    //api for getting leave balance data in pop up
    const onGetHandler = () => {
        setLoading(true)
        setLeaveBalanceShow(true)
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: leave.employeeId,
            locationId: 0
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setLeaveBalance(res.data)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    //for character count during entering text
    const [charCount, setCharCount] = useState(leave.reason ? leave.reason.length : 0)
    const handleInputChange = (event) => {
        const { value } = event.target
        if (value.length <= 250) {
            // Restricting input to 250 characters
            setCharCount(value.length)
            onChangeHandler(event) // Call the original change handler
            if (formErrors.reason) {
                setFormErrors({ ...formErrors, reason: '' })
            }
        }
    }

    useEffect(() => {
        onGetLeaveHandler()
    }, [])

    const onCancelHandler = () => {
        navigate('/authorizeLeaves')
    }
    //resloved  1761 jira ticket
    const onCloseHandler = () => {
        setCharCount(0)
        setShow(false)
        setLeaveBalanceShow(false)
        setFormErrors({})
    }

    //api for getting leave get by id
    const onGetLeaveHandler = () => {
        getById({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            id: leaveId
        }).then((res) => {
            setLoading(false)
            if (res.statusCode == 200) {
                setLeave(res.data)
            }
        })
    }
    const onAuthorizeHandler = (status, id) => {
        setShow(true)
        setSelectedId(id)
        setStatus(status)
    }

    //table columns for leave balance pop up table
    const BalanceCOLUMNS = [
        {
            Header: 'Type',
            accessor: 'leaveTypeName'
        },
        {
            Header: 'Credited',
            accessor: 'totalCredited',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '65%' }}>
                    {row.original.totalCredited}
                </div>
            )
        },

        {
            Header: 'Used',
            accessor: 'totalUsed',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '65%' }}>
                    {row.original.totalUsed}
                </div>
            )
        },

        {
            Header: 'Balance',
            accessor: 'remaining',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '65%' }}>
                    {row.original.remaining}
                </div>
            )
        }
    ]
    const applyLeaveobject = {
        id: leave.id,
        organizationId: userDetails.organizationId,
        leavetypeId: leave.leavetypeId,
        employeeId: leave.employeeId,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        fromSession: leave.fromSession,
        toSession: leave.toSession,
        reason: leave.reason,
        status: status,
        locationId: leave.locationId,
        createdBy: leave.createdBy,
        createdDate: leave.createdDate,
        modifiedBy: userDetails.employeeId
    }

    // api handling for approving leave
    const onApproveHandler = () => {
        ApproveById({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            id: selectedId,
            body: applyLeaveobject,
            reason: formData.reason ? formData.reason : ' '
        }).then((res) => {
            if (res.statusCode == 200) {
                toast.success('Leave Approved Successfully.')
                onGetLeaveHandler()
                navigate('/authorizeLeaves')
                setShow(false)
            } else {
                toast.error(res.errorMessage)
                onGetLeaveHandler()
                navigate('/authorizeLeaves')
            }
        })
    }

    // api handling for rejecting leave
    const onRejectHandler = (e) => {
        e.preventDefault()

        if (!formData.reason || formData.reason.length < 0) {
            setFormErrors({ ...formErrors, reason: 'Required' })
        } else {
            RejectById({
                entity: 'leaves',
                organizationId: userDetails.organizationId,
                id: selectedId,
                body: applyLeaveobject,
                reason: formData.reason
            }).then((res) => {
                if (res.statusCode == 200) {
                    toast.success('Leave Rejected Successfully.')
                    onGetLeaveHandler()
                    navigate('/authorizeLeaves')
                    setShow(false)
                } else {
                    toast.error(res.errorMessage)
                    onGetLeaveHandler()
                    navigate('/authorizeLeaves')
                }
            })
        }
    }

    return (
        <>
            {loading ? <DetailLoader /> : null}
            <section className="section detailBackground">
                <div className="container-fluid">
                    <PageHeader pageTitle={'Authorize Leave'} />

                    <div
                        className="row"
                        style={{ marginLeft: '10%', fontSize: '15px', marginTop: '2%' }}
                    >
                        <div className="row mb-3">
                            <div
                                className="col-sm-4"
                                style={{
                                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                    fontWeight: 'bold'
                                }}
                            >
                                Employee Name
                            </div>
                            <div className="col-sm-8 d-flex align-items-center">
                                <span>{leave && leave.employeeName}</span>
                                <a
                                    className="text-decoration-underline"
                                    onClick={onGetHandler}
                                    style={{
                                        fontSize: '14px',
                                        whiteSpace: 'nowrap',
                                        marginLeft: '15px'
                                    }}
                                >
                                    Leave Balance
                                </a>
                            </div>
                        </div>

                        {/* Dynamic Fields */}
                        {[
                            { label: 'Leave Type', value: leave && leave.leavetypeName },
                            { label: 'Leave Status', value: leave && leave.status },
                            {
                                label: 'From Date',
                                value: `${leave && leave.fromDate} (${leave && leave.fromSession})`
                            },
                            {
                                label: 'To Date',
                                value: `${leave && leave.toDate} (${leave && leave.toSession})`
                            },
                            { label: 'No. of Days', value: leave && leave.numberofDays },
                            { label: 'Reason', value: leave && leave.reason },
                            leave && leave.remarks
                                ? { label: 'Manager Remarks', value: leave.remarks }
                                : null
                        ]
                            .filter(Boolean)
                            .map(({ label, value }) => (
                                <div key={label} className="row mb-3">
                                    <div
                                        className="col-sm-4"
                                        style={{
                                            fontFamily:
                                                "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {label}
                                    </div>
                                    <div className="col-sm-8">
                                        <span
                                            style={{ display: 'inline-block', textAlign: 'left' }}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </section>

            {/* Buttons */}
            <div className="container">
                <div style={{ marginBottom: '20px', marginTop: '5%' }}>
                    <Button
                        className="Button"
                        variant="addbtn"
                        type="button"
                        style={{ marginLeft: '30%' }}
                        onClick={() => onAuthorizeHandler('Approved', leave && leave.id)}
                        disabled={
                            (leave && leave.status === 'Approved') ||
                            (leave && leave.status === 'Rejected')
                        }
                    >
                        Approve
                    </Button>
                    <Button
                        className="Button"
                        variant="addbtn"
                        type="button"
                        onClick={() => onAuthorizeHandler('Rejected', leave && leave.id)}
                        disabled={
                            (leave && leave.status === 'Approved') ||
                            (leave && leave.status === 'Rejected')
                        }
                    >
                        Reject
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        type="button"
                        onClick={onCancelHandler}
                    >
                        {cancelButtonName}
                    </Button>
                </div>
            </div>

            {/* Approval/Reject Modal */}
            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{status === 'Approved' ? 'Approve' : 'Reject'} Leave</Modal.Title>
                </Modal.Header>
                <form onSubmit={onRejectHandler}>
                    <Modal.Body>
                        <div className="col-12">
                            <Form.Group as={Row} className="mb-2" controlId="formGroupToDate">
                                <Form.Label column md={4}>
                                    Remarks{' '}
                                    {status === 'Rejected' && <span className="error">*</span>}
                                </Form.Label>
                                <Col md={7}>
                                    <Form.Control
                                        as="textarea"
                                        maxLength={250}
                                        onChange={handleInputChange}
                                        name="reason"
                                        type="text"
                                    />
                                    <div className="d-flex justify-content-end">
                                        <small>{charCount} / 250</small>
                                    </div>
                                    <p className="error">{formErrors && formErrors.reason}</p>
                                </Col>
                            </Form.Group>
                        </div>
                    </Modal.Body>
                    <div className="delbtn">
                        {status === 'Approved' ? (
                            <Button className="Button" variant="addbtn" onClick={onApproveHandler}>
                                Approve
                            </Button>
                        ) : (
                            <Button className="Button" variant="addbtn" type="submit">
                                Reject
                            </Button>
                        )}
                        <Button variant="secondary" className="Button" onClick={onCloseHandler}>
                            {cancelButtonName}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Leave Balance Modal */}
            <Modal
                size="lg"
                show={leaveBalanceShow}
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Leave Balance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="d-flex justify-content-center">
                            {' '}
                            <Loader />{' '}
                        </div>
                    ) : (
                        <Table
                        key={leaveBalance.length}
                            columns={BalanceCOLUMNS}
                            serialNumber={true}
                            data={leaveBalance}
                            pageSize="10"
                        />
                    )}
                </Modal.Body>
            </Modal>
        </>
    )
}

export default AuthorizeLeaveDetails
