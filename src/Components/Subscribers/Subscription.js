import { DatePicker } from 'antd'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { IoMdRefreshCircle } from 'react-icons/io'
import {  useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError } from '../../Common/CommonComponents/ToastCustomized'
import ValidateZipCode from '../../Common/CommonComponents/ValidateZipCode'
import { SaveWithFileWithoutOrg, getAllByOrgId } from '../../Common/Services/CommonService'
import { getCaptcha } from '../../Common/Services/OtherServices'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import PrivacyModal from '../PrivacyModal'
import TermsModal from '../TermsModal'
import './subscriber.css'

const Subscription = () => {
    // React Router and state management imports
    const packages = useLocation().state
    const navigate = useNavigate()
    // State declarations
    const [formData, setFormData] = useState('') // Holds form input data
    const [foundationDate, setFoundationDate] = useState(null) // Stores foundation date
    const [countries, setCountries] = useState([]) // List of countries
    const [countryId, setCountryId] = useState(null) // Selected country ID
    const [stateId, setStateId] = useState(null) // Selected state ID
    const [formErrors, setFormErrors] = useState({}) // Form field error messages
    const [disabled, setDisabled] = useState(false) // Submit button state
    const [captchaText, setCaptchaText] = useState('') // Captcha value from backend
    const [userInput, setUserInput] = useState('') // User-entered captcha
    const [countryIsoCode, setCountryIsoCode] = useState() // ISO code of selected country
    const [countryIsdCode, setCountryIsdCode] = useState() // ISD code of selected country
    const [countryName, setCountryName] = useState('') // Name of selected country
    const [accept, setAccept] = useState(false) // Checkbox agreement
    const [isLoading, setIsLoading] = useState(false) // Loader state
    const [type, setType] = useState(null) //State for type
    const [showModal, setShowModal] = useState(false) // control plain React modal visibility
    // Fetch countries and captcha on component mount
    useEffect(() => {
        getAllCountries()
        onCaptchaHandler()
        window.scrollTo(0, 0)
    }, [])
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

    // Input field change handler with specific validations
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name == 'zipCode') {
            const validationResult = ValidateZipCode(countries, countryId, value, true)
            if (validationResult.isValid) {
                setFormErrors({ ...formErrors, ['zipCode']: '' })
            } else {
                setFormErrors({ ...formErrors, ['zipCode']: 'Invalid' })
            }
        }
        // Phone number validation
        else if (name === 'phoneNumber') {
            let value1 = '+' + countryIsdCode + value
            const phoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)
            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
            } else if (phoneNumber && !phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }
        // Email validation
        else if (name === 'alternatePhoneNumber') {
            let value1 = '+' + countryIsdCode + value
            const phoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)
            if (!value) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else if (phoneNumber && !phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        } else if (name == 'email') {
            if (value && !emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        } else if (name == 'alternateEmail') {
            if (value && !emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        } else {
            setFormErrors({ ...formErrors, [name]: '' }) // Reset error for the field being edited
        }
    }
    // Transforms captcha input by shifting characters back (simple obfuscation)
    const onCaptchaChangeHandler = (e) => {
        setUserInput(
            e.target.value
                .split('')
                .map((char) => {
                    if (/[a-zA-Z0-9]/.test(char)) {
                        // Decrement letter
                        if (char === 'a') return 'z'
                        if (char === 'A') return 'Z'
                        if (char === '0') return '9'
                        return String.fromCharCode(char.charCodeAt(0) - 1)
                    }

                    return char // Keep numbers unchanged
                })
                .join('')
        )
        setFormErrors({ ...formErrors, captcha: '' }) // Reset error for captcha
    }

    // Handle foundation date picker value
    const onFoundationDateHandler = (date) => {
        setFoundationDate(moment(date).format('YYYY-MM-DD'))
        setFormErrors({ ...formErrors, foundationDate: '' }) // Reset error for foundationDate
    }

    // Fetch list of countries
    const getAllCountries = () => {
        getAllByOrgId({ entity: 'countries', organizationId: 0 }).then((res) => {
            if (res.statusCode == 200) {
                const filteredCountries = res.data.filter((country) => !country.deleted)
                setCountries(filteredCountries)
            }
        })
        .catch(()=> {}) // Handle error by doing nothing
    }

    // Convert countries into dropdown options
    const countryOptions =
        countries && countries.length !== 0
            ? countries.map((option) => ({
                value: option.id,
                label: option.name + '(' + option.isoCode + ')',
                name: option.name,
                isoCode: option.isoCode,
                isdCode: option.isdCode
            }))
            : []

    // Handle country selection and update state
    const handleCountrySelection = (option) => {
        setCountryName(option.name)
        setCountryId(option.value)
        setCountryIsoCode(option.isoCode)
        setCountryIsdCode(option.isdCode)
        setFormErrors({ ...formErrors, country: '' }) // Reset error for country
    }
    // Filter states based on selected country
    const statesFilter = countries.filter((e) => {
        if (e.id == countryId) {
            return e
        }
    })
    const optionsForStates = statesFilter.map((e) => e.stateDTOs) // filtered states by country
    const stateDTOs = optionsForStates[0] // return first element of an array

    // Handle state selection
    const handleStateSelection = (option) => {
        setStateId(option.value)
        setFormErrors({ ...formErrors, state: '' }) // Reset error for state
    }

    // Convert state list into dropdown options
    const stateOptions =
        stateDTOs && stateDTOs.length !== 0
            ? stateDTOs.map((option) => ({
                value: option.id,
                label: option.name
            }))
            : []

    // Fetch and transform captcha string
    const onCaptchaHandler = () => {
        getCaptcha().then((res) => {
            if (res) {
                setCaptchaText(res.data ? res.data : '')
                transformString(res.data ? res.data : '')
            }
        })
       .catch(()=> {}) // Handle error by doing nothing
    }

    // Save form handler
    const onSaveHandler = (e) => {
        e.preventDefault()

        let obj = {
            id: null,
            name: formData.name,
            website: formData.website,
            gratitudePeriod: formData.gratitudePeriod,
            foundationDate: foundationDate,
            noOfDaysForPasswordExpiry: formData.noOfDaysForPasswordExpiry,
            maxNoOfAllowedLoginAttempts: formData.maxNoOfAllowedLoginAttempts,
            locationId: null,
            locationName: formData.city + '-' + countryName,
            headOffice: true,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            stateId: stateId,
            countryId: countryId,
            zipCode: formData.zipCode,
            moduleIds: [],
            employeeId: null,
            userId: null,
            email: formData.email,
            alternateEmail: formData.alternateEmail,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
            alternatePhoneNumber: formData.alternatePhoneNumber,
            logo: null,
            packageId: packages.plan.id,
            slabId: packages.slabId,
            createdBy: null,
            handBook: null,
            termsagreed: accept,
            self: true
        }
        // Validations before API call
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
        } else if (obj.address1 == undefined || !obj.address1) {
            setFormErrors(validate(obj))
        } else if (obj.city == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.stateId == null) {
            setFormErrors(validate(obj))
        } else if (obj.zipCode == undefined) {
            setFormErrors(validate(obj))
        } else if (!validationResult.isValid) {
            setFormErrors({ ...formErrors, ['zipCode']: validationResult.error })
            toast.error('Invalid Zipcode')
        } else if (obj.firstName == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.lastName == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.email == undefined) {
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
        }
        else if (userInput == "") {
            setFormErrors(validate(obj))
        }
        else if (userInput != changedString) {
            onCaptchaHandler()
            toast.error("Please Re-enter Captcha")
            setIsLoading(false)
        }
        else {
            setIsLoading(true)
            setDisabled(true)
            setFormErrors({})
            let subscriptionData = new FormData()
            subscriptionData.append('organization', JSON.stringify(obj))
            // subscriptionData.append("captcha", userInput)

            SaveWithFileWithoutOrg({ entity: 'organizations', body: subscriptionData })
                .then((res) => {
                    if (res) {
                        setDisabled(false)
                    }
                    if (res.statusCode == 200) {
                        if (packages.plan.free) {
                            navigate('/conformation')
                        } else {
                            navigate(
                                `/subscriptionPayment?id=${res.data.subscriptionId}&&organizationId=${res.data.id}`,
                                { state: { plan: res.data } }
                            )
                        }
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    setDisabled(false)
                    ToastError(err.message)
                    onCaptchaHandler()
                })
        }
    }
    // Validate required fields before submitting
    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.foundationDate) {
            errors.foundationDate = 'Required'
        }

        if (!values.address1 || values.address1 == undefined) {
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
        if (!userInput || userInput == undefined || userInput == "") {
            errors.captcha = "Required"
        }

        return errors
    }

    // Cancel button handler
    const onCancelHandler = () => {
        navigate('/')
        window.location.reload()
    }

    // Transform captcha to precomputed value
    const [changedString, setChangedString] = useState('')
    const transformString = (str) => {
        setChangedString(
            str
                .split('')
                .map((char) => {
                    if (/[a-zA-Z0-9]/.test(char)) {
                        // Decrement letter
                        if (char === 'a') return 'z'
                        if (char === 'A') return 'Z'
                        if (char === '0') return '9'
                        return String.fromCharCode(char.charCodeAt(0) - 1)
                    }
                    return char // Keep numbers unchanged
                })
                .join('')
        )
    }

    const handleClick = (typePassed) => {
        setType(typePassed)
        setShowModal(true)
    }



    return (
        <>
            <div className="">
                <body
                    itemtype="https://schema.org/WebPage"
                    itemscope="itemscope"
                    class="home page-template page-template-elementor_theme page page-id-371 ast-desktop ast-page-builder-template ast-no-sidebar astra-4.6.13 ast-single-post ast-inherit-site-logo-transparent ast-hfb-header elementor-default elementor-kit-6 elementor-page elementor-page-371"
                >
                    <div class="hfeed site" id="page">
                        <div id="content" class="site-content">
                            <div class="ast-container">
                                <div id="primary" class="content-area primary">
                                    <main id="main" class="site-main">
                                        <article
                                            class="post-371 page type-page status-publish ast-article-single"
                                            id="post-371"
                                            itemtype="https://schema.org/CreativeWork"
                                            itemscope="itemscope"
                                        >
                                            <header class="entry-header ast-no-thumbnail ast-no-title ast-header-without-markup"></header>
                                            <div class="entry-content clear" itemprop="text">
                                                <div
                                                    data-elementor-type="wp-page"
                                                    data-elementor-id="371"
                                                    class="elementor elementor-371"
                                                    data-elementor-post-type="page"
                                                >
                                                    {isLoading ? <DetailLoader /> : ''}
                                                    <section
                                                        style={{
                                                            marginLeft: '28%',
                                                            marginRight: '25%'
                                                        }}
                                                    >
                                                        <div className="container-fluid">
                                                            <div className="row">
                                                                <div
                                                                    className="col-md-12"
                                                                    style={{ marginTop: '6%' }}
                                                                >
                                                                    <div className=" card-primary">
                                                                        <PageHeader
                                                                            pageTitle={
                                                                                'Organization Details'
                                                                            }
                                                                        />
                                                                        <div
                                                                            style={{
                                                                                marginTop: '30px'
                                                                            }}
                                                                        ></div>
                                                                        <form
                                                                            onSubmit={onSaveHandler}
                                                                        >
                                                                            {/**************--Subscriber Information Start--****************/}
                                                                            <h5 className="subscriptionSubHeading">
                                                                                1. Organization
                                                                                Information
                                                                            </h5>
                                                                            <div className="col-12 mb-2">
                                                                                {/* <hr className='subscriptionHrLine' /> */}
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLabel"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Organization
                                                                                        Name{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            maxLength={
                                                                                                100
                                                                                            }
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            onKeyPress={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onPaste={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onInput={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            name="name"
                                                                                            type="text"
                                                                                            onBlur={(
                                                                                                e
                                                                                            ) =>
                                                                                                !e
                                                                                                    .target
                                                                                                    .value
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            name: 'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            name: ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.name && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.name}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLabel"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Website
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="website"
                                                                                            maxLength={
                                                                                                100
                                                                                            }
                                                                                            type="text"
                                                                                        />
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-3"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLabel"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Foundation
                                                                                        Date{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <DatePicker
                                                                                            className="datepicker"
                                                                                            size="md"
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                onFoundationDateHandler(
                                                                                                    e
                                                                                                )
                                                                                            }
                                                                                            name="foundationDate"
                                                                                            format={
                                                                                                'DD-MM-YYYY'
                                                                                            }
                                                                                            placeholder=" "
                                                                                            disabledDate={(
                                                                                                current
                                                                                            ) =>
                                                                                                current &&
                                                                                                current >
                                                                                                moment().endOf(
                                                                                                    'day'
                                                                                                )
                                                                                            }
                                                                                            inputReadOnly={
                                                                                                true
                                                                                            }
                                                                                            clearIcon={
                                                                                                true
                                                                                            }
                                                                                            onBlur={(
                                                                                                e
                                                                                            ) =>
                                                                                                !e
                                                                                                    .target
                                                                                                    .value
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            foundationDate:
                                                                                                                'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            foundationDate:
                                                                                                                ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.foundationDate && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.foundationDate}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>

                                                                            {/**************--Subscriber Information End--****************/}

                                                                            {/**************--Location Information Start--****************/}

                                                                            <h5 className="subscriptionSubHeading">
                                                                                2. Primary Location
                                                                            </h5>
                                                                            <div className="col-12 mb-2">
                                                                                {/* <hr className='subscriptionHrLine' /> */}
                                                                            </div>

                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Country{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col
                                                                                        md={6}
                                                                                        className="select"
                                                                                    >
                                                                                        <Select
                                                                                           
                                                                                            className="subscriptionSelect"
                                                                                            onChange={
                                                                                                handleCountrySelection
                                                                                            }
                                                                                            options={
                                                                                                countryOptions
                                                                                            }
                                                                                            name="country"
                                                                                            placeholder=" "
                                                                                            onBlur={() =>
                                                                                                countryId ==
                                                                                                    null
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            country:
                                                                                                                'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            country:
                                                                                                                ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.country && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.country}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Line 1{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            // onKeyPress={(e) => handleKeyPress(e)}
                                                                                            maxLength={
                                                                                                100
                                                                                            }
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="address1"
                                                                                            type="text"
                                                                                            onBlur={(
                                                                                                e
                                                                                            ) =>
                                                                                                !e
                                                                                                    .target
                                                                                                    .value
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            address1:
                                                                                                                'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            address1:
                                                                                                                ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.address1 && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.address1}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Line 2
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onKeyPress={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onPaste={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onInput={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="address2"
                                                                                            type="text"
                                                                                            maxLength={
                                                                                                100
                                                                                            }
                                                                                        />
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        City{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onKeyPress={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onPaste={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onInput={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="city"
                                                                                            type="text"
                                                                                            maxLength={
                                                                                                50
                                                                                            }
                                                                                            onBlur={(
                                                                                                e
                                                                                            ) =>
                                                                                                !e
                                                                                                    .target
                                                                                                    .value
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            city: 'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            city: ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.city && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.city}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        State{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col
                                                                                        md={6}
                                                                                        className="select"
                                                                                    >
                                                                                        <Select
                                                                                            
                                                                                            className="subscriptionSelect"
                                                                                            onChange={
                                                                                                handleStateSelection
                                                                                            }
                                                                                            options={
                                                                                                stateOptions
                                                                                            }
                                                                                            name="state"
                                                                                            placeholder=" "
                                                                                            onBlur={() =>
                                                                                                stateId ==
                                                                                                    null
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            state: 'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            state: ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.state && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.state}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable "
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Postal / Zip
                                                                                        Code{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="zipCode"
                                                                                            type="text"
                                                                                            maxLength={
                                                                                                10
                                                                                            }
                                                                                            onBlur={(
                                                                                                e
                                                                                            ) =>
                                                                                                !e
                                                                                                    .target
                                                                                                    .value
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            zipCode:
                                                                                                                'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            zipCode:
                                                                                                                ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.zipCode && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.zipCode}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            {/**************--Location Information End--****************/}

                                                                            {/**************--Location Information Start--****************/}
                                                                            <h5 className="subscriptionSubHeading">
                                                                                3. Contact Person
                                                                                Information
                                                                            </h5>
                                                                            <div className="col-12 mb-2">
                                                                                {/* <hr className='subscriptionHrLine' /> */}
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        First Name{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onKeyPress={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onPaste={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onInput={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="firstName"
                                                                                            type="text"
                                                                                            maxLength={
                                                                                                50
                                                                                            }
                                                                                            onBlur={(
                                                                                                e
                                                                                            ) =>
                                                                                                !e
                                                                                                    .target
                                                                                                    .value
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            firstName:
                                                                                                                'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            firstName:
                                                                                                                ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.firstName && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.firstName}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Last Name{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            onKeyPress={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onPaste={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            onInput={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleKeyPress(
                                                                                                    e,
                                                                                                    setFormErrors
                                                                                                )
                                                                                            }
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="lastName"
                                                                                            type="text"
                                                                                            maxLength={
                                                                                                50
                                                                                            }
                                                                                            onBlur={(
                                                                                                e
                                                                                            ) =>
                                                                                                !e
                                                                                                    .target
                                                                                                    .value
                                                                                                    ? setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            lastName:
                                                                                                                'Required'
                                                                                                        }
                                                                                                    )
                                                                                                    : setFormErrors(
                                                                                                        {
                                                                                                            ...formErrors,
                                                                                                            lastName:
                                                                                                                ''
                                                                                                        }
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.lastName && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.lastName}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>

                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-3"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Email{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="email"
                                                                                            type="text"
                                                                                            onBlur={
                                                                                                handleInputChange
                                                                                            }
                                                                                            maxLength={
                                                                                                100
                                                                                            }
                                                                                        // onBlur={(e) => !e.target.value ? setFormErrors({ ...formErrors, email: "Required" }) : setFormErrors({ ...formErrors, email: "" })}
                                                                                        />
                                                                                        <p className="error">
                                                                                            {
                                                                                                formErrors.email
                                                                                            }
                                                                                        </p>{' '}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>

                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-3"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Alternate
                                                                                        Email
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="alternateEmail"
                                                                                            type="text"
                                                                                            onBlur={
                                                                                                handleInputChange
                                                                                            }
                                                                                            maxLength={
                                                                                                100
                                                                                            }
                                                                                        />
                                                                                        <p className="error">
                                                                                            {
                                                                                                formErrors.alternateEmail
                                                                                            }
                                                                                        </p>
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>

                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Phone Number{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="phoneNumber"
                                                                                            type="text"
                                                                                            onBlur={
                                                                                                handleInputChange
                                                                                            }
                                                                                            maxLength={
                                                                                                15
                                                                                            }
                                                                                            onInput={(
                                                                                                e
                                                                                            ) => {
                                                                                                // Filter out non-numeric characters
                                                                                                e.target.value =
                                                                                                    e.target.value.replace(
                                                                                                        /[^0-9]/g,
                                                                                                        ''
                                                                                                    )
                                                                                            }}
                                                                                        // onBlur={(e) => !e.target.value ? setFormErrors({ ...formErrors, phoneNumber: "Required" }) : setFormErrors({ ...formErrors, phoneNumber: "" })}
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.phoneNumber && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.phoneNumber}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-4"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Alternate
                                                                                        Phone Number
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                handleInputChange
                                                                                            }
                                                                                            name="alternatePhoneNumber"
                                                                                            type="text"
                                                                                            onBlur={
                                                                                                handleInputChange
                                                                                            }
                                                                                            maxLength={
                                                                                                15
                                                                                            }
                                                                                            onInput={(
                                                                                                e
                                                                                            ) => {
                                                                                                // Filter out non-numeric characters
                                                                                                e.target.value =
                                                                                                    e.target.value.replace(
                                                                                                        /[^0-9]/g,
                                                                                                        ''
                                                                                                    )
                                                                                            }}
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.alternatePhoneNumber && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.alternatePhoneNumber}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>

                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-2"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    >
                                                                                        Captcha{' '}
                                                                                        <span className="error">
                                                                                            *
                                                                                        </span>
                                                                                    </Form.Label>
                                                                                    {/* <Col className='collon' md={1}><div className='collon'>:</div></Col> */}
                                                                                    <Col md={6}>
                                                                                        <div className="row">
                                                                                            <div
                                                                                                className="captcha-container col-sm-7"
                                                                                                onCopy={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    e.preventDefault()
                                                                                                }
                                                                                            >
                                                                                                <div className="captcha-display">
                                                                                                    {captchaText
                                                                                                        .split(
                                                                                                            ''
                                                                                                        )
                                                                                                        .map(
                                                                                                            (
                                                                                                                char,
                                                                                                                index
                                                                                                            ) => (
                                                                                                                <span
                                                                                                                    key={
                                                                                                                        char.id
                                                                                                                    }
                                                                                                                    className={`char-style-${index % 6}`}
                                                                                                                >
                                                                                                                    {
                                                                                                                        char
                                                                                                                    }
                                                                                                                </span>
                                                                                                            )
                                                                                                        )}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-sm-3">
                                                                                                <span
                                                                                                    type="button"
                                                                                                    onClick={
                                                                                                        onCaptchaHandler
                                                                                                    }
                                                                                                >
                                                                                                    <IoMdRefreshCircle
                                                                                                        size={
                                                                                                            '36px'
                                                                                                        }
                                                                                                    />
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div class="col-12">
                                                                                <Form.Group
                                                                                    as={Row}
                                                                                    className="mb-3"
                                                                                    controlId="formGroupToDate"
                                                                                >
                                                                                    <Form.Label
                                                                                        className="fieldLable"
                                                                                        column
                                                                                        md={5}
                                                                                    ></Form.Label>
                                                                                    <Col md={6}>
                                                                                        <Form.Control
                                                                                            className="subscriptionText"
                                                                                            plaintext
                                                                                            onChange={
                                                                                                onCaptchaChangeHandler
                                                                                            }
                                                                                            name="captcha"
                                                                                            type="text"
                                                                                            placeholder="Enter the above code here"
                                                                                            maxLength={
                                                                                                8
                                                                                            }
                                                                                        />
                                                                                        {formErrors &&
                                                                                            formErrors.captcha && (
                                                                                                <p className="error">
                                                                                                    {formErrors &&
                                                                                                        formErrors.captcha}
                                                                                                </p>
                                                                                            )}
                                                                                    </Col>
                                                                                </Form.Group>
                                                                            </div>
                                                                            {/**************--Location Information End--****************/}

                                                                            <div className="mb-4 textBold" style={{ marginLeft: '15px' }}>
                                                                                <span>
                                                                                    <input
                                                                                        required
                                                                                        type="checkbox"
                                                                                        checked={
                                                                                            accept
                                                                                        }
                                                                                        onChange={() =>
                                                                                            setAccept(
                                                                                                !accept
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </span>{' '}
                                                                                &ensp;
                                                                                <span>
                                                                                    I have read and
                                                                                    agree to the
                                                                                    &nbsp;
                                                                                    <a
                                                                                        href="#"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault()
                                                                                            handleClick('terms')
                                                                                        }}
                                                                                        style={{
                                                                                            fontSize:
                                                                                                '12px',
                                                                                            textDecoration:
                                                                                                'underline'
                                                                                        }}
                                                                                    >
                                                                                        Terms and
                                                                                        Conditions
                                                                                    </a>
                                                                                    &nbsp; and
                                                                                    &nbsp;
                                                                                    <a
                                                                                        href="#"
                                                                                        onClick={(e) => {
                                                                                            e.preventDefault()
                                                                                            handleClick('privacy')
                                                                                        }}
                                                                                        style={{
                                                                                            fontSize:
                                                                                                '12px',
                                                                                            textDecoration:
                                                                                                'underline'
                                                                                        }}
                                                                                    >
                                                                                        Privacy Policy
                                                                                    </a>
                                                                                </span>
                                                                            </div>

                                                                            {/**************--Buttons Start--****************/}
                                                                            <div className="text-center mb-3">
                                                                                <Button
                                                                                    variant="addbtn"
                                                                                    disabled={
                                                                                        disabled
                                                                                    }
                                                                                    className="Button"
                                                                                    type="submit"
                                                                                >
                                                                                    Enroll
                                                                                </Button>
                                                                                <Button
                                                                                    variant="secondary"
                                                                                    onClick={
                                                                                        onCancelHandler
                                                                                    }
                                                                                    className="Button"
                                                                                >
                                                                                    Back
                                                                                </Button>
                                                                            </div>
                                                                            {/**************--Buttons End--****************/}
                                                                        </form>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                            </div>
                                        </article>
                                    </main>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
            </div>
            {/* Top-Nav */}

            {/* <!--footer copyright start--> */}
            <div className="footer-bottom gray-light-bg py-3">
                <div className="container">
                    <div className="row align-items-center justify-content-between">
                        <div className="col-md-5 col-lg-5">
                            <p className="copyright-text pb-0 mb-0 text-center">
                                <img
                                    src="/dist/Images/Workshine.png"
                                    alt="workshine"
                                    height="14px"
                                    style={{ marginTop: '-6px' }}
                                />
                                &copy; <b>Infyshine Technologies</b>
                                &ensp;All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!--footer copyright end--> */}

            {showModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)'
                    }}
                    onClick={() => setShowModal(false)} // close when clicking backdrop
                >
                    <div
                        role="document"
                        onClick={(e) => e.stopPropagation()} // prevent backdrop close when clicking modal
                        style={{
                            width: '80%',
                            maxWidth: 900,
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            background: '#fff',
                            borderRadius: 6,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            padding: '1rem'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h5 style={{ margin: 0 }}>
                                {type === 'terms' ? 'Terms and conditions' : 'Privacy Policy'}
                            </h5>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                                style={{
                                    background: '#6C757D',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    padding: '6px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                X
                            </button>
                        </div>
                        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                            {type === 'terms' ? <TermsModal /> : <PrivacyModal />}
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: '#6c757d',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                {cancelButtonName}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Subscription
