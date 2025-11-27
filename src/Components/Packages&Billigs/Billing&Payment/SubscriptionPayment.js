import React, { useEffect, useState } from 'react'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {
    createOrder,
    getNewSubscriber,
    verifyPayment
} from '../../../Common/Services/OtherServices'
import { useNavigate } from 'react-router-dom'
import { RAZOR_PAY_KEY } from '../../../Common/Utilities/Constants'
import Loader from '../../../Common/CommonComponents/Loader'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'
import { useSelector } from 'react-redux'

const SubscriptionPayment = () => {
    const navigate = useNavigate()
    // Get logged-in user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    const [data, setData] = useState(null) // Subscription data to show in UI
    const urlParams = new URLSearchParams(window.location.search) // Creates an instance of URLSearchParams to parse the query parameters from the current URL.
    const id = urlParams.get('id') // Subscription ID from URL
    const organizationId = urlParams.get('organizationId') // Org ID from URL
    // On component mount, fetch subscription details
    useEffect(() => {
        setLoading(true)
        getSubscriptionDetails()
    }, [])
    // Dynamically load Razorpay SDK if not already loaded
    const loadRazorpay = () => {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) {
                resolve(window.Razorpay)
            } else {
                const script = document.createElement('script')
                script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                script.async = true
                script.onload = () => resolve(window.Razorpay)
                script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
                document.body.appendChild(script)
            }
        })
    }
    // Verifies the Razorpay payment after successful completion
    const verifyPaymentHandler = async (
        response, orderCreated
        
    ) => {
        const obj = {
            ...orderCreated.data,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
        }
        try {
            const res = await verifyPayment({
                id: orderCreated.data.id,
                organizationId: organizationId,
                body: obj
            })
            // If payment verified, redirect to thank-you page
            if(res && res.data && res.data.paid) {
                navigate('/thankyou', { state: 'paid' })
            setLoading(false)
            }
           
        } catch (err) {
            // Show error toast on verification failure
            ToastError(err.message)
        }
    }

    const [loading, setLoading] = useState(false) // Loader state

    // Triggered when user clicks on "Pay" button
    const handlePayment = async (e) => {
        e.preventDefault()
        setLoading(true)
        // Prepare payload for Razorpay order creation
        const obj = {
            amount: data.afterDiscount,
            subscriptionId: id,
            organizationId: organizationId,
            currency: 'INR'
        }
        try {
            const res = await createOrder({
                body: obj
            })
            if (!res.data || !res.data.orderId) {
                throw new Error('Order ID is missing in the response')
            }
            const Razorpay = await loadRazorpay()
            // Razorpay checkout options
            var options = {
                key: RAZOR_PAY_KEY,
                amount: res.data.amount,
                currency: res.data.currency,

                order_id: res.data.orderId,
                handler: (response) => verifyPaymentHandler(response, res),
                theme: {
                    color: '#3399cc'
                },
                method: {
                    upi: true,
                    card: true,
                    netbanking: true
                },
                modal: {
                    ondismiss: () => {
                       
                        // Refresh the subscription details without showing the loader
                        getSubscriptionDetails()
                    }
                }
            }
            // Open Razorpay popup
            var rzp1 = new Razorpay(options)
            rzp1.on('payment.failed', function () {
                // Stop loader if payment fails
                setLoading(false)
            })
            rzp1.open()
        } catch (err) {
            // Hide loader on any error
            setLoading(false)
        }
    }
    // Fetch subscription info using subscription ID and organization ID
    const getSubscriptionDetails = () => {
        getNewSubscriber({
            organizationId: organizationId,
            subscriptionId: id
        })
            .then((res) => {
                // If already paid, redirect to thank-you page
                if (res && res.data && res.data.paid) {
                    navigate('/thankyou', { state: 'paid' })
                }
                // Set response data to state for UI rendering
                setData(res && res.data)
                setLoading(false)
            })

            .catch(() => {
                // Handle error silently and hide loader
                setLoading(false)
            })
    }

    return (
        <section className="section">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12" style={{ marginTop: '-100px' }}>
                        <br />
                        <PageHeader pageTitle=" " />
                        {loading ? (
                            <center>
                                <Loader />
                            </center>
                        ) : (
                            <div
                                className="payment-container"
                                style={{
                                    width: '100.45%',
                                    marginTop: userDetails ? '85px' : '0px'
                                }}
                            >
                                {/* Payment Info Card */}
                                <div className="payment-section">
                                    <div className="payment-card">
                                        <div className="paymentHeads">Payment Details</div>
                                        <hr className="payment-line" />

                                        <div className="formBody">
                                            <form className="card-body">
                                                {/* Amount */}
                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            className="fieldLable"
                                                            column
                                                            md={6}
                                                        >
                                                            Amount :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <Form.Control
                                                                disabled
                                                                className="textFieldSub"
                                                                value={data && data.afterDiscount}
                                                                name="amount"
                                                                type="text"
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Organization Name */}
                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            className="fieldLable"
                                                            column
                                                            md={6}
                                                        >
                                                            Organization Name :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <Form.Control
                                                                disabled
                                                                className="textFieldSub"
                                                                value={
                                                                    data && data.organizationName
                                                                }
                                                                name="organizationName"
                                                                type="text"
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Package Name */}
                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            className="fieldLable"
                                                            column
                                                            md={6}
                                                        >
                                                            Package Name :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <Form.Control
                                                                disabled
                                                                className="textFieldSub"
                                                                value={data && data.packageName}
                                                                name="packageName"
                                                                type="text"
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    {/* Payment Gateway Selection (currently Razorpay only) */}
                                    <div
                                        className="payment-card"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <input type="radio" label="Internal" checked={true} />
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    marginLeft: '1rem'
                                                }}
                                            >
                                                <span style={{ color: '#004aad', fontWeight: 700 }}>
                                                    Razorpay
                                                </span>
                                                <span>
                                                    Secure online payment through Razorpay portal
                                                </span>
                                            </div>
                                        </div>
                                        <img
                                            src="/dist/SVGs/Razorpay.svg"
                                            alt="Razorpay"
                                            style={{ width: '5rem' }}
                                        />
                                    </div>
                                </div>
                                {/* Details Section */}
                                <div className="details-section">
                                    <p
                                        className="paymentHeads"
                                        style={{ marginTop: '30px', marginBottom: '0px' }}
                                    >
                                        Details
                                    </p>
                                    <hr className="payment-line" />
                                    {/* Selected Modules */}
                                    <p className="fieldLable" style={{ color: '#fff' }}>
                                        <b>Selected Modules</b>
                                    </p>
                                    <ul>
                                        {data &&
                                            data.modules &&
                                            data.modules.map((rec, index) => (
                                                <li
                                                    className="fieldLable"
                                                    style={{ paddingLeft: '40px' }}
                                                    key={index}
                                                >
                                                    {rec.name}
                                                </li>
                                            ))}
                                    </ul>
                                    {/* User Range */}
                                    <p className="fieldLable" style={{ color: '#fff' }}>
                                        <b>Users Count</b>
                                    </p>
                                    <p className="fieldLable" style={{ paddingLeft: '40px' }}>
                                        {data && data.fromRange} - {data && data.toRange} Users
                                    </p>
                                    {/* Pay Button */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            marginTop: '2rem'
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            disabled={!data}
                                            className="pay-button"
                                            onClick={handlePayment}
                                        >
                                            Pay &#8377;{data && data.afterDiscount}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SubscriptionPayment
