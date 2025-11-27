// Import core libraries and dependencies
import html2canvas from 'html2canvas' // Convert HTML to canvas (for PDF generation)
import jsPDF from 'jspdf' // PDF generator library
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import ReactHTMLTableToExcel from 'react-html-table-to-excel' // Export table to Excel
import { useSelector } from 'react-redux'
import Select from 'react-select'

// Import custom components and services
import FileViewer from '../../Common/CommonComponents/FileViewer'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { Pdf, XlSheet } from '../../Common/CommonIcons/CommonIcons'
import { getAllByOrgId } from '../../Common/Services/CommonService'
import {
    getTimesheetFileReports,
    getTimesheetMonthlyReports
} from '../../Common/Services/OtherServices'
import RecursiveTable from '../../Common/Table/RecursiveTable'
import TimeSheetMonthlyTable from '../../Common/Table/TimeSheetMonthlyTable'

const TimeSheetMonthlyReport = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get user details from Redux store
    const currentDate = new Date()

    // State declarations
    const [locationList, setLocationList] = useState([])
    const [days, setDays] = useState([])
    const [fileView, setFileView] = useState(false)
    const [files, setFiles] = useState([])
    const [exportType, setExportType] = useState('')
    const [fileGen, setFileGen] = useState(null)
    const [loading, setLoading] = useState(false)

    // Fetch location and initial reports on mount
    useEffect(() => {
        setLoading(true)
        onGetLocationHandler()
        onReportsHandler()
    }, [])

    const onCloseHandler = () => {
        setFileView(false)
        setFiles([])
    }

    // Get locations by organization ID
    const onGetLocationHandler = () => {
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                setLocationList(res.data)
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    // Handle file export (PDF, print, Excel)
    useEffect(() => {
        if (fileGen) {
            const input = document.getElementById('print-table')
            if (exportType === 'pdf') {
                html2canvas(input)
                    .then((canvas) => {
                        const imgData = canvas.toDataURL('image/png')
                        const pdf = new jsPDF('p', 'mm', 'a4')
                        const imgProps = pdf.getImageProperties(imgData)
                        const pdfWidth = pdf.internal.pageSize.getWidth()
                        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                        pdf.save('table.pdf')
                    })
                    .catch((error) => {
                        console.error('Error generating PDF: ', error)
                    })
            } else if (exportType === 'print') {
                window.print()
            } else if (exportType === 'excel') {
                document.getElementById('timesheet-table-xls-button').click()
            }

            setFileGen(null)
        }
    }, [fileGen, exportType])

    // Generate exportable data table
    const exportToTable = (type) => {
        setExportType(type)
        const col = [
            { Header: 'Name', accessor: 'employeeName' },
            { Header: 'Employee Id', accessor: 'code' },
            { Header: 'Location', accessor: 'locationName' },
            { Header: 'Total', accessor: 'total' },
            { Header: 'Dates', accessor: 'dates', children: fileChildHeaders }
        ]
        setFileGen(RecursiveTable(data, col, 'dates'))
    }

    // Dropdown options
    const monthOptions = [
        { label: 'Jan', value: 1 },
        { label: 'Feb', value: 2 },
        { label: 'Mar', value: 3 },
        { label: 'Apr', value: 4 },
        { label: 'May', value: 5 },
        { label: 'Jun', value: 6 },
        { label: 'Jul', value: 7 },
        { label: 'Aug', value: 8 },
        { label: 'Sep', value: 9 },
        { label: 'Oct', value: 10 },
        { label: 'Nov', value: 11 },
        { label: 'Dec', value: 12 }
    ]

    const dateOptions = Array.from({ length: 31 }, (_, i) => ({ label: i + 1, value: i + 1 }))

    const locationOtions = locationList.map((option) => ({
        value: option.id,
        label: option.name
    }))

    // State for selected filters
    const [year, setYear] = useState({
        label: currentDate.getFullYear(),
        value: currentDate.getFullYear()
    })
    const [month, setMonth] = useState(
        monthOptions.find((e) => e.value === currentDate.getMonth() + 1)
    )
    const [date, setDate] = useState({})
    const [location, setLocation] = useState({
        label: userDetails.locationName,
        value: userDetails.locationId
    })
    const [data, setData] = useState([])

    // Generate last 5 years for dropdown
    const getLastFiveYears = () => {
        const currentYear = new Date().getFullYear()
        return Array.from({ length: 5 }, (_, i) => currentYear - i)
    }
    const yearOptions = getLastFiveYears().map((year) => ({ label: year, value: year }))

    const [fileChildHeaders, setFileChildHeaders] = useState([])

    // Fetch report data from API
    const onReportsHandler = () => {
        getTimesheetMonthlyReports({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            locationId: location.value,
            day: date.value,
            month: month.value,
            year: year.value
        })
            .then((res) => {
                if (res.statusCode === 200) {
                    setData(res.data)
                    setDays(res.days)
                    setFileChildHeaders(
                        res.headers.map((head) => ({
                            Header: head,
                            accessor: head
                        }))
                    )
                    setLoading(false)
                }
            })
            .catch(() => setLoading(false))
    }

    // Open modal and fetch files
    const onFileViewHandler = (row) => {
        setFileView(true)
        getTimesheetFileReports({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            employeeId: row.employeeId,
            day: date.value,
            month: month.value,
            year: year.value
        }).then((res) => {
            if (res.statusCode === 200) {
                setFiles(res.data)
            }
        })
    }

    // Flatten nested dates object for table rendering
    const flattenObject = (obj, parentKey = '', result = {}) => {
        for (let key in obj) {
            const newKey = parentKey ? `${parentKey}.${key}` : key
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                flattenObject(obj[key], newKey, result)
            } else {
                result[newKey] = obj[key]
            }
        }
        return result
    }

    const flattenArrayObjects = (array) => {
        return array.map((item) => {
            const flattenedItem = { ...item, ...flattenObject(item.dates) }
            delete flattenedItem.dates
            return flattenedItem
        })
    }

    let flatData = flattenArrayObjects(data)

    // Generate column headers
    const header = Array.from(new Set(flatData.flatMap((item) => Object.keys(item))))
    const headers = header.filter((h) => h !== 'employeeId' && h !== 'filesCount')

    // Define columns for TimeSheetMonthlyTable
    let columns = [
        ...headers.map((item, i) => ({
            Header: () => (
                <div
                    className="text-left textBold"
                    style={{ color: days[i - 4] === 'Sun' || days[i - 4] === 'Sat' ? 'gray' : '' }}
                >
                    {item === 'employeeName'
                        ? 'Employee'
                        : item === 'code'
                          ? 'Employee Id'
                          : item === 'locationName'
                            ? 'Location'
                            : item === 'total'
                              ? 'Total'
                              : `${item} (${days[i - 4]})`}
                </div>
            ),
            accessor: item,
            Cell: ({ row }) => (
                <div
                    style={{
                        textAlign:
                            item === 'code' || item === 'employeeName' || item === 'locationName'
                                ? 'left'
                                : 'right',
                        whiteSpace: 'nowrap',
                        padding: '0.5rem 0.4rem 0.5rem 0rem',
                        backgroundColor:
                            days[i - 4] === 'Sun' || days[i - 4] === 'Sat' ? 'lightgray' : ''
                    }}
                >
                    {row.original[item] !== undefined ? row.original[item] : ''}
                </div>
            )
        })),
        {
            Header: () => <div>Files</div>,
            accessor: 'Files',
            Cell: ({ row }) => (
                <div>
                    {row.original.filesCount ? (
                        <div
                            style={{ cursor: 'pointer' }}
                            onClick={() => onFileViewHandler(row.original)}
                        >
                            <Pdf />
                        </div>
                    ) : (
                        <div>N/A</div>
                    )}
                </div>
            )
        }
    ]

    return (
        <div>
            <section className="section">
                <div className="container-fluid">
                    <PageHeader pageTitle={'Timesheet Monthly Reports'} />

                    {loading ? <DetailLoader /> : ''}
                    <div className="row">
                        <div className="col-md-12">
                            <div className=" card-primary">
                                {/* Filters Section */}
                                <div className="row">
                                    <div className="col-sm-8">
                                        <div className="row">
                                            {/* Location filter */}
                                            <div className="col-sm-6">
                                                <Form.Group as={Row} className="mb-0">
                                                    <Form.Label column md={4}>
                                                        Location{' '}
                                                        <span className="error">*</span>{' '}
                                                    </Form.Label>
                                                    <Col md={8}>
                                                        <Select
                                                            className="dropdown"
                                                            placeholder="Location"
                                                            options={locationOtions}
                                                            value={location}
                                                            onChange={(e) => setLocation(e)}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            {/* Month + Year filter */}
                                            <div className="col-sm-6">
                                                <Form.Group as={Row} className="mb-0">
                                                    <Form.Label column md={3}>
                                                        Month <span className="error">*</span>{' '}
                                                    </Form.Label>
                                                    <Col md={4}>
                                                        <Select
                                                            className="dropdown"
                                                            placeholder="Year"
                                                            options={yearOptions}
                                                            value={year}
                                                            onChange={(e) => setYear(e)}
                                                        />
                                                    </Col>
                                                    <Col md={4}>
                                                        <Select
                                                            className="dropdown"
                                                            placeholder="Month"
                                                            options={monthOptions}
                                                            value={month}
                                                            onChange={(e) => setMonth(e)}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        </div>
                                    </div>
                                    {/* End Date filter */}
                                    <div className="col-sm-3">
                                        <Form.Group as={Row} className="mb-0">
                                            <Form.Label column md={7}>
                                                Timesheet End-day{' '}
                                            </Form.Label>
                                            <Col md={5}>
                                                <Select
                                                    className="dropdown text-right"
                                                    placeholder="Select Date"
                                                    options={dateOptions}
                                                    value={date}
                                                    onChange={(e) => setDate(e)}
                                                />
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    {/* Go Button */}
                                    <div className="col-sm-1 text-center">
                                        <Button
                                            size="sm"
                                            variant="addbtn"
                                            onClick={onReportsHandler}
                                        >
                                            Go
                                        </Button>
                                    </div>
                                </div>

                                {/* Export buttons */}
                                <div className="row mt-2">
                                    <div className="col-10"></div>
                                    <div className="col-2">
                                        <div style={{ display: 'none' }} id="print-table">
                                            {fileGen}
                                        </div>
                                        <div style={{ display: 'none' }}>
                                            <ReactHTMLTableToExcel
                                                id="timesheet-table-xls-button"
                                                table="table-to-xls"
                                                filename="TimesheetMontly"
                                                sheet="TimesheetMontly"
                                                buttonText="Download as XLS"
                                            />
                                        </div>
                                        <Button
                                            variant=""
                                            className="iconWidth"
                                            onClick={() => exportToTable('excel')}
                                        >
                                            <XlSheet height="25px" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Render Main Table */}
                                <div style={{ overflow: 'auto', marginTop: '-5px' }}>
                                    <TimeSheetMonthlyTable data={flatData} columns={columns} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* File Viewer Modal */}
            <Modal
                show={fileView}
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header>
                    <Modal.Title>Uploaded Files</Modal.Title>
                    <Button variant="secondary" onClick={onCloseHandler}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <FileViewer documents={files} />
                </Modal.Body>
            </Modal>
        </div>
    )
}
export default TimeSheetMonthlyReport
