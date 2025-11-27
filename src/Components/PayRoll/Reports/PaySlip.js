import React, { useState, useEffect, useRef } from 'react'
import PaySlipGenerate from './PaySlipGenerate'
import { Row, Col, Form, Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'

const PaySlip = () => {
    // Accessing user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    // State variables
    const [employeeId, setEmployeeId] = useState('') // Employee ID from user details
    const pdfRef = useRef() // Reference to the PaySlipGenerate component for PDF export
    const [isPdfGenerated, setIsPdfGenerated] = useState(false) // Controls the "Download" button
    const [loading, setLoading] = useState(true) // Loader display
    const [errorMsg, setErrorMsg] = useState(null) // To show error if payslip is not generated

    // Handles PDF generation using html2canvas and jsPDF
    const exportPaySlip = () => {
        if (pdfRef.current) {
            const input = pdfRef.current
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF()
                const imgProps = pdf.getImageProperties(imgData)
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save('Payslip.pdf')
            })
        }
    }
    // Populates dropdown options for month and year
    const monthsYearsHandler = () => {
        const years = []
        const currentYear = new Date().getFullYear()
        // Generate years from current year down to 2000
        for (let year = currentYear; year >= 2000; year--) {
            years.push({ value: year, label: year })
        }

        setMonths(monthsDefined) // Set months list
        setYears(years) // Set years list
        setLoading(false) // Stop loader after data is prepared
    }
    // Static months definition, used for dropdown
    const monthsDefined = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ].map((month) => ({ value: month, label: month }))

    // Dropdown state handlers
    const [months, setMonths] = useState([])
    const [years, setYears] = useState([])
    const [selectedMonth, setSelectedMonth] = useState(null)
    const [selectedYear, setSelectedYear] = useState(null)

    // Handlers to update selected dropdown values
    const handleMonthChange = (selection) => {
        setSelectedMonth(selection ? selection.value : null)
    }

    const handleYearChange = (selection) => {
        setSelectedYear(selection ? selection.value : null)
    }
    // Component mount: set employeeId and populate dropdowns
    useEffect(() => {
        setLoading(true)
        setEmployeeId(userDetails.employeeId)
        monthsYearsHandler()
    }, [])

    return (
        <>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                {/* Page title */}
                                <PageHeader pageTitle="My Payslips" />
                                {/* Show loader while data is being initialized */}
                                {loading ? (
                                    <DetailLoader />
                                ) : (
                                    <div>
                                        {/* Year Dropdown */}
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="yearSelect"
                                        >
                                            <Col sm={2}></Col>
                                            <Form.Label column sm={2}>
                                                Select Year
                                            </Form.Label>
                                            <Col sm={6}>
                                                <Select
                                                    options={years}
                                                    // defaultValue={years.find(year => year.label === selectedYear)}
                                                    value={
                                                        years.find(
                                                            (year) => year.value === selectedYear
                                                        ) || null
                                                    }
                                                    onChange={handleYearChange}
                                                ></Select>
                                            </Col>
                                        </Form.Group>
                                        {/* Month Dropdown */}
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="monthSelect"
                                        >
                                            <Col sm={2}></Col>
                                            <Form.Label column sm={2}>
                                                Select Month
                                            </Form.Label>
                                            <Col sm={6}>
                                                <Select
                                                    options={months}
                                                    // defaultValue={months.find(month => month.label === selectedMonth)}
                                                    value={
                                                        months.find(
                                                            (month) => month.value === selectedMonth
                                                        ) || null
                                                    }
                                                    onChange={handleMonthChange}
                                                ></Select>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                )}
                                {/* Payslip generation component */}
                                <PaySlipGenerate
                                    setLoading={setLoading}
                                    setIsPdfGenerated={setIsPdfGenerated}
                                    ref={pdfRef}
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                    organizationId={userDetails.organizationId}
                                    employeeId={employeeId}
                                    setErrorMsg={setErrorMsg}
                                />
                                {/* Error message if any */}
                                <div style={{ textAlign: 'center' }}>
                                    <b>{errorMsg}</b>
                                </div>

                                {/* Download PDF button */}
                                <div className="btnCenter mb-3">
                                    <Button
                                        className="Button"
                                        variant="addbtn"
                                        onClick={exportPaySlip}
                                        disabled={!isPdfGenerated || !pdfRef.current}
                                    >
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* </>
      } */}
        </>
    )
}

export default PaySlip
