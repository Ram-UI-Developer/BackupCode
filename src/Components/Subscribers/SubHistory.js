import html2canvas from 'html2canvas' // Used for converting HTML to canvas
import jsPDF from 'jspdf' // Used for generating PDF from canvas
import moment from 'moment' // For date formatting
import React, { useRef, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { FaEye } from 'react-icons/fa6'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { subscriptionInfo, subscriptionInfoFromAppowner } from '../../Common/Services/OtherServices'
import Invoice from '../Packages&Billigs/Billing&Payment/Invoice'

const SubHistory = ({ data, organizationId, isActive = false }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get user details from Redux
    const [isPdfGenerated, setIsPdfGenerated] = useState(false) // Track if PDF is ready
    const navigate = useNavigate() // For routing
    const pdfRef = useRef() // Reference to the invoice DOM element

    const [show, setShow] = useState(false) // Show/hide modal
    const [subscriptionId, setSubScriptionId] = useState(null) // Current selected subscription ID

    // Trigger invoice modal and set the selected subscription ID
    const onINvoiceHandler = (id) => {
        setShow(true)
        setSubScriptionId(id)
    }

    // Close modal and reset flags
    const handleClose = () => {
        setShow(false)
        setIsPdfGenerated(false)
    }

    // Export invoice as PDF using html2canvas and jsPDF
    const exportInvoice = () => {
        if (pdfRef.current) {
            const input = pdfRef.current
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF()
                const imgProps = pdf.getImageProperties(imgData)
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save('Invoice.pdf')
            })
        }
    }

    // Format today's date
    const today = new Date()
    const todayDate = moment(today).format('YYYY-MM-DD')

    // Handle "Renewal" or "Change" actions
    const onRenewalHandler = (item, type) => {
        if (userDetails.organizationId) {
            subscriptionInfo({
                entity: 'subscriptions',
                organizationId: item.organizationId,
                subscriptionId: item.id
            }).then((res) => {
                // Navigate to packages page with subscription history and action type
                navigate('/packages', {
                    state: {
                        top: '60px',
                        subscriptionHistory: res.data,
                        type: type,
                        payment: true
                    }
                })

            })
                .catch(() => { }) // Handle error by doing nothing
        } else {
            subscriptionInfoFromAppowner({
                entity: 'subscriptions',
                subscriptionId: item.id
            }).then((res) => {
                // Navigate to packages page with subscription history and action type
                navigate('/packages', {
                    state: {
                        top: '60px',
                        subscriptionHistory: res.data,
                        type: type,
                        payment: true
                    }
                })
            })
                .catch(() => { }) // Handle error by doing nothing
        }
    }

    return (
        <div>
            {data.map((e) => (
                <div key={e.id} className="card" style={{ width: '95%', padding: '10px' }}>
                    {/* First Row: Package Info & Buttons */}
                    <Row style={{ marginLeft: '0.1rem' }}>
                        <div className="col-6">
                            <Form.Group as={Row} className="mb-1">
                                <Form.Label column sm={4}>
                                    Package Name
                                </Form.Label>
                                <Col sm={4} style={{ marginTop: '1%' }}>
                                    {e.packageName}
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Renewal and Change buttons */}
                        <div
                            className="col-sm-6 d-flex"
                            style={{ flexDirection: 'row-reverse', right: '12px' }}
                        >
                            {userDetails.organizationId && (
                                <>
                                    {e.paid ? <>
                                        <Button
                                            onClick={() => onRenewalHandler(e, 'renewal')}
                                            variant=""
                                            style={{ backgroundColor: '#EB7222', color: 'white' }}
                                        >
                                            Renewal
                                        </Button>{' '}
                                        &emsp;
                                        <Button
                                            variant=""
                                            style={{ backgroundColor: '#EB7222', color: 'white' }}
                                            onClick={() => onRenewalHandler(e, 'upgrade')}
                                        >
                                            Change
                                        </Button>
                                    </> : (
                                        <Button
                                            onClick={() => navigate(`/subscriptionPayment?id=${e.id}&organizationId=${userDetails.organizationId}`,)}
                                            variant=""
                                            style={{ backgroundColor: '#EB7222', color: 'white' }}
                                        >
                                            Pay
                                        </Button>
                                    )
                                    }
                                </>
                            )}
                        </div>
                    </Row>

                    {/* Second Row: Valid From & To Dates */}
                    <Row style={{ marginLeft: '0.1rem' }}>
                        <div className="col-6">
                            <Form.Group as={Row} className="mb-1">
                                <Form.Label column sm={4}>
                                    Valid From
                                </Form.Label>
                                <Col sm={4} style={{ marginTop: '1%' }}>
                                    {e.validFrom}
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-4">
                            <Form.Group as={Row} className="mb-1">
                                <Form.Label column sm={3}>
                                    Valid To
                                </Form.Label>
                                <Col sm={4} style={{ marginTop: '1%', marginLeft: '-2rem' }}>
                                    {e.validTo}
                                </Col>
                            </Form.Group>
                        </div>
                    </Row>

                    {/* Payment Status */}
                    <div className="col-sm-6">
                        <Form.Group as={Row} className="mb-1">
                            <Form.Label column sm={4}>
                                Payment Status
                            </Form.Label>
                            <Col sm={4} style={{ marginTop: '1%', marginLeft: '0.1rem' }}>
                                {e.paid ? 'Paid' : 'Pending'}
                            </Col>
                        </Form.Group>
                    </div>

                    {/* User Count and Invoice link */}
                    <Row style={{ marginLeft: '0.1rem' }}>
                        <div className="col-sm-6">
                            <Form.Group as={Row} className="mb-1">
                                <Form.Label column sm={4}>
                                    User Count
                                </Form.Label>
                                <Col sm={4} style={{ marginTop: '1%' }}>
                                    {e.fromRange} - {e.toRange}
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Invoice link and status (Active/Expired) */}
                        <div
                            className="col-6 d-flex"
                            style={{ flexDirection: 'row-reverse', right: '12px' }}
                        >
                            <a
                                style={{ marginTop: '0.3rem' }}
                                onClick={() => onINvoiceHandler(e.id)}
                            >
                                {e.paid && <><FaEye /> <u>Invoice</u></>}
                            </a>{' '}
                            &emsp;
                            {e.paid && <div>
                                {e.validTo > todayDate && isActive ? (
                                    <span
                                        className="text-green"
                                        style={{ fontWeight: '600', fontSize: '20px' }}
                                    >
                                        Active
                                    </span>
                                ) : (
                                    <span
                                        className="text-red"
                                        style={{ fontWeight: '600', fontSize: '20px' }}
                                    >
                                        Inactive
                                    </span>
                                )}
                            </div>}
                        </div>
                    </Row>
                </div>
            ))}

            {/* Invoice Modal */}
            <Modal
                show={show}
                scrollable
                onHide={handleClose}
                backdrop="static"
                size="lg"
                keyboard={false}
            >
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>Invoice</Modal.Title>
                </Modal.Header>

                <Modal.Body className="modalBody mb-4">
                    <Invoice
                        setIsPdfGenerated={setIsPdfGenerated}
                        ref={pdfRef}
                        subscriptionId={subscriptionId}
                        appOwner={!userDetails.organizationId} // True if app owner (not organization)
                        organizationId={userDetails.organizationId || organizationId}
                    />
                </Modal.Body>

                {/* PDF Download and Cancel buttons */}
                <div className="btnCenter mb-3">
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={exportInvoice}
                        disabled={!isPdfGenerated || !pdfRef.current}
                    >
                        Download
                    </Button>

                    <Button className="Button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default SubHistory
