import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import TableHeader from '../../../Common/CommonComponents/TableHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { getAllById, save } from '../../../Common/Services/CommonService'
import {
    getAllEmployeesById,
    getAllListCompByLocation,
    getTemplteListctc
} from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import Annexure from '../../PayRoll/Reports/Annexure'

const CompensationHistory = ({ booleanValue, id, locId, doj, onCompensationCloseHandler }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Accessing user details from the Redux store

    const [loading, setLoading] = useState(false) // State to manage loading status (true while loading, false otherwise)
    const [data, setData] = useState([]) // State to hold some data (initially an empty array)
    const [templates, setTemplates] = useState([]) // State to store templates
    const [locations, setLocations] = useState([]) // State to store locations
    const [locationId, setLocationId] = useState(locId) // State to store locationId
    const [employeeId, setEmployeeId] = useState(id) // State to store employeId
    // useEffect hook to perform side effects when the component is mounted
    useEffect(() => {
        getAllLocationById() // Calling the function to fetch all locations based on an ID
        if (
            locId !== undefined &&
            locId != null &&
            employeeId !== undefined &&
            employeeId != null
        ) {
            getAllRecordsByLocation()
            getEmployeesById() // Calling the function to fetch employees based on an ID
        }
    }, []) // Empty dependency array means this effect runs only once when the component mounts

    // Function to fetch all locations by organization ID
    const getAllLocationById = () => {
        getAllById({ entity: 'locations', organizationId: userDetails.organizationId })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLocations(res.data)
                        setLoading(false)
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

    // Mapping the locations data to create an array of option objects with value and label
    const locationOptions = locations.map((option) => ({
        value: option.id,
        label: option.name
    }))

    // Handler function to manage location selection
    const handleLocationSelect = (select) => {
        setLocationId(select.value)
        getEmployeesById(select.value)
        // getAllRecordsByLocation(select.value)
    }

    // State to store the list of employees
    const [employees, setEmployees] = useState([])
    // Function to fetch employees by location ID
    const getEmployeesById = (val) => {
        setLoading(true)
        getAllEmployeesById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            locationId: val ? val : locationId
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        setEmployees(res.data ? res.data : [])
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
    // Mapping the employees data to create an array of option objects with value, label, and date of joining (doj)
    const employeeOptions = employees.map((option) => ({
        value: option.id,
        label: option.name,
        doj: option.dateOfJoining
    }))

    const [employeeDoj, setEmployeeDoj] = useState(doj ? doj : null) // State to hold the selected employee's date of joining
    // Handler function for when an employee is selected
    const handleEmployeeSelect = (select) => {
        setEmployeeDoj(select.doj)
        setEmployeeId(select.value)
        getAllRecordsByLocation(select.value)
    }

    // Function to fetch all compensation records by location and employee ID
    const getAllRecordsByLocation = (empId) => {
        setLoading(true)
        getAllListCompByLocation({
            entity: 'compensation',
            organizationId: userDetails.organizationId,
            locationId: locationId,
            employeeId: empId ? empId : employeeId
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        setData(res.data)
                        console.log(data, "chekingData")
                    }
                },
            )
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }

    const [formErrors, setFormErrors] = useState({}) // State to store form errors (initially an empty object)
    // Function to validate the form values
    const validate = (values) => {
        const errors = {}
        if (!values.ctc) {
            errors.ctc = 'Required'
        }
        if (values.templateId == undefined) {
            errors.templateId = 'Required'
        }
        if (values.fromDate == undefined) {
            errors.fromDate = 'Required'
        }

        if (values.locationId == undefined) {
            errors.locationId = 'Required'
        }
        if (values.employeeId == undefined) {
            errors.employeeId = 'Required'
        }
        if (values.currencyId == undefined || null) {
            errors.currencyId = 'Required'
        }

        return errors
    }

    const [formData, setFormData] = useState({}) // State to store form data

    const [fromDate, setFromDate] = useState() // State to store the fromDate value
    // Function to handle the selection of a date for the "fromDate" field
    const handleFromDate = (selectDate) => {
        setFromDate(moment(selectDate).format('YYYY-MM-DD'))
    }
    const lastRecorddate = data.length == 0 ? "" : data[data.length - 1].fromDate
    console.log(lastRecorddate, "chekingLastRecordDate")
    // Function to handle changes in form input fields
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setTemplateId(null)
        setFormData({ ...formData, [name]: value })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    // Function to fetch the template list based on the provided value (ctc)
    const getAllTemplteList = (value) => {
        // Calling the API to get the template list based on organization ID, location ID, and ctc value
        if (value > 0) {
            getTemplteListctc({
                organizationId: userDetails.organizationId,
                locationId: locationId,
                ctc: value
            })
                .then(
                    (res) => {
                        if (res.statusCode == 200) {
                            setLoading(false)
                            setTemplates(res.data ? res.data : [])
                        }
                    },
                    (error) => {
                        console.log(error)
                        setLoading(false)
                    }
                )
                .catch((err) => {
                    console.log(err)
                    setLoading(false)
                })
        }
    }
    // Mapping the templates data to create an array of option objects with value and label
    const templateOptions = templates.map((options) => ({
        value: options.id,
        label: options.name
    }))

    // State to store the selected template ID (initially null)
    const [templateId, setTemplateId] = useState(null)
    // Handler function for when a template is selected
    const handleTemplateSelect = (select) => {
        setTemplateId(select.value)
    }
    const navigate = useNavigate() // Hook to navigate programmatically
    // Function to handle closing the current view and navigating to the home page ("/")
    const onCloseHandler = () => {
        navigate('/')
    }
    const [annexureRead, setAnnexureRead] = useState(false) // State to track whether the annexure has been read (initially set to false)
    const [ctc, setCtc] = useState() // State to store the ctc (cost to company) value (initially undefined)
    const [action, setAction] = useState('') // State to track the action being performed (initially an empty string)
    const [currency, setCurrency] = useState('') // State to store the currency (initially an empty string)
    // Function to handle showing the annexure, setting values for template ID, currency, ctc, and action

    // Function to handle showing the annexure and setting related values
    const onAnexureShowHandler = (id, value, c, mode) => {
        setTemplateId(id)
        setCurrency(c)
        setAnnexureRead(true)
        setCtc(value)
        setAction(mode)
    }

    // Function to format a number as per the Indian numbering system (e.g., 1,00,000 for one lakh)
    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat('en-IN').format(number)
    }
    // Function to handle closing the annexure and marking it as not read
    const onAnexureCloseHandler = () => {
        setAnnexureRead(false)
    }

    // Array of column definitions for a table, used to display various data fields
    const COLUMNS = [
        {
            Header: 'From Date',
            accessor: 'fromDate'
        },
        {
            Header: 'CTC',
            accessor: 'ctc',
            Cell: ({ row }) => (
                <span
                    onClick={() =>
                        onAnexureShowHandler(
                            row.original.templateId,
                            row.original.ctc,
                            row.original.currencyCode,
                            'readOnly'
                        )
                    }
                >
                    <a className="">
                        <u>{formatNumber(row.original.ctc)}</u>
                    </a>
                </span>
            )
        },
        {
            Header: 'Currency',
            accessor: 'currencyCode',
            Cell: ({ row }) => <span>{row.original.currencyCode}</span>
        },
        {
            Header: 'Template',
            accessor: 'templateName'
        },
        {
            Header: 'Modified Date',
            accessor: 'lastModifiedDate'
        }
        // {
        //     Header: "% Hike",
        //     accessor: "hikePercentage",
        //     Cell: ({ row }) => (
        //         <div className='text-center' style={{ marginLeft: "-20%" }}>{row.original.hikePercentage}</div>
        //     )
        // },
        // {
        //     Header: () => <div className="text-wrap text-right actions">Actions</div>,
        //     accessor: "actions",
        //     disableSortBy: true,
        //     Cell: ({ row }) => (
        //         <>
        //             <div className="text-wrap text-right actionsWidth">
        //                 <Button
        //                     type="button"
        //                     variant=""
        //                     className="iconWidth"
        //                     onClick={() => onShowHandler(row.original, row.index)}
        //                 >
        //                     <EditIcon />
        //                 </Button>
        //                 |
        //                 <Button
        //                     variant=""
        //                     className="iconWidth"
        //                     onClick={() => onDeleteHandler(row.original, row.index)}
        //                 >
        //                     <DeleteIcon />
        //                 </Button>
        //             </div>
        //         </>
        //     ),
        // },
    ]

    // useEffect hook to perform side effects when the component is mounted
    useEffect(() => {
        onGetCurrencyHandler()
    }, [])

    const [curriencies, setCurriencies] = useState([]) // State to store the list of currencies (initially an empty array)

    // Function to fetch the list of currencies from the API
    const onGetCurrencyHandler = () => {
        setLoading(true)
        // Calling the API to get the currencies based on the organization ID
        getAllById({
            entity: 'currencies',
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setCurriencies(res.data)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    // Mapping the currencies data to create an array of option objects with value (currency ID) and label (currency code)
    const currenciesOptions = curriencies
        ? curriencies.map((option) => ({
            value: option.id,
            label: option.currencyCode
        }))
        : []

    const [currencyId, setCurrencyId] = useState() // State to store the selected currency ID (initially undefined)
    // Function to handle currency selection from the options list
    const handleCurrencySelection = (option) => {
        setCurrencyId(option.value)
    }

    // Function to handle saving the compensation data
    const onSaveHandler = () => {
        const obj = {
            organizationId: userDetails.organizationId,
            fromDate: fromDate,
            locationId: locationId,
            templateId: templateId,
            ctc: formData.ctc,
            currencyId: currencyId,
            employeeId: employeeId,
            hikePercentage: formData.hikePercentage
        }
        if (obj.fromDate == undefined || '') {
            setFormErrors(validate(obj))
        } else if (obj.templateId == undefined || null) {
            setFormErrors(validate(obj))
        } else if (obj.locationId == undefined || null) {
            setFormErrors(validate(obj))
        } else if (obj.employeeId == undefined || null) {
            setFormErrors(validate(obj))
        } else if (obj.ctc == undefined || '') {
            setFormErrors(validate(obj))
        } else if (obj.currencyId == undefined || null) {
            setFormErrors(validate(obj))
        } else {
            setLoading(true)
            // Call the save function to send the data to the backend
            save({
                entity: 'compensation',
                organizationId: userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Compensation',
                    operationType: 'save'
                }),
                screenName: 'Compensation'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        if (booleanValue) {
                            ToastSuccess(res.message)
                            // getAllCompHistory()
                            setLoading(false)
                            onCompensationCloseHandler()
                        } else {
                            ToastSuccess(res.message)
                            setLoading(false)
                            setLocationId(null)
                            setEmployeeId(null)
                            setTemplateId(null)
                            setFormData({})
                            setCurrencyId(null)
                            setFromDate(null)
                            // getAllCompHistory()
                            // onCloseHandler()
                        }
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                    console.log(err, 'error')
                })
        }
    }

    // Function to handle keypress events and restrict input to numbers and dots (for decimal values)
    const handleKeyPress = (event) => {
        const key = String.fromCharCode(event.charCode)
        const isDigit = key >= '0' && key <= '9'
        const isDot = key === '.'

        if (!isDigit && !isDot) {
            event.preventDefault()
        }
        if (event.target.value.length >= 10 && isDigit) {
            event.preventDefault()
        }
    }

    return (
        <div>
            <section className={booleanValue ? 'section' : ' section detailBackground'}>
                {/* loader component */}
                {loading ? <DetailLoader /> : ''}
                <div className="container-fluid">
                    {/* page header */}
                    <div className="row">
                        {booleanValue ? '' : <PageHeader pageTitle="Compensation History" />}

                        <div
                            className="col-md-12"
                            style={{ marginTop: booleanValue ? '8%' : '3%' }}
                        >
                            {/* 
    This section contains the form layout with multiple input fields (Location, Employee, CTC, Currency, Template, and Effective Date).
    Each field has a corresponding label and validation for required fields. The `Select` component is used for dropdown inputs (Location, Employee, Currency, Template), and the `DatePicker` is used for selecting an Effective Date.
    Validation is handled on blur (leaving the input field), and error messages are displayed when fields are not filled out as required. The `booleanValue` condition controls whether the fields are disabled.
*/}
                            <div className="row">
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="locationCompensation"
                                    >
                                        <Form.Label
                                            id="locationCompensation"
                                            column
                                            sm={booleanValue ? 4 : 3}
                                        >
                                            Location <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="locationCompensation"
                                                options={locationOptions}
                                                onChange={handleLocationSelect}
                                                isDisabled={booleanValue}
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
                                        controlId="employeeCompensation"
                                    >
                                        <Form.Label
                                            id="employeeCompensation"
                                            column
                                            sm={booleanValue ? 5 : 4}
                                        >
                                            Employee <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="employeeCompensation"
                                                options={employeeOptions}
                                                onChange={handleEmployeeSelect}
                                                isDisabled={booleanValue}
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
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="ctcCompensation"
                                    >
                                        <Form.Label
                                            id="ctcCompensation"
                                            column
                                            sm={booleanValue ? 4 : 3}
                                        >
                                            CTC <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="ctcCompensation"
                                                type="number"
                                                size="sm"
                                                name="ctc"
                                                maxLength={10}
                                                min={0}
                                                value={formData.ctc || ''}
                                                onChange={handleInputChange}
                                                onPaste={(e) => e.preventDefault()}
                                                onBlur={() => getAllTemplteList(formData.ctc)}
                                                onKeyPress={handleKeyPress}
                                            // defaultValue={booleanValue == true ? lastIndexObject && lastIndexObject.ctc : ""}
                                            />
                                            <p className="error">{formErrors.ctc}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="CurrencyCompensation"
                                    >
                                        <Form.Label
                                            id="CurrencyCompensation"
                                            column
                                            sm={booleanValue ? 5 : 4}
                                        >
                                            Currency <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="CurrencyCompensation"
                                                size="sm"
                                                options={currenciesOptions}
                                                onChange={handleCurrencySelection}
                                                value={currenciesOptions.filter(
                                                    (e) => e.value == currencyId
                                                )}
                                                onBlur={() =>
                                                    !currencyId
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            currencyId: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            currencyId: ''
                                                        })
                                                }
                                            />
                                            <p className="error">{formErrors.currencyId}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="TemplateCompensation"
                                    >
                                        <Form.Label
                                            id="TemplateCompensation"
                                            column
                                            sm={booleanValue ? 4 : 3}
                                        >
                                            Template <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                id="TemplateCompensation"
                                                size="sm"
                                                options={templateOptions}
                                                onChange={handleTemplateSelect}
                                                value={templateOptions.filter(
                                                    (e) => e.value == templateId
                                                )}
                                                onBlur={() =>
                                                    !templateId
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            templateId: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            templateId: ''
                                                        })
                                                }
                                            />
                                            <p className="error">{formErrors.templateId}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="effectiveDateCompensation"
                                    >
                                        <Form.Label
                                            id="effectiveDateCompensation"
                                            column
                                            sm={booleanValue ? 5 : 4}
                                        >
                                            Effective Date <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <DatePicker
                                                id="effectiveDateCompensation"
                                                format={'DD-MM-YYYY'}
                                                inputReadOnly={true}
                                                placeholder="Select Date"
                                                onChange={handleFromDate}
                                                value={fromDate == null ? null : moment(fromDate)}
                                                allowClear={false}
                                                required
                                                size="sm"
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
                                                disabledDate={(current) => {
                                                    const tomorrow = new Date(
                                                        lastRecorddate ? lastRecorddate : employeeDoj
                                                    )
                                                    tomorrow.setDate(tomorrow.getDate())

                                                    let customDate =
                                                        moment(tomorrow).format('YYYY-MM-DD')
                                                    return (
                                                        current &&
                                                        current < moment(customDate, 'YYYY-MM-DD')
                                                    )
                                                }}
                                            />
                                            <p className="error">{formErrors.fromDate}</p>
                                        </Col>
                                    </Form.Group>
                                </div>
                            </div>
                            {/* Check if employeeId exists, if true, display the "History" table section. */}
                            {employeeId ? (
                                <>
                                    {/* TableHeader component is used to display the title "History" */}
                                    <TableHeader tableTitle={'History'} />
                                    <div style={{ marginTop: '4%' }}>
                                        {/* Table component displays the data with specified columns (COLUMNS) and adds serial number */}
                                        <Table
                                            columns={COLUMNS}
                                            data={data}
                                            serialNumber={true}
                                            name={'compensation records'}
                                        />
                                    </div>
                                </>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: booleanValue == true ? '-4%' : '' }}>
                    {/* 
        This div dynamically adjusts the margin-top based on the value of `booleanValue`.
        If `booleanValue` is true, the margin-top is set to -4%, otherwise, it's left empty.
    */}
                    <div className={booleanValue ? 'saveButtonSingleButton' : 'saveButton1'}>
                        <Button
                            id="saveCompensation"
                            variant="addbtn"
                            className="Button"
                            onClick={onSaveHandler}
                        >
                            Save
                        </Button>
                        {/* If `booleanValue` is false, show the "Cancel" button */}
                        {booleanValue ? (
                            ''
                        ) : (
                            <Button
                                id="cancelCompensation"
                                variant="secondary"
                                className="Button"
                                onClick={onCloseHandler}
                            >
                                {cancelButtonName}
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* Moadl Popup for Annexure */}
            <Modal centered show={annexureRead} onHide={onAnexureCloseHandler} size="lg">
                <Modal.Header closeButton={onAnexureCloseHandler}>
                    <Modal.Title>Annexure</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Annexure
                        templateId={templateId}
                        averageSal={ctc}
                        currencyCode={currency}
                        action={action}
                    />
                </Modal.Body>
                <div style={{ marginLeft: '43%', marginBottom: '3%' }}>
                    <Button
                        id="closeAnexure"
                        className="Button"
                        variant="secondary"
                        onClick={onAnexureCloseHandler}
                    >
                        Close
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export default CompensationHistory
