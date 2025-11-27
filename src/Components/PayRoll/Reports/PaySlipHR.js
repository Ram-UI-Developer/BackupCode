import React, { useState, useEffect, useRef } from 'react'
import PaySlipGenerate from './PaySlipGenerate'
import { Row, Col, Form, Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { getAllById } from '../../../Common/Services/CommonService'
import { getAllEmployeesById } from '../../../Common/Services/OtherServices'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'

const PaySlipHR = () => {
    // Getting user details from redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    // Local states
    const [employeeId, setEmployeeId] = useState('') // selected employee
    const [locations, setLocations] = useState([]) // all locations
    const [locationId, setLocationId] = useState(null) // selected location id
    const [locationName, setLocationName] = useState([]) // default location name
    const [employees, setEmployees] = useState([]) // employees based on location
    const pdfRef = useRef() // reference to the payslip DOM to capture for PDF
    const [isPdfGenerated, setIsPdfGenerated] = useState(false) // flag to know if PDF can be downloaded
    const [loading, setLoading] = useState(false) // loading state for spinner
    const [errorMsg, setErrorMsg] = useState(null) // error message display

    // Mapping locations to options for react-select
    const locationOptions = locations
        ? locations.map((option) => ({
              value: option.id,
              label: option.name
          }))
        : []

    // Converts the referenced PaySlipGenerate component to image and saves as PDF
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

    // Maps employee data to react-select options
    const employeeOptions = employees
        ? employees.map((option) => ({
              value: option.id,
              label: option.name
          }))
        : []

    // Sets selected employee ID
    const handleEmployeeSelection = (selection) => {
        setEmployeeId(selection.value)
    }

    // Fetch location list when component mounts
    useEffect(() => {
        getAllLocationById()
    }, [])

    // Fetch all accessible locations
    const getAllLocationById = () => {
        setEmployees([]) // reset employee list on new location
        getAllById({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    // Set location list based on user's allowed access
                    setLocations(
                        userDetails.accessible == 'Global'
                            ? res.data
                            : res.data.filter((item1) =>
                                  userDetails.allowedLocations.some((item2) => item1.id === item2)
                              )
                    )
                    setLocationName(res.data ? res.data[0].name : [])
                    setLocationId(res.data ? res.data[0].id : [])
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Sets the selected locationId on selection change
    const handleLocationHandler = (selection) => {
        setLocationId(selection.value)
    }
    // Fetch employees whenever locationId changes
    useEffect(() => {
        if (locationId) {
            getEmployeesById()
        }
    }, [locationId])
    // API call to fetch employees based on selected location
    const getEmployeesById = () => {
        setLoading(true)
        getAllEmployeesById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            locationId: locationId
        })
            .then((res) => {
                setEmployees(res.data ? res.data : [])
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }
    // Initializes years and months for dropdown
    const monthsYearsHandler = () => {
        const years = []
        const currentYear = new Date().getFullYear()

        for (let year = currentYear; year >= 2000; year--) {
            years.push({ value: year, label: year })
        }

        setMonths(monthsDefined)
        setYears(years)
    }
    // Month list definition
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

    // Month and year states
    const [months, setMonths] = useState([])
    const [years, setYears] = useState([])
    const [selectedMonth, setSelectedMonth] = useState(null)
    const [selectedYear, setSelectedYear] = useState(null)

    // Handle month selection from dropdown
    const handleMonthChange = (selection) => {
        setSelectedMonth(selection.value)
    }
    // Handle year selection from dropdown
    const handleYearChange = (selection) => {
        setSelectedYear(selection.value)
    }
    // Initialize month-year dropdowns on component load
    useEffect(() => {
        setLoading(true)
        monthsYearsHandler()
    }, [])

    return (
        <>
            {/* Main authorized view */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                {/* Header */}
                                <PageHeader pageTitle=" Payslip" />
                                {/* Show loader while fetching data */}
                                {loading ? <DetailLoader /> : ''}
                                <div>
                                    {/* Location selection dropdown */}
                                    <Form.Group
                                        as={Row}
                                        className="mb-3 justify-content-center"
                                        controlId="formGroupToDate"
                                    >
                                        <Form.Label column sm={2}>
                                            Location
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                value={
                                                    locationId
                                                        ? locationOptions.filter(
                                                              (e) => e.value == locationId
                                                          )
                                                        : { label: locationName }
                                                }
                                                onChange={handleLocationHandler}
                                                options={locationOptions}
                                            />
                                        </Col>
                                    </Form.Group>
                                    {/* Employee selection dropdown */}
                                    <Form.Group
                                        as={Row}
                                        className="mb-3 justify-content-center"
                                        controlId="formGroupEmployee"
                                    >
                                        <Form.Label column sm={2}>
                                            Employee
                                        </Form.Label>

                                        <Col sm={6}>
                                            <Select
                                                required
                                                onChange={handleEmployeeSelection}
                                                options={employeeOptions}
                                                placeholder="Select Employee"
                                            />
                                        </Col>
                                    </Form.Group>
                                    {/* Year selection dropdown */}
                                    <Form.Group
                                        as={Row}
                                        className="mb-3 justify-content-center"
                                        controlId="yearSelect"
                                    >
                                        <Form.Label column sm={2}>
                                            Select Year
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                options={years}
                                                value={years.find(
                                                    (year) => year.label === selectedYear
                                                )}
                                                onChange={handleYearChange}
                                            ></Select>
                                        </Col>
                                    </Form.Group>
                                    {/* Month selection dropdown */}
                                    <Form.Group
                                        as={Row}
                                        className="mb-3 justify-content-center"
                                        controlId="monthSelect"
                                    >
                                        <Form.Label column sm={2}>
                                            Select Month
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                options={months}
                                                value={months.find(
                                                    (month) => month.label === selectedMonth
                                                )}
                                                onChange={handleMonthChange}
                                            ></Select>
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Payslip Generate component */}
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

                                {/* Display any error messages */}
                                <div style={{ textAlign: 'center' }}>
                                    <b>{errorMsg}</b>
                                </div>
                                {/* Download button for payslip */}
                                <div style={{ marginLeft: '45%', marginTop: '3%' }}>
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
        </>
    )
}

export default PaySlipHR
