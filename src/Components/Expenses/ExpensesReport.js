import { DatePicker } from 'antd'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import ExportPdf from '../../Common/CommonComponents/ExportPdf'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { Doc, XlSheet } from '../../Common/CommonIcons/CommonIcons'
import { getAllByOrgId } from '../../Common/Services/CommonService'
import { getExpenseReports } from '../../Common/Services/OtherServices'
import RecursiveTable from '../../Common/Table/RecursiveTable'
import Table from '../../Common/Table/Table'

const ExpensesReport = () => {
    // Get logged-in user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    // Boolean to check if user has access to the reports
    // Boolean to indicate loading state while fetching reports or generating files
    const [loading, setLoading] = useState(true)
    // Holds the list of generated report data
    const [reports, setReports] = useState([])
    // Holds the list of available locations the user can filter reports by
    const [locationList, setLocationList] = useState([])
    // Selected location for filtering reports (defaulted to user's current location)
    const [location, setLocation] = useState(userDetails.locationId)
    // Start date for filtering reports
    const [fromDate, setFromDate] = useState(null)
    // End date for filtering reports
    const [toDate, setToDate] = useState(null)
    // Type of export selected (e.g., PDF, Excel)
    const [exportType, setExportType] = useState('')
    // Stores the file object or metadata after report file is generated
    const [fileGen, setFileGen] = useState(null)

    const handleFromDate = (date) => {
        setFromDate(moment(date).format('YYYY-MM-DD'))
    }
    const handleToDate = (date) => {
        setToDate(moment(date).format('YYYY-MM-DD'))
    }

    /**
     * useEffect to handle file export logic when fileGen is set.
     * Depending on the selected exportType, this hook triggers:
     * - PDF generation using html2canvas and jsPDF.
     * - Print view using window.print().
     * - Excel export by triggering a hidden export button click.
     *
     * Dependencies:
     * - fileGen: Triggers the effect when set (indicates export is requested).
     * - exportType: Determines the type of export to perform.
     */
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
                document.getElementById('leave-table-xls-button').click()
            }

            setFileGen(null) // Reset after handling
        }
    }, [fileGen, exportType])

    const exportToTable = (type) => {
        setExportType(type)
        setFileGen(RecursiveTable(reports, exportFileColumns, 'balanceReportDTOs'))
    }

    const exportFileColumns = [
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Submitted Amount',
            accessor: 'submittedAmount'
        },
        {
            Header: 'Approved Amount',
            accessor: 'approvedAmount'
        },
        {
            Header: 'Reimbursed Amount',
            accessor: 'reimbursedAmount'
        },
        {
            Header: 'Status',
            accessor: 'status'
        }
    ]

    const fileColumns = [
        {
            title: 'Employee Name',
            filed: 'employeeName'
        },
        {
            title: 'Submitted Amount',
            filed: 'submittedAmount'
        },
        {
            title: 'Approved Amount',
            filed: 'approvedAmount'
        },
        {
            title: 'Reimbursed Amount',
            filed: 'reimbursedAmount'
        },
        {
            title: 'Status',
            filed: 'status'
        }
    ]

    const handleDownloadPDF = () => {
        const locationName = locationList.filter((loc) => (loc.id == location ? loc.name : ''))
        const fileName = 'ExpenseList'
        ExportPdf(
            fileColumns,
            reports,
            fromDate,
            toDate,
            locationName.length > 0 ? locationName[0].name : '',
            fileName
        )
    }

    useEffect(() => {
        setLoading(true)
        onGetLocationHandler()
        onGetReportsByLocationHandler()
    }, [])

    const onGetLocationHandler = () => {
        getAllByOrgId({
            entity: 'locations',
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                setLocationList(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }
    const options = locationList.map((option) => ({
        value: option.id,
        label: option.name
    }))
    const handleStatusSelect = (select) => {
        setLocation(select.value)
    }

    useEffect(() => {
        const pastdate = moment().subtract(15, 'days').toDate()
        setFromDate(moment(pastdate).format('YYYY-MM-DD'))
        setToDate(moment(pastdate).format('YYYY-MM-DD'))
        const presentdate = moment()
        setToDate(moment(presentdate).format('YYYY-MM-DD'))
        setFromDate(moment(presentdate).format('YYYY-MM-DD'))
    }, [])

    const onGetReportsByLocationHandler = () => {
        getExpenseReports({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            locationId: location,
            fromDate: fromDate,
            toDate: toDate
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setReports(res.data)
                    setLoading(false)
                }
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }

    const COLUMNS = [
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Submitted Amount',
            accessor: 'submittedAmount',
            Cell: ({ row }) => (
                <>
                    <div className="text-center">{row.original.submittedAmount}</div>
                </>
            )
        },
        {
            Header: 'Approved Amount',
            accessor: 'approvedAmount',
            Cell: ({ row }) => (
                <>
                    <div className="text-center">{row.original.approvedAmount}</div>
                </>
            )
        },
        {
            Header: 'Reimbursed Amount',
            accessor: 'reimbursedAmount',
            Cell: ({ row }) => (
                <>
                    <div className="text-center">{row.original.reimbursedAmount}</div>
                </>
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
                {loading ? <DetailLoader /> : ''}
                <section className="section">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="">
                                    <PageHeader pageTitle={'Expenses Reports'} />
                                    <div className="" style={{ marginLeft: '1.5%' }}>
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={5}>
                                                        From Date
                                                    </Form.Label>
                                                    <Col md={6}>
                                                        <DatePicker
                                                            placeholder=""
                                                            inputReadOnly
                                                            size="sm"
                                                            allowClear={false}
                                                            onClick={() => setFromDate(null)}
                                                            value={
                                                                fromDate ? moment(fromDate) : null
                                                            }
                                                            format={'DD-MM-YYYY'}
                                                            className="datepicker datePickerforBetweenDates"
                                                            onChange={handleFromDate}
                                                            name="fromDate"
                                                            disabledDate={(current) => {
                                                                const end = moment(
                                                                    toDate,
                                                                    'YYYY-MM-DD'
                                                                )
                                                                return current > end
                                                            }}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div className="col-sm-4">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={5}>
                                                        To Date
                                                    </Form.Label>
                                                    <Col md={6}>
                                                        <DatePicker
                                                            placeholder=""
                                                            inputReadOnly
                                                            size="sm"
                                                            allowClear={false}
                                                            disabledDate={(current) => {
                                                                const tomorrow = new Date(fromDate)
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
                                                                )
                                                            }}
                                                            format={'DD-MM-YYYY'}
                                                            className="datepicker datePickerforBetweenDates"
                                                            onChange={handleToDate}
                                                            name="toDate"
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div className="col-sm-3">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={5}>
                                                        Location
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <Select
                                                            className="datePickerforBetweenDates statusSelect"
                                                            classNamePrefix="mySelect"
                                                            placeholder=""
                                                            defaultValue={{
                                                                label: userDetails.locationName
                                                            }}
                                                            options={options}
                                                            onChange={handleStatusSelect}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button
                                                    size="sm"
                                                    style={{ paddingTop: '4.2px' }}
                                                    variant="addbtn"
                                                    onClick={onGetReportsByLocationHandler}
                                                >
                                                    Go
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row" style={{ marginTop: '10px' }}>
                                        {''}

                                        <div className="col-10"></div>
                                        <div className="col-2">
                                            <div style={{ display: 'none' }} id="print-table">
                                                {fileGen}
                                            </div>
                                            <Button
                                                variant=""
                                                className="iconWidth"
                                                onClick={handleDownloadPDF}
                                                disabled={reports.length > 0 ? false : true}
                                            >
                                                <Doc height="25px" />
                                            </Button>
                                            <div style={{ display: 'none' }}>
                                                <ReactHTMLTableToExcel
                                                    id="leave-table-xls-button"
                                                    className="download-table-xls-button"
                                                    table="table-to-xls"
                                                    filename="ExpenseList"
                                                    sheet="ExpenseList"
                                                    buttonText="Download as XLS"
                                                />
                                            </div>
                                            <Button
                                                variant=""
                                                className="iconWidth"
                                                onClick={() => exportToTable('excel')}
                                                disabled={reports.length > 0 ? false : true}
                                            >
                                                <XlSheet height="25px" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1px 8px 0px 8px', marginLeft: '7px' }}>
                                        <>
                                            <div className="noOfRecordsInTemplets">
                                                {reports.length > 10 ? (
                                                    <span>No. of Records : {reports.length}</span>
                                                ) : (
                                                    ''
                                                )}
                                            </div>{' '}
                                            <Table
                                                columns={COLUMNS}
                                                serialNumber={true}
                                                data={reports}
                                            />
                                        </>
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
export default ExpensesReport
