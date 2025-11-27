import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { FaEye } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DataBetweenDates from '../../../Common/CommonComponents/DataBetweenDates'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { Cancelation } from '../../../Common/CommonIcons/CommonIcons'
import {
    cancelApi,
    getById,
    getDataBetweenDatesByMngId
} from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'

const AuthorizeLeaves = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [leavesList, setLeavesList] = useState([]) //state for handling leave data
    const [status, setStatus] = useState('') //state for handling leave status
    const [formData, setFormData] = useState('') //state to store form data
    const [loading, setLoading] = useState(true) //state for loader displaying
    const [toDate, setToDate] = useState(null) //state for handling to date
    const [fromDate, setFromDate] = useState(null) //state for handling from date
    const [show, setShow] = useState(false) // state for popups
    const options = [
        { value: 'All', label: 'All' },
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Cancelled', label: 'Cancelled' }
    ]

    useEffect(() => {
        const pastdate = moment().subtract(30, 'days').toDate()
        const futureDate = moment('2099-12-31').toDate() // Set a far future date
        setFromDate(moment(pastdate).format('YYYY-MM-DD'))
        setToDate(moment(futureDate).format('YYYY-MM-DD'))
        setIsDirectSubordinateChecked(true)
        setIsIndirectSubordinateChecked(false)
    }, [])
    const navigate = useNavigate()
    // handle input

    //resolved 1783 jira ticker

    const [charCount, setCharCount] = useState(0) // state for character count
    const onCloseHandler = () => {
        setShow(false)
        setFormErrors({})
        setFormData({})
        setCharCount(0)
    }

    //api handling gor getting leaves between dates
    const onGetStatusHandler = () => {
        getDataBetweenDatesByMngId({
            entity: 'leaves',
            empId: userDetails.employeeId,
            fromDate: fromDate,
            toDate: toDate,
            organizationId: userDetails.organizationId,
            status: status,
            direct: isDirectSubordinateChecked,
            inDirect: isIndirectSubordinateChecked
        })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setLeavesList(res.data ? res.data : [])
                } else {
                    setLeavesList([])
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const [isDirectSubordinateChecked, setIsDirectSubordinateChecked] = useState(null)
    const [isIndirectSubordinateChecked, setIsIndirectSubordinateChecked] = useState(null)

    // Event handlers to handle checkbox state changes
    const handleDirectSubordinateChange = (event) => {
        setIsDirectSubordinateChecked(event.target.checked)
    }

    const handleIndirectSubordinateChange = (event) => {
        setIsIndirectSubordinateChecked(event.target.checked)
    }

    useEffect(() => {
        if (fromDate && toDate) {
            onGetStatusHandler()
        }
    }, [setFromDate, setToDate, isDirectSubordinateChecked, isIndirectSubordinateChecked])

    const onCancelationHandler = (row, id) => {
        setShow(true)
        onGetLeaveHandler(id)
    }

    const [leaveBody, setLeaveBody] = useState({})

    //api handling for leave getById
    const onGetLeaveHandler = (id) => {
        getById({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            id: id
        }).then((res) => {
            if (res.statusCode == 200) {
                setLeaveBody(res.data)
            }
        })
    }

    const [formErrors, setFormErrors] = useState({})

    const validate = (values) => {
        const errors = {}

        if (!values.cancellatoinRemarks) {
            errors.cancellatoinRemarks = 'Required'
        }
        return errors
    }

    // api handling for cancelling leave

    const cancelationHandler = () => {
        const levaeObj = {
            approvedBy: leaveBody.approvedBy,
            approvedDate: leaveBody.approvedDate,
            cancellatoinRemarks: formData.cancellatoinRemarks,
            cancelledBy: userDetails.employeeId,
            cancelledDate: leaveBody.cancelledDate,
            createdBy: leaveBody.createdBy,
            createdDate: leaveBody.createdDate,
            employeeId: leaveBody.employeeId,
            employeeName: leaveBody.employeeName,
            fromDate: leaveBody.fromDate,
            fromSession: leaveBody.fromSession,
            id: leaveBody.id,
            leavetypeId: leaveBody.leavetypeId,
            leavetypeName: leaveBody.leavetypeName,
            locationId: leaveBody.locationId,
            locationName: leaveBody.locationName,
            managerId: leaveBody.managerId,
            managerName: leaveBody.managerName,
            modifiedBy: userDetails.employeeId,
            numberofDays: leaveBody.numberofDays,
            organizationId: leaveBody.organizationId,
            organizationName: leaveBody.organizationName,
            reason: leaveBody.reason,
            remarks: leaveBody.remarks,
            status: 'Cancelled',
            submittedDate: leaveBody.submittedDate,
            toDate: leaveBody.toDate,
            toSession: leaveBody.toSession
        }
        if (!levaeObj.cancellatoinRemarks) {
            setFormErrors(validate(levaeObj))
        } else {
            cancelApi({
                entity: 'leaves',
                organizationId: userDetails.organizationId,
                id: levaeObj.id,
                body: levaeObj
            }).then((res) => {
                if (res.statusCode == 200) {
                    toast.success('Leave Cancelled Successfully.')
                    // onGetHandler();
                    onGetStatusHandler()
                    onCloseHandler()
                } else {
                    toast.error(res.errorMessage)
                }
            })
        }
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
        ...(isIndirectSubordinateChecked
            ? [
                {
                    Header: 'Manager Name',
                    accessor: 'managerName'
                }
            ]
            : []),
        {
            Header: 'Status',
            accessor: 'status'
        },
        {
            Header: () => <div className="header text-center ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-center">
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            disabled={row.original.status == 'Cancelled'}
                            onClick={() => onCancelationHandler(row.original, row.original.id)}
                        >
                            <Cancelation />
                        </Button>
                        |
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() =>
                                navigate('/AuthorizeLeaveDetails', { state: row.original.id })
                            }
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
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card-primary">
                                <PageHeader pageTitle={'Authorize Leaves'} />
                                <div className="" style={{ marginLeft: '1.5%' }}>
                                    <DataBetweenDates
                                        setFromDate={setFromDate}
                                        setToDate={setToDate}
                                        setStatus={setStatus}
                                        options={options}
                                        handleGo={onGetStatusHandler}
                                        defaultValue={{ label: 'All' }}
                                        showEmptyToDate={true}
                                    />
                                </div>
                                <div style={{ marginTop: '20px' }}>{''}</div>
                                <div style={{ display: 'flex', float: 'right' }}>
                                    <label>Include </label>
                                    <div style={{ marginRight: '25px' }}>
                                        <input
                                            type="checkbox"
                                            onChange={handleDirectSubordinateChange}
                                            checked={isDirectSubordinateChecked}
                                            style={{ marginLeft: '10px' }}
                                        />{' '}
                                        <label>Direct Reportees</label>
                                    </div>
                                    <div>
                                        <input
                                            type="checkbox"
                                            onChange={handleIndirectSubordinateChange}
                                            checked={isIndirectSubordinateChecked}
                                            style={{ marginLeft: '10px' }}
                                        />{' '}
                                        <label>Indirect Reportees</label>
                                    </div>
                                </div>
                                <div style={{ padding: '1px 8px 0px 8px', marginLeft: '7px' }}>
                                    <>
                                        <div className="noOfRecordsInTemplet">
                                            {leavesList && leavesList.length > 10 ? (
                                                <span>
                                                    No. of Records :{' '}
                                                    {leavesList && leavesList.length}
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </div>{' '}
                                        <Table
                                            columns={COLUMNS}
                                            serialNumber={true}
                                            data={leavesList}
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={onCloseHandler}>
                    <Modal.Title>Cancel Leave ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <div class="col-">
                        <Form.Group
                            as={Row}
                            className="mb-3 justify-content-center"
                            controlId="formGroupToDate"
                        >
                            <Form.Label column sm={3}>
                                Remarks <span className="error">*</span>
                            </Form.Label>
                            <Col md={7}>
                                {/* resolved 1783 jira ticket */}
                                <Form.Control
                                    name="cancellatoinRemarks"
                                    type="text"
                                    maxLength={250}
                                    value={formData.cancellatoinRemarks || ''}
                                    onChange={(e) => {
                                        const { value } = e.target
                                        if (value.length <= 250) {
                                            setFormData({ ...formData, cancellatoinRemarks: value })
                                            setCharCount(value.length)
                                            if (formErrors.cancellatoinRemarks) {
                                                setFormErrors({
                                                    ...formErrors,
                                                    cancellatoinRemarks: ''
                                                })
                                            }
                                        }
                                    }}
                                />
                                <div className="d-flex justify-content-end">
                                    <small>{charCount} / 250 </small>
                                </div>
                                <p className="modalError">{formErrors.cancellatoinRemarks}</p>
                            </Col>
                        </Form.Group>
                    </div>
                </Modal.Body>
                <div className="delbtn">
                    <Button className="Button" variant="addbtn" onClick={cancelationHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default AuthorizeLeaves
