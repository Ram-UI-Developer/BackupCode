import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { useSelector } from 'react-redux'
import { getAllByOrgId } from '../../../Common/Services/CommonService'
import { getReportsByLocationId } from '../../../Common/Services/OtherServices'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { XlSheet } from '../../../Common/CommonIcons/CommonIcons'
import { Tooltip } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'
import Select from 'react-select'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import LeaveTypeHistory from '../../../Common/CommonComponents/LeaveTypeHistory'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import ChildTable from '../../../Common/Table/ChildTable'
import RecursiveTable from '../../../Common/Table/RecursiveTable'

const LeaveBalanceList = () => {
    const [data, setData] = useState([]) //state for setting data
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const [loading, setLoading] = useState(true) //state for displaying loader
    const [eventSelect, setEventSelect] = useState(userDetails.locationId) //state for event select
    const [options, setOptions] = useState([]) //state for setting dropdown options
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [exportType, setExportType] = useState('') //state for pdf download
    const [fileGen, setFileGen] = useState(null)

    useEffect(() => {

        getLocationList();


    }, [])

    //downloaded table columns
    const exportFileColumns = [
        {
            Header: 'Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Code',
            accessor: 'code'
        },
        {
            Header: 'Date of Joining',
            accessor: 'dateOfJoining'
        },
        {
            Header: 'Email',
            accessor: 'email'
        },
        {
            Header: 'Worked Days',
            accessor: 'workedDays'
        },

        {
            Header: 'Leave Balances',
            accessor: 'balanceReportDTOs',
            children: [
                {
                    Header: 'Type',
                    accessor: 'leaveTypeName'
                },
                {
                    Header: 'Credited',
                    accessor: 'totalCredited'
                },
                {
                    Header: 'Used',
                    accessor: 'totalUsed'
                },
                {
                    Header: 'Balance',
                    accessor: 'remaining'
                }
            ]
        }
    ]

    const [getData, setGetData] = useState({})
    const [leaveTypeShow, setLeaveTypeShow] = useState(false)
    const handleLeaveTypeHistory = (leaveTypeId, employeeId, leaveTypeName) => {
        const data = { leaveTypeId, employeeId, leaveTypeName }
        setLeaveTypeShow(true)
        setGetData(data)
    }

    const handleCloseLeaveTypeHistory = () => {
        setLeaveTypeShow(false)
        setGetData({})
    }

    //api handling for getting all locations in that organization
    const getLocationList = () => {
        setLoading(true)

        getAllByOrgId({ entity: "locations", organizationId: userDetails.organizationId })
            .then((res) => {
                locationHandler(userDetails.accessible == "Global" ? res.data : res.data.filter(item1 => userDetails.allowedLocations.some(item2 => item1.id === item2)));
                setLoading(false)
            },

                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    const locationHandler = (data) => {
        let optionsMapped = data.map((option) => ({
            value: option.id,

            label: option.name,
        }));
        setOptions(optionsMapped);

        if (optionsMapped.length > 0) {
            // Try to find user's location in the new options
            let found = optionsMapped.find(opt => opt.value === userDetails.locationId);
            let defaultLoc = found ? found.value : optionsMapped[0].value;
            setEventSelect(defaultLoc);
            getLeavebalanceList(defaultLoc);
        } else {
            // No locations: clear selection and data
            setEventSelect(null);
            setData([]);
            setLoading(false);
        }

    }

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
                    .catch(() => { })
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
        setFileGen(RecursiveTable(data, exportFileColumns, 'balanceReportDTOs'))
    }

    const handleEventSelection = (selection) => {
        setEventSelect(selection.value)
        setToolTip(true)
        getLeavebalanceList(selection.value)

    };
    //resolved jira issue 1979
    const getLeavebalanceList = (id) => {
        setLoading(true)
        getReportsByLocationId({ entity: "employeeleavebalance", organizationId: userDetails.organizationId, id: id })
            .then((res) => {
                if (res.data && res.data.length >= 1) {
                    setData(res.data)
                } else {
                    setData([]) // <-- Always clear data if no results
                }
                setLoading(false)
            })
            .catch(() => {
                setData([])
                setLoading(false)
            })
    }


    const [toolTip, setToolTip] = useState(true)
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Code',
            accessor: 'code'
        },
        {
            Header: 'Date of Joining',
            accessor: 'dateOfJoining',
            Cell: ({ row }) => (
                <div>
                    {row.original.dateOfJoining ? (
                        <DateFormate date={row.original.dateOfJoining} />
                    ) : (
                        ''
                    )}
                </div>
            )
        },
        {
            Header: 'Email',
            accessor: 'email',
            Cell: ({ row }) => (
                <>
                    {toolTip == true && (
                        <Tooltip title={row.original.email} open>
                            {row.original.email}
                        </Tooltip>
                    )}

                    <div className="tableLength">{row.original.email}</div>
                </>
            )
        },
        {
            Header: 'Worked Days',
            accessor: 'workedDays',
            Cell: ({ row }) => (
                <>
                    <div className="text-right workedDaysLength">{row.original.workedDays}</div>
                </>
            )
        },

        {
            Header: (
                <div className="text-center">
                    <div className="text-right header" style={{ marginRight: '30%' }}>
                        Leave Balances
                    </div>
                    <tr style={{ float: 'right', background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                minWidth: '120px',
                                marginLeft: '-10%'
                            }}
                        >
                            {' '}
                            Type{' '}
                        </th>
                        <th
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                minWidth: '110px'
                            }}
                        >
                            {' '}
                            Forwarded{' '}
                        </th>
                        <th
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                minWidth: '110px'
                            }}
                        >
                            {' '}
                            Credited{' '}
                        </th>
                        <th
                            style={{ borderBottom: 'none', paddingBottom: '0px', minWidth: '95px' }}
                        >
                            {' '}
                            Used{' '}
                        </th>
                        <th
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                minWidth: '110px'
                            }}
                        >
                            {' '}
                            LOP{' '}
                        </th>
                        <th
                            style={{ borderBottom: 'none', paddingBottom: '0px', minWidth: '80px' }}
                        >
                            {' '}
                            Balance{' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'balanceReportDTOs',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="balanceReports">
                        {row.original.balanceReportDTOs &&
                            row.original.balanceReportDTOs.map((e) => {
                                return (
                                    <tr
                                        style={{
                                            border: 'none',
                                            float: 'right',
                                            background: 'none'
                                        }}
                                    >
                                        <td style={{ minWidth: '100px' }}>{e.leaveTypeName}</td>
                                        <td className="text-right" style={{ minWidth: '95px' }}>
                                            {e.carryForward}
                                        </td>
                                        <td className="text-right" style={{ minWidth: '100px' }}>
                                            {e.totalCredited}
                                        </td>
                                        <td className="text-right" style={{ minWidth: '98px' }}>
                                            {e.totalUsed}
                                        </td>
                                        <td className="text-right" style={{ minWidth: '90px' }}>
                                            {e.lop}
                                        </td>
                                        <td
                                            className="text-right"
                                            style={{ minWidth: '120px', paddingRight: '5%' }}
                                        >
                                            <a
                                                className=""
                                                onClick={() =>
                                                    handleLeaveTypeHistory(
                                                        e.leaveTypeId,
                                                        e.employeeId,
                                                        e.leaveTypeName
                                                    )
                                                }
                                            >
                                                {e.remaining}
                                            </a>
                                        </td>
                                    </tr>
                                )
                            })}
                    </div>
                </>
            )
        }
    ]

    const onBlurHandler = () => {
        eventSelect == undefined
            ? setFormErrors({ ...formErrors, location: 'Location Required' })
            : setFormErrors({ ...formErrors, location: '' })
        setToolTip(true)
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Leave Balances'} />
                                <div className="table">
                                    <form className="">
                                        <Form.Group
                                            // className='mb-1'


                                            as={Row}>
                                            <Form.Label column sm={1}>Location<span className="error">*</span>

                                            </Form.Label>
                                            <Col sm={3}>
                                                <Select
                                                    options={options}

                                                    value={
                                                        eventSelect
                                                            ? options.filter(option => option.value == eventSelect)
                                                            : null
                                                    }

                                                    onBlur={onBlurHandler}
                                                    onChange={handleEventSelection}
                                                    onMenuOpen={() => setToolTip(false)}
                                                />
                                                <p className="error">
                                                    {formErrors.location}
                                                </p>
                                            </Col>
                                        </Form.Group>
                                    </form>

                                    <div className="row" style={{ marginTop: '10px' }}>
                                        {''}

                                        <div className="col-10"></div>
                                        <div className="col-2" style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'none' }} id="print-table">
                                                {fileGen}
                                            </div>
                                            {/* <Button
                                                variant=""
                                                className="iconWidth"
                                            disabled={data.length > 0 ? false : true}
                                            >
                                                <Doc height="25px" />
                                            </Button> */}
                                            <div style={{ display: 'none' }}>
                                                <ReactHTMLTableToExcel
                                                    id="leave-table-xls-button"
                                                    className="download-table-xls-button"
                                                    table="table-to-xls"
                                                    filename="LeaveBalance"
                                                    sheet="LeaveBalance"
                                                    buttonText="Download as XLS"
                                                />
                                            </div>
                                            <Button
                                                variant=""
                                                className="iconWidth"
                                                // onClick={exportToTable}
                                                onClick={() => exportToTable('excel')}
                                                disabled={data.length > 0 ? false : true}
                                            >
                                                <XlSheet height="25px" />
                                            </Button>
                                        </div>
                                    </div>

                                    <ChildTable 
                                    key={data.length}
                                    columns={COLUMNS} serialNumber={true} data={data} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal
                show={leaveTypeShow}
                onHide={handleCloseLeaveTypeHistory}
                backdrop="static"
                size="lg"
                keyboard={false}
            >
                <Modal.Header closeButton={handleCloseLeaveTypeHistory}>
                    <Modal.Title>View Leavetype History : {getData.leaveTypeName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LeaveTypeHistory getData={getData} header={true} />
                </Modal.Body>
                <div style={{ marginLeft: '40%', marginBottom: '3%' }}>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={handleCloseLeaveTypeHistory}
                    >
                        Close
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default LeaveBalanceList
