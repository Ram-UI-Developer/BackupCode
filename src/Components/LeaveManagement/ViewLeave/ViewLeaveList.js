import { DatePicker } from 'antd'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'
import { FaEye } from 'react-icons/fa6'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import ExportPdf from '../../../Common/CommonComponents/ExportPdf'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { Doc, XlSheet } from '../../../Common/CommonIcons/CommonIcons'
import { getAllByOrgId } from '../../../Common/Services/CommonService'
import { getApprovedLeaves } from '../../../Common/Services/OtherServices'
import RecursiveTable from '../../../Common/Table/RecursiveTable'
import Table from '../../../Common/Table/Table'

const ViewLeaveList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //user details storing
    const [leavesList, setLeavesList] = useState([]) //state for handling leave data
    const [location, setLocation] = useState(userDetails.locationId) //state for handling location intially setting to login member location
    const [locationList, setLocationList] = useState([]) //state for setting data of location list
    const [loading, setLoading] = useState(true) //state for loader displaying
    const [toDate, setToDate] = useState(null) //state for handling to date
    const [fromDate, setFromDate] = useState(null) //state for handling from date
    const [startDate, setStartDate] = useState(null) //state for handling start date
    const [endDate, setEndDate] = useState(null) //state for handling end date
    const [exportType, setExportType] = useState('') //state for pdf download
    const [fileGen, setFileGen] = useState(null)

    const exportFileColumns = [
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Leave Type',
            accessor: 'leavetypeName'
        },
        {
            Header: 'From Date ',
            accessor: 'fromDate'
        },
        {
            Header: 'To Date (No. of Days)',
            accessor: 'toDate'
        },
        {
            Header: 'Submitted Date',
            accessor: 'submittedDate'
        },
        {
            Header: 'Manager Name',
            accessor: 'managerName'
        },

        {
            Header: 'Status',
            accessor: 'status'
        }
    ]

    const options =
        locationList && locationList.length > 0
            ? locationList.map((option) => ({
                  value: option.id,
                  label: option.name
              }))
            : []

    const navigate = useNavigate()
    // handling date picker for fromdate

    const handleFromDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setFromDate(selectedDate)
        setStartDate(selectedDate)
    }
    const handleToDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setToDate(selectedDate)
        setEndDate(selectedDate)
    }
    const handleStatusSelect = (select) => {
        // console.log(select.value, "statusChecking");
        setLocation(select.value)
    }

    useEffect(() => {
        // onGetHandler();
        onGetLeavesByLocationHandler()
        onGetLocationHandler()
    }, [])

    useEffect(() => {
        const pastdate = moment().subtract(30, 'days').toDate()
        setStartDate(moment(pastdate).format('YYYY-MM-DD'))
        setToDate(moment(pastdate).format('YYYY-MM-DD'))
        const presentdate = moment()
        setEndDate(moment(presentdate).format('YYYY-MM-DD'))
      
    }, [])

    //api handling for getting  locations
    const onGetLocationHandler = () => {
        setLoading(true)
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                // setEventSelect(res.data)
                setLocationList(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }

    const fileColumns = [
        {
            title: 'S.No',
            filed: 'sno'
        },
        {
            title: 'Employee Name',
            filed: 'employeeName'
        },
        {
            title: 'Leave Type',
            filed: 'leavetypeName'
        },
        {
            title: 'From Date ',
            filed: 'fromDate'
        },
        {
            title: 'To Date ',
            filed: 'toDate'
        },
        {
            title: 'No.of.Days',
            filed: 'numberofDays'
        },
        {
            title: 'Submitted Date',
            filed: 'submittedDate'
        },
        {
            title: 'Manager Name',
            filed: 'managerName'
        },
        {
            title: 'Status',
            filed: 'status'
        }
    ]

    const handleDownloadPDF = () => {
        const locationName = locationList.filter((loc) => (loc.id == location ? loc.name : ''))
        console.log(locationList, location, 'loc')
        const fileName = 'LeaveList'
        const dataWithIndex = leavesList.map((d, i) => ({ ...d, sno: i + 1 }))
        ExportPdf(
            fileColumns,
            dataWithIndex,
            endDate,
            startDate,
            locationName.length > 0 ? locationName[0].name : '',
            fileName
        )
    }

    useEffect(() => {
        if (fileGen) {
            const input = document.getElementById('print-table')
            console.log(input, 'file input for export')
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

            setFileGen(null)
        }
    }, [fileGen, exportType])

    const exportToTable = (type) => {
        setExportType(type)
        setFileGen(RecursiveTable(leavesList, exportFileColumns, 'balanceReportDTOs'))
    }

    //api handling getting approved leaves to display
    const onGetLeavesByLocationHandler = () => {
        setLoading(true)
        getApprovedLeaves({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            locationId: location,
            fromDate: fromDate,
            toDate: toDate
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLeavesList(res.data)
                } else {
                    setLeavesList([])
                }
                setLoading(false)
            })
            .catch((err) => {
                console.log(err, 'error')
                setLoading(false)
            })
    }

    //table columns
    const COLUMNS = [
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Leave Type',
            accessor: 'leavetypeName'
        },
        {
            Header: 'From Date ',
            accessor: 'fromDate',
            Cell: ({ row }) => <div>{<DateFormate date={row.original.fromDate} />}</div>
        },
        {
            Header: 'To Date (No. of Days)',
            accessor: 'toDate',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap " style={{ display: 'flex' }}>
                        {<DateFormate date={row.original.toDate} />} ({row.original.numberofDays})
                    </div>
                </>
            )
        },
        {
            Header: 'Submitted Date',
            accessor: 'submittedDate',
            Cell: ({ row }) => <div>{<DateFormate date={row.original.submittedDate} />}</div>
        },
        {
            Header: 'Manager Name',
            accessor: 'managerName'
        },

        {
            Header: 'Status',
            accessor: 'status'
        },
        {
            Header: () => <div className="text-wrap text-right actions"> Actions </div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-center">
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => navigate('/ViewLeave', { state: row.original.id })}
                        >
                            <FaEye className="themeColor" size={20} />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    return (
        <>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Leave Reports'} />
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
                                                        value={startDate ? moment(startDate) : null}
                                                        format={'DD-MM-YYYY'}
                                                        className="datepicker datePickerforBetweenDates"
                                                        onChange={handleFromDate}
                                                        name="fromDate"
                                                        disabledDate={(current) => {
                                                            const end = moment(
                                                                endDate,
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
                                                            const tomorrow = new Date(startDate)
                                                            tomorrow.setDate(tomorrow.getDate() + 1)
                                                            let customDate =
                                                                moment(tomorrow).format(
                                                                    'YYYY-MM-DD'
                                                                )
                                                            return (
                                                                current &&
                                                                current <
                                                                    moment(customDate, 'YYYY-MM-DD')
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
                                                onClick={onGetLeavesByLocationHandler}
                                            >
                                                Go
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {loading ? <DetailLoader /> : ''}
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
                                            disabled={leavesList.length > 0 ? false : true}
                                        >
                                            <Doc height="25px" />
                                        </Button>
                                        <div style={{ display: 'none' }}>
                                            <ReactHTMLTableToExcel
                                                id="leave-table-xls-button"
                                                className="download-table-xls-button"
                                                table="table-to-xls"
                                                filename="LeaveList"
                                                sheet="LeaveList"
                                                buttonText="Download as XLS"
                                            />
                                        </div>
                                        <Button
                                            variant=""
                                            className="iconWidth"
                                            // onClick={exportToExcel}
                                            onClick={() => exportToTable('excel')}
                                            disabled={leavesList.length > 0 ? false : true}
                                        >
                                            <XlSheet height="25px" />
                                        </Button>
                                    </div>
                                </div>

                                <div style={{ padding: '1px 8px 0px 8px', marginLeft: '7px' }}>
                                    {loading ? (
                                        <center>
                                            {' '}
                                            <DetailLoader />{' '}
                                        </center>
                                    ) : (
                                        <>
                                            <div className="noOfRecords">
                                                {leavesList.length > 10 ? (
                                                    <span>No. of Records {leavesList.length}</span>
                                                ) : (
                                                    ''
                                                )}
                                            </div>{' '}
                                            <Table
                                            key={leavesList.length}
                                                columns={COLUMNS}
                                                serialNumber={true}
                                                data={leavesList}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ViewLeaveList
