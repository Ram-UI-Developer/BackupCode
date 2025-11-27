import { useState } from 'react'
import { Button, Col, Form, Modal, ModalBody, Row, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import LeaveTypeHistory from '../../../Common/CommonComponents/LeaveTypeHistory'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { DangerIcon } from '../../../Common/CommonIcons/CommonIcons'
import { getAllWithGenderandMartial, getById, save } from '../../../Common/Services/CommonService'
import { getLeaveBalance } from '../../../Common/Services/OtherServices'
import ExpandedTable from '../../../Common/Table/ExapandedTable'

const EmployeeLeaveBalance = ({ employeeData, employee, showAdd, status }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Accessing user details from the Redux store
    const [show, setShow] = useState(false) // useState hook to manage the state of the modal (show/hide)
    // Function to show the modal and reset form state
    const handleShow = () => {
        setShow(true)
        setPop('')
        setFormErrors({})
        getLeaveType()
    }
    const [lastWarnedValue, setLastWarnedValue] = useState(null)
    const [warningMessage, setWarningMessage] = useState('') // State for storing warning message
    const [showWarning, setShowWarning] = useState(false) // State to handle visibility of the warning message
    // States for managing leave-related flags
    const [credited, setCredited] = useState(true) // Default state for credited leave
    const [carryForward, setCarryForwarded] = useState(false) // Default state for carry forward leave
    const [lop, setLop] = useState(false) // Default state for leave without pay (LOP)
    const [leaves, setLeaves] = useState([]) // State for storing leave types
    // Function to fetch leave types based on employee details (organization ID, location ID, employee ID)
    const getLeaveType = () => {
        getAllWithGenderandMartial({
            entity: 'leavetypes',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: employee.locationId,
            employeeId: employee.id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLeaves(res.data)
                    setAllLeaves(res.data) // resolved bugathon error
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    // Mapping the fetched leave types to options for a dropdown or select input
    const leaveOptions = leaves
        ? leaves.map((option) => ({
            label: option.name,
            value: option.id,
            automate: option.automate
        }))
        : 'No Data Found'

    const [leaveType, setLeaveType] = useState() // State for managing the selected leave type

    // Function to handle leave type selection from a dropdown or select input
    //resolved 1754 jira ticket
    const handleLeaveTypeSelection = (select) => {
        if (select) {
            setLeaveType(select.value)
            getLeaveById(select.value)
            const selectedLeaveType = leaves.find((leave) => leave.id === select.value)
            if (selectedLeaveType) {
                setFrequency(selectedLeaveType.frequency)
            }
        } else {
            setLeaveType(null)
            setPop(null)
        }
        // Clear warning when leave type changes
        setShowWarning(false)
        setWarningMessage('')
        setLastWarnedValue(null)
    }

    const [pop, setPop] = useState({}) // State for storing additional leave details (e.g., frequency, description, etc.)
    // Function to fetch leave details by its ID
    const getLeaveById = (id) => {
        // Fetch leave details using an API call with the leave ID, organization ID, and other necessary parameters
        getById({
            entity: 'leavetypes',
            organizationId: userDetails.organizationId,
            id: id
        }).then((res) => {
            if (res.statusCode == 200) {
                setPop(res.data)
            }
        })
            .catch((err) => {
                console.log(err, 'error') // Log any errors that occur during the API call
            })
    }

    // validations for object fields
    const [formErrors, setFormErrors] = useState({})
    const validate = (values) => {
        const errors = {}
        if (!values.leavetypeId || values.leavetypeId == '') {
            errors.leavetypeId = 'Required'
        }
        if (values.accumulated == undefined || !values.accumulated || values.accumulated == 0) {
            errors.accumulated = 'Required'
        }
        if (frequency === 'Monthly' && !values.month) {
            errors.month = 'Required'
        }
        //resolved 1771 jira ticket typo error
        if (frequency === 'Quarterly' && !values.quarter) {
            errors.quarter = 'Required'
        }
        if (frequency === 'Yearly' && !values.year) {
            errors.year = 'Required'
        }
        return errors
    }

    const year = new Date().getFullYear() // Get the current year using JavaScript's Date object
    const [formData, setFormData] = useState('') // State to hold form data (initially empty)
    // Function to handle input changes in the form fields
    //resolved 1754 jira ticket
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        // If user changes accumulated, clear warning and lastWarnedValue
        if (name === 'accumulated') {
            setShowWarning(false)
            setWarningMessage('')
            setLastWarnedValue(null)
        }
    }

    const [frequency, setFrequency] = useState('') // State for storing the frequency of some event or operation (could be related to leave type, etc.)
    const [quarter, setQuarter] = useState('') // State for storing the selected quarter (Jan-Mar, Apr-Jun, etc.)
    // Array containing the different quarterly options to choose from
    const quarterlyOptions = [
        { value: 'Jan-Mar', label: 'Jan-Mar' },
        { value: 'Apr-Jun', label: 'Apr-Jun' },
        { value: 'Jul-Sep', label: 'Jul-Sep' },
        { value: 'Oct-Dec', label: 'Oct-Dec' }
    ]
    // Array containing all months of the year in uppercase
    const monthsOptions = [
        { value: 'JANUARY', label: 'JANUARY' },
        { value: 'FEBRUARY', label: 'FEBRUARY' },
        { value: 'MARCH', label: 'MARCH' },
        { value: 'APRIL', label: 'APRIL' },
        { value: 'MAY', label: 'MAY' },
        { value: 'JUNE', label: 'JUNE' },
        { value: 'JULY', label: 'JULY' },
        { value: 'AUGUST', label: 'AUGUST' },
        { value: 'SEPTEMBER', label: 'SEPTEMBER' },
        { value: 'OCTOBER', label: 'OCTOBER' },
        { value: 'NOVEMBER', label: 'NOVEMBER' },
        { value: 'DECEMBER', label: 'DECEMBER' }
    ]
    const [months, setMonths] = useState(null) // State to store the selected month (initially null)
    // Function to handle the selection of a month from the month options
    const handleMonthSelect = (selection) => {
        setMonths(selection.value)
    }
    // Function to save the leave balance data
    //resolved 1754 jira ticket
    const saveLeaveBalance = () => {
        const obj = {
            accumulated: formData.accumulated,
            employeeId: employeeData.id,
            organizationId: userDetails.organizationId,
            locationId: employee.locationId,
            leavetypeId: leaveType,
            year: formData.yearValue ? formData.yearValue : year,
            month: months == '' ? null : months,
            quarter: quarter == '' ? null : quarter,
            lop: lop,
            forwarded: carryForward
        }

        // Always validate first
        const errors = validate(obj)
        setFormErrors(errors)

        // If any validation error, don't proceed
        if (Object.keys(errors).length > 0) return

        // Check for leave count exceeding allowed
        if (
            pop &&
            formData.accumulated > 30 &&
            lastWarnedValue !== formData.accumulated
        ) {
            setWarningMessage(
                `The entered leave balance ${formData.accumulated} is greater than the allowed ${pop.numberOfDays}.`
            )
            setShowWarning(true)
            setLastWarnedValue(formData.accumulated) // Remember this value
            return // Don't proceed to save on first click
        }

        // If all validations pass, or user confirmed by clicking save again, proceed to save the data
        save({
            entity: 'leavebalances',
            organizationId: userDetails.organizationId,
            body: obj,
            toastSuccessMessage: commonCrudSuccess({
                screen: 'Leavebalances',
                operationType: 'save'
            })
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    ToastSuccess(res.message)
                    onCloseHandler()
                    setFormData('')
                    setLeaveType('')
                    setMonths('')
                    setLastWarnedValue(null) // Reset after successful save
                }
            })
            .catch((err) => {
                ToastError(err.message)
            })
    }
    // Function to handle closing the popup and other associated actions
    //resolved 1754 jira ticket
    //resolved 1839 jira ticket  by closing all the popups and resetting the form data
    const onCloseHandler = () => {
        setShow(false)
        setPopUp(false)
        setShowWarning(false)
        setLeaveType(null)
        setFormData('') // <-- reset form data
        setMonths('') // <-- reset months
        setQuarter('') // <-- reset quarter
        setFrequency('') // <-- reset frequency
        setFormErrors({}) // <-- reset errors
        setPop('') // <-- reset pop
        setLastWarnedValue(null)
        setWarningMessage('')
        setExpandedRow(null) // <-- reset expanded row if needed
        setGetData({})
        handleRowClose()
    }
    const [popup, setPopUp] = useState(false) // State to track whether the popup is open or not
    // Function to show the popup and trigger leave balance data retrieval
    const onHandleshow = () => {
        setPopUp(true)
        onGetLeaveHandler()
    }
    const [data, setData] = useState([]) // State to store the leave balance data
    // useEffect hook to trigger the retrieval of LOP balance on initial render

    // Function to retrieve the leave balance data for the employee
    const onGetLeaveHandler = () => {
        // Fetch leave balance data for the employee using API
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: employeeData.id ? employeeData.id : employeeData,
            locationId: 0
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setData(res.data)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    // Function to retrieve the LOP balance data for the employee

    // Function to handle row click event and toggle row expansion
    const handleRowClick = (rowIndex, row) => {
        setExpandedRow(rowIndex) // Toggle row expansion
        setGetData(row)
    }
    // Function to close the expanded row and reset the row data
    const handleRowClose = () => {
        setExpandedRow(null)
        setGetData({})
    }

    const [expandedRow, setExpandedRow] = useState(null) // State to track the currently expanded row (if any)
    const [getData, setGetData] = useState({}) // State to store the data of the currently selected row
    // Define the columns for the table
    // Column for 'Actions' which allows the user to expand or collapse a row
    const COLUMNS = [
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="text-center" style={{ width: '3.3rem' }}>
                    {expandedRow !== row.index ? (
                        <Button
                            id="expandLeaveBalance"
                            variant="success"
                            onClick={() => handleRowClick(row.index, row.original)}
                        >
                            +
                        </Button>
                    ) : (
                        <Button
                            id="collapseLeaveBalance"
                            variant="danger"
                            onClick={() => handleRowClose()}
                        >
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
    // Function to handle changes in the credited type selection (either 'Credited', 'carryForward', or 'LOP')
    //resolved bugathon error
    const [allLeaves, setAllLeaves] = useState([]) // Store the full list
    // Function to handle changes in the credited type selection (either 'Credited', 'carryForward', or 'LOP')
    const onCreditedTypeChange = (e) => {
        setLeaveType(null)
        setPop()
        setShowWarning(false)
        setWarningMessage('')
        setLastWarnedValue(null)

        if (e === 'Credited') {
            setLeaves(allLeaves) // Show all leave types
            setCredited(true)
            setLop(false)
            setCarryForwarded(false)
        } else if (e === 'carryForward') {
            const carryForwardTypes = allLeaves.filter((leave) => leave.carryforward === true)
            setLeaves(carryForwardTypes)
            setCredited(false)
            setLop(false)
            setCarryForwarded(true)
        } else {
            const lopTypes = allLeaves.filter((leave) => leave.lop === true)
            setLeaves(lopTypes)
            setCredited(false)
            setLop(true)
            setCarryForwarded(false)
        }
    }
    // Function to render the leave type history row in the table
    const renderLeaveTypeHistory = (rowData) => {
        return (
            <tr>
                <td colSpan={COLUMNS.length} className="p-0">
                    {/* Render the LeaveTypeHistory component with the given rowData and getData as props */}
                    <LeaveTypeHistory rowData={rowData} getData={getData} />
                </td>
            </tr>
        )
    }

    return (
        <div>
            {showAdd ? (
                // Check if 'showAdd' is true, if so render the following block
                <div style={{ marginLeft: '13rem' }}>
                    &ensp;
                    <span>
                        <a id="viewLeaveBalance" className="" onClick={onHandleshow}>
                            <u style={{ fontSize: '14px' }}>View Leave Balance</u>
                        </a>
                    </span>
                </div>
            ) : (
                <div style={{ display: 'flex' }}>
                    &ensp;
                    {
                        status != "Active" ? <></> :

                            <span>
                                <a id="addLeaveBalance" className="" onClick={handleShow}>
                                    <u style={{ fontSize: '14px' }}>Add Leave Balance</u>
                                </a>
                            </span>
                    }
                    &emsp; &ensp;
                    <div>
                        &ensp;
                        {
                            (status === "Active" || status === "OnNoticePeriod") ? (
                                <span>
                                    <a id="viewLeaveBalance" className="" onClick={onHandleshow}>
                                        <u style={{ fontSize: '14px' }}>View Leave Balance</u>
                                    </a>
                                </span>
                            ) : <></>
                        }
                    </div>
                </div>
            )}
            <Modal className="" size="lg" show={show} onHide={onCloseHandler}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Employee Leave Balance</Modal.Title>
                </Modal.Header>
                {/* The body of the modal, where all content is placed */}
                <Modal.Body className="commonModal">
                    <div className="row">
                        <div
                            style={{
                                justifyContent: 'center',
                                display: 'flex',
                                marginBottom: showWarning ? '15px' : ''
                            }}
                        >
                            {showWarning && (
                                <div>
                                    <DangerIcon height="20px" size="20px" />
                                    &nbsp;&nbsp; {warningMessage}
                                </div>
                            )}
                        </div>

                        <div className="col-10">
                            <Form.Group className="mb-3" as={Row} controlId="balancedType">
                                <Form.Label id="balancedType" column sm={0}>
                                    Balanced Type
                                </Form.Label>
                                <Col sm={7} style={{ marginRight: '4.8rem', marginTop: '5px' }}>
                                    <input
                                        id="creditedType"
                                        type="radio"
                                        checked={credited}
                                        onChange={() => onCreditedTypeChange('Credited')}
                                    />{' '}
                                    <span style={{ marginRight: '2rem' }}>Regular</span>
                                    <input
                                        id="lopType"
                                        type="radio"
                                        value="MANUAL"
                                        checked={lop}
                                        onChange={() => onCreditedTypeChange(' ')}
                                    />{' '}
                                    <span style={{ marginRight: '2rem' }}>LOP</span>
                                    <input
                                        id="carryForwardType"
                                        type="radio"
                                        checked={carryForward}
                                        onChange={() => onCreditedTypeChange('carryForward')}
                                    />{' '}
                                    <span style={{ marginRight: '2rem' }}>Carry Forward</span>
                                </Col>
                            </Form.Group>
                        </div>
                        <Row style={{ paddingRight: '0px' }}>
                            <div className="col-6">
                                <Form.Group className="" as={Row} controlId="leaveTypeSelect">
                                    <Form.Label id="leaveTypeSelect" column sm={6}>
                                        Leave Type <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={6}>
                                        <Select
                                            id="leaveTypeSelect"
                                            value={
                                                leaveType != null || leaveType != undefined
                                                    ? leaveOptions.find(
                                                        (option) => option.value === leaveType
                                                    )
                                                    : null
                                            }
                                            onBlur={() =>
                                                !leaveType
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        leavetypeId: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        leavetypeId: ''
                                                    })
                                            }
                                            onChange={handleLeaveTypeSelection}
                                            options={leaveOptions}
                                        // isClearable={true}
                                        />
                                        <p className="error">{formErrors.leavetypeId}</p>
                                    </Col>
                                </Form.Group>
                            </div>
                            <div className="col-6">
                                <Form.Group as={Row} className="" controlId="limit">
                                    <Form.Label
                                        id="limit"
                                        style={{ paddingLeft: '40px' }}
                                        column
                                        sm={6}
                                    >
                                        Limit
                                    </Form.Label>
                                    <Col id="limit" sm={6}>
                                        {pop && pop.maxlimit}
                                    </Col>
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group as={Row} className="mb-3" controlId="noOfLeaves">
                                    <Form.Label id="noOfLeaves" column sm={6}>
                                        No Of Leaves
                                    </Form.Label>
                                    <Col id="noOfLeaves" style={{ marginTop: '1%' }} sm={6}>
                                        {pop && pop.numberOfDays}
                                    </Col>
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group as={Row} className="mb-3" controlId="carryForward">
                                    <Form.Label
                                        id="carryForward"
                                        style={{ paddingLeft: '40px' }}
                                        column
                                        sm={6}
                                    >
                                        Carry Forward
                                    </Form.Label>
                                    <Col id="carryForward" sm={6} style={{ marginTop: '1%' }}>
                                        {pop && pop.carryforward === true
                                            ? 'Yes'
                                            : pop && pop.carryforward === false
                                                ? 'No'
                                                : ''}
                                    </Col>
                                </Form.Group>
                            </div>

                            <div className="col-6">
                                <Form.Group as={Row} className="" controlId="maximumCarryForward">
                                    <Form.Label id="maximumCarryForward" column sm={6}>
                                        Maximum Carry Forward
                                    </Form.Label>
                                    <Col
                                        id="maximumCarryForward"
                                        style={{ marginTop: '1%' }}
                                        sm={4}
                                    >
                                        {pop && pop.maxcarryforward}
                                    </Col>
                                </Form.Group>
                            </div>
                            <div className="col-6">
                                <Form.Group as={Row} className="" controlId="accumulated">
                                    <Form.Label
                                        id="accumulated"
                                        style={{ paddingLeft: '40px' }}
                                        column
                                        sm={6}
                                    >
                                        No. Of Days <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={6} style={{ marginTop: '1%', paddingRight: '0px' }}>
                                        <Form.Control
                                            id="accumulated"
                                            size="sm"
                                            onChange={handleInputChange}
                                            type="number"
                                            min="1"
                                            maxLength={3}
                                            name="accumulated"
                                            onBlur={(e) =>
                                                !e.target.value
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        accumulated: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        accumulated: ''
                                                    })
                                            }
                                        />
                                        <p className="error">{formErrors.accumulated}</p>
                                    </Col>
                                </Form.Group>
                            </div>

                            {/* Conditional rendering beside Credited */}
                            <div className="col-6">
                                {credited ? (
                                    <>
                                        {frequency === 'Monthly' && (
                                            <Form.Group as={Row} className="mb-3" controlId="month">
                                                <Form.Label id="month" column sm={6}>
                                                    Month <span className="error">*</span>
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Select
                                                        id="month"
                                                        options={monthsOptions}
                                                        onChange={handleMonthSelect}
                                                        onBlur={() =>
                                                            !months
                                                                ? setFormErrors({
                                                                    ...formErrors,
                                                                    month: 'Required'
                                                                })
                                                                : setFormErrors({
                                                                    ...formErrors,
                                                                    month: ''
                                                                })
                                                        }
                                                    />
                                                    <p className="error">{formErrors.month}</p>
                                                </Col>
                                            </Form.Group>
                                        )}

                                        {frequency === 'Quarterly' && (
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="quarter"
                                            >
                                                <Form.Label id="quarter" column sm={6}>
                                                    Quarter<span className="error">*</span>
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Select
                                                        id="quarter"
                                                        options={quarterlyOptions}
                                                        onChange={(selection) =>
                                                            setQuarter(selection.value)
                                                        }
                                                        onBlur={() =>
                                                            !quarter
                                                                ? setFormErrors({
                                                                    ...formErrors,
                                                                    quarter: 'Required'
                                                                })
                                                                : setFormErrors({
                                                                    ...formErrors,
                                                                    quarter: ''
                                                                })
                                                        }
                                                    />
                                                    <p className="error">{formErrors.quarter}</p>
                                                </Col>
                                            </Form.Group>
                                        )}

                                        {frequency === 'Yearly' && (
                                            <Form.Group as={Row} className="mb-3" controlId="year">
                                                <Form.Label id="year" column sm={6}>
                                                    Year<span className="error">*</span>
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Form.Control
                                                        id="year"
                                                        defaultValue={year}
                                                        onChange={handleInputChange}
                                                        type="text"
                                                        name="yearValue"
                                                        className="form-control"
                                                        maxLength={4}
                                                    />
                                                    <p className="error">{formErrors.year}</p>
                                                </Col>
                                            </Form.Group>
                                        )}

                                        {frequency === 'Life time' && <></>}
                                    </>
                                ) : (
                                    <Form.Group as={Row} className="mb-3" controlId="month">
                                        <Form.Label id="month" column sm={6}>
                                            Month<span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="month"
                                                options={monthsOptions}
                                                onChange={handleMonthSelect}
                                                onBlur={() =>
                                                    !months
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            month: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            month: ''
                                                        })
                                                }
                                            />
                                            <p className="error">{formErrors.month}</p>
                                        </Col>
                                    </Form.Group>
                                )}
                            </div>
                        </Row>
                    </div>
                </Modal.Body>

                <div className="btnCenter mb-3">
                    <Button
                        id="saveLeaveBalance"
                        className="Button"
                        variant="addbtn"
                        onClick={saveLeaveBalance}
                    >
                        Save
                    </Button>
                </div>
            </Modal>

            {/* Modal component to display the leave balance details */}
            <Modal className="" size="lg" show={popup} onHide={onCloseHandler}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>View Employee Leave Balance</Modal.Title>
                </Modal.Header>
                <ModalBody>
                    <ExpandedTable
                        columns={COLUMNS}
                        serialNumber={true}
                        data={data}
                        expandedRow={expandedRow}
                        renderLeaveTypeHistory={renderLeaveTypeHistory}
                    />
                    <br />
                    <div className="btnCenter mb-3">
                        <Button
                            id="closeLeaveBalance"
                            className="Button"
                            variant="secondary"
                            onClick={onCloseHandler}
                        >
                            Close
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}
export default EmployeeLeaveBalance
