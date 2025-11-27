import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { AddIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    getAllById,
    getAllByOrgId,
    getById,
    save,
    update
} from '../../../Common/Services/CommonService'
import {
    getAllByLocation,
    getAllEmployeesById,
    getAllListCompByLocation
} from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'
import { updateValidation } from '../../../Common/CommonComponents/FormControlValidation'
import { toast } from 'react-toastify'

const LoanTracking = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Accessing user details from the Redux store
    // Defining various states for visibility, loading, data, and installment DTOs
    const [visible, setVisible] = useState('')
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [instalmentDtos, setInstalmentDtos] = useState({})
    // useEffect hook runs when the component mounts
    useEffect(() => {
        getAllLocationById()
        getAllRecordByOrgId()
    }, [])
    // Function to format numbers into a human-readable format (e.g., with commas)
    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat().format(number)
    }
    const [locations, setLocations] = useState([]) // State to store locations data (initially an empty array)
    const [locationId, setLocationId] = useState() // State to store the selected location ID
    // Function to fetch all locations by organization ID
    const getAllLocationById = () => {
        setLoading(true) // Setting loading state to true before making the API call
        // Calling the API service to fetch locations data
        getAllById({ entity: 'locations', organizationId: userDetails.organizationId })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLocations(res.data)
                        setLoading(false)
                    }
                },
                (err) => {
                    setLoading(false)
                    console.log(err)
                }
            )
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }
    // Mapping over the locations to create options for a select input (dropdown)
    const locationOptions = locations.map((option) => ({
        value: option.id,
        label: option.name
    }))
    // Function to handle the location selection from the dropdown
    const handleLocationSelect = (select) => {
        getEmployeesById(select.value)
        setLocationId(select.value)
    }
    // Creating options for a search filter dropdown (similar to locationOptions)
    const locationOptionsForSearch = locations.map((option) => ({
        value: option.id,
        label: option.name
    }))

    const [locatFor, setLocationFor] = useState() // State to store the selected location for search functionality
    // Function to handle location selection for search filter
    const handleLocationSelectForSearch = (select) => {
        getEmployeesById(select.value)
        setLocationFor(select.value)
        getAllLIstBYLocation(select.value)
    }

    const [employees, setEmployees] = useState([]) // State to store the list of employees
    const [employeesForSearch, setEmployeesforSearch] = useState([]) // State to store the list of employeesSearch
    const [employeeId, setEmployeeId] = useState() // State to store the selected employee ID
    // Function to fetch employees based on the selected location ID
    const getEmployeesById = (id) => {
        setLoading(true)
        // API call to fetch employees for the selected location ID
        getAllEmployeesById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            locationId: id
        })
            .then(
                (res) => {
                    console.log(res.data, 'checkingzEployeeResponse')
                    if (res.statusCode == 200) {
                        setLoading(false)
                        setEmployees(res.data ? res.data : [])
                        setEmployeesforSearch(res.data ? res.data : [])
                    }
                },
                (error) => {
                    setLoading(false)
                    console.log(error)
                }
            )
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }
    // Function to fetch the list of data (e.g., loans) for the selected location ID
    const getAllLIstBYLocation = (id) => {
        setLoading(true)
        // API call to fetch the list (loans or other data) for the selected location
        getAllByLocation({
            entity: 'loans',
            organizationId: userDetails.organizationId,
            locationId: id
        })
            .then(
                (res) => {
                    setLoading(false)
                    if (res.statusCode == 200) {
                        setData(res.data ? res.data : [])
                    }
                },
                (error) => {
                    setLoading(false)
                    console.log(error)
                }
            )
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }
    // Mapping employees to create options for a dropdown or select input
    const employeeOptions = employees.map((option) => ({
        value: option.id,
        label: option.name,
        dateOfJoining: option.dateOfJoining
    }))

    const [joiningDate, setJoiningDate] = useState('') // State to store the joining date of the selected employee
    // Function to handle employee selection from a dropdown
    const handleEmployeeSelect = (select) => {
        setEmployeeId(select.value)
        setJoiningDate(select.dateOfJoining)
    }
    // Similar to employeeOptions, this is used for a different search functionality or filtering
    const employeeOptionsForSerach = employeesForSearch.map((option) => ({
        value: option.id,
        label: option.name
    }))
    // Function to handle employee selection for search filter
    const handleEmployeeSelectForSearch = (select) => {
        getAllRecordsByLocation(select.value)
    }
    // Function to fetch all records for a specific organization (loans)
    const getAllRecordByOrgId = () => {
        setLoading(true)
        // API call to get all records (loans) by organization ID
        getAllByOrgId({ entity: 'loans', organizationId: userDetails.organizationId })
            .then(
                (response) => {
                    if (response.statusCode == 200) {
                        setLoading(false)
                        setData(response.data ? response.data : [])
                    }
                },
                (err) => {
                    console.log(err)
                    setLoading(false)
                }
            )
            .catch((error) => {
                console.log(error)
                setLoading(false)
            })
    }
    // Function to fetch records for loans based on employee and location ID
    const getAllRecordsByLocation = (empId) => {
        setLoading(true)
        // API call to get all records (loans) by location and employee ID
        getAllListCompByLocation({
            entity: 'loans',
            organizationId: userDetails.organizationId,
            locationId: locatFor,
            employeeId: empId
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        setData(res.data)
                    }
                },
                (err) => {
                    setLoading(false)
                    console.log(err)
                }
            )
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }

    const [formErrors, setFormErrors] = useState({}) // State to store form errors for validation
    // Validation function to check the form input values
    const validate = (values) => {
        const errors = {}
        if (!values.amount) {
            errors.amount = 'Required'
        }
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.installments) {
            errors.installments = 'Required'
        }
        if (values.issuedDate == undefined) {
            errors.issuedDate = 'Required'
        }
        if (values.locationId == undefined) {
            errors.locationId = 'Required'
        }
        if (values.employeeId == undefined) {
            errors.employeeId = 'Required'
        }

        return errors
    }

    const [formData, setFormData] = useState({}) // State to manage form data, initially set as an empty object
    // Function to handle the action when a "create" or "update" action is triggered
    const onShowHandler = (action, row) => {
        if (action == 'create') {
            setShow(true)
            setVisible('create')
        } else {
            setShow(true)
            setVisible('update')
            getLoanTrackinghistoryById(row.id)
        }
    }
    const [issuedDate, setIssuedDate] = useState() // State to manage the issued date
    // Function to handle the change in the "from date" field (issued date)
    const handleFromDate = (selectDate) => {
        setIssuedDate(moment(selectDate).format('YYYY-MM-DD'))
    }
    // Function to handle closing the form, resetting form data and other states
    const onCloseHandler = () => {
        setShow(false)
        setFormData({})
        setIssuedDate(null)
        setFormErrors({})
        setLocationId()
        setEmployeeId()
        setInstalmentDtos({})
        setEmployees([])
    }
    // columns for main table
    const COLUMNS = [
        {
            Header: 'Issued Date',
            accessor: 'issuedDate'
        },
        {
            Header: () => <div className="numericColHeading">Amount</div>,
            accessor: 'amount',
            Cell: ({ row }) => (
                <div className="numericData">{formatNumber(row.original.amount)}</div>
            )
        },
        {
            Header: () => <div className="numericColHeading">No Of Installments</div>,
            accessor: 'installments',
            Cell: ({ row }) => <div className="numericData">{row.original.installments}</div>
        },
        {
            Header: 'Employee',
            accessor: 'employeeName'
        },

        {
            Header: 'Location',
            accessor: 'locationName'
        },
        {
            Header: () => <div className="numericColHeading">Pending Installments </div>,
            accessor: 'pendingInstallments',
            Cell: ({ row }) => <div className="numericData">{row.original.pendingInstallments}</div>
        },
        {
            Header: () => <div className="numericColHeading"> Pending Amount </div>,
            accessor: 'pendingAmount',
            Cell: ({ row }) => (
                <div className="numericData">{formatNumber(row.original.pendingAmount)}</div>
            )
        },

        {
            Header: 'Status',
            accessor: 'status'
        },

        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center ">
                        <Button
                            id="editButtonSalaryAdvance"
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        {/* |
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => onDeleteHandler(row.original, row.index)}
                        >
                            <DeleteIcon />
                        </Button> */}
                    </div>
                </>
            )
        }
    ]

    // columns for instalment table
    const instalMentColumns = [
        {
            Header: () => <div className="numericColHeading">Paid Amount</div>,
            accessor: 'paidAmount',
            Cell: ({ row }) => (
                <div className="numericData">{formatNumber(row.original.paidAmount)}</div>
            )
        },
        {
            Header: () => <div className="numericColHeading">Remaining Amount</div>,
            accessor: 'pendingAmount',
            Cell: ({ row }) => (
                <div className="numericData">{formatNumber(row.original.pendingAmount)}</div>
            )
        },
        {
            Header: () => <div className="numericColHeading">Paid Instalments</div>,
            accessor: 'paidInstallments',
            Cell: ({ row }) => <div className="numericData">{row.original.paidInstallments}</div>
        },
        {
            Header: () => <div className="numericColHeading">Remaining Instalments</div>,
            accessor: 'pendingInstallments',
            Cell: ({ row }) => <div className="numericData">{row.original.pendingInstallments}</div>
        }
    ]
    const [validateData, setValidateData] = useState({})
    const getLoanTrackinghistoryById = (id) => {
        setLoading(true)
        getById({ entity: 'loans', organizationId: userDetails.organizationId, id: id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setFormData(res.data)
                    setValidateData(res.data)
                    setInstalmentDtos(res.data ? res.data : [])
                    setIssuedDate(res.data.issuedDate)
                    setLocationId(res.data.locationId)
                    setEmployeeId(res.data.employeeId)
                    getEmployeesById(res.data.locationId)
                    // setRepaymentDto(res.data.map((e)=>e.repaymentDTOs))
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }
    // handleInputChange is responsible for updating form data and managing form validation errors
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }
    // onSaveHandler is responsible for handling the save action of the form
    const onSaveHandler = () => {
        // Create an object to hold the form data to be saved
        const obj = {
            organizationId: userDetails.organizationId,
            issuedDate: issuedDate,
            locationId: locationId,
            // name: formData.name,
            amount: formData.amount,
            employeeId: employeeId,
            installments: formData.installments,
            repaymentDTOs: []
        }
        // Validation checks for required fields
        if (obj.issuedDate == undefined || '') {
            setFormErrors(validate(obj))
        } else if (obj.locationId == undefined || obj.locationId == null) {
            setFormErrors(validate(obj))
        } else if (obj.employeeId == undefined || obj.employeeId == null) {
            setFormErrors(validate(obj))
        } else if (obj.amount == undefined || obj.amount == '') {
            setFormErrors(validate(obj))
        } else if (formData.amount <= 0) {
            setFormErrors({ ...formErrors, amount: 'Enter valid amount' })
        } else if (obj.installments == undefined || obj.installments == '') {
            setFormErrors(validate(obj))
        } else if (formData.installments <= 0) {
            setFormErrors({ ...formErrors, installments: 'Enter valid installments' })
        } else {
            // If validation passes, proceed to save the data
            setLoading(true)
            save({
                entity: 'loans',
                organizationId: userDetails.organizationId,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Salary Advance',
                    operationType: 'save'
                }),
                screenName: 'Salary Advance',
                body: obj
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        onCloseHandler()
                        getAllRecordByOrgId()
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                    console.log(err, 'error')
                })
        }
    }
    // onUpdateHandler is responsible for handling the update action of the form
    const onUpdateHandler = () => {
        // Create an object with the updated form data
        const obj = {
            organizationId: userDetails.organizationId,
            id: formData.id,
            // name: formData.name,
            issuedDate: issuedDate,
            amount: formData.amount,
            employeeId: employeeId,
            status: formData.status,
            locationId: locationId,
            installments: formData.installments
        }
        const validateObj = {
            organizationId: validateData.organizationId,
            id: validateData.id,
            issuedDate: validateData.issuedDate,
            amount: validateData.amount,
            employeeId: validateData.employeeId,
            status: validateData.status,
            locationId: validateData.locationId,
            installments: validateData.installments
        }
        if (updateValidation(validateObj, obj)) {
            toast.info('No changes made to update.')
        }
        // Validation checks for required fields before updating
        else if (formData.amount == '') {
            setFormErrors(validate(obj))
        } else if (formData.amount <= 0) {
            setFormErrors({ ...formErrors, amount: 'Enter valid amount' })
        } else if (formData.installments == '') {
            setFormErrors(validate(obj))
        } else if (formData.installments <= 0) {
            setFormErrors({ ...formErrors, installments: 'Enter valid installments' })
        } else {
            // If validation passes, proceed to update the record
            setLoading(true)
            update({
                entity: 'loans',
                organizationId: userDetails.organizationId,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Salary Advance',
                    operationType: 'update'
                }),
                screenName: 'Salary Advance',
                id: formData.id,
                body: obj
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        setLoading(false)
                        onCloseHandler()
                        getAllRecordByOrgId()
                    }
                })
                .catch((err) => {
                    ToastError(err.message)
                    setLoading(false)
                    console.log(err, 'error')
                })
        }
    }
    // handleKeyPress is used to restrict input to numbers and decimal points only
    const handleKeyPress = (event) => {
        const key = event.key // Modern, reliable way to get the pressed key

        // Allow only digits and a single period
        const isDigit = key >= '0' && key <= '9'
        const isDot = key === '.'

        if (!isDigit && !isDot) {
            event.preventDefault()
        }
    }

    return (
        <div>
            <section className="section">
                {/* Conditionally render a loader while data is being fetched */}
                {loading ? <DetailLoader /> : ''}
                {/* Container to hold the entire content */}
                <div className="container-fluid">
                    {/* Row that holds the Location and Employee search forms */}
                    <div className="row">
                        <PageHeader pageTitle="Salary Advances" />
                        <div className="col-md-12" style={{ marginTop: '3%' }}>
                            <div className="row">
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="salaryAdvanceLocation"
                                    >
                                        <Form.Label id="salaryAdvanceLocation" column sm={4}>
                                            Location
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="locationSelectForSearch"
                                                options={locationOptionsForSearch}
                                                onChange={handleLocationSelectForSearch}
                                                // value={locationOptions.filter(
                                                //     (e) => e.value == locationId
                                                // )}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="salaryAdvanceEmployee"
                                    >
                                        <Form.Label id="salaryAdvanceEmployee" column sm={5}>
                                            Employee
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="employeeSelectForSearch"
                                                options={employeeOptionsForSerach}
                                                onChange={handleEmployeeSelectForSearch}
                                                // value={employeeOptions.filter(
                                                //     (e) => e.value == employeeId
                                                // )}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>
                            </div>
                            {/* Button to trigger the "create" action for adding a new record */}
                            <Button
                                id="addButtonSalaryAdvance"
                                className="addButton"
                                variant="addbtn"
                                onClick={() => onShowHandler('create')}
                            >
                                <AddIcon />
                            </Button>
                            {/* Table component that displays the data */}
                            <Table
                                columns={COLUMNS}
                                data={data}
                                serialNumber={true}
                                name={'Salary Advance records'}
                            />
                        </div>
                    </div>
                </div>
            </section>
            {/* modal for input fields of salary advance */}
            <Modal show={show} onHide={onCloseHandler} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Salary Advance Tracking</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Form inside the modal to create or update a salary advance record */}
                    <div className="row">
                        <form className="modalFormBody">
                            <Row>
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="slaryAdvanceLocationId"
                                    >
                                        <Form.Label id="slaryAdvanceLocationId" column sm={4}>
                                            Location <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="locationSelect"
                                                options={locationOptions}
                                                isDisabled={visible == 'update'}
                                                onChange={handleLocationSelect}
                                                value={locationOptions.filter(
                                                    (e) => e.value == locationId
                                                )}
                                                onBlur={() =>
                                                    !locationId
                                                        ? setFormErrors({
                                                              ...formErrors,
                                                              locationId: 'Required'
                                                          })
                                                        : setFormErrors({
                                                              ...formErrors,
                                                              locationId: ''
                                                          })
                                                }
                                            />
                                            <p className="error">{formErrors.locationId}</p>
                                        </Col>
                                    </Form.Group>
                                </div>
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="slaryAdvanceEmployeeId"
                                    >
                                        <Form.Label id="slaryAdvanceEmployeeId" column sm={5}>
                                            Employee <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="employeeSelect"
                                                options={employeeOptions}
                                                onChange={handleEmployeeSelect}
                                                isDisabled={visible == 'update'}
                                                value={employeeOptions.filter(
                                                    (e) => e.value == employeeId
                                                )}
                                                onBlur={() =>
                                                    !employeeId
                                                        ? setFormErrors({
                                                              ...formErrors,
                                                              employeeId: 'Required'
                                                          })
                                                        : setFormErrors({
                                                              ...formErrors,
                                                              employeeId: ''
                                                          })
                                                }
                                            />
                                            <p className="error">{formErrors.employeeId}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="amount">
                                        <Form.Label id="amount" column sm={4}>
                                            Amount <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="amountInput"
                                                type="number"
                                                size="sm"
                                                name="amount"
                                                maxLength={10}
                                                onChange={handleInputChange}
                                                onBlur={handleInputChange}
                                                onKeyPress={handleKeyPress}
                                                defaultValue={formData.amount}
                                            />
                                            <p className="error">{formErrors.amount}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="noOfInstalments"
                                    >
                                        <Form.Label id="noOfInstalments" column sm={5}>
                                            No Of Instalments <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="noOfInstalmentsInput"
                                                maxLength={3}
                                                size="sm"
                                                type="number"
                                                name="installments"
                                                onChange={handleInputChange}
                                                onBlur={handleInputChange}
                                                onKeyPress={handleKeyPress}
                                                defaultValue={formData.installments}
                                            />
                                            <p className="error">{formErrors.installments}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="issuedDate">
                                        <Form.Label id="issuedDate" column sm={4}>
                                            Issued Date <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <DatePicker
                                                id="issuedDatePicker"
                                                format={'DD-MM-YYYY'}
                                                inputReadOnly={true}
                                                placeholder="Select Date"
                                                onChange={handleFromDate}
                                                value={
                                                    issuedDate == null ? null : moment(issuedDate)
                                                }
                                                allowClear={false}
                                                required
                                                disabledDate={(current) => {
                                                    const tomorrow = new Date(joiningDate)
                                                    tomorrow.setDate(tomorrow.getDate())

                                                    let customDate =
                                                        moment(tomorrow).format('YYYY-MM-DD')
                                                    return (
                                                        current &&
                                                        current < moment(customDate, 'YYYY-MM-DD')
                                                    )
                                                }}
                                                size="sm"
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                              ...formErrors,
                                                              issuedDate: 'Required'
                                                          })
                                                        : setFormErrors({
                                                              ...formErrors,
                                                              issuedDate: ''
                                                          })
                                                }
                                            />
                                            <p className="error">{formErrors.issuedDate}</p>
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                            {visible == 'create' ? (
                                ''
                            ) : (
                                <>
                                    <label>Instalments Table</label>
                                    <div style={{ marginTop: '-1%' }}>
                                        <Table
                                            data={[instalmentDtos]}
                                            columns={instalMentColumns}
                                            serialNumber={true}
                                        />
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </Modal.Body>
                <div className="btnCenter mb-3">
                    {visible == 'create' && (
                        <Button
                            id="saveSalaryAdvance"
                            variant="addbtn"
                            className="Button"
                            onClick={onSaveHandler}
                        >
                            Add
                        </Button>
                    )}
                    {visible == 'update' && (
                        <Button
                            variant="addbtn"
                            id="updateSalaryAdvance"
                            className="Button"
                            onClick={onUpdateHandler}
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        id="closeSalaryAdvance"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        Close
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export default LoanTracking
