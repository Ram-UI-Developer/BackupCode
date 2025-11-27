import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DateAndMonths from '../../../Common/CommonComponents/DateAndMonths'
import {
    compareArrayOfObjects,
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import {
    getAllByOrgId,
    saveWithOrgAndLocationIds,
    update
} from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { toast } from 'react-toastify'

const LeaveType = () => {
    const entity = 'leavetypes'
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const initialValues = {
        id: '',
        name: '',
        numberOfDays: 0,
        automate: false, // ✅ Set a default value
        specialTypeEnum: 'Regular',
        frequency: 'Monthly',
        carryforward: false,
        maxcarryforward: 0,
        deleted: false,
        locationIds: [],
        organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
        dayOfMonth: null,
        eligibleYears: 0,
        martialInclude: true,
        jobRoleInclude: true,
        genderInclude: true
    }
    const [formData, setFormData] = useState(initialValues) //state for form data
    const navigate = useNavigate() //for redirect
    const location = useLocation()
    const [mode, setMode] = useState('') //state for setting it is create mode or view mode
    const [carryForward, setCarryForward] = useState() //state for handling carry forward data
    const [patternSelect, setPatternSelect] = useState('') // state for selecting pattern of leave type
    //state for selected location
    const [locationOptions, setLocationOptions] = useState([]) //state for location drop down
    const [dateLength, setDateLength] = useState() //storing the count for data length
    const [limitVisible, setLimitVisible] = useState(true) //state for setting  limit visible column
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [automateLeaveSelect, setAutomateLeaveSelect] = useState('MANUAL') //state for setting  leave type select initially setting to manual
    const [lop, setLop] = useState(false) //state for setting lop
    const [genderOptions, setGenderOptions] = useState([]) //state for storing gender  drop down options
    const [jobRolesOptions, setJobRolesOptions] = useState([]) //state for storing job role  drop down options
    const [loading, setLoading] = useState(true) //state for displaying loader
    const [maritialStatus, setMaritialStatus] = useState([]) //state for storing marital status  drop down options
    const [selectedLocation, setSelectedLocation] = useState(null) //state for selected location
    const [selectedGender, setSelectedGender] = useState(null) //state for selected gender
    const [selectedMaritialStatus, setSelectedMaritialStatus] = useState(null) //state for selected marital status
    const [selectedJobRole, setSelectedJobRole] = useState(null) //state for selected job role
    const [leaveTypeData, setLeaveTypeData] = useState([])
    const optionsLableHandler = (options, keyOfIds) => {
        const selected = location.state && location.state.data[keyOfIds]

        if (selected) {
            return options
                .filter((option) => selected.includes(option.id))
                .map((option) => ({
                    label: option.name,
                    value: option.id
                }))
        }

        return []
    }

    const jobRoleSelectHandler = (selectedOptions) => {
        if (selectedOptions) {
            const isAllSelected = selectedOptions.some((option) => option.value === 'all')

            if (isAllSelected) {
                setSelectedJobRole(
                    jobRolesOptions.map((option) => ({
                        label: option.name,
                        value: option.id
                    }))
                )
                setFormData({
                    ...formData,
                    jobRoleAll: true
                })
            } else {
                setSelectedJobRole(selectedOptions)
                setFormData({
                    ...formData,
                    jobRoleAll: false
                })
            }
            // Clear error immediately
            setFormErrors((prev) => ({ ...prev, jobroleIds: '' }))
        } else {
            setSelectedJobRole([])
        }
    }

    const LocationSelectHandler = (selectedOptions) => {
        if (selectedOptions) {
            const isAllSelected = selectedOptions.some((option) => option.value === 'all')

            if (isAllSelected) {
                // have to set the boolean for select all
                // *********************
                // *********************
                setSelectedLocation(
                    locationOptions.map((option) => ({
                        label: option.name,
                        value: option.id
                    }))
                )
            } else {
                setSelectedLocation(selectedOptions)
            }
        } else {
            setSelectedLocation([])
        }
    }
    const handleDecimalInput = (e) => {
        let value = e.target.value

        // Allow only numbers and one dot
        value = value.replace(/[^0-9.]/g, '')

        // Only one dot allowed
        const firstDot = value.indexOf('.')
        if (firstDot !== -1) {
            value =
                value.substring(0, firstDot + 1) + value.substring(firstDot + 1).replace(/\./g, '')
        }

        // Split into integer and decimal parts
        let parts = value.split('.')
        let intPart = parts[0]
        let decPart = parts[1]

        // Limit integer part to 3 digits
        intPart = (intPart && intPart.slice(0, 3)) || ''

        // Limit decimal part to 2 digits
        if (decPart !== undefined) {
            decPart = decPart.slice(0, 2)
            value = intPart + '.' + decPart
        } else {
            value = intPart
        }
        if (e.target.name === 'numberOfDays' && value) {
            setFormErrors((prev) => ({ ...prev, numberOfDays: '' }))
        }
        if (e.target.name === 'maxcarryforward' && value) {
            setFormErrors((prev) => ({ ...prev, maxcarryforward: '' }))
        }

        onInputChange({ target: { name: e.target.name, value } })
    }

    const genderSelectHandler = (selectedOptions) => {
        if (selectedOptions) {
            const isAllSelected = selectedOptions.some((option) => option.value === 'all')

            if (isAllSelected) {
                setSelectedGender(
                    genderOptions.map((option) => ({
                        label: option.name,
                        value: option.id
                    }))
                )
                setFormData({
                    ...formData,
                    genderAll: true
                })
            } else {
                setSelectedGender(selectedOptions)
                setFormData({
                    ...formData,
                    genderAll: false
                })
            }
            // Clear error immediately
            setFormErrors((prev) => ({ ...prev, genderIds: '' }))
        } else {
            setSelectedGender([])
        }
    }

    const maritialSelectHandler = (selectedOptions) => {
        if (selectedOptions) {
            const isAllSelected = selectedOptions.some((option) => option.value === 'all')

            if (isAllSelected) {
                setSelectedMaritialStatus(
                    maritialStatus.map((option) => ({
                        label: option.name,
                        value: option.id
                    }))
                )
                setFormData({
                    ...formData,
                    martialAll: true
                })
            } else {
                setSelectedMaritialStatus(selectedOptions)
                setFormData({
                    ...formData,
                    martialAll: false
                })
            }
            // Clear error immediately
            setFormErrors((prev) => ({ ...prev, martialStatusIds: '' }))
        } else {
            setSelectedMaritialStatus([])
        }
    }

    //api for getting all marital status in that organization
    const getAllMaritalHandler = () => {
        getAllByOrgId({
            entity: 'maritalstatus',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    setMaritialStatus(res.data ? res.data : [])
                    setSelectedMaritialStatus(optionsLableHandler(res.data, 'martialStatusIds'))

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

    //api for getting all genders in that organization

    const getAllGenderHandler = () => {
        getAllByOrgId({
            entity: 'gender',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    setGenderOptions(res.data ? res.data : [])
                    setSelectedGender(optionsLableHandler(res.data, 'genderIds'))

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

    //api for getting all job roles  in that organization

    const getAllJobRolesHandler = () => {
        getAllByOrgId({
            entity: 'jobrole',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    setJobRolesOptions(res.data ? res.data : [])
                    setSelectedJobRole(optionsLableHandler(res.data, 'jobroleIds'))

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

    useEffect(() => {
        if (
            formData.month == 'Apr' ||
            formData.month == 'Jun' ||
            formData.month == 'Sep' ||
            formData.month == 'Nov'
        ) {
            setDateLength(30)
        } else if (formData.month == 'Feb') {
            setDateLength(28)
        } else {
            setDateLength(31)
        }


    }, [formData])

    const carryForwardChange = (e) => {
        setCarryForward(e.target.checked)
        if (e.target.checked == true) {
            setLimitVisible(false)
            setFormData({ ...formData, carryforward: e.target.checked })
        } else {
            setLimitVisible(true)
            setFormData({
                ...formData,
                maxcarryforward: 0,
                carryforward: e.target.checked
            })
        }
    }

    const extractIds = (selectedOptions) => {
        return selectedOptions ? selectedOptions.map((option) => option.value) : []
    }

    //api handling for leave type save with validations
    const onSaveHandler = (e) => {
        e.preventDefault()

        const obj = {
            ...formData,
            martialStatusIds: extractIds(selectedMaritialStatus),
            locationIds: extractIds(selectedLocation),
            genderIds: extractIds(selectedGender),
            jobroleIds: extractIds(selectedJobRole),
            lop: lop
        }

        if (!formData.name) {
            setFormErrors(validate(obj))
        } else if (!formData.frequency) {
            setFormErrors(validate(obj))
        } else if (!formData.numberOfDays) {
            setFormErrors(validate(obj))
        } else if (obj.automate && !obj.dayOfMonth && obj.frequency == 'Monthly') {
            setFormErrors(validate(obj))
        } else if (!obj.martialStatusIds || obj.martialStatusIds.length < 1) {
            setFormErrors(validate(obj))
        } else if (!obj.genderIds || obj.genderIds.length < 1) {
            setFormErrors(validate(obj))
        } else if (!obj.jobroleIds || obj.jobroleIds.length < 1) {
            setFormErrors(validate(obj))
        } else if (obj.carryforward == true && obj.maxcarryforward == 0) {
            setFormErrors(validate(obj))
        } else {
            saveWithOrgAndLocationIds({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                locationId: userDetails.locationId == null ? 0 : userDetails.locationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Leave Type',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        navigate('/leaveTypeList')
                        ToastSuccess(res.message)
                    }
                })
                .catch((err) => {
                    ToastError(err.message)
                })
        }
    }

    //api handling for leave type update with validations
    const onUpdateHandler = (e) => {
        e.preventDefault()

        const obj = {
            ...formData,
            martialStatusIds: extractIds(selectedMaritialStatus),
            locationIds: extractIds(selectedLocation),
            genderIds: extractIds(selectedGender),
            jobroleIds: extractIds(selectedJobRole),
            lop: lop
        }
        console.log(formData, 'formmmmm')
        console.log(leaveTypeData, 'leaveTypeData')
        if (!formData.name) {
            setFormErrors(validate(formData))
        } else if (!formData.frequency) {
            setFormErrors(validate(formData))
        } else if (!formData.numberOfDays) {
            setFormErrors(validate(formData))
        } else if (obj.automate && !obj.dayOfMonth && obj.frequency == 'Monthly') {
            setFormErrors(validate(obj))
        } else if (!obj.martialStatusIds || obj.martialStatusIds.length < 1) {
            setFormErrors(validate(obj))
        } else if (!obj.genderIds || obj.genderIds.length < 1) {
            setFormErrors(validate(obj))
        } else if (!obj.jobroleIds || obj.jobroleIds.length < 1) {
            setFormErrors(validate(obj))
        } else if (formData.carryforward == true && formData.maxcarryforward == 0) {
            setFormErrors(validate(formData))
        } else if (
            updateValidation(leaveTypeData, formData) &&
            compareArrayOfObjects(leaveTypeData.jobroleIds || [], obj.jobroleIds || []) &&
            compareArrayOfObjects(leaveTypeData.genderIds || [], obj.genderIds || []) &&
            compareArrayOfObjects(leaveTypeData.locationIds || [], obj.locationIds || []) &&
            compareArrayOfObjects(
                leaveTypeData.martialStatusIds || [],
                obj.martialStatusIds || []
            ) &&
            leaveTypeData.lop == formData.lop
        ) {
            toast.info('No changes made to update')
            setLoading(false)
        } else {
            update({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                locationId: userDetails.locationId == null ? 0 : userDetails.locationId,
                body: obj,
                id: location.state.id,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Leave Type',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)

                        navigate('/leaveTypeList')
                        ToastSuccess(res.message)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    ToastError(err.message)
                })
        }
    }

    //setting radio button handling
    const patternChange = (e) => {
        if (e.target.value == 'Monthly') {
            setPatternSelect('Monthly')
            setAutomateLeaveSelect('AUTOMATE')
            setFormData({ ...formData, frequency: 'Monthly' })
        } else if (e.target.value == 'Quarterly') {
            setAutomateLeaveSelect('AUTOMATE')
            setPatternSelect('Quarterly')
            setFormData({
                ...formData,
                frequency: 'Quarterly',
                automate: true,
                dayOfMonth: null,
                month: null
            })
        } else if (e.target.value == 'Yearly') {
            setPatternSelect('Yearly')
            setFormData({ ...formData, frequency: 'Yearly' })
        } else {
            setPatternSelect('Lifetime')
            setFormData({ ...formData, frequency: 'Lifetime' })
        }
    }

    const includeAndExcludeChange = (e) => {
        setFormData({ ...formData, [Object.keys(e)[0]]: Object.values(e)[0] })
    }

    const automateLeaveSelectChange = (e) => {
        if (e.target.value == 'AUTOMATE') {
            setAutomateLeaveSelect('AUTOMATE')
            setFormData({ ...formData, automate: true })
        } else if (e.target.value == 'MANUAL') {
            setAutomateLeaveSelect('MANUAL')
            setFormData({
                ...formData,
                automate: false,
                dayOfMonth: null,
                month: null
            })
        }
    }

    useEffect(() => {
        if (location.state && location.state.id == null) {
            setMode('create')
            setLoading(false)
            setPatternSelect('Monthly')
        } else {
            setMode('edit')
            if (location.state && location.state.data.carryforward == true) {
                setLimitVisible(true)
            }
            setLop(location.state.data.lop)
            setFormData(location.state && location.state.data)
            setLeaveTypeData(location.state && location.state.data)

            setCarryForward(
                location.state && location.state.data && location.state.data.carryforward
            )
            setPatternSelect(location.state && location.state.data && location.state.data.frequency)
            if (location.state && location.state.data.automate == true) {
                setAutomateLeaveSelect('AUTOMATE')
            } else {
                setAutomateLeaveSelect('MANUAL')
            }
        }
        if (userDetails.organizationId != null) {
            getLocationList()
        }

        getAllGenderHandler()
        getAllMaritalHandler()
        getAllJobRolesHandler()
    }, [])

    const handleLopSelection = (event) => {
        const isChecked = event.target.checked
        setLop(isChecked)
        setFormData((prevFormData) => ({
            ...prevFormData,
            lop: isChecked
        }))
    }

    //api handling for getting all locations in that organization
    const getLocationList = () => {
        getAllByOrgId({
            entity: 'locations',
            organizationId: userDetails.organizationId
        })
            .then(
                (res) => {
                    setLoading(false)
                    setLocationOptions(res.data)
                    setSelectedLocation(optionsLableHandler(res.data, 'locationIds'))
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    const onInputChange = (e) => {
        let { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const onDateChangeHandler = (option, name) => {
        if (name == 'date') {
            setFormData({ ...formData, dayOfMonth: option.value })
        } else {
            setFormData({ ...formData, month: option.value })
        }
    }

    const validate = (values) => {
        const errors = {}

        if (!values.name) {
            errors.name = 'Required'
        }

        if (!values.numberOfDays) {
            errors.numberOfDays = 'Required'
        }

        if (
            values.carryforward == true &&
            (values.maxcarryforward == null || values.maxcarryforward == 0)
        ) {
            errors.maxcarryforward = 'Required'
        }

        if (values.automate && !values.dayOfMonth) {
            errors.dayOfMonth = 'Required'
        }
        if (patternSelect == 'Yearly' && !formData.month) {
            errors.month = 'Required'
        }

        if (!values.martialStatusIds || values.martialStatusIds.length < 1) {
            errors.martialStatusIds = 'Required'
        }
        if (!values.locationIds || values.locationIds.length < 1) {
            errors.location = 'Required'
        }
        if (!values.genderIds || values.genderIds.length < 1) {
            errors.genderIds = 'Required'
        }

        if (!values.jobroleIds || values.jobroleIds.length < 1) {
            errors.jobroleIds = 'Required'
        }

        return errors
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section detailBackground">
                <div className="row">
                    <div className="col-md-12">
                        <div className="">
                            <PageHeader
                                pageTitle={
                                    mode == 'create' ? 'Add Leave Type' : 'Update Leave Type'
                                }
                            />
                            <div
                                className="center"
                                style={{ paddingLeft: '10%', paddingRight: '10%' }}
                            >
                                <form className="card-body">
                                    {userDetails.locationId && (
                                        <div className="col-">
                                            <Form.Group className="mb-3" as={Row}>
                                                <Form.Label column sm={4}>
                                                    Location <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={8}>
                                                    <Select
                                                        options={[
                                                            ...(locationOptions &&
                                                                locationOptions.length > 0
                                                                ? [{ label: 'All', value: 'all' }]
                                                                : []),
                                                            ...(locationOptions &&
                                                                locationOptions.map((option) => ({
                                                                    label: option.name.toString(),
                                                                    value: option.id
                                                                })))
                                                        ]}
                                                        placeholder=""
                                                        value={selectedLocation}
                                                        isMulti={true}
                                                        isClearable={true}
                                                        onChange={LocationSelectHandler}
                                                        //resolved 2018
                                                        onBlur={() => {
                                                            if (!selectedLocation || selectedLocation.length < 1) {
                                                                setFormErrors({
                                                                    ...formErrors,
                                                                    location: 'Required'
                                                                });
                                                            } else {
                                                                setFormErrors({
                                                                    ...formErrors,
                                                                    location: ''
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    {formErrors && formErrors.location ? (
                                                        <p className="error">
                                                            {formErrors.location}
                                                        </p>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    )}

                                    <div className="col-">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Name <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={8}>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    name="name"
                                                    maxLength={50}
                                                    value={formData.name}
                                                    defaultValue={
                                                        location.state.data
                                                            ? location.state.data.name
                                                            : ''
                                                    }
                                                    onChange={onInputChange}
                                                    onBlur={(e) =>
                                                        !e.target.value
                                                            ? setFormErrors({
                                                                ...formErrors,
                                                                name: 'Required'
                                                            })
                                                            : setFormErrors({
                                                                ...formErrors,
                                                                name: ''
                                                            })
                                                    }
                                                    onKeyPress={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    onPaste={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    onInput={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                />
                                                {formErrors.name && (
                                                    <p className="error">
                                                        {formErrors.name}
                                                    </p>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Frequency <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={7} style={{ marginTop: '5px' }}>
                                                <input
                                                    type="radio"
                                                    value="Monthly"
                                                    checked={patternSelect === 'Monthly'}
                                                    onChange={(e) => {
                                                        patternChange(e)
                                                    }}
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>Monthly</span>
                                                <input
                                                    type="radio"
                                                    value="Quarterly"
                                                    checked={patternSelect === 'Quarterly'}
                                                    onChange={(e) => {
                                                        patternChange(e)
                                                    }}
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>
                                                    Quarterly
                                                </span>
                                                <input
                                                    type="radio"
                                                    value="Yearly"
                                                    checked={patternSelect === 'Yearly'}
                                                    onChange={(e) => {
                                                        patternChange(e)
                                                        setAutomateLeaveSelect('MANUAL')
                                                    }}
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>Yearly</span>
                                                <input
                                                    type="radio"
                                                    value="Lifetime"
                                                    checked={patternSelect === 'Lifetime'}
                                                    onChange={(e) => {
                                                        patternChange(e)
                                                        setAutomateLeaveSelect('MANUAL')
                                                    }}
                                                />{' '}
                                                <span>Lifetime</span>
                                                {formErrors && formErrors.patternSelect ? (
                                                    <p className="error">
                                                        {formErrors.patternSelect}
                                                    </p>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Crediting Method <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={7} style={{ marginTop: '5px' }}>
                                                {['Monthly', 'Quarterly'].includes(
                                                    patternSelect
                                                ) && (
                                                        <>
                                                            <input
                                                                type="radio"
                                                                value="AUTOMATE"
                                                                checked={
                                                                    automateLeaveSelect === 'AUTOMATE'
                                                                }
                                                                onChange={automateLeaveSelectChange}
                                                            />{' '}
                                                            <span style={{ marginRight: '2rem' }}>
                                                                Automatic
                                                            </span>
                                                        </>
                                                    )}
                                                <input
                                                    type="radio"
                                                    value="MANUAL"
                                                    checked={automateLeaveSelect === 'MANUAL'}
                                                    onChange={automateLeaveSelectChange}
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>Manual</span>
                                                {formErrors && formErrors.automate ? (
                                                    <p className="error">{formErrors.automate}</p>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {patternSelect === 'Monthly' &&
                                        automateLeaveSelect === 'AUTOMATE' && (
                                            <div className="col-">
                                                <Form.Group as={Row} className="mb-3">
                                                    <Form.Label column sm={4}>
                                                        Crediting Date{' '}
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col md={7}>
                                                        <div className="dropdown">
                                                            <DateAndMonths
                                                                month={formData.month}
                                                                date={formData.dayOfMonth}
                                                                enableMonth={false}
                                                                enableDate={true}
                                                                dateLength={dateLength}
                                                                formErrors={formErrors}
                                                                onChange={onDateChangeHandler}
                                                                required
                                                            />
                                                        </div>
                                                        {formErrors && formErrors.dayOfMonth ? (
                                                            <p className="error">
                                                                {formErrors.dayOfMonth}
                                                            </p>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        )}

                                    <div className="col-">
                                        <Form.Group
                                            className="mb-3"
                                            controlId="genderLeave"
                                            as={Row}
                                        >
                                            <Form.Label column sm={4}>
                                                Genders <span className="error">*</span>
                                            </Form.Label>

                                            <Col
                                                sm={4}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <Select
                                                    className="dropdown"
                                                    options={[
                                                        // { label: 'All', value: 'all' },
                                                        ...(genderOptions &&
                                                            genderOptions.length > 0
                                                            ? [{ label: 'All', value: 'all' }]
                                                            : []),
                                                        ...(genderOptions &&
                                                            genderOptions.map((option) => ({
                                                                label: option.name.toString(),
                                                                value: option.id
                                                            })))
                                                    ]}
                                                    value={selectedGender}
                                                    onChange={genderSelectHandler}
                                                    isMulti={true}
                                                    isClearable={true}
                                                    required
                                                />
                                                {formErrors && formErrors.genderIds ? (
                                                    <p className="error">{formErrors.genderIds}</p>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                            <Col
                                                sm={2}
                                                md={2}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <input
                                                    type="radio"
                                                    label="Include"
                                                    value="Include"
                                                    checked={
                                                        formData && formData.genderInclude == true
                                                    }
                                                    onChange={() =>
                                                        includeAndExcludeChange({
                                                            genderInclude: true
                                                        })
                                                    }
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>
                                                    {' '}
                                                    Include{' '}
                                                </span>
                                            </Col>
                                            <Col
                                                sm={2}
                                                md={2}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <input
                                                    type="radio"
                                                    label="Exclude"
                                                    value="Exclude"
                                                    checked={
                                                        formData && formData.genderInclude == false
                                                    }
                                                    onChange={() =>
                                                        includeAndExcludeChange({
                                                            genderInclude: false
                                                        })
                                                    }
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>
                                                    {' '}
                                                    Exclude{' '}
                                                </span>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group
                                            className="mb-3"
                                            controlId="genderLeave"
                                            as={Row}
                                        >
                                            <Form.Label column sm={4}>
                                                {' '}
                                                Marital Statuses <span className="error">*</span>
                                            </Form.Label>

                                            <Col
                                                sm={4}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <Select
                                                    className="dropdown"
                                                    options={[
                                                        // { label: 'All', value: 'all' },
                                                        ...(maritialStatus &&
                                                            maritialStatus.length > 0
                                                            ? [{ label: 'All', value: 'all' }]
                                                            : []),
                                                        ...(maritialStatus &&
                                                            maritialStatus.map((option) => ({
                                                                label: option.name.toString(),
                                                                value: option.id
                                                            })))
                                                    ]}
                                                    value={selectedMaritialStatus}
                                                    onChange={maritialSelectHandler}
                                                    isMulti={true}
                                                    isClearable={true}
                                                    required
                                                />
                                                {formErrors && formErrors.martialStatusIds ? (
                                                    <p className="error">
                                                        {formErrors.martialStatusIds}
                                                    </p>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                            <Col
                                                sm={2}
                                                // md={2}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <input
                                                    type="radio"
                                                    label="Include"
                                                    value="Include"
                                                    checked={
                                                        formData && formData.martialInclude == true
                                                    }
                                                    onChange={() =>
                                                        includeAndExcludeChange({
                                                            martialInclude: true
                                                        })
                                                    }
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>
                                                    {' '}
                                                    Include{' '}
                                                </span>
                                            </Col>
                                            <Col
                                                sm={2}
                                                md={2}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <input
                                                    type="radio"
                                                    label="Exclude"
                                                    value="Exclude"
                                                    checked={
                                                        formData && formData.martialInclude == false
                                                    }
                                                    onChange={() =>
                                                        includeAndExcludeChange({
                                                            martialInclude: false
                                                        })
                                                    }
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>
                                                    {' '}
                                                    Exclude{' '}
                                                </span>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group
                                            className="mb-3"
                                            controlId="genderLeave"
                                            as={Row}
                                        >
                                            <Form.Label column sm={4}>
                                                {' '}
                                                Job Roles <span className="error">*</span>
                                            </Form.Label>

                                            <Col
                                                sm={4}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <Select
                                                    className="dropdown"
                                                    options={[
                                                        ...(jobRolesOptions &&
                                                            jobRolesOptions.length > 0
                                                            ? [{ label: 'All', value: 'all' }]
                                                            : []),
                                                        ...(jobRolesOptions &&
                                                            jobRolesOptions.map((option) => ({
                                                                label: option.name.toString(),
                                                                value: option.id
                                                            })))
                                                    ]}
                                                    value={selectedJobRole}
                                                    onChange={jobRoleSelectHandler}
                                                    isMulti={true}
                                                    isClearable={true}
                                                    required
                                                />

                                                {formErrors && formErrors.jobroleIds ? (
                                                    <p className="error">{formErrors.jobroleIds}</p>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                            <Col
                                                sm={2}
                                                md={2}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <input
                                                    type="radio"
                                                    label="Include"
                                                    value="Include"
                                                    checked={
                                                        formData && formData.jobRoleInclude == true
                                                    }
                                                    onChange={() =>
                                                        includeAndExcludeChange({
                                                            jobRoleInclude: true
                                                        })
                                                    }
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>
                                                    {' '}
                                                    Include{' '}
                                                </span>
                                                {formErrors && formErrors.jobRoleInclude ? (
                                                    <p className="error">
                                                        {formData.jobRoleInclude}
                                                    </p>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                            <Col
                                                sm={2}
                                                md={2}
                                                style={{ marginTop: '5px', border: 'black' }}
                                            >
                                                <input
                                                    type="radio"
                                                    label="Exclude"
                                                    value="Exclude"
                                                    checked={
                                                        formData && formData.jobRoleInclude == false
                                                    }
                                                    onChange={() =>
                                                        includeAndExcludeChange({
                                                            jobRoleInclude: false
                                                        })
                                                    }
                                                />{' '}
                                                <span style={{ marginRight: '2rem' }}>
                                                    {' '}
                                                    Exclude{' '}
                                                </span>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                {' '}
                                                Eligible Years
                                            </Form.Label>
                                            <Col md={2} style={{ paddingRight: '70px' }}>
                                                <Form.Control
                                                    type="text"
                                                    inputMode="decimal"
                                                    // max="80"
                                                    name="eligibleYears"
                                                    onChange={handleDecimalInput}
                                                    value={formData.eligibleYears}
                                                />
                                                {formErrors && formErrors.eligibleYears ? (
                                                    <p className="error">
                                                        {formErrors.eligibleYears}
                                                    </p>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Number of Leaves <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={2} style={{ paddingRight: '70px' }}>
                                                <Form.Control
                                                    type="text"
                                                    inputMode="decimal"
                                                    name="numberOfDays"
                                                    value={formData.numberOfDays}
                                                    onChange={handleDecimalInput}
                                                    onBlur={(e) =>
                                                        e.target.value == 0
                                                            ? setFormErrors({
                                                                ...formErrors,
                                                                numberOfDays: 'Required'
                                                            })
                                                            : setFormErrors({
                                                                ...formErrors,
                                                                numberOfDays: ''
                                                            })
                                                    }
                                                />
                                                {formErrors && formErrors.numberOfDays ? (
                                                    <p className="error">
                                                        {formErrors.numberOfDays}
                                                    </p>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group className="mb-2" controlId="lop" as={Row}>
                                            <Form.Label column sm={4}>
                                                Can be considered for LOP ?
                                            </Form.Label>
                                            <Col sm={2} style={{ marginTop: '10px' }}>
                                                <p>
                                                    <input
                                                        type="checkbox"
                                                        name={'lop'}
                                                        checked={lop}
                                                        onChange={handleLopSelection}
                                                    />
                                                </p>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group
                                            className="mb-2"
                                            controlId="carryforward"
                                            as={Row}
                                        >
                                            <Form.Label column sm={4}>
                                                Can be carried forward ?
                                            </Form.Label>
                                            <Col sm={2} style={{ marginTop: '10px' }}>
                                                <p>
                                                    <input
                                                        type="checkbox"
                                                        name={'carryForward'}
                                                        checked={carryForward}
                                                        onChange={carryForwardChange}
                                                    />
                                                </p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div className="col-">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Minimum eligibility for carrying forward
                                            </Form.Label>

                                            <Col sm={2} style={{ paddingRight: "70px" }}>
                                                <Form.Control
                                                    disabled={!carryForward && limitVisible}
                                                    name="minEligibility"
                                                    type="text"
                                                    inputMode="decimal"
                                                    // max={formData.numberOfDays}
                                                    value={formData.minEligibility}
                                                    onChange={handleDecimalInput}


                                                    onBlur={(e) =>
                                                        e.target.value == 0
                                                            ? setFormErrors({
                                                                ...formErrors,
                                                                maxcarryforward: "Required",
                                                            })
                                                            : setFormErrors({
                                                                ...formErrors,
                                                                maxcarryforward: "",
                                                            })
                                                    }
                                                />
                                                <p className="error">{formErrors.minEligibility}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div className="col-">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Maximum Encashable
                                            </Form.Label>

                                            <Col sm={2} style={{ paddingRight: "70px" }}>
                                                <Form.Control
                                                    disabled={!carryForward && limitVisible}
                                                    name="maxEncashable"
                                                    type="text"
                                                    inputMode="decimal"


                                                    // max={formData.numberOfDays}
                                                    value={formData.maxEncashable}
                                                    onChange={handleDecimalInput}
                                                // onBlur={(e) => e.target.value == 0 ? setFormErrors({ ...formErrors, maxEncashable: "Required" }) : setFormErrors({ ...formErrors, maxEncashable: "" })}
                                                />
                                                <p className="error">{formErrors.maxEncashable}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div className="col-">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Maximum leaves to carry forward {carryForward && <span className="error">*</span>}
                                            </Form.Label>

                                            <Col sm={2} style={{ paddingRight: "70px" }}>
                                                <Form.Control
                                                    disabled={!carryForward && limitVisible}
                                                    name="maxcarryforward"
                                                    type="text"
                                                    inputMode="decimal"
                                                    // max={formData.numberOfDays}
                                                    value={formData.maxcarryforward}
                                                    onChange={handleDecimalInput}
                                                // onBlur={(e) => e.target.value == 0 ? setFormErrors({ ...formErrors, maxcarryforward: "Required" }) : setFormErrors({ ...formErrors, maxcarryforward: "" })}
                                                />
                                                <p className="error">{formErrors.maxcarryforward}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="btnCenter mb-3">
                                        {mode == 'create' && (
                                            <Button
                                                style={{ marginRight: '2%' }}
                                                type="button"
                                                className="Button"
                                                variant="addbtn"
                                                onClick={onSaveHandler}
                                            >
                                                Save
                                            </Button>
                                        )}
                                        {mode == 'edit' && (
                                            <Button
                                                style={{ marginRight: '2%' }}
                                                type="button"
                                                className="Button"
                                                variant="addbtn"
                                                onClick={onUpdateHandler}
                                            >
                                                Update
                                            </Button>
                                        )}
                                        <Button
                                            variant="secondary"
                                            className="Button"
                                            type="button"
                                            onClick={() => navigate('/leaveTypeList')}
                                            style={{ marginRight: '2%' }}
                                        >
                                            {cancelButtonName}
                                        </Button>
                                    </div>
                                </form>
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default LeaveType
