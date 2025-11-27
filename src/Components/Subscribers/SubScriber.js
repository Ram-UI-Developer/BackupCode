import { DatePicker } from 'antd'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import ValidateZipCode from '../../Common/CommonComponents/ValidateZipCode'
import {
    getAllByOrgId,
    getByIdwithOutOrg,
    SaveWithFileWithoutOrg,
    updateWithFileWithoutOrg
} from '../../Common/Services/CommonService'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import ContactPersonList from './ContactPersonList'
import SubHistory from './SubHistory'
import './subscriber.css'

const Subscriber = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get user details from Redux store
    const organization = useLocation().state // Access organization data passed via react-router's location state
    const navigate = useNavigate() // Hook for programmatic navigation
    const [formData, setFormData] = useState('') // Holds general form data for the organization
    const [logo, setLogo] = useState(null) // Stores uploaded organization logo
    const [foundationDate, setFoundationDate] = useState(null) // Organization's date of foundation
    const [modules, setModules] = useState([]) // List of selected modules or features enabled for the organization
    const [contactPersons, setContactPersons] = useState({}) // Contact persons related to the organization (e.g., admin, billing, etc.)
    const [subscriber, setSubscriber] = useState({}) // Subscriber information (the individual or entity responsible for the subscription)
    const [formErrors, setFormErrors] = useState(null) // Object to capture and track form validation errors
    const [countries, setCountries] = useState([]) // List of countries for dropdown selection
    const [countryId, setCountryId] = useState() // Selected country ID
    const [countryIsdCode, setCountryIsdCode] = useState() // ISD code for selected country (e.g., +91 for India)
    const [countryIsoCode, setCountryIsoCode] = useState() // ISO code for selected country (e.g., IN for India)
    const [stateId, setStateId] = useState(null) // Selected state ID within the chosen country
    const [disabled, setDisabled] = useState(false) // Boolean flag to disable form controls or actions (e.g., during submission)
    const [isLoading, setIsLoading] = useState(true) // Boolean flag to show loading indicator while data is being fetched or initialized
    const [countryName, setCountryName] = useState('') // Name of the selected country (used for display purposes)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // Email formate

    // onchange for input text
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name == 'zipCode') {
            const validationResult = ValidateZipCode(countries, countryId, value, true)
            if (validationResult.isValid) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else {
                setFormErrors({ ...formErrors, [name]: validationResult.error })
            }
        } else {
            setFormErrors({ ...formErrors, [name]: '' }) // Reset error for the field being edited
        }
    }

    // handling date picker for fromdate
    const onFoundationDateHandler = (date) => {
        setFoundationDate(moment(date).format('YYYY-MM-DD'))
        setFormErrors({ ...formErrors, foundationDate: '' }) // Reset error for foundationDate
        if (date == null) {
            setFoundationDate(null)
            setFormErrors({ ...formErrors, foundationDate: 'Required' })
        }
    }

    // fetching API call for the countries
    const getAllCountries = () => {
        getAllByOrgId({ entity: 'countries', organizationId: 0 }).then((res) => {
            if (res.statusCode == 200) {
                const filteredCountries = res.data.filter((country) => !country.deleted)
                setCountries(filteredCountries)
                if (organization.id == undefined) {
                    setIsLoading(false)
                } else {
                    onGetHandler(filteredCountries)
                }
            }
        })
            .catch(() => { }) // Handle error by doing nothing
    }

    // Handle country selection and update state
    const handleCountrySelection = (option) => {
        setCountryName(option.name)
        setCountryId(option.value)
        setCountryIsdCode(option.isdcode)
        setCountryIsoCode(option.isoCode)
        setFormErrors({ ...formErrors, country: '' }) // Reset error for country selection
    }

    // Convert countries into dropdown options
    const countryOptions =
        countries && countries.length !== 0
            ? countries.map((option) => ({
                value: option.id,
                label: option.name + '(' + option.isoCode + ')',
                name: option.name,
                isocode: option.isoCode,
                isdcode: option.isdCode
            }))
            : []

    // Filter states based on selected country
    const statesFilter = countries.filter((e) => {
        if (e.id == countryId) {
            return e
        }
    })
    const optionsForStates = statesFilter.map((e) => e.stateDTOs)
    const stateDTOs = optionsForStates[0]

    // Convert state list into dropdown options
    const stateOptions =
        stateDTOs && stateDTOs.length !== 0
            ? stateDTOs.map((option) => ({
                value: option.id,
                label: option.name
            }))
            : []

    // Handle state selection
    const handleStateSelection = (option) => {
        setStateId(option.value)
        setFormErrors({ ...formErrors, state: '' }) // Reset error for state selection
        if (option.value == null) {
            setFormErrors({ ...formErrors, state: 'Required' })
        }
    }

    // Fetching Get by id Api for organiztions
    const onGetHandler = (filteredCountries) => {
        getByIdwithOutOrg({ entity: 'organizations', id: organization.id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    setSubscriber(res.data)
                    setFormData(res.data)
                    setModules(res.data.moduleIds)
                    setCountryId(res.data.countryId)
                    const matchedCountry =
                        filteredCountries &&
                        filteredCountries.find((country) => country.id === res.data.countryId)

                    if (matchedCountry) {
                        setCountryIsdCode(matchedCountry.isdCode)
                        setCountryIsoCode(matchedCountry.isocode)
                    }
                    setStateId(res.data.stateId)
                    setFoundationDate(res.data.foundationDate)
                    setLogo(res.data.logo)
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // Fetch countries on component mount
    useEffect(() => {
        getAllCountries()
        if (organization.id == undefined) {
            setIsLoading(false)
        }
        // else {
        //     onGetHandler()
        // }
    }, [])

    // api handling for save
    const onSaveHandler = (e) => {
        e.preventDefault()
        let obj = {
            name: formData.name ? formData.name : subscriber.name,
            website: formData.website ? formData.website : subscriber.website,
            gratitudePeriod: formData.gratitudePeriod
                ? formData.gratitudePeriod
                : subscriber.gratitudePeriod,
            foundationDate: foundationDate,
            noOfDaysForPasswordExpiry: formData.noOfDaysForPasswordExpiry
                ? formData.noOfDaysForPasswordExpiry
                : subscriber.noOfDaysForPasswordExpiry,
            maxNoOfAllowedLoginAttempts: formData.maxNoOfAllowedLoginAttempts
                ? formData.maxNoOfAllowedLoginAttempts
                : subscriber.maxNoOfAllowedLoginAttempts,
            locationName: formData.city + '-' + countryName,
            headOffice: true,
            address1: formData.address1 ? formData.address1 : subscriber.address1,
            address2: formData.address2 ? formData.address2 : subscriber.address2,
            city: formData.city ? formData.city : subscriber.city,
            stateId: stateId,
            countryId: countryId,
            zipCode: formData.zipCode ? formData.zipCode : subscriber.zipCode,
            moduleIds: [],
            email: contactPersons.email ? contactPersons.email : subscriber.email,
            alternateEmail: contactPersons.alternateEmail
                ? contactPersons.alternateEmail
                : subscriber.alternateEmail,
            firstName: contactPersons.firstName ? contactPersons.firstName : subscriber.firstName,
            lastName: contactPersons.lastName ? contactPersons.lastName : subscriber.lastName,
            phoneNumber: contactPersons.phoneNumber
                ? contactPersons.phoneNumber
                : subscriber.phoneNumber,
            alternatePhoneNumber: contactPersons.alternatePhoneNumber
                ? contactPersons.alternatePhoneNumber
                : subscriber.alternatePhoneNumber,
            logo: subscriber.logo ? subscriber.logo : null,
            packageId: organization.plan.id,
            slabId: organization.slabId,
            createdDate: subscriber.createdDate,
            createdBy: userDetails.employeeId,
            handBook: null,
            termsagreed: true,
            self: false
        }
        const validationResult = ValidateZipCode(countries, countryId, obj.zipCode, true)
        let value = '+' + countryIsdCode + obj.phoneNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        let value1 = '+' + countryIsdCode + obj.alternatePhoneNumber
        const alternatePhoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)
        if (obj.name == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.foundationDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.countryId == null) {
            setFormErrors(validate(obj))
        } else if (obj.address1 == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.city == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.stateId == null) {
            setFormErrors(validate(obj))
        } else if (obj.zipCode == undefined) {
            setFormErrors(validate(obj))
        } else if (!validationResult.isValid) {
            setFormErrors({ ...formErrors, ['zipCode']: validationResult.error })
            toast.error(validationResult.error)
        } else if (obj.firstName == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.lastName == undefined) {
            setFormErrors(validate(obj))
        } else if (!emailRegex.test(obj.email)) {
            toast.error('Invalid email format')
        } else if (
            obj.alternateEmail != undefined &&
            obj.alternateEmail != '' &&
            !emailRegex.test(obj.alternateEmail)
        ) {
            toast.error('Invalid alternate email format')
        } else if (obj.phoneNumber == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.phoneNumber.length <= 1) {
            toast.error('Invalid phone number')
        } else if (!phoneNumber.isValid()) {
            toast.error('Invalid phone number')
        } else if (obj.alternatePhoneNumber && !alternatePhoneNumber.isValid()) {
            toast.error('Invalid alternate phone number')
        } else {
            setIsLoading(true)
            setDisabled(true)
            let orgData = new FormData()
            logo && orgData.append('file', logo)
            orgData.append('organization', JSON.stringify(obj))
            SaveWithFileWithoutOrg({ entity: 'organizations', body: orgData })
                .then((res) => {
                    if (res) {
                        setDisabled(false)
                    }
                    if (res.statusCode == 200) {
                        !organization.id && ToastSuccess('Subscriber details Saved successfully.')
                        organization.id && ToastSuccess('Subscriber details Updated successfully.')
                        navigate('/subscriberList')
                    } else {
                        setDisabled(false)
                    }
                })
                .catch((err) => {
                    setDisabled(false)
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // api handling for Update
    const onUpdateHandler = (e) => {
        e.preventDefault()

        let obj = {
            id: organization.id,
            name: formData.name ? formData.name : subscriber.name,
            website: formData.website ? formData.website : subscriber.website,
            gratitudePeriod: formData.gratitudePeriod
                ? formData.gratitudePeriod
                : subscriber.gratitudePeriod,
            foundationDate: foundationDate,
            noOfDaysForPasswordExpiry: formData.noOfDaysForPasswordExpiry
                ? formData.noOfDaysForPasswordExpiry
                : subscriber.noOfDaysForPasswordExpiry,
            maxNoOfAllowedLoginAttempts: formData.maxNoOfAllowedLoginAttempts
                ? formData.maxNoOfAllowedLoginAttempts
                : subscriber.maxNoOfAllowedLoginAttempts,
            locationId: subscriber.locationId,
            locationName: formData.locationName ? formData.locationName : subscriber.locationName,
            headOffice: true,
            address1: formData.address1 ? formData.address1 : subscriber.address1,
            address2: formData.address2 ? formData.address2 : subscriber.address2,
            city: formData.city ? formData.city : subscriber.city,
            stateId: stateId,
            countryId: countryId,
            zipCode: formData.zipCode ? formData.zipCode : subscriber.zipCode,
            moduleIds: modules,
            employeeId: subscriber.employeeId,
            userId: subscriber.userId,
            email: contactPersons.email ? contactPersons.email : subscriber.email,
            alternateEmail: contactPersons.alternateEmail
                ? contactPersons.alternateEmail
                : subscriber.alternateEmail,
            firstName: contactPersons.firstName ? contactPersons.firstName : subscriber.firstName,
            lastName: contactPersons.lastName ? contactPersons.lastName : subscriber.lastName,
            phoneNumber: contactPersons.phoneNumber
                ? contactPersons.phoneNumber
                : subscriber.phoneNumber,
            alternatePhoneNumber: contactPersons.alternatePhoneNumber
                ? contactPersons.alternatePhoneNumber
                : subscriber.alternatePhoneNumber,
            logo: subscriber.logo ? subscriber.logo : null,
            packageId: subscriber.packageId,
            slabId: subscriber.slabId,
            createdBy: userDetails.employeeId,
            createdDate: subscriber.createdDate,
            handBook: subscriber ? subscriber.handBook : null,
            termsagreed: true,
            self: false,
            active: subscriber.active,
            emailVerified: subscriber.emailVerified
        }

        // Validate zip code based on selected country
        const validationResult = ValidateZipCode(countries, countryId, obj.zipCode, true)
        let value = '+' + countryIsdCode + obj.phoneNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        let value1 = '+' + countryIsdCode + obj.alternatePhoneNumber
        const alternatePhoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)
        if (
            subscriber.name == formData.name &&
            subscriber.website == formData.website &&
            subscriber.foundationDate == foundationDate
        ) {
            toast.info('No changes made to update.')
        } else if (obj.name == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.foundationDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.countryId == null) {
            setFormErrors(validate(obj))
        } else if (obj.address1 == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.city == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.stateId == null) {
            setFormErrors(validate(obj))
        } else if (obj.zipCode == undefined) {
            setFormErrors(validate(obj))
        } else if (!validationResult.isValid) {
            setFormErrors({ ...formErrors, ['zipCode']: validationResult.error })
            ToastError(validationResult.error)
        } else if (obj.firstName == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.lastName == undefined) {
            setFormErrors(validate(obj))
        } else if (!emailRegex.test(obj.email)) {
            ToastError('Invalid email format')
        } else if (
            obj.alternateEmail != undefined &&
            obj.alternateEmail != '' &&
            !emailRegex.test(obj.alternateEmail)
        ) {
            ToastError('Invalid alternate email format')
        } else if (obj.phoneNumber == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.phoneNumber.length <= 1) {
            ToastError('Invalid phone number')
        } else if (!phoneNumber.isValid()) {
            ToastError('Invalid phone number')
        } else if (obj.alternatePhoneNumber && !alternatePhoneNumber.isValid()) {
            ToastError('Invalid alternate phone number')
        } else {
            setIsLoading(true)
            let orgData = new FormData()
            logo && orgData.append('file', logo)
            orgData.append('organization', JSON.stringify(obj))
            updateWithFileWithoutOrg({
                entity: 'organizations',
                id: organization.id,
                body: orgData
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        !organization.id && ToastSuccess('Subscriber details Saved successfully.')
                        organization.id && ToastSuccess('Subscriber details Updated successfully.')
                        navigate('/subscriberList')
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Handliing validations for required fiedls
    const validate = (values) => {
        const errors = {}

        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.foundationDate) {
            errors.foundationDate = 'Required'
        }
        if (!values.address1) {
            errors.address1 = 'Required'
        }
        if (!values.city) {
            errors.city = 'Required'
        }
        if (values.stateId == null) {
            errors.state = 'Required'
        }
        if (values.countryId == null) {
            errors.country = 'Required'
        }
        if (!values.zipCode) {
            errors.zipCode = 'Required'
        }
        if (!values.firstName) {
            errors.firstName = 'Required'
        }
        if (!values.lastName) {
            errors.lastName = 'Required'
        }
        if (!values.email) {
            errors.email = 'Required'
        }
        if (!values.phoneNumber) {
            errors.phoneNumber = 'Required'
        }
        if (logo && logo.size > 100000) {
            errors.fileSize = 'File size should not exceed more than 100kb'
        }
        return errors
    }

    // Restrict input from starting with non-alphabet character
    const handleKeyPress = (event, setFormErrors) => {
        const { name, value } = event.target
        if (event.type === 'keypress') {
            const key = event.key
            // Prevent first character from being a number
            if (value.length === 0 && !/^[a-zA-Z]$/.test(key)) {
                event.preventDefault()
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: 'First character must be an alphabet'
                }))
            }
        }
    }

    // handling tabs
    const [next, setNext] = useState(0)
    const updateStep = (step) => {
        if (step == next) {
            return step
        } else {
            setNext(step)
        }
    }

    return (
        <>
            {isLoading ? <DetailLoader /> : ''}
            <section className="section detailBackground">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader
                                    pageTitle={
                                        (organization.id == null ? 'Add' : 'Update') +
                                        ' ' +
                                        'Subscriber'
                                    }
                                />
                                <br />
                                <Tabs className="mb-4" activeKey={next} onSelect={updateStep}>
                                    {/* General information tab */}
                                    <Tab
                                        className="tabText"
                                        eventKey={0}
                                        onClick={() => updateStep(0)}
                                        id="General Information"
                                        title="General Information"
                                    >
                                        <form>
                                            <div className="container">
                                                <div className="row">
                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable"
                                                                column
                                                                md={6}
                                                            >
                                                                Subscriber Name{' '}
                                                                <span className="error">
                                                                    *
                                                                </span>
                                                            </Form.Label>
                                                            <Col md={6}>
                                                                <Form.Control
                                                                    className="textFieldSub"
                                                                    defaultValue={subscriber.name}
                                                                    onChange={handleInputChange}
                                                                    name="name"
                                                                    type="text"
                                                                    maxLength={50}
                                                                    onKeyPress={(e) =>
                                                                        handleKeyPress(
                                                                            e,
                                                                            setFormErrors
                                                                        )
                                                                    }
                                                                    onPaste={(e) =>
                                                                        handleKeyPress(
                                                                            e,
                                                                            setFormErrors
                                                                        )
                                                                    }
                                                                    onInput={(e) =>
                                                                        handleKeyPress(
                                                                            e,
                                                                            setFormErrors
                                                                        )
                                                                    }
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
                                                                />
                                                                <p className="error textFieldSub">
                                                                    {formErrors && formErrors.name}
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable sub"
                                                                column
                                                                md={6}
                                                            >
                                                                Website
                                                            </Form.Label>
                                                            <Col md={6}>
                                                                <Form.Control
                                                                    className="textField"
                                                                    defaultValue={
                                                                        subscriber.website
                                                                    }
                                                                    onChange={handleInputChange}
                                                                    name="website"
                                                                    maxLength={100}
                                                                    type="text"
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-0"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable"
                                                                column
                                                                md={6}
                                                            >
                                                                Foundation Date{' '}
                                                                <span className="error">
                                                                    *
                                                                </span>
                                                            </Form.Label>
                                                            <Col md={6} className="foundationdate">
                                                                <DatePicker
                                                                    className="datepicker foundation"
                                                                    value={
                                                                        foundationDate == null
                                                                            ? null
                                                                            : moment(foundationDate)
                                                                    }
                                                                    onChange={(e) =>
                                                                        onFoundationDateHandler(e)
                                                                    }
                                                                    name="foundationDate"
                                                                    format={'DD-MM-YYYY'}
                                                                    placeholder=" "
                                                                    inputReadOnly={true}
                                                                    clearIcon={true}
                                                                />
                                                                <p className="error ">
                                                                    {formErrors &&
                                                                        formErrors.foundationDate}
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                                {/*************** Locations in the Subscriber start *******************/}
                                                <div className="row" style={{ marginTop: '-10px' }}>
                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable"
                                                                column
                                                                md={6}
                                                            >
                                                                Country{' '}
                                                                <span className="error">
                                                                    *
                                                                </span>
                                                            </Form.Label>
                                                            <Col md={6} className="select" style={{ marginLeft: '-60px' }}>
                                                                <Select
                                                                    isDisabled={subscriber.id}
                                                                    value={countryOptions.filter(
                                                                        (e) => e.value == countryId
                                                                    )}
                                                                    onChange={
                                                                        handleCountrySelection
                                                                    }
                                                                    options={countryOptions}
                                                                    name="country"
                                                                    placeholder=" "
                                                                    onBlur={() =>
                                                                        countryId == null
                                                                            ? setFormErrors({
                                                                                ...formErrors,
                                                                                country:
                                                                                    'Required'
                                                                            })
                                                                            : setFormErrors({
                                                                                ...formErrors,
                                                                                country: ''
                                                                            })
                                                                    }
                                                                />
                                                                <p className="error">
                                                                    {formErrors &&
                                                                        formErrors.country}
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable sub"
                                                                column
                                                                md={6}
                                                            >
                                                                Line 1{' '}
                                                                <span className="error">
                                                                    *
                                                                </span>
                                                            </Form.Label>
                                                            <Col md={6}>
                                                                <Form.Control
                                                                    readOnly={subscriber.id}
                                                                    onChange={handleInputChange}
                                                                    defaultValue={
                                                                        subscriber.address1
                                                                    }
                                                                    name="address1"
                                                                    maxLength={100}
                                                                    type="text"
                                                                    onBlur={(e) =>
                                                                        !e.target.value
                                                                            ? setFormErrors({
                                                                                ...formErrors,
                                                                                address1:
                                                                                    'Required'
                                                                            })
                                                                            : setFormErrors({
                                                                                ...formErrors,
                                                                                address1: ''
                                                                            })
                                                                    }
                                                                />
                                                                <p className="error">
                                                                    {formErrors &&
                                                                        formErrors.address1}
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>

                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable"
                                                                column
                                                                md={6}
                                                            >
                                                                Line 2
                                                            </Form.Label>
                                                            <Col md={6}>
                                                                <Form.Control
                                                                    readOnly={subscriber.id}
                                                                    className="textFieldSub"
                                                                    defaultValue={
                                                                        subscriber.address2
                                                                    }
                                                                    maxLength={100}
                                                                    onChange={handleInputChange}
                                                                    name="address2"
                                                                    type="text"
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable sub"
                                                                column
                                                                md={6}
                                                            >
                                                                City{' '}
                                                                <span className="error">
                                                                    *
                                                                </span>
                                                            </Form.Label>
                                                            <Col md={6}>
                                                                <Form.Control
                                                                    readOnly={subscriber.id}
                                                                    defaultValue={subscriber.city}
                                                                    onChange={handleInputChange}
                                                                    maxLength={50}
                                                                    name="city"
                                                                    type="text"
                                                                    onBlur={(e) =>
                                                                        !e.target.value
                                                                            ? setFormErrors({
                                                                                ...formErrors,
                                                                                city: 'Required'
                                                                            })
                                                                            : setFormErrors({
                                                                                ...formErrors,
                                                                                city: ''
                                                                            })
                                                                    }
                                                                />
                                                                <p className="error">
                                                                    {formErrors && formErrors.city}
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable "
                                                                column
                                                                md={6}
                                                            >
                                                                State{' '}
                                                                <span className="error">
                                                                    *
                                                                </span>
                                                            </Form.Label>
                                                            <Col md={6} className="select" style={{ marginLeft: '-60px' }}>
                                                                <Select
                                                                    isDisabled={subscriber.id}
                                                                    onChange={handleStateSelection}
                                                                    options={stateOptions}
                                                                    name="state"
                                                                    placeholder=" "
                                                                    value={stateOptions.filter(
                                                                        (e) => e.value == stateId
                                                                    )}
                                                                    onBlur={() =>
                                                                        stateId == null
                                                                            ? setFormErrors({
                                                                                ...formErrors,
                                                                                state: 'Required'
                                                                            })
                                                                            : setFormErrors({
                                                                                ...formErrors,
                                                                                state: ''
                                                                            })
                                                                    }
                                                                />
                                                                <p className="error ">
                                                                    {formErrors && formErrors.state}
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>

                                                    <div class="col-6">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-5"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable sub"
                                                                column
                                                                md={6}
                                                            >
                                                                Postal / Zip Code{' '}
                                                                <span className="error">
                                                                    *
                                                                </span>
                                                            </Form.Label>
                                                            <Col md={6}>
                                                                <Form.Control
                                                                    readOnly={subscriber.id}
                                                                    defaultValue={
                                                                        subscriber.zipCode
                                                                    }
                                                                    onChange={handleInputChange}
                                                                    name="zipCode"
                                                                    type="text"
                                                                    maxLength={10}
                                                                    onBlur={(e) =>
                                                                        !e.target.value
                                                                            ? setFormErrors({
                                                                                ...formErrors,
                                                                                zipCode:
                                                                                    'Required'
                                                                            })
                                                                            : setFormErrors({
                                                                                ...formErrors,
                                                                                zipCode: ''
                                                                            })
                                                                    }
                                                                />
                                                                <p className="error">
                                                                    {formErrors &&
                                                                        formErrors.zipCode}
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                </div>

                                                {/*************** Locations in the Subscriber end  *******************/}
                                                <div style={{ marginTop: '-50px' }}>
                                                    <ContactPersonList
                                                        contactPersons={subscriber}
                                                        sendToParent={setContactPersons}
                                                        countryIsdCode={countryIsdCode}
                                                        countryIsoCode={countryIsoCode}
                                                        formError={formErrors}
                                                    />
                                                </div>
                                                <div className="btnCenter">
                                                    {organization.id == null ? (
                                                        <Button
                                                            variant="addbtn"
                                                            disabled={disabled}
                                                            className="Button"
                                                            type="button"
                                                            onClick={onSaveHandler}
                                                            style={{ marginRight: '2%' }}
                                                        >
                                                            Save
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="addbtn"
                                                            className="Button"
                                                            onClick={onUpdateHandler}
                                                            style={{ marginRight: '2%' }}
                                                        >
                                                            Update
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="secondary"
                                                        className="Button"
                                                        onClick={() => navigate('/subscriberList')}
                                                    >
                                                        {cancelButtonName}
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>
                                    </Tab>
                                    {/* Subscription History Tab */}
                                    <Tab
                                        disabled={subscriber.id ? false : true}
                                        eventKey={1}
                                        onClick={() => updateStep(1)}
                                        id="subscriptionHistory"
                                        title="Subscription History"
                                    >
                                        <SubHistory
                                            organizationId={subscriber.id}
                                            data={
                                                subscriber.subscriptions
                                                    ? subscriber.subscriptions
                                                    : []
                                            }
                                            isActive={subscriber.active}
                                        />
                                    </Tab>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Subscriber
