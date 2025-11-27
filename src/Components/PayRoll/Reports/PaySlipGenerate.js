import React, { useEffect, useState, forwardRef } from 'react'
import { Row, Col } from 'react-bootstrap'
import { payslipGenerationForEmployee } from '../../../Common/Services/OtherServices'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import './PaySlip.css'
import { toWords } from 'number-to-words'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'

// Forward ref allows this component to be used with a parent ref (for PDF or DOM access)
const PaySlipGenerate = forwardRef((props, ref) => {
    const {
        setLoading,
        selectedMonth,
        setIsPdfGenerated,
        setErrorMsg,
        selectedYear,
        organizationId,
        employeeId
    } = props

    // State to manage image source for logo
    const [imageSrc, setImageSrc] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // States to hold total earnings and deductions
    const [totalEarnings, setTotalEarnings] = useState(0)
    const [totalDeductions, setTotalDeductions] = useState(0)

    // Helper to calculate totals from earnings or deduction list
    const calculateTotal = (list) => {
        return list.reduce(
            (element, item) => {
                element.fullAmount += item.fullAmount
                element.actualAmount += item.actualAmount
                return element
            },
            { fullAmount: 0, actualAmount: 0 }
        )
    }

    // Get first 3 characters of a word (used for month)
    const getFirstThreeLetters = (word) => {
        return word.slice(0, 3)
    }

    // Labels for personal details and the corresponding keys from response data
    const personalDetails = [
        { lable: 'Name', key: 'empName' },
        { lable: 'Joining Date', key: 'joiningDate' },
        { lable: 'Designation', key: 'designation' },
        { lable: 'Department', key: 'department' },
        { lable: 'Location', key: 'locationName' },
        { lable: 'Effective Working Days', key: 'effectiveWorkDays' },
        { lable: 'LOP', key: 'lop' }
    ]
    // Labels for account details
    const accountDetails = [
        { lable: 'Employee No', key: 'empCode' },
        { lable: 'Bank Name', key: 'bankName' },
        { lable: 'Bank Account No', key: 'accountNumber' },
        { lable: 'PAN Number', key: 'panNumber' },
        { lable: 'PF No', key: 'pfNumber' },
        { lable: 'UAN No', key: 'pfUan' }
    ]

    const [earningsLength, setEarningsLength] = useState(0)
    const [deductionsLength, setDeductionsLength] = useState(0)
    const [maxLength, setMaxLength] = useState(0) // Used for table alignment
    const [currencyCode, setCurrencyCode] = useState('') // Currency code for formatting
    // Format currency using utility
    const currencyFormateHandler = (amount) => {
        return formatCurrency(amount, currencyCode || 'INR')
    }
    // Capitalize first letter of each word (used in net pay text)
    const capitalizeFirstLetter = (str) => {
        let cleanWords = str.replace(/,/g, '')
        cleanWords = cleanWords
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        return cleanWords
    }

    const [data, setData] = useState(null) // Main data for payslip
    // Auto-trigger when month/year/orgId/employeeId changes
    useEffect(() => {
        if (selectedMonth && organizationId && selectedYear && employeeId) {
            setErrorMsg(null)
            payslipGenerationHandler()
        }
    }, [selectedMonth, selectedYear, organizationId, employeeId])

    // Main handler to fetch payslip data
    const payslipGenerationHandler = () => {
        setIsLoading(true)
        setLoading(true)
        // API call to fetch payslip
        payslipGenerationForEmployee({
            month: getFirstThreeLetters(selectedMonth),
            year: selectedYear,
            organizationId: organizationId,
            employeeId: employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setData(res.data)
                    setImageSrc(res.data.logo ? `data:image/png;base64,${res.data.logo}` : null)
                    // Set earnings and deductions length for alignment
                    const earnings = res.data.earningsList.length
                    const deductions = res.data.deductionList.length
                    setEarningsLength(Number(earnings))
                    setDeductionsLength(Number(deductions))
                    const max = Math.max(earnings, deductions)
                    setMaxLength(Number(max))

                    // Currency code for formatting
                    setCurrencyCode(res.data.currencyCode)
                    // Set total earnings/deductions
                    setTotalEarnings(calculateTotal(res.data.earningsList))
                    setTotalDeductions(calculateTotal(res.data.deductionList))
                    setIsPdfGenerated(true)
                } else {
                    // No payslip generated yet
                    setData(null)
                    setErrorMsg('Pay slip not generated yet.')
                    setIsPdfGenerated(false)
                }
                setLoading(false)
                setIsLoading(false)
            })
            .catch(() => {
                // Handle error gracefully
                setData(null)
                setIsPdfGenerated(false)
                setIsLoading(false)
                setLoading(false)
                ToastError('Failed to generate pay slip')
            })
    }

    return (
        <div ref={ref} style={{ padding: '10px' }}>
            {/* Only render table if data exists and loading is complete */}
            {data && !isLoading ? (
                <table width="100%" border="2px solid black">
                    <tbody>
                        {/* Header with logo and company info */}
                        <tr style={{ borderBottom: '2px solid black' }}>
                            <Row>
                                <Col md={2}>
                                    {imageSrc ? (
                                        <img
                                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                                            src={imageSrc}
                                            alt="Company Logo"
                                        />
                                    ) : (
                                        <p>Loading image...</p>
                                    )}
                                </Col>
                                <Col md={8}>
                                    <Row>
                                        <Col
                                            style={{
                                                textAlign: 'center',
                                                fontSize: '20px',
                                                fontWeight: 'bold'
                                            }}
                                            md={12}
                                        >
                                            {data ? data.organizationName : ''}
                                        </Col>
                                        <Col
                                            style={{ textAlign: 'center', fontSize: '12px' }}
                                            md={12}
                                        >
                                            {data ? data.locationAddress : ''}
                                        </Col>
                                        <Col
                                            style={{
                                                marginTop: '10px',
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                textAlign: 'center'
                                            }}
                                        >
                                            Payslip for the month of {selectedMonth} {selectedYear}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </tr>
                        {/* Personal and Account Details */}
                        {data ? (
                            <>
                                <tr style={{ borderBottom: '2px solid black' }}>
                                    <Row style={{ padding: '0px 10px' }}>
                                        {/* Personal details */}
                                        <Col
                                            md={6}
                                            style={{
                                                padding: 'none',
                                                borderRight: '2px solid black'
                                            }}
                                        >
                                            {personalDetails.map(
                                                (detail, key) =>
                                                    Object.keys(data).includes(detail.key) && (
                                                        <Row key={key}>
                                                            <Col
                                                                style={{ fontWeight: 'bold' }}
                                                                md={6}
                                                            >
                                                                {detail.lable}:
                                                            </Col>
                                                            <Col
                                                                md={6}
                                                                className={
                                                                    detail.key ==
                                                                        'effectiveWorkDays' ||
                                                                    detail.key == 'lop'
                                                                        ? 'text-right'
                                                                        : 'text-left'
                                                                }
                                                            >
                                                                {data[detail.key]}
                                                            </Col>
                                                        </Row>
                                                    )
                                            )}
                                        </Col>
                                        {/* Account details */}
                                        <Col md={6}>
                                            {accountDetails.map(
                                                (detail, key) =>
                                                    Object.keys(data).includes(detail.key) && (
                                                        <Row key={key}>
                                                            <Col
                                                                style={{ fontWeight: 'bold' }}
                                                                md={6}
                                                            >
                                                                {detail.lable}:
                                                            </Col>
                                                            <Col md={6}>{data[detail.key]}</Col>
                                                        </Row>
                                                    )
                                            )}
                                        </Col>
                                    </Row>
                                </tr>

                                {/* Earnings and Deductions */}
                                <tr style={{ borderBottom: '2px solid black' }}>
                                    <Row style={{ padding: '0px 10px' }}>
                                        {/* Earnings section */}
                                        <Col
                                            md={6}
                                            style={{
                                                padding: 'none',
                                                borderRight: '2px solid black'
                                            }}
                                        >
                                            <Row>
                                                <Col style={{ fontWeight: 'bold' }} md={6}>
                                                    Earnings
                                                </Col>
                                                <Col
                                                    style={{
                                                        fontWeight: 'bold',
                                                        textAlign: 'right'
                                                    }}
                                                    md={3}
                                                >
                                                    Full
                                                </Col>
                                                <Col
                                                    style={{
                                                        fontWeight: 'bold',
                                                        textAlign: 'right'
                                                    }}
                                                    md={3}
                                                >
                                                    Actual
                                                </Col>
                                            </Row>
                                            {data.earningsList.map((earning, index) => (
                                                <Row key={index}>
                                                    <Col md={6}>{earning.name}</Col>
                                                    <Col style={{ textAlign: 'right' }} md={3}>
                                                        {currencyFormateHandler(earning.fullAmount)}
                                                    </Col>
                                                    <Col style={{ textAlign: 'right' }} md={3}>
                                                        {currencyFormateHandler(
                                                            earning.actualAmount
                                                        )}
                                                    </Col>
                                                </Row>
                                            ))}
                                            {/* Add empty rows to align with deductions */}
                                            {maxLength - earningsLength > 0 &&
                                                Array.from({
                                                    length: maxLength - earningsLength
                                                }).map((_, index) => (
                                                    <Row
                                                        key={`earning-empty-${index}`}
                                                        className="row-debug"
                                                    >
                                                        <Col md={6}></Col>
                                                        <Col md={3}></Col>
                                                        <Col md={3}></Col>
                                                    </Row>
                                                ))}
                                            {/* Total earnings */}
                                            <Row>
                                                <Col style={{ fontWeight: 'bold' }} md={6}>
                                                    Total Earnings
                                                </Col>
                                                <Col
                                                    style={{
                                                        fontWeight: 'bold',
                                                        textAlign: 'right'
                                                    }}
                                                    md={3}
                                                >
                                                    {currencyFormateHandler(
                                                        totalEarnings.fullAmount
                                                    )}
                                                </Col>
                                                <Col
                                                    style={{
                                                        fontWeight: 'bold',
                                                        textAlign: 'right'
                                                    }}
                                                    md={3}
                                                >
                                                    {currencyFormateHandler(
                                                        totalEarnings.actualAmount
                                                    )}
                                                </Col>
                                            </Row>
                                        </Col>
                                        {/* Deductions section */}
                                        <Col md={6}>
                                            <Row>
                                                <Col style={{ fontWeight: 'bold' }} md={9}>
                                                    Deductions
                                                </Col>
                                                <Col
                                                    style={{
                                                        fontWeight: 'bold',
                                                        textAlign: 'right'
                                                    }}
                                                    md={3}
                                                >
                                                    Actual
                                                </Col>
                                            </Row>
                                            {data.deductionList.map((deduction, index) => (
                                                <Row key={index}>
                                                    <Col md={9}>{deduction.name}</Col>
                                                    <Col style={{ textAlign: 'right' }} md={3}>
                                                        {currencyFormateHandler(
                                                            deduction.actualAmount
                                                        )}
                                                    </Col>
                                                </Row>
                                            ))}
                                            {/* Empty rows for alignment */}
                                            {maxLength - deductionsLength > 0 &&
                                                Array.from({
                                                    length: maxLength - deductionsLength
                                                }).map((_, index) => (
                                                    <Row
                                                        key={`deduction-empty-${index}`}
                                                        className="row-debug"
                                                    >
                                                        <Col md={9}></Col>
                                                        <Col md={3}></Col>
                                                    </Row>
                                                ))}
                                            {/* Total deductions */}
                                            <Row>
                                                <Col style={{ fontWeight: 'bold' }} md={9}>
                                                    Total Deductions
                                                </Col>
                                                <Col
                                                    style={{
                                                        textAlign: 'right',
                                                        fontWeight: 'bold'
                                                    }}
                                                    md={3}
                                                >
                                                    {currencyFormateHandler(
                                                        totalDeductions.actualAmount
                                                    )}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </tr>
                                {/* Net Pay Section */}
                                <tr>
                                    <Row style={{ padding: '10px' }}>
                                        <Col md={12}>
                                            Net Pay for the month (Total Earnings - Total
                                            Deductions):{' '}
                                            <strong>{currencyFormateHandler(data.netPay)}</strong>
                                        </Col>
                                        <Col md={12}>
                                            {data.currencyName}{' '}
                                            {capitalizeFirstLetter(
                                                toWords(Math.round(data.netPay))
                                            )}
                                        </Col>
                                    </Row>
                                </tr>
                            </>
                        ) : (
                            <></>
                        )}
                    </tbody>
                </table>
            ) : null}
        </div>
    )
})

export default PaySlipGenerate
