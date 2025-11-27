import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import ExportPdf from '../../Common/CommonComponents/ExportPdf'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { Doc, XlSheet } from '../../Common/CommonIcons/CommonIcons'
import {
    getAllByOrgId,
    getAppraisalReports,
    getAppraisalReportsByDate,
    getReviewPeriod
} from '../../Common/Services/CommonService'
import RecursiveTable from '../../Common/Table/RecursiveTable'
import Table from '../../Common/Table/Table'

const AppraisalReports = () => {
    // Retrieving user details from Redux state
    const userDetails = useSelector((state) => state.user.userDetails)

    // State management for various aspects of the component
    const [loading, setLoading] = useState(true) // State to manage loading indicator
    const [reports, setReports] = useState([]) // State to store fetched reports
    const [locationList, setLocationList] = useState([]) // State to store location options
    const [location, setLocation] = useState(userDetails.locationId) // State to store current selected location
    const [reviewPeriodList, setReviewPeriodList] = useState([]) // State to store review period options
    const [exportType, setExportType] = useState('') // State to store selected export type (pdf, excel, etc.)
    const [fileGen, setFileGen] = useState(null) // State to store generated file data for export

    // Fetch location and review period data on initial render
    useEffect(() => {
        onGetLocationHandler()
        onGetreviewPeriodHandler()
    }, [])

    // Function to fetch review periods based on the current location and organization
    const onGetreviewPeriodHandler = () => {
        setLoading(true) // Start loading
        getReviewPeriod({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            locationId: location
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false) // Stop loading
                    setReviewPeriodList(res.data) // Store the retrieved review periods
                }
            })
            .catch((err) => {
                setLoading(false) // Stop loading on error
                console.log(err) // Log the error
            })
    }

    // Mapping reviewPeriodList to options for a Select component
    const reviewperiodOptions = reviewPeriodList.map((option) => ({
        value: option,
        label: option
    }))

    const [reviewPeriod, setReviewPeriod] = useState() // State to store selected review period

    // Function to handle selection of review period
    const onReviewPeriodSelect = (select) => {
        setReviewPeriod(select.value)
    }

    // Function to fetch location data based on the organization ID
    const onGetLocationHandler = () => {
        setLoading(true) // Start loading
        getAllByOrgId({
            entity: 'locations',
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                setLoading(false) // Stop loading
                setLocationList(res.data) // Store the retrieved locations
            })
            .catch((err) => {
                setLoading(false) // Stop loading on error
                console.log(err) // Log the error
            })
    }

    // Mapping locationList to options for a Select component
    const options = locationList.map((option) => ({
        value: option.id,
        label: option.name
    }))

    // Function to handle location selection
    const handleStatusSelect = (select) => {
        setLocation(select.value)
    }

    // Fetch reports based on selected location (called on initial render)
    useEffect(() => {
        onGetReportsByLocationHandler()
    }, [])

    // Function to fetch appraisal reports based on location and review period
    const onGetReportsByReviewPeriod = () => {
        setLoading(true) // Start loading
        getAppraisalReportsByDate({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            locationId: location,
            reviewPeriod: reviewPeriod
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setReports(res.data) // Store the fetched reports
                    setLoading(false) // Stop loading
                }
            })
            .catch((err) => {
                setLoading(false) // Stop loading on error
                console.log(err) // Log the error
            })
    }

    // Function to handle PDF/Excel generation based on export type
    useEffect(() => {
        if (fileGen) {
            const input = document.getElementById('print-table')
            if (exportType === 'pdf') {
                // Generate PDF if export type is 'pdf'
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
                // Trigger browser print if export type is 'print'
                window.print()
            } else if (exportType === 'excel') {
                // Trigger Excel download if export type is 'excel'
                document.getElementById('leave-table-xls-button').click()
            }

            setFileGen(null) // Reset after handling export
        }
    }, [fileGen, exportType])

    // Function to trigger the file generation for selected export type
    const exportToTable = (type) => {
        setExportType(type) // Set the export type (pdf, excel, print)
        setFileGen(RecursiveTable(reports, exportFileColumns, '')) // Generate the file
    }

    // Function to fetch reports based on selected location
    const onGetReportsByLocationHandler = () => {
        getAppraisalReports({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            locationId: location
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setReports(res.data) // Store the fetched reports
                    setLoading(false) // Stop loading
                }
            })
            .catch((err) => {
                setLoading(false) // Stop loading on error
                console.log(err) // Log the error
            })
    }

    // Function to format and return employee rating value
    function handleEmpleeRating(row) {
        return row.toFixed(2) // Format rating to 2 decimal places
    }

    // Define columns for exporting data
    const fileColumns = [
        { title: 'Employee Id', filed: 'code' },
        { title: 'Employee Name', filed: 'employeeName' },
        { title: 'Location Name', filed: 'locationName' },
        { title: 'Manager Name', filed: 'managerName' },
        { title: 'Employee Rating', filed: 'empOverallRating' },
        { title: 'Peer Rating', filed: 'peerOverallRating' },
        { title: 'Manager Rating', filed: 'mrgOverallRating' },
        { title: 'Status', filed: 'status' }
    ]
    // Function to handle PDF download with the relevant data
    const handleDownloadPDF = () => {
        const locationName = locationList.filter((loc) => (loc.id == location ? loc.name : ''))
        const fileName = 'AppraisalList' // File name for the exported PDF
        console.log(reviewPeriod, 'reviewPeriod') // Log review period for debugging
        ExportPdf(
            fileColumns,
            reports,
            '',
            reviewPeriod,
            locationName.length > 0 ? locationName[0].name : '',
            fileName
        ) // Export the PDF
    }
    // columns for pdf and excel table
    const exportFileColumns = [
        {
            Header: 'Employee Id',
            accessor: 'code'
        },
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Location Name',
            accessor: 'locationName'
        },
        {
            Header: 'Manager Name',
            accessor: 'managerName'
        },

        {
            Header: 'Employee Rating',
            accessor: 'empOverallRating'
        },

        {
            Header: 'Peer Rating',
            accessor: 'peerOverallRating'
        },
        {
            Header: 'Manager Rating',
            accessor: 'mrgOverallRating'
        },
        {
            Header: 'Status',
            accessor: 'status'
        }
    ]
    // columns for main table
    const COLUMNS = [
        {
            Header: <div className="text-left header">Employee Id</div>,
            accessor: 'code',
            Cell: ({ row }) => <div className="text-left">{row.original.code}</div>
        },
        {
            Header: <div className="text-left header">Employee Name</div>,
            accessor: 'employeeName',
            Cell: ({ row }) => <div className="text-left">{row.original.employeeName}</div>
        },
        {
            Header: <div className="text-left header">Location Name</div>,
            accessor: 'locationName',
            Cell: ({ row }) => <div className="text-left">{row.original.locationName}</div>
        },
        {
            Header: <div className="text-left header">Manager Name</div>,
            accessor: 'managerName',
            Cell: ({ row }) => (
                <div className="text-left" style={{ whiteSpace: 'nowrap' }}>
                    {row.original.managerName}
                </div>
            )
        },

        {
            Header: <div className="text-right header">Employee Rating</div>,
            accessor: 'empOverallRating',
            Cell: ({ row }) => (
                <div className="text-right">
                    {handleEmpleeRating(
                        row.original.empOverallRating ? Number(row.original.empOverallRating) : 0
                    )}
                </div>
            )
        },

        {
            Header: <div className="text-right header">Peer Rating</div>,
            accessor: 'peerOverallRating',
            Cell: ({ row }) => (
                <div className="text-right">
                    {handleEmpleeRating(
                        row.original.peerOverallRating ? Number(row.original.peerOverallRating) : 0
                    )}
                </div>
            )
        },
        {
            Header: <div className="text-right header">Manager Rating</div>,
            accessor: 'mrgOverallRating',
            Cell: ({ row }) => (
                <div className="text-right">
                    {handleEmpleeRating(
                        row.original.mrgOverallRating ? Number(row.original.mrgOverallRating) : 0
                    )}
                </div>
            )
        },

        {
            Header: 'Status',
            accessor: 'status'
        }
    ]
    return (
        <div>
            <>
                <section className="section">
                    {/* Conditionally render the loader while the data is loading */}
                    {loading ? <DetailLoader /> : ''}

                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="">
                                    {/* Page Header Component to display the title */}
                                    <PageHeader pageTitle={'Appraisal Reports'} />

                                    <div className="">
                                        <div className="row" style={{ marginLeft: '1%' }}>
                                            {/* Review Period Filter */}
                                            <div className="col-sm-5">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={4}>
                                                        Review Period
                                                    </Form.Label>
                                                    <Col md={6}>
                                                        <Select
                                                            options={reviewperiodOptions} // Options for review period
                                                            onChange={onReviewPeriodSelect} // Event handler when an option is selected
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* Location Filter */}
                                            <div className="col-sm-4">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={4}>
                                                        Location
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <Select
                                                            placeholder="" // Empty placeholder for the location select input
                                                            defaultValue={{
                                                                label: userDetails.locationName
                                                            }} // Set default location from user details
                                                            options={options} // Options for location
                                                            onChange={handleStatusSelect} // Event handler for location selection
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* Go Button to fetch reports based on the selected filters */}
                                            <div className="col-sm">
                                                <Button
                                                    size="sm"
                                                    style={{ paddingTop: '4.2px' }}
                                                    variant="addbtn"
                                                    onClick={onGetReportsByReviewPeriod} // Event handler to get reports by the selected review period and location
                                                >
                                                    Go
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Section for file download buttons */}
                                    <div className="row" style={{ marginTop: '10px' }}>
                                        <div className="col-10"></div>
                                        <div className="col-2">
                                            <div style={{ display: 'none' }} id="print-table">
                                                {fileGen} {/* Hidden section for file generation */}
                                            </div>

                                            {/* Button to download reports as PDF */}
                                            <Button
                                                variant=""
                                                className="iconWidth"
                                                onClick={handleDownloadPDF} // Trigger PDF download
                                                disabled={reports.length > 0 ? false : true} // Disable button if there are no reports
                                            >
                                                <Doc height="25px" /> {/* Icon for PDF download */}
                                            </Button>

                                            {/* Hidden Excel download option */}
                                            <div style={{ display: 'none' }}>
                                                <ReactHTMLTableToExcel
                                                    id="leave-table-xls-button"
                                                    className="download-table-xls-button"
                                                    table="table-to-xls" // Table to export to Excel
                                                    filename="AppraisalReport"
                                                    sheet="AppraisalReport"
                                                    buttonText="Download as XLS" // Button text for downloading XLS
                                                />
                                            </div>

                                            {/* Button to download reports as Excel */}
                                            <Button
                                                variant=""
                                                className="iconWidth"
                                                onClick={() => exportToTable('excel')} // Trigger Excel download
                                                disabled={reports.length > 0 ? false : true} // Disable button if there are no reports
                                            >
                                                <XlSheet height="25px" />{' '}
                                                {/* Icon for Excel download */}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Section to display the number of records if greater than 10 */}
                                    <div style={{ padding: '1px 8px 0px 8px', marginLeft: '7px' }}>
                                        <div className="noOfRecordsInTemplets">
                                            {/* Display total number of records if more than 10 */}
                                            {reports.length > 10 ? (
                                                <span>No. of Records : {reports.length}</span>
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                        <Table
                                            columns={COLUMNS}
                                            serialNumber={true}
                                            data={reports}
                                        />{' '}
                                        {/* Table to display the reports */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        </div>
    )
}
export default AppraisalReports
