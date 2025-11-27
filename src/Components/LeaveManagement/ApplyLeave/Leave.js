import { DatePicker } from 'antd'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { ModalBody, Tooltip } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import {
    commonCrudSuccess,
    leaveCrudSuccess
} from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import LeaveTypeHistory from '../../../Common/CommonComponents/LeaveTypeHistory'
import Loader from '../../../Common/CommonComponents/Loader'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import {
    getAllWithGenderandMartial,
    getById,
    save,
    update
} from '../../../Common/Services/CommonService'
import {
    getHolidayCalendarByLocationId,
    getLeaveBalance
} from '../../../Common/Services/OtherServices'
import ExpandedTable from '../../../Common/Table/ExapandedTable'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const Leave = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const leaveId = useLocation().state
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState('') // state for text inputs
    const [leaveType, setLeaveType] = useState([])
    const [leavetypeId, setLeaveTypeId] = useState(null) // state for selected leavenametype
    const [fromDate, setFromDate] = useState(null) // state for from date
    const [toDate, setToDate] = useState(null) //state for Todate
    const navigate = useNavigate() // for redirect
    const [leave, setLeave] = useState({}) //state for storing  leave data
    const [show, setShow] = useState(false) //state for displaying modals (pop ups)
    const [year, setYear] = useState(new Date().getFullYear()) //state for setting year for holiday calender
    const [holidays, setHolidays] = useState(null) //state for storing holidays data
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [leaveBalanceShow, setLeaveBalanceShow] = useState(false) //state for displaying leave balance pop up
    const [leaveBalance, setLeaveBalance] = useState([]) //state for storing leave balance  data
    const [fromDateHalfday, setFromDateHalfday] = useState(false) //state for handling  check box functionality at from date
    const [toDateHalfday, setToDateHalfday] = useState(false) //state for handling  check box functionality at to date
    const [fromSession, setFromSession] = useState(null) //state for handling from session values
    const [toSession, setToSession] = useState(null) //state for handling to session values
    const [submitShow, setSubmitShow] = useState(false) //state for handling viewing submit pop up
    const [leaveGetData, setLeaveGetData] = useState([])

    const onCloseHandler = () => {
        setLeaveBalanceShow(false)
        setShow(false)
        setExpandedRow(null) // Reset expanded row on close
        setGetData({})
        setSubmitShow(false)
    }

    // handlig text inputs
    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    
    const handleInputChange = (event) => {
        const { value } = event.target
        if (value.length <= 250) {
            // Restricting input to 250 characters
           
            onChangeHandler(event) // Call the original change handler
        }
    }

    // options for dropdown
    const leaveTypeOptions = leaveType.map((option) => ({
        value: option.id,
        label: option.name
    }))

    // handling dropdown
    const handleLeaveypeselection = (selection) => {
        setLeaveTypeId(selection.value)
    }

    // handling date picker for fromdate
    const onFromDateHandler = (fromDate) => {
        setFromDate(moment(fromDate).format('YYYY-MM-DD'))
        setToDate(null)
        setFromDateHalfday(false)
        setToDateHalfday(false)
        setToSession(null)
    }

    // handling date picker for todate
    const onToDateHandler = (todate) => {
        setToDate(moment(todate).format('YYYY-MM-DD'))
    }
    useEffect(() => {
        onGetLeavetypeHandler()
        if (leaveId && leaveId.id) {
            onGetLeaveHandler()
        }
    }, [])

    // api for get leavetypes
    const onGetLeavetypeHandler = () => {
        setLoading(true)
        getAllWithGenderandMartial({
            entity: 'leavetypes',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: userDetails.locationId == null ? 0 : userDetails.locationId,
            employeeId: userDetails.employeeId == null ? 0 : userDetails.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLeaveType(res.data)
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    const onGetHandler = () => {
        setLoading(true)
        setLeaveBalanceShow(true)
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: userDetails.employeeId,
            locationId: userDetails.locationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLeaveBalance(res.data)
                    setLoading(false)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    //api for  getting holiday calender based on year
    const onGetHolidayCalendarHandler = (year) => {
        setLoading(true)
        getHolidayCalendarByLocationId({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId,
            year: year
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setHolidays(res.data)
                } else {
                    setHolidays([])
                }
                setLoading(false) // Always set loading to false after response
            })
            .catch((err) => {
                setLoading(false) // Also set loading to false on error
                setHolidays([])
                console.log(err, 'error')
            })
    }

    // api handling for applyLeave
    const onSaveHandler = (e) => {
        if (loading) return
        setLoading(true)

        const isNew = !leave.id // true if initial save/submit

        const applyLeaveobject = {
            id: leave.id,
            organizationId: userDetails.organizationId,
            leavetypeId: leavetypeId,
            employeeId: userDetails.employeeId,
            fromDate: fromDate ? fromDate : leave.fromDate,
            toDate: toDate,
            fromSession: fromSession,
            toSession: toSession,
            fromSelect: fromDateHalfday,
            toSelect: toDateHalfday,
            reason: formData.reasonForLeave ? formData.reasonForLeave : leave.reason,
            status: e,
            locationId: userDetails.locationId,
            createdBy: isNew ? userDetails.employeeId : leave.createdBy,
            createdDate: isNew ? null : leave.createdDate,
            modifiedBy: isNew ? null : userDetails.employeeId
        }

        if (applyLeaveobject.leavetypeId == undefined) {
            setFormErrors(validate(applyLeaveobject))
            setLoading(false)
            return
        } else if (applyLeaveobject.fromDate == undefined || applyLeaveobject.fromDate.length < 0) {
            setFormErrors(validate(applyLeaveobject))
            setLoading(false)
            return
        } else {
            save({
                entity: 'leaves',
                organizationId: userDetails.organizationId,
                body: applyLeaveobject,
                toastSuccessMessage: leaveCrudSuccess({
                    screen: 'Leave',
                    operationType: applyLeaveobject.status
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        navigate('/leaveList')
                        ToastSuccess(res.message)
                    } else {
                        setSubmitShow(false)
                    }
                })
                .catch((err) => {
                    ToastError(err.message)
                    console.log(err, 'error')
                })
                .finally(() => {
                    setLoading(false) // End loading state on completion
                })
        }
    }
    console.log(userDetails, 'user details')
    //leave submit object handler
    const onSubmiteHandler = () => {
        let updatedToDate = toDate
        let updatedToSession = toSession
        const isNew = !leave.id // true if initial save/submit

        if (fromDateHalfday && fromSession == 'FirstSession') {
            updatedToDate = null
            updatedToSession = null
        }

        if (fromDate && toDate && fromDate === toDate && !toDateHalfday) {
            updatedToDate = null
            updatedToSession = null
        }

        const applyLeaveobject = {
            id: leave.id,
            organizationId: userDetails.organizationId,
            leavetypeId: leavetypeId ? leavetypeId : leave.leavetypeId,
            employeeId: userDetails.employeeId,
            fromDate: fromDate ? fromDate : leave.fromDate,
            toDate: updatedToDate,
            fromSession: fromSession,
            locationId: userDetails.locationId,
            toSession: updatedToSession,
            fromSelect: fromDateHalfday,
            toSelect: fromDate == toDate ? false : toDateHalfday,
            reason: formData.reasonForLeave ? formData.reasonForLeave : leave.reason,
            createdBy: isNew ? userDetails.employeeId : leave.createdBy,
            createdDate: isNew ? null : leave.createdDate,
            modifiedBy: isNew ? null : userDetails.employeeId
        }

        if (applyLeaveobject.leavetypeId == undefined) {
            setFormErrors(validate(applyLeaveobject))
        } else if (applyLeaveobject.fromDate == undefined || applyLeaveobject.fromDate.length < 0) {
            setFormErrors(validate(applyLeaveobject))
        } else {
            setSubmitShow(true)
        }
    }
    // api handling for updating Leave object
    const onUpdateHandler = (e) => {
        const isLeaveDataUnchanged =
            leaveGetData.leavetypeId === (leavetypeId ? leavetypeId : leave.leavetypeId) &&
            leaveGetData.fromDate === (fromDate ? fromDate : leave.fromDate) &&
            leaveGetData.toDate === toDate &&
            leaveGetData.fromSession === fromSession &&
            leaveGetData.toSession === toSession &&
            leaveGetData.fromSelect === fromDateHalfday &&
            leaveGetData.toSelect === toDateHalfday &&
            leaveGetData.reason ===
                (formData.reasonForLeave ? formData.reasonForLeave : leave.reason)

        if (isLeaveDataUnchanged) {
            toast.info('No changes made to update')
            setLoading(false)
            return // important to exit early
        }
        let updatedToDate = toDate
        let updatedToSession = toSession

        if (fromDateHalfday && fromSession == 'FirstSession') {
            updatedToDate = null
            updatedToSession = null
        }

        if (fromDate && toDate && fromDate === toDate && !toDateHalfday) {
            updatedToDate = null
            updatedToSession = null
        }

        const applyLeaveobject = {
            id: leave.id,
            organizationId: userDetails.organizationId,
            leavetypeId: leavetypeId ? leavetypeId : leave.leavetypeId,
            employeeId: userDetails.employeeId,
            fromDate: fromDate ? fromDate : leave.fromDate,
            toDate: updatedToDate,
            fromSession: fromSession,
            locationId: userDetails.locationId,
            toSession: updatedToSession,
            fromSelect: fromDateHalfday,
            toSelect: fromDate == toDate ? false : toDateHalfday,
            reason: formData.reasonForLeave ? formData.reasonForLeave : leave.reason,
            status: e,
            createdBy: leave.createdBy, // always from getById
            createdDate: leave.createdDate, // always from getById
            modifiedBy: userDetails.employeeId // always current user
        }

        if (applyLeaveobject.leavetypeId == undefined) {
            setFormErrors(validate(applyLeaveobject))
        } else if (applyLeaveobject.fromDate == undefined || applyLeaveobject.fromDate.length < 0) {
            setFormErrors(validate(applyLeaveobject))
        } else {
            // alert("hello")
            update({
                entity: 'leaves',
                organizationId: userDetails.organizationId,
                id: leave.id,
                body: applyLeaveobject,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Leave',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        navigate('/leaveList')
                    } else {
                        setSubmitShow(false)
                    }
                })
                .catch((err) => {
                    ToastError(err.message)
                    console.log(err, 'error')
                })
        }
    }

    // api handling for leave get by id
    const onGetLeaveHandler = () => {
        setLoading(true)
        getById({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            id: leaveId && leaveId.id
        }).then((res) => {
            if (res.statusCode == 200) {
                setLeaveTypeId(res.data.leavetypeId)
                setLeave(res.data)
                setFromDate(res.data.fromDate)
                setToDate(res.data.toDate)
                setFromDateHalfday(res.data.fromSelect)
                setToDateHalfday(res.data.toSelect)
                setFromSession(res.data.fromSession)
                setToSession(res.data.toSession)
                setLeaveGetData(res.data ? res.data : {})
                setLoading(false)
            }
        })
    }
const isActionEnabled = () => {
    const allowedStatuses = ['Saved', 'Rejected', 'Cancelled'];
    // leave.status may be undefined for new leave
    return !leave.status || allowedStatuses.includes(leave.status);
};
    //leave balance pop up table
    const BalanceCOLUMNS = [
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="text-center" style={{ width: '3.3rem' }}>
                    {expandedRow !== row.index ? (
                        <Button
                            variant="success"
                            onClick={() => handleRowClick(row.index, row.original)}
                        >
                            +
                        </Button>
                    ) : (
                        <Button variant="danger" onClick={() => handleRowClose()}>
                            -
                        </Button>
                    )}
                </div>
            )
        },
        {
            Header: <div className="text-left header">Type</div>,
            accessor: 'leaveTypeName',
            Cell: ({ row }) => (
                <div className="text-left" style={{ width: '5rem' }}>
                    {row.original.leaveTypeName}
                </div>
            )
        },
        {
            Header: <div className="text-center header">Remarks</div>,
            accessor: 'remarks',
            Cell: ({ row }) => (
                <div className="text-left" style={{ width: '6rem' }}>
                    <Tooltip title={row.original.remarks} open>
                        {row.original.remarks}
                    </Tooltip>
                    <div
                        className="text-center"
                        style={{
                            width: '6rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {row.original.remarks}
                    </div>
                </div>
            )
        },
        {
            Header: <div className="numericColHeading">Forwarded</div>,
            accessor: 'carryForward',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '5rem' }}>
                    {row.original.carryForward}
                </div>
            )
        },
        {
            Header: <div className="numericColHeading">Credited</div>,
            accessor: 'totalCredited',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '5rem' }}>
                    {row.original.totalCredited}
                </div>
            )
        },
        {
            Header: <div className="numericColHeading">Used</div>,
            accessor: 'totalUsed',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '5rem' }}>
                    {row.original.totalUsed}
                </div>
            )
        },
        {
            Header: <div className="numericColHeading">LOP</div>,
            accessor: 'lop',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '5rem' }}>
                    {row.original.lop}
                </div>
            )
        },
        {
            Header: <div className="numericColHeading">Balance</div>,
            accessor: 'remaining',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '5rem' }}>
                    {row.original.remaining}
                </div>
            )
        }
    ]

    const GetDay = (data) => {
        let fullDate = new Date(data).toString()
        let day = fullDate.slice(0, 3)
        return day
    }

    // for year

    const nextYear = () => {
        setYear(year + 1)

        onGetHolidayCalendarHandler(year + 1)
    }
    const prevYear = () => {
        setYear(year - 1)
        onGetHolidayCalendarHandler(year - 1)
    }

    //table for holiday calender pop up
    const COLUMNS = [
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }) => (
                <div
                    style={{
                        width: '100px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {value}
                </div>
            )
        },
        {
            Header: 'Day',
            accessor: '',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap">{GetDay(row.original.date)}</div>
                </>
            )
        },
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ value }) => (
                <div
                    style={{
                        width: '100px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    title={value}
                >
                    {value}
                </div>
            )
        },

        {
            Header: 'Optional',
            accessor: 'optional',
            Cell: ({ row }) => (
                <>
                    <div className="tableNameData">{row.original.optional ? 'Yes' : 'No'}</div>
                </>
            )
        },

        {
            Header: 'Description',
            accessor: 'description'
        }
    ]

    const [getData, setGetData] = useState({})

    //validate condition
    const validate = (values) => {
        const errors = {}
        setSubmitShow(false)
        if (values.leavetypeId == undefined || values.leavetypeId.length < 0) {
            errors.leaveType = 'Required'
        }
        if (!values.fromDate || values.fromDate.length < 0) {
            errors.fromDate = 'Required'
        }
        return errors
    }

    const handleHalfdayFromDate = () => {
        setFromDateHalfday(!fromDateHalfday)
        setToDate(null)
        setToSession(null)
        if (!fromDateHalfday) {
            setFromSession('FirstSession')
        } else {
            setFromSession(null)
        }

    }

    const handleRowClick = (rowIndex, row) => {
        setExpandedRow(rowIndex) // Toggle row expansion
        setGetData(row)
    }

    const handleRowClose = () => {
        setExpandedRow(null)
        setGetData({})
    }

    //getting leave types data to expanded table in leave balance pop up
    const renderLeaveTypeHistory = (rowData) => {
        return (
            <tr>
                <td colSpan={BalanceCOLUMNS.length} className="p-0">
                    <LeaveTypeHistory rowData={rowData} getData={getData} />
                </td>
            </tr>
        )
    }

    const [expandedRow, setExpandedRow] = useState(null)

    const clickFromButton = (e) => {
        setFromSession(e.target.value)
        setToDate(null)
    }

    const handleHalfdayToDate = () => {
        setToDateHalfday((prevState) => {
            const newState = !prevState
            setToSession(newState ? 'FirstSession' : null)
            return newState
        })
    }

    const dateCellRender = (current) => {
        const holiday = (holidays || []).find(function (holiday) {
            return (
                new Date(holiday.date).getDate() === current.date() &&
                new Date(holiday.date).getMonth() === current.month() &&
                new Date(holiday.date).getFullYear() === current.year()
            )
        })

        if (holiday) {
            return (
                <div className="ant-picker-cell-inner">
                    <Tooltip title={holiday.name} open>
                        <span
                            style={{
                                backgroundColor: 'lightgray',
                                padding: '1px 6px 2px 5px',
                                borderRadius: '20px'
                            }}
                        >
                            {current.date()}
                        </span>
                    </Tooltip>
                    <span
                        style={{
                            backgroundColor: 'lightgray',
                            padding: '1px 6px 2px 5px',
                            borderRadius: '20px'
                        }}
                    >
                        {current.date()}
                    </span>
                </div>
            )
        }

        return <div className="ant-picker-cell-inner">{current.date()}</div>
    }
    console.log(leaveBalance, 'leave data')
    return (
        <>
            <>
                {loading ? <DetailLoader /> : ''}
                <section className="section detailBackground">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="">
                                    <PageHeader
                                        pageTitle={
                                            (leaveId.id == null ? 'Apply' : 'Update') +
                                            ' ' +
                                            'Leave'
                                        }
                                    />

                                    <br />
                                    <form className="formBody">
                                        <div class="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={3}>
                                                    Leave Type <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={6}>
                                                    <Select
                                                        className="dropdownMedium"
                                                        placeholder=""
                                                        options={leaveTypeOptions}
                                                        value={leaveTypeOptions.filter(
                                                            (e) => e.value == leavetypeId
                                                        )}
                                                        onChange={handleLeaveypeselection}
                                                        onBlur={() =>
                                                            leavetypeId == null
                                                                ? setFormErrors({
                                                                      ...formErrors,
                                                                      leaveType: 'Required'
                                                                  })
                                                                : setFormErrors({
                                                                      ...formErrors,
                                                                      leaveType: ''
                                                                  })
                                                        }
                                                    />
                                                    <p className="error">{formErrors.leaveType}</p>
                                                </Col>
                                                <Col
                                                    md={2}
                                                    className="leaveBalanceCol"
                                                    style={{ marginLeft: '2%' }}
                                                >
                                                    &ensp;
                                                    <a className="" onClick={onGetHandler}>
                                                        <u style={{ fontSize: '14px' }}>
                                                            Leave Balance
                                                        </u>
                                                    </a>
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div class="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={3}>
                                                    From Date <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={8}>
                                                    <DatePicker
                                                        dateRender={dateCellRender}
                                                        value={
                                                            fromDate == null
                                                                ? null
                                                                : moment(fromDate)
                                                        }
                                                        placeholder=""
                                                        inputReadOnly={true}
                                                        disabledDate={(current) => {
                                                            if (
                                                                !userDetails ||
                                                                !userDetails.dateOfJoining
                                                            )
                                                                return false // Ensure dateOfJoining exists
                                                            const joiningDate = moment(
                                                                userDetails.dateOfJoining,
                                                                'YYYY-MM-DD'
                                                            )
                                                            return current && current < joiningDate // Disable dates before dateOfJoining
                                                        }}
                                                        format={'DD-MM-YYYY'}
                                                        allowClear={false}
                                                        className="datepicker"
                                                        onChange={(e) => onFromDateHandler(e)}
                                                        name="fromDate"
                                                        onBlur={(e) =>
                                                            !e.target.value
                                                                ? setFormErrors({
                                                                      ...formErrors,
                                                                      fromDate: 'Required'
                                                                  })
                                                                : setFormErrors({
                                                                      ...formErrors,
                                                                      fromDate: ''
                                                                  })
                                                        }
                                                    />
                                                    &ensp;
                                                    <span className="themeColor">
                                                        <input
                                                            type="checkbox"
                                                            checked={fromDateHalfday}
                                                            onClick={() => handleHalfdayFromDate()}
                                                        />
                                                        &ensp; Half Day
                                                    </span>{' '}
                                                    &emsp;
                                                    {fromDateHalfday && (
                                                        <span>
                                                            <input
                                                                value="FirstSession"
                                                                type="radio"
                                                                checked={
                                                                    fromSession === 'FirstSession'
                                                                } // "FirstSession" radio button is checked if fromSession is "FirstSession"
                                                                onChange={(e) => clickFromButton(e)}
                                                                name="halfday"
                                                                disabled={!fromDateHalfday} // Radio buttons are disabled if fromDateHalfday is not checked
                                                            />
                                                            &ensp;
                                                            <span className="themeColor">
                                                                First Half
                                                            </span>
                                                            &emsp;
                                                            <input
                                                                value="SecondSession"
                                                                type="radio"
                                                                checked={
                                                                    fromSession === 'SecondSession'
                                                                } // "SecondSession" radio button is checked if fromSession is "SecondSession"
                                                                onChange={(e) =>
                                                                    setFromSession(e.target.value)
                                                                }
                                                                name="halfday"
                                                                disabled={!fromDateHalfday} // Radio buttons are disabled if fromDateHalfday is not checked
                                                            />
                                                            &ensp;
                                                            <span className="themeColor">
                                                                Second Half
                                                            </span>
                                                        </span>
                                                    )}
                                                    <p className="error">{formErrors.fromDate}</p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        {fromDateHalfday && fromSession == 'FirstSession' ? (
                                            <> </>
                                        ) : (
                                            <div class="col-">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column sm={3}>
                                                        To Date <span></span>
                                                    </Form.Label>
                                                    <Col md={8}>
                                                        <DatePicker
                                                            value={
                                                                toDate == null
                                                                    ? null
                                                                    : moment(toDate)
                                                            }
                                                            dateRender={dateCellRender}
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
                                                            placeholder=""
                                                            inputReadOnly={true}
                                                            className="datepicker"
                                                            name="toDate"
                                                            onChange={(e) => onToDateHandler(e)}
                                                            format={'DD-MM-YYYY'}
                                                            allowClear={false}
                                                            onBlur={(e) =>
                                                                !e.target.value
                                                                    ? setFormErrors({
                                                                          ...formErrors
                                                                      })
                                                                    : setFormErrors({
                                                                          ...formErrors,
                                                                          toDate: ''
                                                                      })
                                                            }
                                                        />
                                                        &ensp;
                                                        <span className="themeColor">
                                                            <input
                                                                type="checkbox"
                                                                checked={toDateHalfday}
                                                                disabled={
                                                                    !toDate || fromDate == toDate
                                                                } // Checkbox is disabled if toDate is null
                                                                onClick={handleHalfdayToDate}
                                                            />
                                                            &ensp; First Half
                                                        </span>{' '}
                                                        &emsp;
                                                        <p className="error">{formErrors.toDate}</p>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        )}
                                        <div class="col-">
                                            <Form.Group as={Row} className="mb-5">
                                                <Form.Label column sm={3}>
                                                    Reason
                                                </Form.Label>
                                                <Col md={6}>
                                                    <Form.Control
                                                        size="sm"
                                                        as="textarea"
                                                        maxLength={250}
                                                        defaultValue={leave.reason}
                                                        onChange={handleInputChange}
                                                        name="reasonForLeave"
                                                        type="text"
                                                    />

                                                    {/* <div className="d-flex justify-content-end">
                            <small>{charCount} / 250 </small>
                          </div> */}
                                                </Col>

                                                <Col
                                                    md={2}
                                                    style={{ marginLeft: '2%', marginTop: '3%' }}
                                                    className="holidaycalderLink"
                                                    onClick={() => setShow(true)}
                                                >
                                                    &ensp;
                                                    {/* //resolved 1844 */}
                                                    <span style={{ whiteSpace: 'nowrap' }}>
                                                        <a
                                                            className=""
                                                            onClick={() => {
                                                                setShow(true)
                                                                onGetHolidayCalendarHandler(year) // Call API with current year when opening modal
                                                            }}
                                                        >
                                                            <u style={{ fontSize: '14px' }}>
                                                                View Holiday Calendar
                                                            </u>
                                                        </a>
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="btnCenter mb-3">
                                            {leaveId.id == null ? (
                                                <Button
                                                    variant="addbtn"
                                                    type="button"
                                                    onClick={() => onSaveHandler('Saved')}
                                                    disabled={loading || !isActionEnabled()}
                                                    className="Button"
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="addbtn"
                                                    type="button"
                                                    onClick={() => onUpdateHandler('Saved')}
                                                    disabled={loading || !isActionEnabled()}
                                                    className="Button"
                                                >
                                                    Update
                                                </Button>
                                            )}{' '}
                                            <Button
                                                variant="addbtn"
                                                type="button"
                                                onClick={() => onSubmiteHandler()}
                                                className="Button"
                                                 disabled={loading || !isActionEnabled()}
                                            >
                                                Submit
                                            </Button>{' '}
                                            <Button
                                                variant="secondary"
                                                type="button"
                                                onClick={() => navigate('/leaveList')}
                                                className="Button"
                                            >
                                                {cancelButtonName}
                                            </Button>{' '}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Modal
                    show={show}
                    size="lg"
                    onHide={onCloseHandler}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton={onCloseHandler}>
                        <Modal.Title>Holiday Calendar ({year})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h6 className="modalBody">
                            <Button
                                className="holidayYearPrev"
                                disabled={year <= new Date().getFullYear()}
                                onClick={prevYear}
                                variant=""
                            >
                                {new Date().getFullYear()}
                            </Button>

                            <Button
                                className="holidayYearNext"
                                disabled={year > new Date().getFullYear()}
                                onClick={nextYear}
                                variant=""
                            >
                                {new Date().getFullYear() + 1}
                            </Button>
                        </h6>
                        {loading ? (
                            <div className="d-flex justify-content-center">
                                {' '}
                                <Loader />{' '}
                            </div>
                        ) : (
                            <div className="">
                                {holidays == null ? (
                                    <h4 className="modalBody">No Holidays Available</h4>
                                ) : (
                                    <Table
                                        columns={COLUMNS}
                                        data={holidays}
                                        serialNumber={true}
                                        pageSize="10"
                                    />
                                )}
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
                <Modal size="lg" className="" show={leaveBalanceShow} onHide={onCloseHandler}>
                    <Modal.Header closeButton={onCloseHandler}>
                        <Modal.Title>Leave Balance</Modal.Title>
                    </Modal.Header>
                    <ModalBody>
                        <ExpandedTable
                            columns={BalanceCOLUMNS}
                            serialNumber={true}
                            data={leaveBalance}
                            expandedRow={expandedRow}
                            renderLeaveTypeHistory={renderLeaveTypeHistory}
                        />
                        <br />
                        <div style={{ marginLeft: '40%' }}>
                            <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                                Close
                            </Button>
                        </div>
                    </ModalBody>
                </Modal>
                <Modal show={submitShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                    <Modal.Header className="" closeButton={onCloseHandler}>
                        <Modal.Title>Submit?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        Are you sure that you want to submit this leave request?
                    </Modal.Body>
                    <div className="delbtn">
                        <Button
                            className="Button"
                            variant="addbtn"
                            onClick={() => onSaveHandler('Submitted')}
                        >
                            Yes
                        </Button>
                        <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                            No
                        </Button>
                    </div>
                </Modal>
            </>
        </>
    )
}

export default Leave
