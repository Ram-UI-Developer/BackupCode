import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { getById } from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const ViewLeave = () => {
    const [formData, setFormData] = useState('') // state for text data
    const leaveId = useLocation().state //state for storing leave id
    const [leave, setLeave] = useState({}) //state for handling leave data
    
    const userDetails = useSelector((state) => state.user.userDetails) //user details storing
    const [show, setShow] = useState(false) //state for modal pop ups
    // for redirect
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value.trimStart().replace(/\s+/g, ' ')
        })
    }

    useEffect(() => {
        onGetLeaveHandler()
    }, [])

    const onCancelHandler = () => {
        navigate('/leavesReports')
    }
    const onCloseHandler = () => {
        setShow(false)
    }

    //api handling for leaves get by id
    const onGetLeaveHandler = () => {
        getById({ entity: 'leaves', organizationId: userDetails.organizationId, id: leaveId }).then(
            (res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setLeave(res.data)
                }
            }
        )
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="">
                        <PageHeader pageTitle={'Employee Leave Report'} />
                        <div style={{ marginTop: '2%' }}>
                            <div className="row" style={{ marginLeft: '10%', fontSize: '15px' }}>
                                <div
                                    className="col-sm-4 mb-3"
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Employee Name
                                </div>
                                <div className="col-sm-8">{leave.employeeName}</div>
                                <div
                                    className="col-sm-4 mb-3"
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Leave Type{' '}
                                </div>
                                <div className="col-sm-8">{leave.leavetypeName}</div>
                                <div
                                    className="col-sm-4 mb-3"
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Leave Status{' '}
                                </div>
                                <div className="col-sm-8">{leave.status}</div>
                                <div
                                    className="col-sm-4 mb-3"
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        fontWeight: 'bold'
                                    }}
                                >
                                    From Date{' '}
                                </div>
                                <div className="col-sm-8">
                                    {' '}
                                    {leave.fromDate === leave.toDate
                                        ? leave.fromSession === leave.toSession
                                            ? `${leave.fromDate} (${leave.fromSession})`
                                            : `${leave.fromDate}`
                                        : leave.fromSession === 'SecondSession'
                                          ? `${leave.fromDate} (${leave.fromSession})`
                                          : `${leave.fromDate}`}
                                </div>
                                <div
                                    className="col-sm-4 mb-3"
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        fontWeight: 'bold'
                                    }}
                                >
                                    To Date{' '}
                                </div>
                                <div className="col-sm-8">
                                    {' '}
                                    {leave.fromDate === leave.toDate
                                        ? leave.toSession === 'FirstSession'
                                            ? `${leave.toDate} (${leave.toSession})`
                                            : `${leave.toDate}`
                                        : `${leave.toDate} (${leave.toSession})`}
                                </div>
                                <div
                                    className="col-sm-4 mb-3"
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        fontWeight: 'bold'
                                    }}
                                >
                                    No. of Days{' '}
                                </div>
                                <div className="col-sm-8">{leave.numberofDays}</div>
                                <div
                                    className="col-sm-4 mb-3"
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Reason{' '}
                                </div>
                                <div className="col-sm-8">{leave.reason}</div>

                                <>
                                    {' '}
                                    <div
                                        className="col-sm-4 mb-8 mb-4"
                                        style={{
                                            fontFamily:
                                                "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Manager Remarks{' '}
                                    </div>
                                    <div className="col-sm-8">{leave.remarks}</div>
                                </>
                            </div>
                        </div>

                        <div className="container">
                            <div style={{ marginBottom: '30px', marginLeft: '450px' }}>
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
                    </div>
                </div>
            </section>

            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>{status == 'Approved' ? 'Approve' : 'Reject'} Leave</Modal.Title>
                </Modal.Header>
                <form
                //  onSubmit={onRejectHandler}
                >
                    <Modal.Body>
                        <div class="col-12">
                            <Form.Group as={Row} className="mb-2" controlId="formGroupToDate">
                                <Form.Label column md={4}>
                                    Remarks{' '}
                                    {status == 'Rejected' && <span className="error">*</span>} :
                                </Form.Label>
                                <Col md={7}>
                                    <Form.Control
                                        as="textarea"
                                        // required
                                        onChange={onChangeHandler}
                                        name="reason"
                                        type="text"
                                    />
                                  
                                </Col>
                            </Form.Group>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="modalFooter">
                            <Button variant="secondary" onClick={onCloseHandler}>
                                {cancelButtonName}
                            </Button>
                        </div>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}

export default ViewLeave
