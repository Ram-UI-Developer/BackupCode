import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { Tabs } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { TbPhotoEdit } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { Doc, OffBoard, OffBoardAlert } from '../../Common/CommonIcons/CommonIcons'
import {
    appownerDeleteById,
    getByIdwithOutOrg,
    logout,
    updateWithFileWithoutOrg
} from '../../Common/Services/CommonService'
import { ACCESS_TOKEN, cancelButtonName } from '../../Common/Utilities/Constants'
import { NOTIFICATIONS, TITLE, USER_DETAILS } from '../../reducers/constants'
import SubHistory from './SubHistory'
import { updateValidation } from '../../Common/CommonComponents/FormControlValidation'

const OrgProfile = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get the current user details from Redux store
    const navigate = useNavigate() // Hook for programmatic navigation
    const [formData, setFormData] = useState('') // Holds the form data for organization setup or update
    const [logo, setLogo] = useState(null) // Stores the uploaded logo file for the organization
    const [countryId, setCountryId] = useState(null) // Stores the selected country ID from dropdown or API
    const [stateId, setStateId] = useState(null) // Stores the selected state ID (within selected country)
    const [plan, setPlan] = useState(null) // Stores the selected subscription plan for the organization
    const dispatch = useDispatch() // Used to dispatch Redux actions
    const [showLogo, setShowLogo] = useState(false) // Controls visibility of the logo preview (toggle)
    const [offBoard, setOffBoard] = useState(false) // Indicates whether the organization is offboarded or inactive
    const [isLoading, setIsLoading] = useState(true) // Tracks whether the page/data is in loading state
    const [org, setOrg] = useState({}) // Holds full organization object/data (either fetched or in-progress)
    const [modules, setModules] = useState([]) // Stores enabled/selected modules (features) for the organization
    const [formErrors, setFormErrors] = useState({}) // Holds validation errors for form fields

    const handleClose = () => {
        // Closes the logo modal or preview and clears the selected logo file
        setShowLogo(false)
        setLogo(null)
    }

    const handleKeyDown = (e) => {
        // Prevents user from entering "+" or "-" in certain number input fields
        if (e.key === '-' || e.key === '+') {
            e.preventDefault()
        }
    }

    const handleKey = (e) => {
        // Allows only numeric input and periods (for decimal values)
        let key = e.key
        let regex = /[0-9]|\./
        if (!regex.test(key)) {
            e.preventDefault() // Block any non-numeric and non-period key
        }
    }

    const handleInputChange = (e) => {
        // Generic input change handler for form fields
        const { name, value } = e.target
        if (
            name === 'gratitudePeriod' ||
            name === 'noOfDaysForPasswordExpiry' ||
            name === 'maxNoOfAllowedLoginAttempts'
        ) {
            // Ensure numeric input for specific fields
            if (isNaN(value) || value.length > 3) {
                return
            }
        }
        setFormData({ ...formData, [name]: value }) // Update form data dynamically based on input name
    }

    useEffect(() => {
        // On component mount, fetch organization data by ID
        getByOrgId()
    }, [])

    // fetching organization getbyid Api
    const getByOrgId = () => {
        getByIdwithOutOrg({ entity: 'organizations', id: userDetails.organizationId })
            .then((res) => {
                setIsLoading(false)
                setOrg(res.data ? res.data : {})
                setDate(res.data ? res.data.foundationDate : null)
                if (res.statusCode == 200) {
                    setFormData(res.data ? res.data : {})
                    setModules(res.data.moduleIds)
                    setPlan(res.data.packagePlan)
                    setCountryId(res.data.countryId)
                    setStateId(res.data.stateId)
                    convertToBlob(res.data.handBook)
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }
    const [date, setDate] = useState()
    // updateing foundation data
    const handleFounndationDate = (select) => {
        setDate(moment(select).format('YYYY-MM-DD'))
    }

    // function for logout
    const logoutProcess = () => {
        // localStorage.setItem(ACCESS_TOKEN, '')
        // window.location = '/'
        // dispatch({
        //     type: TITLE,
        //     payload: ' '
        // })
        logout({ id: userDetails.employeeId })
            .then((res) => {
                if (res.status == 'success') {
                    localStorage.removeItem(ACCESS_TOKEN)
                    window.location.href = '/'
                    dispatch({
                        type: TITLE,
                        payload: ' '
                    })

                    dispatch({
                        type: NOTIFICATIONS,
                        payload: ' '
                    })
                    dispatch({
                        type: USER_DETAILS,
                        payload: ''
                    })
                }
            })
            .catch((error) => {
                if (error.message == 'Token Expired' || error.message == 'Session expired') {
                    localStorage.removeItem(ACCESS_TOKEN)
                    window.location.href = '/'
                    dispatch({
                        type: TITLE,
                        payload: ' '
                    })

                    dispatch({
                        type: NOTIFICATIONS,
                        payload: ' '
                    })
                    dispatch({
                        type: USER_DETAILS,
                        payload: ''
                    })
                } else {
                    ToastError(error.message)
                    localStorage.removeItem(ACCESS_TOKEN)
                    window.location = '/'
                    dispatch({
                        type: TITLE,
                        payload: ' '
                    })

                    dispatch({
                        type: NOTIFICATIONS,
                        payload: ' '
                    })
                    dispatch({
                        type: USER_DETAILS,
                        payload: ''
                    })
                }
            })
    }

    const handleLogoChange = (e) => {
        const file = e.target.files[0]
        const maxSizeInKB = 200 // Maximum size in KB
        const maxSizeInBytes = maxSizeInKB * 1024 // Convert to bytes

        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif']
            if (!validImageTypes.includes(file.type)) {
                toast.error('Only image files (JPEG, PNG) are allowed.')
                e.target.value = '' // Clear the file input
                return
            }

            if (file.size > maxSizeInBytes) {
                toast.error(`File size must be less than ${maxSizeInKB} KB.`)
                e.target.value = '' // Clear the file input
            } else {
                setLogo(file) // Store the file for later use
            }
        }
    }

    const [hrHandBook, setHrHandBook] = useState(null) // state for hr handbook
    const [hrHandBookFile, setHrHandBookFile] = useState(null) // state for hr handbook file
    // validation and update hr handbook
    const handleHrFileSelect = (e) => {
        const file = e.target.files[0]
        const maxSizeInMB = 15 // Maximum size in MB
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024 // Convert MB to Bytes

        if (file) {
            const validImageTypes = ['application/pdf']
            if (!validImageTypes.includes(file.type)) {
                toast.error('Only PDF files are allowed.')
                e.target.value = '' // Clear the file input
                return
            }
            if (file.size > maxSizeInBytes) {
                toast.error(`File size must be less than ${maxSizeInMB} MB.`)
                e.target.value = '' // Clear the file input
            } else {
                setHrHandBook(file) // Proceed if the file size is valid
                setHrHandBookFile(file) // Store the file for later use
            }
        }
    }

    // handling save api with validations
    const onSaveHandler = (e) => {
        e.preventDefault()
        let obj = {
            id: org.id,
            name: formData.name,
            website: formData.website,
            gratitudePeriod: formData.gratitudePeriod,
            foundationDate: date,
            noOfDaysForPasswordExpiry: formData.noOfDaysForPasswordExpiry,
            maxNoOfAllowedLoginAttempts: formData.maxNoOfAllowedLoginAttempts,
            locationId: org.locationId,
            locationName: formData.locationName,
            headOffice: true,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            stateId: stateId,
            countryId: countryId,
            zipCode: formData.zipCode,
            moduleIds: modules,
            employeeId: org.employeeId,
            userId: org.userId,
            email: formData.email,
            alternateEmail: formData.alternateEmail,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
            alternatePhoneNumber: formData.alternatePhoneNumber,
            logo: org.logo ? org.logo : null,
            packageId: formData.packageId,
            slabId: formData.slabId,
            handBook: hrHandBookFile ? null : org.handBook,
            packagePlan: plan ? plan : org.packagePlan,
            createdDate: org.createdDate,
            termsagreed: true,
            self: true,
            active: formData.active
        }

        if (
            updateValidation(org, formData) &&
            org.foundationDate == date &&
            logo == null &&
            hrHandBookFile == null
        ) {
            toast.info('No changes made to update')
        } else {
            // issue #1698 : validating website url
            if (formErrors.website || formErrors.website == 'Invalid URL') {
                return
            }

            setIsLoading(true)
            let orgData = new FormData()
            logo && orgData.append('file', logo)
            hrHandBookFile && orgData.append('handBook', hrHandBook)
            orgData.append('organization', JSON.stringify(obj))

            updateWithFileWithoutOrg({ entity: 'organizations', id: org.id, body: orgData })
                .then((res) => {
                    if (res.statusCode == 200) {
                        !org.id && ToastSuccess('Subscriber details Saved successfully.')
                        org.id && ToastSuccess('Subscriber details Updated successfully.')
                        // navigate("/"); // stop navigation to home page after update
                        setIsLoading(false)
                        getByOrgId() // Refresh organization data after update
                        setLogo(null) // Clear the logo state after successful update
                        setHrHandBookFile(null) // Clear the HR handbook file state after successful update
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }
    // handling hrhandbook preview popup
    const [fileshow, setFileShow] = useState(false)
    const handleFilesShow = (action) => {
        if (action == 'handBook') {
            setFileShow(true)
        }
    }

    const onCloseHandler = () => {
        setFileShow(false)
        setOffBoard(false)
    }

    const fileInputRef = useRef(null) // Ref for the first hidden file input (used to trigger file selection programmatically)
    const fileInputRef1 = useRef(null) // Ref for the second hidden file input (if multiple file uploads are needed)

    const handleClick = () => {
        // Triggers a click on the first hidden file input
        fileInputRef.current.click()
    }

    const handleClick1 = () => {
        // Triggers a click on the second hidden file input
        fileInputRef1.current.click()
    }

    const [next, setNext] = useState(0) // Manages the current step in a multi-step form or wizard

    const updateStep = (step) => {
        // Updates the step only if it's different from the current one
        if (step == next) {
            return step // Do nothing if the step is the same
        } else {
            setNext(step) // Set to the new step
        }
    }

    // api handling for offboarding
    const getAllData = () => {
        getByIdwithOutOrg({ entity: 'offboarding', id: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    const byteCharacters = atob(res.data.bytes)
                    const byteArrays = []
                    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                        const slice = byteCharacters.slice(offset, offset + 512)
                        const byteNumbers = new Array(slice.length)
                        for (let i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i)
                        }
                        byteArrays.push(new Uint8Array(byteNumbers))
                    }
                    const blob = new Blob(byteArrays, { type: 'application/zip' })
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = `${userDetails.organizationName}_files.zip`
                    link.click()
                    URL.revokeObjectURL(link.href)
                    logoutProcess()
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const onOffBoarding = () => {
        setOffBoard(true)
    }

    // offboarding with delete data
    const OnDeleteHandler = () => {
        setIsLoading(true)
        appownerDeleteById({ entity: 'offboarding', id: userDetails.organizationId }).then(
            (res) => {
                if (res.statusCode == 200) {
                    logoutProcess()
                }
            }
        )
            .catch(() => {
                setIsLoading(false)
            })
    }

    // file conveting into blob formate
    const convertToBlob = (base64Data) => {
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
            .fill(0)
            .map((_, i) => byteCharacters.charCodeAt(i))
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        setHrHandBook(blob)
    }
    // issue #1698 : validating website url
    // const validateWebsite = (value) => {
    //   const websiteRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    //   return websiteRegex.test(value);
    // };

    const validateWebsite = (url) => {
        const pattern = new RegExp(
            '^' +
            '(https?:\\/\\/)?' + // Optional protocol (http or https)
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+' + // Domain name (subdomain + domain)
            '[a-z]{2,})' + // Top-level domain (e.g., com, net)
            '(\\:\\d+)?' + // Optional port (e.g., :3000)
            '(\\/[-a-z\\d%_.~+]*)*' + // Optional path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // Optional query string
            '(\\#[-a-z\\d_]*)?' + // Optional fragment (hash)
            '$',
            'i' // Case-insensitive
        )

        return pattern.test(url)
    }

    // issue #1698 : validating website url
    const handleWebsiteChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        if (value && !validateWebsite(value)) {
            setFormErrors({ ...formErrors, website: 'Invalid URL' })
        } else {
            setFormErrors({ ...formErrors, website: '' })
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
                                <PageHeader pageTitle="Organization Profile" />
                                <br />
                                <Tabs className="mb-4" activeKey={next} onSelect={updateStep}>
                                    <Tab
                                        className="tabText"
                                        eventKey={0}
                                        onClick={() => updateStep(0)}
                                        id="General Information"
                                        title="General Information"
                                    >
                                        {/* general information tab */}
                                        <div className="formBody">
                                            <form className="card-body">
                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            className="fieldLable"
                                                            column
                                                            md={4}
                                                        >
                                                            Organization Name{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            <Form.Control
                                                                disabled
                                                                className="textFieldSub"
                                                                defaultValue={org.name}
                                                                name="name"
                                                                type="text"
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            className="fieldLable"
                                                            column
                                                            md={4}
                                                        >
                                                            Website
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            <Form.Control
                                                                className="textFieldSub"
                                                                value={formData.website}
                                                                onChange={handleWebsiteChange}
                                                                onBlur={handleWebsiteChange}
                                                                name="website"
                                                                type="text"
                                                                maxLength={100}
                                                            />
                                                            {formErrors.website && (
                                                                <span className="error textFieldSub">
                                                                    {formErrors.website}
                                                                </span>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column md={4}>
                                                            Foundation Date{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col
                                                            md={6}
                                                            style={{ marginLeft: '-58px' }}
                                                            className="foundationdate"
                                                        >
                                                            <DatePicker
                                                                placeholder="Select Date"
                                                                className="datepicker"
                                                                allowClear={false}
                                                                value={
                                                                    date == null
                                                                        ? null
                                                                        : moment(date)
                                                                }
                                                                onChange={handleFounndationDate}
                                                                name="foundationDate"
                                                                format={'DD-MM-YYYY'}
                                                                disabledDate={(current) =>
                                                                    current &&
                                                                    current > moment().endOf('day')
                                                                }
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column md={4}>
                                                            Logo
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            <div>
                                                                {logo || org.logo ? (
                                                                    <>
                                                                        <img
                                                                            className="textFieldSub"
                                                                            style={{
                                                                                maxHeight: '70px',
                                                                                maxWidth: '100px'
                                                                            }}
                                                                            src={
                                                                                logo
                                                                                    ? URL.createObjectURL(
                                                                                        logo
                                                                                    )
                                                                                    : org.id !==
                                                                                        null &&
                                                                                        org.logo
                                                                                        ? `data:image/jpeg;base64,${org.logo}`
                                                                                        : '/dist/Images/add-photo.png'
                                                                            }
                                                                            alt="Logo"
                                                                            onClick={handleClick}
                                                                            type="button"
                                                                        />
                                                                        <TbPhotoEdit
                                                                            onClick={handleClick}
                                                                            className="themeColor"
                                                                            size={18}
                                                                            style={{
                                                                                marginTop: '20px'
                                                                            }}
                                                                            type="button"
                                                                        />
                                                                        <input
                                                                            type="file"
                                                                            ref={fileInputRef}
                                                                            style={{
                                                                                display: 'none'
                                                                            }}
                                                                            onChange={(e) =>
                                                                                handleLogoChange(e)
                                                                            }
                                                                            accept="image/*"
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Form.Control
                                                                            className="textFieldSub"
                                                                            type="file"
                                                                            onChange={(e) =>
                                                                                handleLogoChange(e)
                                                                            }
                                                                            accept="image/*"
                                                                        />
                                                                    </>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            className="fieldLable"
                                                            column
                                                            md={4}
                                                            style={{ whiteSpace: 'nowrap' }}
                                                        >
                                                            HR Handbook
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            {org.handBook == null ? (
                                                                <Form.Control
                                                                    className="textFieldSub"
                                                                    onChange={(event) =>
                                                                        handleHrFileSelect(event)
                                                                    }
                                                                    type="file"
                                                                    accept="application/pdf"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <a
                                                                        variant=""
                                                                        className="textFieldSub"
                                                                        onClick={() =>
                                                                            handleFilesShow(
                                                                                'handBook'
                                                                            )
                                                                        }
                                                                    >
                                                                        <Doc height={'50px'} />
                                                                    </a>
                                                                    <>
                                                                        <img
                                                                            onClick={handleClick1}
                                                                            type="button"
                                                                            style={{
                                                                                marginTop: '35px'
                                                                            }}
                                                                            src="/dist/OceanImages/edit.png"
                                                                            height={15}
                                                                        />
                                                                        <input
                                                                            type="file"
                                                                            accept="application/pdf"
                                                                            ref={fileInputRef1}
                                                                            style={{
                                                                                display: 'none'
                                                                            }}
                                                                            onChange={(event) =>
                                                                                handleHrFileSelect(
                                                                                    event
                                                                                )
                                                                            }
                                                                        />
                                                                    </>
                                                                </>
                                                            )}
                                                            <p className="textFieldSub">
                                                                Only allowed PDF files up to 15MB.
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div
                                                    style={{
                                                        marginLeft: 'auto',
                                                        marginRight: 'auto'
                                                    }}
                                                >
                                                    <Button
                                                        className="addMoreBtn"
                                                        variant=""
                                                        onClick={onOffBoarding}
                                                    >
                                                        <OffBoard height={'20px'} /> Off Board
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </Tab>
                                    <Tab
                                        eventKey={1}
                                        onClick={() => updateStep(1)}
                                        id="settings"
                                        title="Settings"
                                    >
                                        {/* settngs tab */}
                                        <div className="formBody">
                                            <form className="card-body">
                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            className="fieldLable"
                                                            column
                                                            md={4}
                                                        >
                                                            Gratuity Period(Years)
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            <Form.Control
                                                                className="textFieldSub"
                                                                value={formData.gratitudePeriod}
                                                                onChange={handleInputChange}
                                                                onBlur={handleInputChange}
                                                                name="gratitudePeriod"
                                                                type="number"
                                                                maxLength={2}
                                                                max={20}
                                                                min={1}
                                                                onKeyPress={handleKey}
                                                                placeholder="0"
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div class="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            column
                                                            md={4}
                                                            style={{ whiteSpace: 'nowrap' }}
                                                        >
                                                            Password Expiry Days
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            <Form.Control
                                                                className="textFieldSub"
                                                                value={
                                                                    formData.noOfDaysForPasswordExpiry
                                                                }
                                                                onChange={handleInputChange}
                                                                onBlur={handleInputChange}
                                                                name="noOfDaysForPasswordExpiry"
                                                                type="number"
                                                                min="1"
                                                                maxLength={3}
                                                                max={365}
                                                                placeholder="0"
                                                                onKeyDown={handleKeyDown}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                    <div class="col-">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-5"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                className="fieldLable"
                                                                column
                                                                md={4}
                                                                style={{ whiteSpace: 'nowrap' }}
                                                            >
                                                                Max Invalid Login Attempts
                                                            </Form.Label>
                                                            <Col md={7}>
                                                                <Form.Control
                                                                    className="textFieldSub"
                                                                    value={
                                                                        formData.maxNoOfAllowedLoginAttempts
                                                                    }
                                                                    onChange={handleInputChange}
                                                                    onBlur={handleInputChange}
                                                                    name="maxNoOfAllowedLoginAttempts"
                                                                    type="number"
                                                                    max={10}
                                                                    maxLength={2}
                                                                    min="1"
                                                                    placeholder="0"
                                                                    onKeyDown={handleKeyDown}
                                                                />
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </Tab>

                                    <Tab
                                        eventKey={2}
                                        onClick={() => updateStep(2)}
                                        id="subscriptionHistory"
                                        title="Subscription History"
                                    >
                                        {/* Subscription History Tab */}
                                        <SubHistory
                                            data={org.subscriptions ? org.subscriptions : []}
                                            isActive={org.active}
                                        />
                                    </Tab>
                                </Tabs>
                                {next == 2 ? (
                                    <></>
                                ) : (
                                    <div className="btnCenter mb-3">
                                        <Button
                                            variant="addbtn"
                                            type="button"
                                            className="Button"
                                            onClick={onSaveHandler}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            className="Button"
                                            onClick={() => navigate('/')}
                                        >
                                            {cancelButtonName}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* modal for logo */}
            <Modal show={showLogo} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Change Logo</Modal.Title>
                    <Button variant="secondary" onClick={handleClose}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div class="container" style={{ padding: '30px' }}>
                            <center>
                                <div className="mb-5">
                                    <img
                                        src={
                                            logo
                                                ? URL.createObjectURL(logo)
                                                : org.id !== null &&
                                                `data:image/jpeg;base64,${org.logo}`
                                        }
                                        style={{ height: '50px' }}
                                        alt="Logo"
                                    />
                                </div>

                                <input
                                    onChange={(e) => {
                                        setLogo(e.target.files[0])
                                    }}
                                    name="logo"
                                    type="file"
                                />
                            </center>
                            <div className="delbtn">
                                <Button
                                    variant="addbtn"
                                    type="button"
                                    className="Button"
                                    onClick={() => setShowLogo(false)}
                                >
                                    Upload
                                </Button>

                                <Button
                                    variant="secondary"
                                    type="button"
                                    className="Button"
                                    onClick={handleClose}
                                >
                                    {cancelButtonName}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
            {/* modal for offboarding */}
            <Modal
                show={offBoard}
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Off Boarding ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <OffBoardAlert height={'50px'} />{' '}
                    <p style={{ color: 'red', marginTop: '1%' }}>
                        {' '}
                        Once you proceed, all your data will be permanently deleted and cannot be
                        recovered under any circumstances, even upon request. You will be redirected
                        to the Workshine landing page and will lose access to Workshine. This action
                        is irreversible. Are you sure you want to continue? Click 'Yes' to proceed
                        or 'Cancel' to abort
                    </p>
                </Modal.Body>
                <div className="delbtn1">
                    <Button
                        className="Button"
                        variant="addbtn"
                        style={{ width: '30%' }}
                        onClick={getAllData}
                    >
                        Download & Proceed
                    </Button>
                    <Button className="Button" variant="addbtn" onClick={OnDeleteHandler}>
                        Proceed
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        Cancel
                    </Button>
                </div>
            </Modal>
            {/* modal for handbook */}
            <Modal
                show={fileshow}
                size="lg"
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {hrHandBook ? (
                        <iframe
                            src={URL.createObjectURL(hrHandBook)}
                            width="100%"
                            height="700px"
                        ></iframe>
                    ) : (
                        <iframe
                            src={`data:application/pdf;base64,${org.handBook}`}
                            width="100%"
                            height="700px"
                        ></iframe>
                    )}
                </Modal.Body>
            </Modal>
        </>
    )
}

export default OrgProfile
