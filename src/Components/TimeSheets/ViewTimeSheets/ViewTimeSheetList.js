import { DatePicker } from 'antd'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import ExportPdf from '../../../Common/CommonComponents/ExportPdf'
import FileViewer from '../../../Common/CommonComponents/FileViewer'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ActionIcon, Doc, Pdf, XlSheet } from '../../../Common/CommonIcons/CommonIcons'
import { getAllByOrgId } from '../../../Common/Services/CommonService'
import {
    getApprovedTimesheet,
    getApprovedTimesheets,
} from '../../../Common/Services/OtherServices'
import RecursiveTable from '../../../Common/Table/RecursiveTable'
import Table from '../../../Common/Table/Table'

const ViewTimeSheetList = () => {
    // Fetching the user details from the Redux store.
    const userDetails = useSelector((state) => state.user.userDetails)

    // State hook to manage loading state, initially set to true to indicate loading.
    const [loading, setLoading] = useState(true)

    // useNavigate hook from React Router to handle navigation programmatically.
    const navigate = useNavigate()

    // State hook to manage a list of locations. Initially an empty array.
    const [locationList, setLocationList] = useState([])


    // State hooks to manage the start and end dates, initially set to null.
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    // State hook to manage the type of export. Initially an empty string.
    const [exportType, setExportType] = useState('')

    // State hook to handle the file generation process. Initially set to null.
    const [fileGen, setFileGen] = useState(null)

    // Function to handle navigation to the "ViewTimeSheet" page, passing row data as state.
    const handleNavigate = (row) => {
        navigate('/ViewTimeSheet', { state: { row } })
    }

    // useEffect hook to fetch data when the component mounts (initially empty dependency array).
    // This calls functions to load all employees, authorized time sheets, and location data.
    useEffect(() => {
        setLoading(true) // Set loading state to true
        getAuthorizeTimeSheetList() // Fetch authorized time sheets
        onGetLocationHandler() // Fetch location-related data
    }, [])

    // Column definitions for exporting data, used in various file export formats (PDF, Excel, Print).
    const exportFileColumns = [
        { Header: 'Weekend Date', accessor: 'weekendDate' },
        { Header: 'Employee Name', accessor: 'employeeName' },
        { Header: 'Project Name', accessor: 'projectName' },
        { Header: 'Manager Name', accessor: 'managerName' },
        { Header: 'Captured Hours', accessor: 'capturedHours' },
        { Header: 'Approved Hours', accessor: 'totalHours' },
        { Header: 'Status', accessor: 'status' }
    ]

    // useEffect hook to handle file generation based on export type (PDF, Print, Excel) when fileGen changes.
    useEffect(() => {
        if (fileGen) {
            const input = document.getElementById('print-table') // Get the table element for export
            console.log(input, 'file input for export')

            // Export to PDF using html2canvas to capture the table as an image
            if (exportType === 'pdf') {
                html2canvas(input)
                    .then((canvas) => {
                        const imgData = canvas.toDataURL('image/png')
                        const pdf = new jsPDF('p', 'mm', 'a4')
                        const imgProps = pdf.getImageProperties(imgData)
                        const pdfWidth = pdf.internal.pageSize.getWidth()
                        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                        pdf.save('table.pdf') // Save the PDF
                    })
                    .catch((error) => {
                        console.error('Error generating PDF: ', error) // Error handling for PDF generation
                    })
            }
            // Handle print export type (trigger browser print dialog)
            else if (exportType === 'print') {
                window.print()
            }
            // Handle Excel export type (trigger click on the Excel export button)
            else if (exportType === 'excel') {
                document.getElementById('leave-table-xls-button').click()
            }

            setFileGen(null) // Reset fileGen state after handling the export
        }
    }, [fileGen, exportType])

    // Function to handle export action, setting the export type (PDF, Print, or Excel).
    const exportToTable = (type) => {
        setExportType(type) // Set the export type (PDF, Print, Excel)
        setFileGen(RecursiveTable(authList, exportFileColumns, 'balanceReportDTOs')) // Trigger file generation
    }


    // State to manage the list of authorized employees.
    const [authList, setAuthList] = useState([])

    // State to manage date range (start and end dates).
    const [toDate, setToDate] = useState(null)

    // useEffect hook to set the default date range when the component mounts.
    useEffect(() => {
        const pastdate = moment().subtract(30, 'days').toDate() // Calculate 30 days ago
        setStartDate(moment(pastdate).format('YYYY-MM-DD')) // Set start date
        setToDate(moment(pastdate).format('YYYY-MM-DD')) // Set end date to past 30 days
        const presentdate = moment()
        setEndDate(moment(presentdate).format('YYYY-MM-DD')) // Set end date to today
    }, [])

    // Column definitions for the table used in the app (for viewing, not export).
    const fileColumns = [
        { title: 'Weekend Date', filed: 'weekendDate' },
        { title: 'Employee Name', filed: 'employeeName' },
        { title: 'Project Name ', filed: 'projectName' },
        { title: 'Captured Hours', filed: 'capturedHours' },
        { title: 'Approved Hours', filed: 'totalHours' },
        { title: 'Status', filed: 'status' },
        { title: 'Manager Name', filed: 'managerName' }
    ]

    // Function to handle the download of the timesheet in PDF format
    const handleDownloadPDF = () => {
        // Filter location list based on either the timeSheetStatus or userDetails.locationId
        const locationName = locationList.filter((loc) =>
            loc.id == (timeSheetStatus ? timeSheetStatus : userDetails.locationId) ? loc.name : ''
        )
        console.log(locationName, userDetails.locationId, timeSheetStatus, 'loc')

        const fileName = 'TimesheetWeekly' // Define the file name for PDF
        // Call ExportPdf function to generate and download the PDF
        ExportPdf(
            fileColumns,
            authList,
            endDate,
            startDate,
            locationName.length > 0 ? locationName[0].name : '',
            fileName
        )
    }

    // State to track the selected timeSheetStatus
    const [timeSheetStatus, setTimeSheetStatus] = useState()

    // Function to fetch the list of authorized timesheets for the organization
    const getAuthorizeTimeSheetList = () => {
        getApprovedTimesheet({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            locationId: userDetails.locationId
        }).then((res) => {
            if (res.statusCode == 200) {
                // If the response is successful, set the authorized list and date range
                setAuthList(res.data)
                setToDate(res.toDate)
                setLoading(false)
            }
            if (res.status == 500) {
                // If there is an error, set the error state
                setLoading(false)
            }
        })
    }


    // Function to handle the start date change and update state
    const handleFromDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD') // Format the date
        setStartDate(selectedDate) // Set the start date for report generation
    }

    // Function to handle the end date change and update state
    const handleToDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD') // Format the date
        setToDate(selectedDate) // Set the end date
    }

    // Function to handle the selection of time sheet status (e.g., Approved)
    const handleStatusSelect = (select) => {
        // Set the selected timeSheetStatus based on user selection
        setTimeSheetStatus(select.value)
    }

    // Function to trigger fetching approved timesheets based on selected filters
    const onGoHandler = () => {
        // Call API to get approved timesheets for the specified filters (e.g., location, date range)
        getApprovedTimesheets({
            entity: 'timesheets',
            locationId: timeSheetStatus ? timeSheetStatus : userDetails.locationId,
            organizationId: userDetails.organizationId,
            fromDate: startDate,
            toDate: toDate
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setAuthList(res.data) // Set the authorized timesheet data
                } else {
                    setAuthList([]) // Clear the data if no results
                }
            })
            .catch((err) => {
                console.log(err, 'err') // Error handling for the API request
            })
    }

    // State to manage files (e.g., uploaded files or attachments)
    const [files, setFiles] = useState([])
    // State to manage whether to show file modal or not
    const [fileShow, setFileShow] = useState()

    // Function to show files/modal with the selected file data
    const handleFilesShow = (file) => {
        setFileShow(true) // Show file modal
        setFiles(file) // Set the file data to be displayed
    }

    // Function to handle closing of the file modal
    const handleFileCloseHandler = () => {
        setFileShow(false) // Close the file modal
    }

    // Column definitions for the timesheet table (with custom cell renderers for certain columns)
    const COLUMN = [
        {
            Header: 'Weekend Date',
            accessor: 'weekendDate',
            Cell: (row) => (
                <span>
                    {/* Format and display the weekend date */}
                    {<DateFormate date={row.row.original.weekendDate} />}
                </span>
            )
        },

        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },

        {
            Header: 'Project Name',
            accessor: 'projectName'
        },
        {
            Header: 'Manager Name',
            accessor: 'managerName'
        },
        {
            Header: () => <div className="numericColHeading">Captured Hours</div>,
            accessor: 'capturedHours',
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original.capturedHours} {/* Display captured hours */}
                </div>
            )
        },
        {
            Header: () => <div className="numericColHeading">Approved Hours</div>,
            accessor: 'totalHours',
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original.totalHours} {/* Display approved hours */}
                </div>
            )
        },
        {
            Header: 'Status',
            accessor: 'status'
        },
        {
            Header: 'Attachments', // Column for handling attachments (e.g., files)
            accessor: 'files',
            Cell: ({ row }) => (
                <>
                    {/* Display a button for files if they exist */}
                    {row.original.files == null || row.original.files.length == 0 ? (
                        ''
                    ) : (
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={
                                () => handleFilesShow(row.original.files) // Show files when clicked
                            }
                        >
                            <Pdf />
                        </Button>
                    )}
                </>
            )
        },

        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    {/* Action button for navigating to the timesheet view */}
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => handleNavigate(row.original)} // Navigate to ViewTimeSheet with row data
                        >
                            <ActionIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]


    // Function to fetch the list of locations associated with the organization
    const onGetLocationHandler = () => {
        // Call API to get all locations based on organizationId
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                // If locations are fetched successfully, set the location list
                setLocationList(res.data) // Update the location list
                setLoading(false) // Set loading state to false after data is fetched
            })
            .catch((err) => {
                // In case of an error, log the error and stop loading
                console.log(err)
                setLoading(false) // Set loading state to false even if there's an error
            })
    }

    // Mapping locationList to create options for a dropdown or selection
    const options =
        locationList &&
        locationList.map((option) => ({
            value: option.id, // Set location ID as value for dropdown option
            label: option.name // Set location name as label for dropdown option
        }))

    return (
        <>
            {/* // Main section of the page */}
            <section className="section">
                {/* Conditional loader display while data is being fetched */}
                {loading ? <DetailLoader /> : ''}
                {/* Container for the content */}
                <div className="container-fluid">
                    {/* Row for the content */}
                    <div className="row">
                        {/* Column for the main card container */}
                        <div className="col-md-12">
                            <div className="">
                                {/* Page header for "Timesheet Weekly Reports" */}
                                <div style={{ marginRight: '10%' }}>
                                    <PageHeader pageTitle="Timesheet Weekly Reports" />
                                </div>

                                {/* Card body for the form and table content */}
                                <div className="card-body">
                                    <div className="">
                                        {/* Date and location filters (commented out in this version) */}
                                        {/* <DataBetweenDates 
                setFromDate={setFromDate} 
                setToDate={setToDate} 
                setStatus={setTimeSheetStatus} 
                options={timeSheetOptions} 
                handleGo={onGoHandler} 
                defaultValue={{label:"Approved"}} 
              /> */}

                                        {/* Filter row for selecting From Date, To Date, and Location */}
                                        <div className="row">
                                            {/* From Date filter */}
                                            <div className="col-sm-4">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={5}>
                                                        From Date{' '}
                                                    </Form.Label>
                                                    <Col md={6}>
                                                        {/* DatePicker for From Date */}
                                                        <DatePicker
                                                            placeholder=""
                                                            inputReadOnly
                                                            size="sm"
                                                            allowClear={false}
                                                            value={
                                                                startDate ? moment(startDate) : null
                                                            }
                                                            format={'DD-MM-YYYY'}
                                                            className="datepicker datePickerforBetweenDates"
                                                            onChange={handleFromDate}
                                                            name="fromDate"
                                                            disabledDate={(current) => {
                                                                const end = moment(
                                                                    endDate,
                                                                    'YYYY-MM-DD'
                                                                )
                                                                return current > end // Disable dates greater than "To Date"
                                                            }}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* To Date filter */}
                                            <div className="col-sm-4">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={5}>
                                                        To Date{' '}
                                                    </Form.Label>
                                                    <Col md={6}>
                                                        {/* DatePicker for To Date */}
                                                        <DatePicker
                                                            placeholder=""
                                                            inputReadOnly
                                                            size="sm"
                                                            allowClear={false}
                                                            disabledDate={(current) => {
                                                                const tomorrow = new Date(startDate)
                                                                tomorrow.setDate(
                                                                    tomorrow.getDate() + 1
                                                                )
                                                                let customDate =
                                                                    moment(tomorrow).format(
                                                                        'YYYY-MM-DD'
                                                                    )
                                                                return (
                                                                    current &&
                                                                    current <
                                                                    moment(
                                                                        customDate,
                                                                        'YYYY-MM-DD'
                                                                    )
                                                                ) // Disable dates earlier than the day after From Date
                                                            }}
                                                            format={'DD-MM-YYYY'}
                                                            className="datepicker datePickerforBetweenDates"
                                                            onChange={handleToDate}
                                                            name="toDate"
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* Location filter */}
                                            <div className="col-sm-3">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={5}>
                                                        Location{' '}
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        {/* Select input for Location */}
                                                        <Select
                                                            className="datePickerforBetweenDates statusSelect"
                                                            classNamePrefix="mySelect"
                                                            placeholder=""
                                                            defaultValue={{
                                                                label: userDetails.locationName
                                                            }}
                                                            options={options}
                                                            onChange={handleStatusSelect} // Handle change in location
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* Go button */}
                                            <div className="col-sm-1">
                                                <Button
                                                    size="sm"
                                                    style={{ paddingTop: '4.2px' }}
                                                    variant="addbtn"
                                                    onClick={onGoHandler} // Trigger search action
                                                >
                                                    Go
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Button row for PDF, Excel export and table actions */}
                                        <div className="row" style={{ marginTop: '10px' }}>
                                            <div className="col-10"></div>
                                            <div className="col-2">
                                                {/* Hidden div for file generation (used for PDF export) */}
                                                <div style={{ display: 'none' }} id="print-table">
                                                    {fileGen}
                                                </div>

                                                {/* Button to download PDF */}
                                                <Button
                                                    variant=""
                                                    className="iconWidth"
                                                    onClick={handleDownloadPDF} // Trigger PDF download
                                                    disabled={authList.length > 0 ? false : true} // Disable button if no records available
                                                >
                                                    <Doc height="25px" />
                                                </Button>

                                                {/* Hidden React HTML Table to Excel component for export */}
                                                <div style={{ display: 'none' }}>
                                                    <ReactHTMLTableToExcel
                                                        id="leave-table-xls-button"
                                                        className="download-table-xls-button"
                                                        table="table-to-xls"
                                                        filename="TimesheetWeekly"
                                                        sheet="LeaveList"
                                                        buttonText="Download as XLS"
                                                    />
                                                </div>

                                                {/* Button to export to Excel */}
                                                <Button
                                                    variant=""
                                                    className="iconWidth"
                                                    onClick={() => exportToTable('excel')} // Trigger Excel export
                                                    disabled={authList.length > 0 ? false : true} // Disable button if no records available
                                                >
                                                    <XlSheet height="25px" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Display number of records if greater than 10 */}
                                    <div style={{ fontWeight: '600' }}>
                                        {authList.length > 10 ? (
                                            <span>No. of Records : {authList.length}</span>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </div>

                                {/* Data table for displaying the timesheet records */}
                                <Table
                                    columns={COLUMN}
                                    serialNumber={true} // Display serial number column
                                    data={authList} // Data for the table
                                    pageSize="10" // Pagination: 10 records per page
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* modal file viewer */}
            <Modal show={fileShow} size="lg" onHide={handleFileCloseHandler}>
                <Modal.Header>
                    <Modal.Title>View Attached Files </Modal.Title>
                    <Button variant="secondary" onClick={handleFileCloseHandler}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <FileViewer documents={files} />
                </Modal.Body>
                <div style={{ margin: '0px auto 15px auto' }}>
                    <Button variant="secondary" className="Button" onClick={handleFileCloseHandler}>
                        Close
                    </Button>
                </div>
            </Modal>


        </>
    )
}
export default ViewTimeSheetList
