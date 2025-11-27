import moment from 'moment'
import { toWords } from 'number-to-words'
import React, { forwardRef, useEffect, useState } from 'react'
import { Col } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import {
    getInvoiceBySubscriberId,
    getInvoiceBySubscriberIdAppOwner
} from '../../../Common/Services/OtherServices'

// ForwardRef to allow parent component to reference this component directly (useful for printing/exporting PDF)
const Invoice = forwardRef((props, ref) => {
    const { setIsPdfGenerated, subscriptionId, organizationId, appOwner } = props

    // States to hold loading status and fetched data
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState(null)
    // States to hold formatted address arrays
    const [fromAddress, setFromAddress] = useState([])
    const [toAddress, setToAddress] = useState([])

    // Fetch invoice data on initial render
    useEffect(() => {
        setIsLoading(true)
        getInvoice()
    }, [])
    // Format currency values with the selected currency code
    const currencyFormateHandler = (amount) => {
        return formatCurrency(amount, 'INR')
    }
    // Capitalizes the first letter of each word in a string (removes commas first)
    const capitalizeFirstLetter = (str) => {
        let cleanWords = str.replace(/,/g, '')
        cleanWords = cleanWords
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        return cleanWords
    }

    // Fetch invoice based on whether it's for the app owner or not
    const getInvoice = () => {
        const fetchInvoice = appOwner
            ? getInvoiceBySubscriberIdAppOwner({
                  subscriptionId: subscriptionId,
                  organizationId: organizationId
              })
            : getInvoiceBySubscriberId({
                  subscriptionId: subscriptionId,
                  organizationId: organizationId
              })
        fetchInvoice
            .then((res) => {
                setData(res.data)
                setIsPdfGenerated(true) // Notify parent component that PDF can now be generated
                splitAddress(res.data) // Parse and split addresses into arrays
            })

            .catch(() => {
                setIsLoading(false)
            })
    }
    // Split comma-separated addresses into arrays for display
    const splitAddress = (add) => {
        setFromAddress(add.fromAddress.split(','))
        setToAddress(add.toAddress.split(','))
        setIsLoading(false)
    }

    return (
        <div ref={ref} style={{ padding: '10px' }}>
            {/* Show invoice data if available and not loading */}
            {data && !isLoading ? (
                <div>
                    {/* Header Section */}
                    <Row className="invoice-broder">
                        <Col md={6} style={{ justifyItems: 'left' }}>
                            {/* Company logo */}
                            <div>
                                <p>
                                    <img
                                        src="/dist/Images/Workshine.png"
                                        alt="Workshine Logo"
                                        className="invoiceLogo"
                                    />
                                </p>
                            </div>
                        </Col>
                        <Col md={6}>
                            {/* Display "From" address dynamically line-by-line */}
                            <p className="no-margin" style={{ textAlign: 'right' }}>
                                {data && data.fromAddress && fromAddress.length > 0 ? (
                                    fromAddress.map((line, index) => {
                                        return index == 0 ? (
                                            <p className="no-margin invoice-heads-text" key={index}>
                                                {line}
                                            </p>
                                        ) : (
                                            <p className="no-margin invoice-para-text" key={index}>
                                                {line}
                                            </p>
                                        )
                                    })
                                ) : (
                                    <p className="no-margin invoice-para-text">-</p>
                                )}
                                {/* Static email and phone details */}
                                <p className="no-margin invoice-para-text">
                                    <span className="invoice-sub-heads-text">Email:</span>{' '}
                                    itsupport@infyshine.com
                                </p>
                                <p className="no-margin invoice-para-text">
                                    <span className="invoice-sub-heads-text">Phone:</span>
                                    99999999999
                                </p>
                            </p>
                        </Col>
                    </Row>
                    {/* === Billing & Invoice Info === */}
                    <Row className="invoice-broder">
                        {/* To Address (Client) */}
                        <Col md={6}>
                            <p className="no-margin" style={{ textAlign: 'left' }}>
                                <strong>Bill To:</strong>
                                {data &&
                                    data.toAddress &&
                                    toAddress.map((line, index) => (
                                        <p className="no-margin invoice-para-text" key={index}>
                                            {line}
                                        </p>
                                    ))}
                            </p>
                        </Col>
                        {/* Invoice Details */}
                        <Col md={6} style={{ textAlign: 'right' }}>
                            <Row>
                                <Col className="invoice-sub-heads-text">Invoice Details</Col>
                            </Row>
                            <Row>
                                <Col className="invoice-para-text">Invoice No.:</Col>
                                <Col className="invoice-para-text">
                                    {data && data.invoiceNumber}
                                </Col>
                            </Row>
                            <Row>
                                <Col className="invoice-para-text">Invoice Date:</Col>
                                <Col className="invoice-para-text">
                                    {moment(data && data.invoiceDate).format('DD-MM-YYYY')}
                                </Col>
                            </Row>
                            <Row>
                                <Col className="invoice-para-text">Plan period:</Col>
                                <Col className="invoice-para-text">
                                    {data && data.subscriptionDetails.validFrom} to{' '}
                                    {data && data.subscriptionDetails.validTo}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {/* === Plan Info Section === */}
                    <Row>
                        <Col md={8} style={{ textAlign: 'left' }}>
                            <Row>
                                <p className="invoice-heads-text">
                                    For {data && data.subscriptionDetails.toRange} Employees
                                </p>
                            </Row>
                        </Col>
                    </Row>
                    {/* === Modules Table === */}
                    <Row className="invoice-broder">
                        <table className="table">
                            <thead className="tableHeader">
                                <tr>
                                    <th className="text-left">S.No</th>
                                    <th className="text-left">Modules Subscribed</th>
                                    <th className="invoice-price invoice-price-text">Price</th>
                                </tr>
                            </thead>
                            <tbody className="tableBody">
                                {data &&
                                    data.subscriptionDetails.modules &&
                                    data.subscriptionDetails.modules.map((record, index) => (
                                        <tr>
                                            <td className="serialNumber">{index + 1}</td>
                                            <td
                                                style={{
                                                    wordWrap: 'break-word',
                                                    padding: '2px',
                                                    verticalAlign: 'middle',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                {record.name}
                                            </td>
                                            <td
                                                style={{
                                                    wordWrap: 'break-word',
                                                    padding: '2px',
                                                    verticalAlign: 'middle',
                                                    textAlign: 'right',
                                                    paddingRight: '35px'
                                                }}
                                            >
                                                {currencyFormateHandler(record.price)}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </Row>

                    {/* === Summary Section === */}
                    <Row style={{ textAlign: 'left' }}>
                        <Col md={8}>
                            <Row>
                                <p className="invoice-para-text">Amount Chargeable (in words)</p>
                            </Row>
                            <Row>
                                <p className="invoice-sub-heads-text">
                                    {data &&
                                    data.subscriptionDetails &&
                                    data.subscriptionDetails.afterDiscount &&
                                    data.subscriptionDetails.afterDiscount !== 0
                                        ? `Rupees ${capitalizeFirstLetter(toWords(Math.round(data.subscriptionDetails.afterDiscount)))} Only`
                                        : '-'}
                                </p>
                            </Row>
                        </Col>
                        {/* Price Summary */}
                        <Col md={4}>
                            <Row className="invoice-broder">
                                <Col>Subtotal:</Col>
                                <Col style={{ textAlign: 'right', paddingRight: '35px' }}>
                                    {data
                                        ? currencyFormateHandler(data.subscriptionDetails.total)
                                        : null}
                                </Col>
                            </Row>
                            <Row>
                                <Col>Discount:</Col>
                                <Col style={{ textAlign: 'right', paddingRight: '35px' }}>
                                    {data ? data.subscriptionDetails.discount : 0}(%)
                                </Col>
                            </Row>

                            <Row className="invoice-broder">
                                <Col>Total:</Col>
                                <Col style={{ textAlign: 'right', paddingRight: '35px' }}>
                                    {data
                                        ? currencyFormateHandler(
                                              data.subscriptionDetails.afterDiscount
                                          )
                                        : null}
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* Footer */}
                    <div style={{ paddingTop: '20px' }}>
                        <Row>
                            <Col md={8}></Col>
                            <Col md={4}>
                                <p className="no-margin invoice-sub-heads-text">
                                    Authorized Signature
                                </p>
                                <img
                                    src="/dist/Images/Workshine.png"
                                    alt="Signature"
                                    className="invoiceLogoFooter"
                                />
                            </Col>
                        </Row>
                    </div>
                </div>
            ) : (
                // Show loader while data is being fetched
                <center>
                    <DetailLoader />
                </center>
            )}
        </div>
    )
})

export default Invoice
