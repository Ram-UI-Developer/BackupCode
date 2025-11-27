import { DatePicker } from 'antd'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row, Tabs } from 'react-bootstrap'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tab from 'react-bootstrap/Tab'
import Tooltip from 'react-bootstrap/Tooltip'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import {
    compareArrayOfObjects,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'
import { ChangeIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    UpdateWithFile,
    getAllByOrgId,
    getByIdwithOutOrg,
    getEmployeePersonalDetails
} from '../../../Common/Services/CommonService'
import { getAllById } from '../../../Common/Services/OtherServices'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import Annexure from '../../PayRoll/Reports/Annexure'
import Address from '../EmployeeDetails/Address'
import Education from '../EmployeeDetails/Education'
import CompensationHistoryView from './CompensationHistoryView'
import EmployeeBankDetails from './EmployeeBankDetails'
import EmployeeLeaveBalance from './EmployeeLeaveBalance'
import EmployeeShifts from './EmployeeModals/EmployeeShifts'
import JobRoleModal from './EmployeeModals/JobRoleModal'
import MaritalStatusModal from './EmployeeModals/MaritalStatusModal'
import EmployeeProjectDetails from './EmployeeProjectDetails'
import Experience from './Experience'
import Family from './Family'
import IdProofs from './IdProof'
import LoanTrackingView from './LoanTrackingView'
import Manager from './Manager'
import Reference from './Reference'
import Skills from './Skill'
import { ProfilePersonalInformation } from './ProfilePersonalInformation'
const EmployeeProfileDetails = () => {
    const [next, setNext] = useState(0) // Keeps track of the current step number
    const [change, setChange] = useState(true)
    const [countryId, setCountryId] = useState(null) // Stores selected country ID
    const [countryIsoCode, setCountryIsoCode] = useState() // Stores the selected country's ISO code
    const [countryIsdCode, setCountryIsdCode] = useState() // Stores the selected country's ISD code
    const [countries, setCountries] = useState() // Stores list of countries
    const [aCountryId, setACountryId] = useState() // Stores another selected country ID (probably for comparison)
    const [aCountryIsoCode, setACountryIsoCode] = useState() // Stores ISO code of another selected country
    const [aCountryIsdCode, setACountryIsdCode] = useState() // Stores ISD code of another selected country
    const [departmentList, setDepartmentList] = useState([]) // Initially set to an empty array
    const [formErrors, setFormErrors] = useState({}) // Manages form validation errors
    
    // Function to update the current step based on the provided step
    const updateStep = (step) => {
        if (step == next) {
            return step
        } else {
            setNext(step)
        }
    }
    // Function to handle currency selection
    const handleCurrencySelection = (option) => {
        setFormErrors({
            ...formErrors,
            countryId: !option ? 'Required' : ''
        })
        setCountryId(option.value)
        setFormData({ ...formData, countryId: option.value }) //#1608: Update formData with the selected country ID
        setCountryIsoCode(option.label)
        setCountryIsdCode(option.isdCode)
    }
    // Function to handle the "Missed Lines History" section
    const onAllMissLinesHistory = (step) => {
        if (step == next) {
            return step
        } else {
            setNext(step)
            window.scrollBy(0, 0)
        }
    }

    const userDetails = useSelector((state) => state.user.userDetails) // Accessing user details from the Redux store using useSelector
    // State hooks to manage various form data
    const [formData, setFormData] = useState('') // Stores form data, initially empty string
    const [marriageDate, setMarriageDate] = useState(null) // Stores selected marriage date
    const [photo, setPhoto] = useState(null) // Stores the selected photo
    const [jobRole, setJobRole] = useState(null) // Stores the selected job role
    // State hooks to manage file uploads for different categories
    const [experienceSelectedFiles, setExperienceSelectedFiles] = useState([]) // Files for experience
    const [idproofSelectedFiles, setIdproofSelectedFiles] = useState([]) // Files for ID proof
    const [educationSelectedFiles, setEducationSelectedFiles] = useState([]) // Files for education
    // State hooks to manage country-related data
    // Function to handle the marriage date selection and format it to 'YYYY-MM-DD'
    const handleMarriageDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setMarriageDate(selectedDate)
        setChange(false)
    }
    // useEffect hook to run certain functions when the component mounts (on initial render)
    useEffect(() => {
        getByOrgId()
        getAllGenderData()
        onGetCurrencyHandler()
        getAllLocationByClientId()
        onDepartmentsHandler()
    }, [])
    // State hooks related to location and shift data
    const [loactionShiftDtos, setLoactionShiftDtos] = useState([]) // Stores location and shift data
    const [locationData, setLocationData] = useState([]) // Stores location-related data
    const [shiftName, setShiftName] = useState('') // Stores shift name
    const [shift, setShift] = useState(null) // Stores shift details, initially null
    // Function to fetch all location data by client ID (organization ID)
    const getAllLocationByClientId = () => {
        // API call to get all locations based on organization ID
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLocationData(res.data)
                        setLoading(false)
                        setLoactionShiftDtos(res.data && res.data.map((e) => e.shiftDTos))
                    }
                },
            )
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }
    // Function to get currency and organization country details
    const onGetCurrencyHandler = () => {
        // API call to fetch organization countries
        getAllById({
            entity: 'organizationCountry',
            id: userDetails.organizationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    const filteredCountries = res.data.filter((country) => !country.deleted)
                    setCountries(filteredCountries)
                    getAllEmployeeById(filteredCountries)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    // Function to fetch the list of departments for the organization
    const onDepartmentsHandler = () => {
        // Make an API call to get all departments based on the organization's ID
        getAllById({
            entity: 'departments', // Entity name is "departments"
            id: userDetails.organizationId // Use the organization ID from user details
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    // If the response status code is 200 (success)
                    setDepartmentList(res.data) // Set the department list from the response data
                }
            })
            .catch((err) => {
                console.log(err) // If there is an error, log it to the console
            })
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // Email regex pattern to validate email addresses
    // Handle input changes in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target

        setFormData({ ...formData, [name]: value })
        const errors = validate({ ...formData, [name]: value === '' ? null : value })
        // Validation for phone number
        if (name === 'phoneNumber') {
            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
                return
            }
            let value1 = '+' + countryIsdCode + value
            const phoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)
            if (phoneNumber && phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' })
            }
        }
        // Validation for alternate phone number
        else if (name === 'alternatePhoneNumber') {
            let value1 = '+' + aCountryIsdCode + value
            const phoneNumber = parsePhoneNumberFromString(value1, aCountryIsoCode)
            if (!value) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else if (phoneNumber && !phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: 'Invalid' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }
        // Validation for email
        else if (name == 'email') {
            if (value && !emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
            // Validation for alternate email
        } else if (name == 'alternateEmail') {
            if (value && !emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        } else {
            // Handle other inputs
            if (errors[name]) {
                setFormErrors({ ...formErrors, [name]: errors[name] })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }
    }
    // Function to handle file selection from input
    const handleFileSelect = (e) => {
        const profile = e.target.files[0]
        let img = new Image()
        img.src = e.target.files[0] && window.URL.createObjectURL(e.target.files[0])
        img.onload = () => {
            if (img.width < img.height) {
                if (e.target.files.length > 0 && e.target.files[0].size > 500000) {
                    // toast.error("size is more then 100kb")
                    setFormErrors({
                        ...formErrors,
                        photoSize: 'File size should not exceed more than 500kb'
                    })
                    setPhoto(null)
                } else {
                    setFormErrors({ ...formErrors, photoSize: '' })
                }
            } else {
                setFormErrors({
                    ...formErrors,
                    photoSize: 'Height and width ratio should be 2:1'
                })
            }
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!allowedTypes.includes(profile.type)) {
            setFormErrors({
                ...formErrors,
                photoSize: 'Please slect JPEG/PNG/JPG file'
            })
        }
        setPhoto(e.target.files[0])
        setChange(false)
    }
    // Function to handle file upload (called after selection)
    const handleFileUpload = () => {
        let img = new Image()
        img.src = photo && window.URL.createObjectURL(photo)
        img.onload = () => {
            if (img.width < img.height) {
                if (photo && photo.size > 500000) {
                    setFormErrors({
                        ...formErrors,
                        photoSize: 'Please select another file'
                    })
                } else {
                    setShowModal(false)
                }
            } else {
                setFormErrors({
                    ...formErrors,
                    photoSize: 'Height and width ratio should be 2:1'
                })
            }
        }
    }

    // Function to handle currency selection for 'A' (Alternate?) country
    const AHandleCurrencySelection = (option) => {
        // Set error for aCountryId if no option is selected, otherwise clear the error
        setFormErrors({
            ...formErrors,
            aCountryId: !option ? 'Required' : ''
        })
        setACountryId(option.value)
        setFormData({ ...formData, alternateCountryId: option.value }) //#1608: Update formData with the selected alternate country ID
        setACountryIsoCode(option.label)
        setACountryIsdCode(option.isdCode)
        setChange(false)
    }


    // Transform the list of countries into options for a dropdown/select component
    const countriesOptions = countries
        ? countries.map((option) => ({
            value: option.countryId,
            label: option.isoCode + '+' + option.isdCode,
            isdCode: option.isdCode
        }))
        : []

    const [marriageStatusDate, setMarriageStatusDate] = useState(null)
    const [maritalStatusDto, setMaritalStatusDto] = useState([]) // State to store list of marital status objects (likely from an API)
    const [maritalStatusName, setMaritalStatusName] = useState('') // State to store the name of the selected marital status
    const [maritalStatus, setMaritalStatus] = useState() // State to store the selected marital status (could be ID or object)
    const maritalStatusHistoryName =
        maritalStatusDto && maritalStatusDto[maritalStatusDto.length - 1]
    const [jobRoleDtos, setJobRoleDtos] = useState([]) // State to store list of job role objects (likely from an API)
    const [jobRoleName, setJobRoleName] = useState('') // State to store the name of the selected job role
    const jobRoleLastHistoryName = jobRoleDtos && jobRoleDtos[jobRoleDtos.length - 1]
    const [shiftsDtos, setShiftsDtos] = useState([]) // State to store list of shift details
    const shiftLastHistoryName = shiftsDtos && shiftsDtos[shiftsDtos.length - 1]

    const [getAllData, setGetAllData] = useState([]) // State to store all fetched data (possibly form data or user details)
    const [referenceGet, setReferenceGet] = useState([]) // State to store reference-related data
    const [skillGet, setSkillget] = useState([]) // State to store skill-related data
    const [experienceGet, setExperienceGet] = useState([]) // State to store experience-related data
    const [educationGet, setEducationGet] = useState([]) // State to store education-related data
    const [idproofGet, setIdproofGet] = useState([]) // State to store ID proof-related data
    const [familyGet, setFamilyGet] = useState([]) // State to store family-related data
    const [addressGet, setAddressGet] = useState([]) // State to store address-related data
    const [managerGet, setManagerGet] = useState([]) // State to store manager-related data

    const [templateId, setTemplateId] = useState() // State to store the selected template ID
    const [action, setAction] = useState('') // State to track current action (e.g., 'edit', 'view', etc.)
    const [ctc, setCtc] = useState(null) // State to store the CTC (Cost to Company) value as a string

    const [showModal, setShowModal] = useState(false) // State to control visibility of a modal (e.g., popup or form modal)
    const [heading, setHeading] = useState('') // State to store the heading/title for a modal or section

    // Function to open/show a modal with a specific heading and action mode
    const onShowModal = (headingname, mode) => {
        if (
            ['Location', 'Marital History', 'Job Role'].includes(headingname) &&
            dateOfJoining == null
        ) {
            setShowModal(false)
            setFormErrors({
                ...formErrors,
                popupDtos: 'Please Add Date Of Joining',
                dateOfJoining: 'Required' // Set error message if no date is selected
            })
        } else {
            setShowModal(true)
            setAction(mode)
            setHeading(headingname)
        }
    }
    // Function to handle closing of the modal based on the context (heading name)
    const onShowModalCloseHandler = (e) => {
        if (e == 'Job Role') {
            setShowModal(false)
            setJobRole()
            setFormErrors({})
        } else if (e == 'Marital History') {
            setShowModal(false)
            setMaritalStatus()
            setFormErrors({})
        } else if (e == 'Employee Shifts') {
            setShowModal(false)
            setShift()
            setFormErrors({})
        } else if (e == 'Change Photo') {
            setShowModal(false)
            setPhoto(null)
            setFormErrors({})
        } else {
            setShowModal(false)
        }
    }

    const [orgDate, setOrgDate] = useState('') // State to store the organization's foundation date
    // Function to fetch organization details by ID (without organization context in the request)
    const getByOrgId = () => {
        // API call to fetch organization data using the organization ID
        getByIdwithOutOrg({ entity: 'organizations', id: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    setOrgDate(res.data ? res.data.foundationDate : '')
                    setLoading(false)
                }
            })
            .catch((err) => {
                console.log(err, 'err')
                setLoading(false)
            })
    }

    const [dateOfBirth, setDateOfBirth] = useState(null) // State to store the selected date of birth
    // Function to handle the selection of date of birth
    const handleDateOfBirth = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setChange(false)
        setDateOfBirth(selectedDate)
        setFormData({ ...formData, dateOfBirth: selectedDate }) //#1608: Update formData with the selected date of birth
        // Calculate the user's age based on the current date and selected date of birth
        let today = new Date(dateOfJoining || new Date()) // Get today's date or the date of joining if available
        let birthDate = new Date(selectedDate)
        let age = today.getFullYear() - birthDate.getFullYear()
        let m = today.getMonth() - birthDate.getMonth()
        // Adjust age if the current date is before the birthday in the current year
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        // If the age is less than 18, show an error message and reset the date of birth
        if (age < 18) {
            toast.error('You must be at least 18 years old to register.')
            setDateOfBirth(null)
            setFormData({ ...formData, dateOfBirth: null }) //#1608: Reset date of birth in formData
        }
    }

    const [dateOfJoining, setDateOfJoining] = useState(null) // State to store the selected date of joining
    // Function to handle the selection of date of joining
    const handleDateOfJoining = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setDateOfJoining(selectedDate)
        setFormData({ ...formData, dateOfJoining: selectedDate }) //#1608: Update formData with the selected date of joining
        // Calculate the minimum allowed date of joining (18 years after the date of birth)
        const allowedDateOfJoining = new Date(dateOfBirth)
        allowedDateOfJoining.setFullYear(allowedDateOfJoining.getFullYear() + 18)
        const doj = moment(allowedDateOfJoining).format('YYYY-MM-DD')
        setFormErrors({
            ...formErrors,
            popupDtos: ''
        })
        // Check if the selected date of joining is before the organization foundation date
        if (selectedDate < orgDate) {
            toast.error('Join date must not precede foundation date')
            setDateOfJoining(null)
            // Check if the selected date of joining is before the minimum 18 years gap between birth and joining
        } else if (selectedDate < doj) {
            toast.error('Required minimum 18 years gap between birth and join dates')
            setDateOfJoining(null)
            setFormData({ ...formData, dateOfJoining: null }) //#1608: Reset date of joining in formData
        }
    }

    const [genderList, setGenderList] = useState([]) // State to store the list of gender options fetched from the organization
    // Function to fetch all gender data for the current organization
    const getAllGenderData = () => {
        // API call to fetch gender data by organization ID
        getAllByOrgId({ entity: 'gender', organizationId: userDetails.organizationId }).then(
            (res) => {
                if (res.statusCode == 200) {
                    setGenderList(res.data)
                    setLoading(false)
                }
            }
        )
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }
    const [gender, setgender] = useState() // State to store the selected gender value

    // Function to handle the selection of a gender option
    const handleGenderSelection = (selection) => {
        setgender(selection.value)
        setChange(false)
        setFormData({ ...formData, genderId: selection.value, genderName: selection.label }) //#1608: Update formData with the selected
    }
    // Map the genderList to create gender options for a dropdown/select component
    const genderOptions = genderList
        ? genderList.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : [] // If genderList is empty, return an empty array (no options)

    const [loading, setLoading] = useState(true) // State to track loading status (initially set to true while data is being fetched)
    const [locationDtos, setLocationDtos] = useState([]) // State to store the list of location data (DTOs)

    // Array of category options (e.g., Mr., Ms., Mrs.) for title selection
    const categoryOptions = [
        { label: 'Mr.', value: 'Mr.' },
        { label: 'Ms.', value: 'Ms.' },
        { label: 'Mrs.', value: 'Mrs.' }
    ]
    const [bloodGroup, setBloodGroup] = useState('') // State to store the selected blood group
    const [title, setTitle] = useState('') // State to store the selected title
    // Function to handle selection of a title from the category options
    const handleCategorySelection = (selection) => {
        setTitle(selection.value)
        setChange(false)
        setFormData({ ...formData, title: selection.value }) //#1608: Update formData with the selected title
    }

    const [employeeTypeName, setEmployeeTypeName] = useState('') // State to store the name of the selected employee type

    // Function to fetch employee's personal details by ID and handle the response
    const getAllEmployeeById = (filteredCountries) => {
        // API call to fetch employee personal details based on the organization and employee ID
        getEmployeePersonalDetails({
            organizationId: userDetails.organizationId,
            employeeId: userDetails.employeeId
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setGetAllData(res.data && res.data)
                setMaritalStatusDto(
                    res.data && res.data.martialStatusDTOs == null ? [] : res.data.martialStatusDTOs
                )
                setAddressGet(res.data ? res.data.addressDTOs : [])
                setEducationGet(res.data ? res.data.educationDTOs : [])
                setExperienceGet(res.data ? res.data.experienceDTOs : [])
                setFamilyGet(res.data ? res.data.familyDTOs : [])
                setEmployeeType(res.data && res.data.employmentTypeId)
                setReferenceGet(res.data ? res.data.referenceDTOs : [])
                setSkillget(res.data ? res.data.skillDTOs : [])
                setBloodGroup(res.data && res.data.bloodGroup) // Set blood group from response or default to empty string
                setIdproofGet(res.data ? res.data.idProofDTOs : [])
                setManagerGet(res.data ? res.data.reportingmanagerDTOs : [])
                setMaritalStatus(res.data && res.data.maritalStatus)
                setJobRoleDtos(res.data && res.data.jobRoleDTOs == null ? [] : res.data.jobRoleDTOs)
                setShiftsDtos(res.data && res.data.shiftDTOs == null ? [] : res.data.shiftDTOs)
                setLocationDtos(
                    res.data && res.data.locationDTOs == null ? [] : res.data.locationDTOs
                )
                setTemplateId(res.data && res.data.templateId)
                setMarriageStatusDate(res.data && res.data.latestMaritalStatus)
                setTitle(res.data && res.data.title)
                setgender(res.data && res.data.genderId)
                setDateOfBirth(res.data && res.data.dateOfBirth)
                setCtc(res.data && res.data.ctc)
                setFormData(res.data && res.data)
                setDateOfJoining(res.data && res.data.dateOfJoining)
                setEmployeeTypeName(res.data && res.data.employmentTypeName)
                setContractToDate(res.data && res.data.contractEndDate)
                // getLocation(res.data && res.data.locationId)
                setMarriageDate(res.data ? res.data.marriageDate : null)
                const matchedCountry =
                    filteredCountries &&
                    filteredCountries.find((country) => country.countryId === res.data.countryId)
                setCountryId(res.data && res.data.countryId)
                if (matchedCountry) {
                    setCountryIsoCode(matchedCountry.isoCode + '+' + matchedCountry.isdCode)
                    setCountryIsdCode(matchedCountry.isdCode)
                }
                const aMatchedCountry =
                    filteredCountries &&
                    filteredCountries.find(
                        (country) => country.countryId === res.data.alternateCountryId
                    )
                setACountryId(res.data.alternateCountryId)
                if (aMatchedCountry) {
                    setACountryIsoCode(aMatchedCountry.isoCode + '+' + aMatchedCountry.isdCode)
                    setACountryIsdCode(aMatchedCountry.isdCode)
                }
            }
        })
            .catch((err) => {
                console.log(err, 'error')
                setLoading(false)
            })
    }

    // Function to handle key down events (used to restrict certain key presses)
    const handleKeyDown = (event) => {
        const { value } = event.target
        const key = event.key

        // Allow control keys like Backspace, Arrow keys, Tab, etc.
        if (
            key === 'Backspace' ||
            key === 'Tab' ||
            key === 'ArrowLeft' ||
            key === 'ArrowRight' ||
            key === 'Delete' ||
            key === 'Home' ||
            key === 'End'
        ) {
            return
        }

        // Allow only digits and optionally one dot
        if (isNaN(Number(key)) && key !== '.') {
            event.preventDefault()
            return
        }

        // Prevent multiple decimal points
        if (key === '.' && value.includes('.')) {
            event.preventDefault()
            return
        }

        // Check length limit for values without a decimal point
        if (value.length >= 3 && !value.includes('.') && key !== '.') {
            event.preventDefault()
            return
        }

        // Predict next value and block if it would exceed 200
        const predictedValue = value + key
        if (Number(predictedValue) > 200) {
            event.preventDefault()
        }
    }
    const [employeeType, setEmployeeType] = useState() // State to hold the employee type value (selected option)

    const [employeeTypeData, setEmployeeTypeData] = useState([]) // State to store all employee type data fetched from the API
    // useEffect hook to call the API and fetch employee types when the component mounts
    useEffect(() => {
        getAllEmployeeTypes()
    }, [])

    // Function to fetch all employee types from the organization API
    const getAllEmployeeTypes = () => {
        // API call to fetch employee types by organization ID
        getAllByOrgId({
            entity: 'employmenttypes',
            organizationId: userDetails.organizationId
        }).then((res) => {
            setEmployeeTypeData(res.data)
            setLoading(false)
        })
            .catch((err) => {
                console.log(err, 'error')
                setLoading(false)
            })
    }
    // Map through the employeeTypeData to create a list of options for a dropdown or select component
    const employeeOptions = employeeTypeData
        ? employeeTypeData.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : []
    // Function to handle the selection of an employee type from the dropdown/select
    const handleEmployeeSelection = (selection) => {
        setContractToDate(null)
        setChange(false)
        setEmployeeTypeName(selection.label) // Sets the name of the selected employee type
        setEmployeeType(selection.value)
        setFormData({
            ...formData,
            employmentTypeId: selection.value,
            employmentTypeName: selection.label
        }) //#1608: Update formData with the selected employee type ID
    }

    const [pfType, setPfType] = useState({ value: 1, label: 'Percentage' }) // State to manage the type of provident fund (PF), with a default value of "Percentage"
    // Validation function to check if the form values are valid
    const validate = (values) => {
        const errors = {}
        if (!values.code) {
            errors.code = 'Required'
        }
        if (dateOfBirth == null) {
            errors.dateOfBirth = 'Required'
        }
        if (dateOfJoining == null) {
            errors.dateOfJoining = 'Required'
        }
        if (values.employmentTypeId == null) {
            errors.employmentTypeId = 'Required'
        }

        if (gender == undefined || null) {
            errors.gender = 'Required'
        }

        if (!values.noticePeriodDays) {
            errors.noticePeriodDays = 'Required'
        }
        return errors
    }
    const bloodGroupOptions = [
        { label: 'A+', value: 'A+' },
        { label: 'A-', value: 'A-' },
        { label: 'B+', value: 'B+' },
        { label: 'B-', value: 'B-' },
        { label: 'AB+', value: 'AB+' },
        { label: 'AB-', value: 'AB-' },
        { label: 'O+', value: 'O+' },
        { label: 'O-', value: 'O-' },
        { label: 'Others', value: 'Others' }
    ]

    const handleBloodGroupSelection = (selection) => {
        setChange(false)
        setBloodGroup(selection.value) // Sets the selected blood group
    }


    const [contractToDate, setContractToDate] = useState(null) // State to store the contract end date


    // Handler function to update the employee details
    const onUpdateHandler = () => {
        // Modify the files data by ensuring each file has a valid file ID (if missing, set it to null)
        const modifiedEduList = educationGet
            ? educationGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null
                }))
            }))
            : []

        const modifiedExpList = experienceGet
            ? experienceGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null
                }))
            }))
            : []

        const modifiedIdProofList = idproofGet
            ? idproofGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null
                }))
            }))
            : []

        // Create an object that holds all the employee data to be updated
        const objAll = {
            id: userDetails.employeeId,
            organizationId: userDetails.organizationId,
            code: formData.code ? formData.code : getAllData.code,
            email: formData.email ? formData.email : getAllData.email,
            firstName: getAllData && getAllData.firstName,
            middleName: formData.middleName,
            lastName: getAllData && getAllData.lastName,
            alternateEmail: formData.alternateEmail,
            dateOfBirth: dateOfBirth ? dateOfBirth : getAllData.dateOfBirth,
            dateOfJoining: dateOfJoining ? dateOfJoining : getAllData.dateOfJoining,
            jobRoleDTOs: jobRoleDtos ? jobRoleDtos : [],
            departmentId: formData && formData.departmentId,
            title: title,
            status: getAllData && getAllData.status,
            phoneNumber: getAllData && getAllData.phoneNumber,
            alternatePhoneNumber: formData.alternatePhoneNumber,
            locationDTOs: locationDtos ? locationDtos : [],
            nationality: formData.nationality,
            ctc: getAllData && getAllData.ctc,
            martialStatusDTOs: maritalStatusDto ? maritalStatusDto : [],
            marriageDate: marriageStatusDate != 'Married' ? null : marriageDate,
            noOfChildren: formData.noOfChildren,
            noticePeriodDays: formData.noticePeriodDays
                ? formData.noticePeriodDays
                : getAllData && getAllData.noticePeriodDays,
            placeOfBirth: formData.placeOfBirth,
            genderId: gender ? gender : getAllData.genderId,
            allergies: formData.allergies,
            employmentTypeId: employeeType ? employeeType : getAllData.employmentTypeId,
            bloodGroup: bloodGroup != 'Others' ? bloodGroup : formData.bloodGroup,
            templateId: getAllData && getAllData.templateId,
            shiftDTOs: shiftsDtos ? shiftsDtos : [],
            // locationId: getAllData && getAllData.locationId,
            photo: getAllData && getAllData.photo,
            pfPreference: pfType ? pfType : getAllData.pfPreference,
            physicallyChallenged: getAllData.physicallyChallenged,
            previousEarningsDTO: getAllData.previousEarningsDTO,
            esiNumber: formData.esiNumber ? formData.esiNumber : getAllData.esiNumber,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber
                ? formData.accountNumber
                : getAllData.accountNumber,
            pfNumber: formData.pfNumber ? formData.pfNumber : getAllData.pfNumber,
            panNumber: formData.panNumber ? formData.panNumber : getAllData.panNumber,
            pfUan: formData.pfUan ? formData.pfUan : getAllData.pfUan,
            addressDTOs: addressGet ? addressGet : [],
            educationDTOs: modifiedEduList ? modifiedEduList : [],
            experienceDTOs: modifiedExpList ? modifiedExpList : [],
            familyDTOs: familyGet ? familyGet : [],
            idProofDTOs: modifiedIdProofList ? modifiedIdProofList : [],
            skillDTOs: skillGet ? skillGet : [],
            reportingmanagerDTOs: managerGet ? managerGet : [],
            referenceDTOs: referenceGet ? referenceGet : [],
            countryId: countryId,
            alternateCountryId: aCountryId ? aCountryId : null,
            contractEndDate: contractToDate,
            clientName: getAllData.clientName
        }
        let value1 = '+' + aCountryIsdCode + objAll.alternatePhoneNumber
        const alternatePhoneNumber = parsePhoneNumberFromString(value1, aCountryIsoCode)
        // #1608: objAll is replace with formData

        console.log(objAll, 'objAll')
        if (
            updateValidation(getAllData, formData) &&
            compareArrayOfObjects(getAllData.shiftDTOs, shiftsDtos) &&
            change &&
            compareArrayOfObjects(getAllData.jobRoleDTOs, jobRoleDtos) &&
            compareArrayOfObjects(getAllData.martialStatusDTOs, maritalStatusDto) &&
            compareArrayOfObjects(getAllData.locationDTOs, locationDtos) &&
            compareArrayOfObjects(getAllData.addressDTOs, addressGet) &&
            compareArrayOfObjects(getAllData.educationDTOs, modifiedEduList) &&
            compareArrayOfObjects(getAllData.experienceDTOs, modifiedExpList) &&
            compareArrayOfObjects(getAllData.familyDTOs, familyGet) &&
            compareArrayOfObjects(getAllData.idProofDTOs, modifiedIdProofList) &&
            compareArrayOfObjects(getAllData.skillDTOs, skillGet) &&
            compareArrayOfObjects(getAllData.reportingmanagerDTOs, managerGet) &&
            compareArrayOfObjects(getAllData.referenceDTOs, referenceGet)
        ) {
            toast.info('No changes made to update.')
        } else if (Object.keys(cleanedFormErrors).length > 0) {
            setLoading(false)
        } else if (!emailRegex.test(formData.email)) {
            toast.error('Invalid email format')
        } else if (!objAll.title) {
            toast.error('Please select title.') // Title is required
        } else if (!formData.noticePeriodDays) {
            setFormErrors(validate(objAll))
        } else if (
            objAll.alternateEmail != undefined &&
            objAll.alternateEmail != '' &&
            !emailRegex.test(objAll.alternateEmail)
        ) {
            toast.error('Invalid alternate email format')
        } else if (objAll.alternatePhoneNumber && objAll.alternatePhoneNumber.length <= 1) {
            toast.error('Invalid alternate phone number')
        } else if (objAll.employmentTypeId == null) {
            setFormErrors(validate(objAll))
        } else if (!objAll.code) {
            setFormErrors(validate(objAll))
        } else if (objAll.dateOfBirth == null) {
            setFormErrors(validate(objAll))
        } else if (objAll.genderId == undefined || null) {
            setFormErrors(validate(objAll))
        } else if (objAll.dateOfJoining == null) {
            setFormErrors(validate(objAll))
        } else if (objAll.alternatePhoneNumber && !alternatePhoneNumber || alternatePhoneNumber && !alternatePhoneNumber.isValid()) {
            toast.error('Invalid alternate phone number')
        } else if (maritalStatusDto.length == 0) {
            toast.error('Please Select Marital Status')
        } else if (jobRoleDtos.length == 0) {
            toast.error('Please Select Job Role')
        }
        else {
            // Prepare FormData object to submit to the backend
            let empData = new FormData()
            // Append photo and selected files for education, experience, and ID proof
            photo && empData.append('photo', photo)
            const filteredFiles = educationSelectedFiles.filter((file) => file instanceof File)
            filteredFiles.forEach((file) => {
                empData.append('educationfiles', file)
            })

            const expFilteredFiles = experienceSelectedFiles.filter((file) => file instanceof File)
            expFilteredFiles.forEach((file) => {
                empData.append('experiencefiles', file)
            })

            const idpFilteredFiles = idproofSelectedFiles.filter((file) => file instanceof File)
            idpFilteredFiles.forEach((file) => {
                empData.append('idprooffiles', file)
            })
            // Append employee data as JSON
            empData.append('employees', JSON.stringify(objAll))
            // setLoading(true)
            // Call the backend service to update the employee data along with the files
            UpdateWithFile({
                entity: 'employees',
                organizationId: userDetails.organizationId,
                id: objAll.id,
                body: empData,
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        // setLoading(false)
                        toast.success('Updated successfully.')
                        // navigate("/")
                        getAllEmployeeById()
                        setChange(true)
                        location.reload() // Reload the page to reflect changes
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }
    const navigate = useNavigate() // Using the 'useNavigate' hook from React Router to allow navigation between pages
    // Defining a tooltip component which will display a message when the user hovers over an element
    const tooltip = <Tooltip id="tooltip">Click here to Update your photo</Tooltip>

    // Function to clean up form errors by removing any keys with empty string values
    const cleanFormErrors = (errors) => {
        const cleanedErrors = {}

        for (const key in errors) {
            const value = errors[key]
            if (value !== '') {
                // Convert camelCase key to Normal Case
                const normalKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                cleanedErrors[normalKey] = value
            }
        }

        return cleanedErrors
    }

    // Clean the form errors by removing any empty error values
    const cleanedFormErrors = cleanFormErrors(formErrors) // Apply the cleaning function on formErrors object

    // Create options for a dropdown or select input based on the department list
    const departmentOptions = departmentList.map((option) => ({
        value: option.id, // Set the department's ID as the value
        label: option.name // Set the department's name as the label
    }))

    const handleDepartMentSelect = (select) => {
        setChange(false)
      
        setFormData({ ...formData, departmentId: select.value, departmentName: select.label }) //#1758: Updates the form data with the selected department ID and name
    }

    return (
        <>
            {loading ? (
                <center>
                    <DetailLoader />{' '}
                </center>
            ) : (
                <div className="detailBackground">
                    {/* Input fileds for employee form */}
                    <section className="section ">
                        <div className="">
                            <div className="container ">
                                <div className="row mb-2">
                                    <div className="col-sm-12">
                                        <div className="row mb-2"></div>

                                        <Tabs activeKey={next} onSelect={updateStep}>
                                            <Tab
                                                className="tabText"
                                                eventKey={0}
                                                onClick={() => updateStep(0)}
                                                id="officialInformation"
                                                title="Official Information"
                                            >
                                                <section className="">
                                                    <div className="container-fluid">
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="">
                                                                    <PageHeader pageTitle="Employee Details" />
                                                                    <div>
                                                                        <>
                                                                            {' '}
                                                                            {userDetails.employeeId !=
                                                                                null && (
                                                                                    <div
                                                                                        style={{
                                                                                            display:
                                                                                                'flex',
                                                                                            marginLeft:
                                                                                                '44%'
                                                                                        }}
                                                                                    >

                                                                                        <div>


                                                                                            <EmployeeLeaveBalance
                                                                                                showAdd={
                                                                                                    true
                                                                                                }
                                                                                                employeeData={
                                                                                                    userDetails.employeeId
                                                                                                }
                                                                                                employee={
                                                                                                    getAllData
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                        &emsp; &ensp;
                                                                                        <div>
                                                                                            <EmployeeProjectDetails
                                                                                                employeeData={
                                                                                                    userDetails.employeeId
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                        </>
                                                                        <div className="card-body">
                                                                            <div
                                                                                style={{
                                                                                    marginTop: '5%',
                                                                                    marginLeft:
                                                                                        '38px'
                                                                                }}
                                                                            >
                                                                                <form>
                                                                                    <Row>
                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-0"
                                                                                                style={{
                                                                                                    marginTop:
                                                                                                        '10%'
                                                                                                }}
                                                                                                controlId="employeeLocation"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeLocation"
                                                                                                    column
                                                                                                    sm={
                                                                                                        5
                                                                                                    }
                                                                                                >
                                                                                                    Location{' '}
                                                                                                    <span className="error">
                                                                                                        *
                                                                                                    </span>
                                                                                                </Form.Label>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    <Form.Control
                                                                                                        id="employeeLocation"
                                                                                                        disabled={
                                                                                                            true
                                                                                                        }
                                                                                                        size="sm"
                                                                                                        value={
                                                                                                            getAllData &&
                                                                                                            getAllData.locationName
                                                                                                        }
                                                                                                    />
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-1"
                                                                                                controlId="employeePhoto"
                                                                                            //controlId="formGroupBranch"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    style={{
                                                                                                        marginTop:
                                                                                                            userDetails.employeeId !==
                                                                                                                null
                                                                                                                ? '10%'
                                                                                                                : '0%'
                                                                                                    }}
                                                                                                    column
                                                                                                    sm={
                                                                                                        4
                                                                                                    }
                                                                                                    id="employeePhoto"
                                                                                                >
                                                                                                    Photo
                                                                                                </Form.Label>

                                                                                                {formData.id ==
                                                                                                    null ? (
                                                                                                    <Col
                                                                                                        sm={
                                                                                                            6
                                                                                                        }
                                                                                                    >
                                                                                                        <Form.Control
                                                                                                            id="employeePhoto"
                                                                                                            type="file"
                                                                                                            size="sm"
                                                                                                            accept="image/jpg, image/jpeg, image/png"
                                                                                                            onChange={(
                                                                                                                event
                                                                                                            ) => {
                                                                                                                handleFileSelect(
                                                                                                                    event
                                                                                                                )
                                                                                                            }}
                                                                                                            name="file"
                                                                                                        />
                                                                                                        <p className="error">
                                                                                                            {formErrors &&
                                                                                                                formErrors.photoSize}

                                                                                                            <p
                                                                                                                style={{
                                                                                                                    textAlign:
                                                                                                                        'left',
                                                                                                                    fontSize:
                                                                                                                        '100%',
                                                                                                                    fontWeight:
                                                                                                                        '500',
                                                                                                                    color: '#374681'
                                                                                                                }}
                                                                                                            >
                                                                                                                {
                                                                                                                    ''
                                                                                                                }
                                                                                                                'Only
                                                                                                                JPEG,PNG
                                                                                                                and
                                                                                                                JPG
                                                                                                                are
                                                                                                                accepted'
                                                                                                            </p>
                                                                                                        </p>
                                                                                                    </Col>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <Col
                                                                                                            sm={
                                                                                                                4
                                                                                                            }
                                                                                                        >
                                                                                                            <OverlayTrigger
                                                                                                                id="employeePhoto"
                                                                                                                placement="bottom"
                                                                                                                overlay={
                                                                                                                    tooltip
                                                                                                                }
                                                                                                            >
                                                                                                                {/* <a></a>` */}
                                                                                                                {photo ||
                                                                                                                    getAllData.photo ? (
                                                                                                                    <img
                                                                                                                        src={
                                                                                                                            photo
                                                                                                                                ? URL.createObjectURL(
                                                                                                                                    photo
                                                                                                                                )
                                                                                                                                : userDetails.employeeId !==
                                                                                                                                null &&
                                                                                                                                `data:image/jpeg;base64,${getAllData.photo}`
                                                                                                                        }
                                                                                                                        style={{
                                                                                                                            height: '100px',
                                                                                                                            float: 'right'
                                                                                                                        }}
                                                                                                                        alt="please Upload Photo"
                                                                                                                        onClick={() =>
                                                                                                                            onShowModal(
                                                                                                                                'Change Photo',
                                                                                                                                'readOnly'
                                                                                                                            )
                                                                                                                        }
                                                                                                                    // type="button"
                                                                                                                    />
                                                                                                                ) : (
                                                                                                                    <img
                                                                                                                        src="/dist/Images/profileImage.png"
                                                                                                                        height={
                                                                                                                            '100px'
                                                                                                                        }
                                                                                                                        alt="image"
                                                                                                                        onClick={() =>
                                                                                                                            onShowModal(
                                                                                                                                'Change Photo',
                                                                                                                                'readOnly'
                                                                                                                            )
                                                                                                                        }
                                                                                                                    />
                                                                                                                )}
                                                                                                            </OverlayTrigger>
                                                                                                        </Col>
                                                                                                    </>
                                                                                                )}
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={Row}
                                                                                                className="mb-3"
                                                                                                controlId="employeeCode"
                                                                                            //controlId="formGroupCode"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeCode"
                                                                                                    column
                                                                                                    sm={
                                                                                                        5
                                                                                                    }
                                                                                                >
                                                                                                    Employee
                                                                                                    Code{' '}
                                                                                                    <span className="error">
                                                                                                        *
                                                                                                    </span>
                                                                                                </Form.Label>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    <Form.Control
                                                                                                        id="employeeCode"
                                                                                                        size="sm"
                                                                                                        required
                                                                                                        disabled={
                                                                                                            !userDetails.profileEditable &&
                                                                                                            getAllData.status ==
                                                                                                            'Active'
                                                                                                        }
                                                                                                        name="code"
                                                                                                        maxLength={
                                                                                                            50
                                                                                                        }
                                                                                                        onBlur={
                                                                                                            handleInputChange
                                                                                                        }
                                                                                                        onKeyDown={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            // Prevent the user from entering "+" or "-" symbols
                                                                                                            if (
                                                                                                                e.key ===
                                                                                                                '+' ||
                                                                                                                e.key ===
                                                                                                                '-' ||
                                                                                                                e.key ===
                                                                                                                '/' ||
                                                                                                                e.key ===
                                                                                                                '.' ||
                                                                                                                e.key ===
                                                                                                                ',' ||
                                                                                                                e.key ===
                                                                                                                '='
                                                                                                            ) {
                                                                                                                e.preventDefault()
                                                                                                            }
                                                                                                        }}
                                                                                                        defaultValue={
                                                                                                            getAllData &&
                                                                                                            getAllData.code
                                                                                                        }
                                                                                                        onChange={
                                                                                                            handleInputChange
                                                                                                        }
                                                                                                    />
                                                                                                    <p className="error">
                                                                                                        {
                                                                                                            formErrors.code
                                                                                                        }
                                                                                                    </p>
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-3"
                                                                                                controlId="employeeName"
                                                                                            //controlId="formGroupFirstName"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeName"
                                                                                                    column
                                                                                                    sm={
                                                                                                        4
                                                                                                    }
                                                                                                >
                                                                                                    First
                                                                                                    Name{' '}
                                                                                                    <span className="error">
                                                                                                        *
                                                                                                    </span>
                                                                                                </Form.Label>

                                                                                                <Col
                                                                                                    sm={
                                                                                                        2
                                                                                                    }
                                                                                                    style={{
                                                                                                        width: '109px'
                                                                                                    }}
                                                                                                >
                                                                                                    <Select
                                                                                                        size='sm'
                                                                                                        value={categoryOptions.filter(
                                                                                                            (
                                                                                                                e
                                                                                                            ) =>
                                                                                                                e.value ==
                                                                                                                title
                                                                                                        )}
                                                                                                        isDisabled={
                                                                                                            !userDetails.profileEditable
                                                                                                            &&
                                                                                                            getAllData.status ==
                                                                                                            'Active' &&
                                                                                                            getAllData.title !=
                                                                                                            null
                                                                                                        }
                                                                                                        placeholder=""
                                                                                                        maxLength={
                                                                                                            100
                                                                                                        }
                                                                                                        options={
                                                                                                            categoryOptions
                                                                                                        }
                                                                                                        onChange={
                                                                                                            handleCategorySelection
                                                                                                        }
                                                                                                    />
                                                                                                </Col>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        4
                                                                                                    }
                                                                                                    style={{
                                                                                                        marginLeft:
                                                                                                            '-15px'
                                                                                                    }}
                                                                                                >
                                                                                                    <Form.Control
                                                                                                        size='sm'
                                                                                                        disabled={
                                                                                                            true
                                                                                                        }
                                                                                                        value={
                                                                                                            getAllData &&
                                                                                                            getAllData.firstName
                                                                                                        }
                                                                                                    />
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <div className="col-6 mb-2">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-3"
                                                                                                controlId="employeeMiddleName"
                                                                                            //controlId="formGroupMiddleName"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeMiddleName"
                                                                                                    column
                                                                                                    sm={
                                                                                                        5
                                                                                                    }
                                                                                                >
                                                                                                    Middle
                                                                                                    Name
                                                                                                </Form.Label>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    <Form.Control
                                                                                                        id="employeeMiddleName"
                                                                                                        onChange={handleInputChange}
                                                                                                        size="sm"
                                                                                                        value={
                                                                                                            formData &&
                                                                                                            formData.middleName
                                                                                                        }

                                                                                                        name="middleName"
                                                                                                        maxLength={
                                                                                                            100
                                                                                                        }
                                                                                                    />
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-3"
                                                                                                controlId="employeeLastName"
                                                                                            //controlId="formGroupLastName"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeLastName"
                                                                                                    column
                                                                                                    sm={
                                                                                                        4
                                                                                                    }
                                                                                                >
                                                                                                    Last
                                                                                                    Name{' '}
                                                                                                    <span className="error">
                                                                                                        *
                                                                                                    </span>
                                                                                                </Form.Label>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    <Form.Control
                                                                                                        id="employeeLastName"
                                                                                                        disabled={
                                                                                                            true
                                                                                                        }
                                                                                                        size="sm"
                                                                                                        value={
                                                                                                            getAllData &&
                                                                                                            getAllData.lastName
                                                                                                        }
                                                                                                        maxLength={
                                                                                                            100
                                                                                                        }
                                                                                                    />
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-3"
                                                                                                controlId="employeeEmail"
                                                                                            //controlId="formGroupEmail"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeEmail"
                                                                                                    column
                                                                                                    sm={
                                                                                                        5
                                                                                                    }
                                                                                                >
                                                                                                    Email{' '}
                                                                                                    <span className="error">
                                                                                                        *
                                                                                                    </span>
                                                                                                </Form.Label>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    <Form.Control
                                                                                                        id="employeeEmail"
                                                                                                        size="sm"
                                                                                                        maxLength={
                                                                                                            50
                                                                                                        }
                                                                                                        disabled={
                                                                                                            !userDetails.profileEditable &&
                                                                                                            getAllData.status ==
                                                                                                            'Active'
                                                                                                        }
                                                                                                        required
                                                                                                        name="email"
                                                                                                        onBlur={
                                                                                                            handleInputChange
                                                                                                        }
                                                                                                        defaultValue={
                                                                                                            getAllData &&
                                                                                                            getAllData.email
                                                                                                        }
                                                                                                        onChange={
                                                                                                            handleInputChange
                                                                                                        }
                                                                                                    />
                                                                                                    <p className="error">
                                                                                                        {
                                                                                                            formErrors.email
                                                                                                        }
                                                                                                    </p>
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-3"
                                                                                                controlId="formGroupDateOfJoining"
                                                                                            //controlId="formGroupDateOfJoining"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="formGroupDateOfJoining"
                                                                                                    column
                                                                                                    sm={
                                                                                                        4
                                                                                                    }
                                                                                                >
                                                                                                    Date
                                                                                                    of
                                                                                                    Joining
                                                                                                    <span className="error">
                                                                                                        *
                                                                                                    </span>
                                                                                                </Form.Label>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    <DatePicker
                                                                                                        id="formGroupDateOfJoining"
                                                                                                        placeholder="Select Date"
                                                                                                        inputReadOnly={
                                                                                                            true
                                                                                                        }
                                                                                                        allowClear={
                                                                                                            false
                                                                                                        }
                                                                                                        onChange={
                                                                                                            handleDateOfJoining
                                                                                                        }
                                                                                                        disabled={
                                                                                                            !userDetails.profileEditable &&
                                                                                                            getAllData.status ==
                                                                                                            'Active'
                                                                                                        }
                                                                                                        disabledDate={(
                                                                                                            current
                                                                                                        ) => {
                                                                                                            const tomorrow =
                                                                                                                new Date(
                                                                                                                    dateOfBirth
                                                                                                                )
                                                                                                            tomorrow.setDate(
                                                                                                                tomorrow.getDate() +
                                                                                                                1
                                                                                                            )
                                                                                                            let customDate =
                                                                                                                moment(
                                                                                                                    tomorrow
                                                                                                                ).format(
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
                                                                                                        value={
                                                                                                            dateOfJoining ==
                                                                                                                null
                                                                                                                ? null
                                                                                                                : moment(
                                                                                                                    dateOfJoining
                                                                                                                )
                                                                                                        }
                                                                                                        required
                                                                                                        format={
                                                                                                            'DD-MM-YYYY'
                                                                                                        }
                                                                                                        size="sm"
                                                                                                        onBlur={(
                                                                                                            e
                                                                                                        ) =>
                                                                                                            !e
                                                                                                                .target
                                                                                                                .value
                                                                                                                ? setFormErrors(
                                                                                                                    {
                                                                                                                        ...formErrors,
                                                                                                                        dateOfJoining:
                                                                                                                            'Required'
                                                                                                                    }
                                                                                                                )
                                                                                                                : setFormErrors(
                                                                                                                    {
                                                                                                                        ...formErrors,
                                                                                                                        dateOfJoining:
                                                                                                                            ''
                                                                                                                    }
                                                                                                                )
                                                                                                        }
                                                                                                        name="dateOfJoining"
                                                                                                    />
                                                                                                    <p className="error">
                                                                                                        {
                                                                                                            formErrors.dateOfJoining
                                                                                                        }
                                                                                                    </p>
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-3"
                                                                                                controlId="formGroupEmployeeType"
                                                                                            //controlId="formGroupEmployeeType"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="formGroupEmployeeType"
                                                                                                    column
                                                                                                    sm={
                                                                                                        5
                                                                                                    }
                                                                                                >
                                                                                                    Employment
                                                                                                    Type
                                                                                                    <span className="error">
                                                                                                        *
                                                                                                    </span>
                                                                                                </Form.Label>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    <Select
                                                                                                        size='sm'
                                                                                                        id="formGroupEmployeeType"
                                                                                                        placeholder=""
                                                                                                        onChange={
                                                                                                            handleEmployeeSelection
                                                                                                        }
                                                                                                        options={
                                                                                                            employeeOptions
                                                                                                        }
                                                                                                        required
                                                                                                        isDisabled={
                                                                                                            !userDetails.profileEditable &&
                                                                                                            getAllData.status ==
                                                                                                            'Active'
                                                                                                        }
                                                                                                        onBlur={() =>
                                                                                                            !employeeType
                                                                                                                ? setFormErrors(
                                                                                                                    {
                                                                                                                        ...formErrors,
                                                                                                                        employmentTypeId:
                                                                                                                            'Required'
                                                                                                                    }
                                                                                                                )
                                                                                                                : setFormErrors(
                                                                                                                    {
                                                                                                                        ...formErrors,
                                                                                                                        employmentTypeId:
                                                                                                                            ''
                                                                                                                    }
                                                                                                                )
                                                                                                        }
                                                                                                        value={employeeOptions.filter(
                                                                                                            (
                                                                                                                e
                                                                                                            ) =>
                                                                                                                e.value ==
                                                                                                                employeeType
                                                                                                        )}
                                                                                                    />
                                                                                                    <p className="error">
                                                                                                        {
                                                                                                            formErrors.employmentTypeId
                                                                                                        }
                                                                                                    </p>
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>

                                                                                        <>
                                                                                            <div className="col-6">
                                                                                                <Form.Group
                                                                                                    as={
                                                                                                        Row
                                                                                                    }
                                                                                                    className="mb-"
                                                                                                    controlId="formGroupJobRole"
                                                                                                //controlId="formGroupMaritalStatus"
                                                                                                >
                                                                                                    <Form.Label
                                                                                                        id="formGroupJobRole"
                                                                                                        column
                                                                                                        sm={
                                                                                                            4
                                                                                                        }
                                                                                                    >
                                                                                                        Job
                                                                                                        Role
                                                                                                        <span className="error">
                                                                                                            *
                                                                                                        </span>
                                                                                                    </Form.Label>
                                                                                                    <Col
                                                                                                        sm={
                                                                                                            5
                                                                                                        }
                                                                                                        style={{
                                                                                                            marginTop:
                                                                                                                '10px'
                                                                                                        }}
                                                                                                    >
                                                                                                        <div>
                                                                                                            <span>
                                                                                                                {jobRoleName
                                                                                                                    ? jobRoleLastHistoryName &&
                                                                                                                    jobRoleLastHistoryName.jobRoleName
                                                                                                                    : getAllData.designation}
                                                                                                            </span>{' '}
                                                                                                            {getAllData.status ==
                                                                                                                'Terminated' ? (
                                                                                                                ''
                                                                                                            ) : (
                                                                                                                <span>
                                                                                                                    <a
                                                                                                                        className=""
                                                                                                                        id="formGroupJobRole"
                                                                                                                        style={{
                                                                                                                            fontWeight:
                                                                                                                                '600'
                                                                                                                        }}
                                                                                                                        onClick={() =>
                                                                                                                            onShowModal(
                                                                                                                                'Job Role',
                                                                                                                                'readOnly'
                                                                                                                            )
                                                                                                                        }
                                                                                                                    >
                                                                                                                        {jobRoleDtos.length !=
                                                                                                                            0 ? (
                                                                                                                            <ChangeIcon />
                                                                                                                        ) : (
                                                                                                                            <u>
                                                                                                                                Add
                                                                                                                                Job
                                                                                                                                Role
                                                                                                                            </u>
                                                                                                                        )}
                                                                                                                    </a>
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                        <p className="error">
                                                                                                            {
                                                                                                                formErrors.popupDtos
                                                                                                            }
                                                                                                        </p>
                                                                                                    </Col>
                                                                                                </Form.Group>
                                                                                            </div>

                                                                                            {
                                                                                                employeeTypeName && employeeTypeName.toLowerCase().includes("contract") && (
                                                                                                    <>
                                                                                                        <div className="col-6">
                                                                                                            <Form.Group
                                                                                                                as={Row}
                                                                                                                className="mb-3"
                                                                                                                controlId="employeeEmploymentType" // Unique ID for the Employment Type form group
                                                                                                            //controlId="formGroupEmployeeType"
                                                                                                            >
                                                                                                                <Form.Label
                                                                                                                    id="employeeEmploymentType"
                                                                                                                    column sm={5}
                                                                                                                >
                                                                                                                    Client Name
                                                                                                                    {' '}
                                                                                                                </Form.Label>
                                                                                                                <Col sm={6}>
                                                                                                                    <Form.Control
                                                                                                                        size='sm'
                                                                                                                        readOnly={true}
                                                                                                                        value={getAllData && getAllData.clientName}
                                                                                                                    />
                                                                                                                </Col>
                                                                                                            </Form.Group>
                                                                                                        </div>

                                                                                                        <div className="col-6">
                                                                                                            <Form.Group
                                                                                                                as={Row}
                                                                                                                className="mb-3"
                                                                                                                controlId="employeeEmploymentType" // Unique ID for the Employment Type form group
                                                                                                            //controlId="formGroupEmployeeType"
                                                                                                            >
                                                                                                                <Form.Label
                                                                                                                    id="employeeEmploymentType"
                                                                                                                    column sm={4}
                                                                                                                >
                                                                                                                    Contract To Date
                                                                                                                    {' '}
                                                                                                                </Form.Label>
                                                                                                                <Col sm={6}
                                                                                                                >
                                                                                                                    <Form.Control
                                                                                                                        size='sm'
                                                                                                                        disabled={true}
                                                                                                                        value={contractToDate == null ? '' : moment(contractToDate, 'YYYY-MM-DD').format('DD-MM-YYYY')
                                                                                                                        }
                                                                                                                    />
                                                                                                                </Col>
                                                                                                            </Form.Group>
                                                                                                        </div>
                                                                                                    </>
                                                                                                )
                                                                                            }

                                                                                            <div className="col-6">
                                                                                                <Form.Group
                                                                                                    as={
                                                                                                        Row
                                                                                                    }
                                                                                                    className="mb-3"
                                                                                                    controlId="formGroupDepartment"
                                                                                                // controlId="formGroupDepartment"
                                                                                                >
                                                                                                    <Form.Label
                                                                                                        id="formGroupDepartment"
                                                                                                        column
                                                                                                        sm={
                                                                                                            5
                                                                                                        }
                                                                                                    >
                                                                                                        Department
                                                                                                    </Form.Label>
                                                                                                    <Col
                                                                                                        sm={
                                                                                                            6
                                                                                                        }
                                                                                                    >
                                                                                                        {/* <Form.Control
                                                                                                            id="formGroupDepartment"
                                                                                                            disabled={
                                                                                                                true
                                                                                                            }
                                                                                                            size="sm"
                                                                                                            value={
                                                                                                                getAllData &&
                                                                                                                getAllData.departmentName
                                                                                                            }
                                                                                                        /> */}
                                                                                                        <Select
                                                                                                            id="employeeDepartment" // Unique ID for the Department select input
                                                                                                            size="sm"
                                                                                                            // defaultValue={
                                                                                                            //   getAllData && getAllData.department
                                                                                                            // }
                                                                                                            value={departmentOptions.filter(
                                                                                                                (
                                                                                                                    e
                                                                                                                ) =>
                                                                                                                    e.value ==
                                                                                                                    formData.departmentId
                                                                                                            )}
                                                                                                            options={
                                                                                                                departmentOptions
                                                                                                            }
                                                                                                            onChange={
                                                                                                                handleDepartMentSelect
                                                                                                            }
                                                                                                            name="department"
                                                                                                        />
                                                                                                    </Col>
                                                                                                </Form.Group>
                                                                                            </div>

                                                                                            <div className="col-6">
                                                                                                <Form.Group
                                                                                                    as={
                                                                                                        Row
                                                                                                    }
                                                                                                    className="mb-3"
                                                                                                    controlId="formGroupNoticeperiodDays"
                                                                                                //controlId="formGroupNoticePeriodDays"
                                                                                                >
                                                                                                    <Form.Label
                                                                                                        id="formGroupNoticeperiodDays"
                                                                                                        column
                                                                                                        sm={
                                                                                                            4
                                                                                                        }
                                                                                                    >
                                                                                                        Notice
                                                                                                        Period{' '}
                                                                                                        <span className="error">
                                                                                                            *
                                                                                                        </span>
                                                                                                    </Form.Label>
                                                                                                    <Col
                                                                                                        sm={
                                                                                                            6
                                                                                                        }
                                                                                                    >
                                                                                                        <Form.Control
                                                                                                            id="formGroupNoticeperiodDays"
                                                                                                            max={
                                                                                                                200
                                                                                                            }
                                                                                                            onKeyPress={
                                                                                                                handleKeyDown
                                                                                                            }
                                                                                                            onChange={
                                                                                                                handleInputChange
                                                                                                            }
                                                                                                            required
                                                                                                            size="sm"
                                                                                                            disabled={
                                                                                                                !userDetails.profileEditable &&
                                                                                                                getAllData.status ==
                                                                                                                'Active'
                                                                                                            }
                                                                                                            type="number"
                                                                                                            lassName="eliminateControls"
                                                                                                            value={
                                                                                                                formData.noticePeriodDays ||
                                                                                                                ''
                                                                                                            }
                                                                                                            defaultValue={
                                                                                                                getAllData &&
                                                                                                                getAllData.noticePeriodDays
                                                                                                            }
                                                                                                            placeholder="days"
                                                                                                            name="noticePeriodDays"
                                                                                                        />
                                                                                                        <p className="error">
                                                                                                            {
                                                                                                                formErrors.noticePeriodDays
                                                                                                            }
                                                                                                        </p>
                                                                                                    </Col>
                                                                                                </Form.Group>
                                                                                            </div>
                                                                                            <div className="col-6">
                                                                                                <Form.Group
                                                                                                    as={
                                                                                                        Row
                                                                                                    }
                                                                                                    className="mb-3"
                                                                                                    controlId="formGroupStatus"
                                                                                                // controlId="formGroupStatus"
                                                                                                >
                                                                                                    <Form.Label
                                                                                                        id="formGroupStatus"
                                                                                                        column
                                                                                                        sm={
                                                                                                            5
                                                                                                        }
                                                                                                    >
                                                                                                        Status
                                                                                                    </Form.Label>
                                                                                                    <Col
                                                                                                        id="formGroupStatus"
                                                                                                        sm={
                                                                                                            4
                                                                                                        }
                                                                                                        style={{
                                                                                                            marginTop:
                                                                                                                '10px'
                                                                                                        }}
                                                                                                    >
                                                                                                        <div>
                                                                                                            <span>
                                                                                                                {getAllData &&
                                                                                                                    getAllData.status}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </Col>
                                                                                                </Form.Group>
                                                                                            </div>

                                                                                            <div className="col-6">
                                                                                                <Form.Group
                                                                                                    as={
                                                                                                        Row
                                                                                                    }
                                                                                                    className="mb-3"
                                                                                                    controlId="formGroupShiftTimings"
                                                                                                >
                                                                                                    <Form.Label
                                                                                                        id="formGroupShiftTimings"
                                                                                                        column
                                                                                                        sm={
                                                                                                            4
                                                                                                        }
                                                                                                    >
                                                                                                        Shift
                                                                                                        Timings
                                                                                                    </Form.Label>
                                                                                                    <Col
                                                                                                        sm={
                                                                                                            6
                                                                                                        }
                                                                                                        style={{
                                                                                                            marginTop:
                                                                                                                '10px'
                                                                                                        }}
                                                                                                    >
                                                                                                        <div>
                                                                                                            {shiftName
                                                                                                                ? shiftLastHistoryName &&
                                                                                                                shiftLastHistoryName.shiftName
                                                                                                                : getAllData.shiftName ||
                                                                                                                'Regular Shift Hours'}{' '}
                                                                                                            {getAllData.status ==
                                                                                                                'Terminated' ? (
                                                                                                                ''
                                                                                                            ) : (
                                                                                                                <span>
                                                                                                                    <a
                                                                                                                        className=""
                                                                                                                        id="formGroupShiftTimings"
                                                                                                                        style={{
                                                                                                                            fontWeight:
                                                                                                                                '600'
                                                                                                                        }}
                                                                                                                        onClick={() =>
                                                                                                                            onShowModal(
                                                                                                                                'Employee Shifts',
                                                                                                                                'readOnly'
                                                                                                                            )
                                                                                                                        }
                                                                                                                    >
                                                                                                                        <ChangeIcon />
                                                                                                                    </a>
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </Col>
                                                                                                </Form.Group>
                                                                                            </div>
                                                                                            <div className="col-6">
                                                                                                <Manager
                                                                                                    dateOfJoining={
                                                                                                        dateOfJoining}
                                                                                                    getAllData={
                                                                                                        getAllData
                                                                                                    }
                                                                                                    employeeData={
                                                                                                        userDetails.employeeId
                                                                                                    }
                                                                                                    setManagerGet={
                                                                                                        setManagerGet
                                                                                                    }
                                                                                                    employeeProfile={
                                                                                                        true
                                                                                                    }
                                                                                                    managerList={
                                                                                                        managerGet
                                                                                                            ? managerGet
                                                                                                            : []
                                                                                                    }
                                                                                                    managerError={
                                                                                                        formErrors.reportingmanagerDTOs
                                                                                                            ? formErrors.reportingmanagerDTOs
                                                                                                            : ''
                                                                                                    }
                                                                                                />
                                                                                            </div>

                                                                                            <div className="col-6">
                                                                                                <Form.Group
                                                                                                    as={
                                                                                                        Row
                                                                                                    }
                                                                                                    className="mb-3"
                                                                                                    controlId="formGroupCompensation"
                                                                                                //controlId="formGroupBloodGroup"
                                                                                                >
                                                                                                    <Form.Label
                                                                                                        id="formGroupCompensation"
                                                                                                        column
                                                                                                        sm={
                                                                                                            4
                                                                                                        }
                                                                                                    >
                                                                                                        Compensation
                                                                                                    </Form.Label>
                                                                                                    <Col
                                                                                                        sm={
                                                                                                            4
                                                                                                        }
                                                                                                    >
                                                                                                        <a
                                                                                                            onClick={() =>
                                                                                                                onShowModal(
                                                                                                                    'Annexure',
                                                                                                                    'readOnly'
                                                                                                                )
                                                                                                            }
                                                                                                            className=""
                                                                                                        >
                                                                                                            <u>
                                                                                                                {ctc &&
                                                                                                                    ctc !=
                                                                                                                    0
                                                                                                                    ? ctc &&
                                                                                                                    ctc.toLocaleString()
                                                                                                                    : ''}
                                                                                                            </u>
                                                                                                        </a>
                                                                                                        &emsp;
                                                                                                        <Button
                                                                                                            id="compensationHistoryview"
                                                                                                            variant="addbtn"
                                                                                                            onClick={() =>
                                                                                                                onAllMissLinesHistory(10)
                                                                                                            }
                                                                                                        >
                                                                                                            History
                                                                                                        </Button>
                                                                                                    </Col>
                                                                                                </Form.Group>
                                                                                            </div>
                                                                                        </>
                                                                                    </Row>
                                                                                </form>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>
                                            </Tab>

                                            <Tab
                                                eventKey={1}
                                                onClick={() => updateStep(1)}
                                                id="personalInformation"
                                                title="Personal Information"
                                            >
                                                <ProfilePersonalInformation
                                                    getAllData={getAllData}
                                                    setGetAllData={setGetAllData}
                                                    setFormErrors={setFormErrors}
                                                    formErrors={formErrors}
                                                    usersList={userDetails.profileEditable}
                                                    handleGenderSelection={handleGenderSelection}
                                                    genderOptions={genderOptions}
                                                    gender={gender}
                                                    handleDateOfBirth={handleDateOfBirth}
                                                    dateOfBirth={dateOfBirth}
                                                    handleInputChange={handleInputChange}
                                                    countriesOptions={countriesOptions}
                                                    countryId={countryId}
                                                    countryIsoCode={countryIsoCode}
                                                    handleCurrencySelection={handleCurrencySelection}
                                                    aCountryId={aCountryId}
                                                    aCountryIsoCode={aCountryIsoCode}
                                                    AHandleCurrencySelection={AHandleCurrencySelection}
                                                    maritalStatusName={maritalStatusName}
                                                    maritalStatusHistoryName={maritalStatusHistoryName}
                                                    onShowModal={onShowModal}
                                                    maritalStatusDto={maritalStatusDto}
                                                    marriageStatusDate={marriageStatusDate}
                                                    handleMarriageDate={handleMarriageDate}
                                                    marriageDate={marriageDate}
                                                    handleBloodGroupSelection={handleBloodGroupSelection}
                                                    bloodGroupOptions={bloodGroupOptions}
                                                    bloodGroup={bloodGroup}
                                                    formData={formData}
                                                />
                                            </Tab>

                                            <Tab
                                                eventKey={2}
                                                onClick={() => updateStep(2)}
                                                id="BankDetails"
                                                title="Account Details"
                                            >
                                                <EmployeeBankDetails
                                                    getAllEmployees={getAllEmployeeById}
                                                    modeShow={true}
                                                    setPfType={setPfType}
                                                    pfType={pfType}
                                                    setFormData={setFormData}
                                                    setChange={setChange}
                                                    formData={formData}
                                                    formErrors={formErrors}
                                                    getAllDta={getAllData}
                                                    setGetAllData={setGetAllData}
                                                    setFormErrors={setFormErrors}
                                                />
                                            </Tab>
                                            <Tab
                                                eventKey={3}
                                                onClick={() => updateStep(3)}
                                                id="address"
                                                title="Address"
                                            >
                                                <Address
                                                    setAddressGet={setAddressGet}
                                                    setChange={setChange}
                                                    addressList={addressGet ? addressGet : []}
                                                />
                                            </Tab>

                                            <Tab eventKey={4} onClick={() => updateStep(4)} id="education" title="Education">
                                                <Education
                                                    setEducationGet={setEducationGet}
                                                    setChange={setChange}
                                                    educationList={educationGet ? educationGet : []}
                                                    setEducationSelectedFiles={
                                                        setEducationSelectedFiles
                                                    }
                                                    dateOfBirth={getAllData && getAllData.dateOfBirth}
                                                />
                                            </Tab>
                                            <Tab eventKey={5} onClick={() => updateStep(5)} id="experience" title="Experience">
                                                <Experience
                                                    setChange={setChange}
                                                    doj={dateOfJoining}
                                                    dateOfBirth={
                                                        getAllData && getAllData.dateOfBirth
                                                    }
                                                    setExperienceGet={setExperienceGet}
                                                    experienceList={
                                                        experienceGet ? experienceGet : []
                                                    }
                                                    setExperienceSelectedFiles={
                                                        setExperienceSelectedFiles
                                                    }
                                                />
                                            </Tab>
                                            <Tab eventKey={6} onClick={() => updateStep(6)} id="idProofs" title="ID Proofs">
                                                <IdProofs
                                                    setChange={setChange}
                                                    setIdproofGet={setIdproofGet}
                                                    idProofsList={idproofGet ? idproofGet : []}
                                                    setIdproofSelectedFiles={
                                                        setIdproofSelectedFiles
                                                    }
                                                    employeeId={getAllData.id}
                                                />
                                            </Tab>
                                            <Tab eventKey={7} onClick={() => updateStep(7)} id="reference" title="References">
                                                <Reference
                                                    setChange={setChange}
                                                    setReferenceGet={setReferenceGet}
                                                    references={referenceGet ? referenceGet : []}
                                                />
                                            </Tab>
                                            <Tab eventKey={8} onClick={() => updateStep(8)} id="family" title="Emergency Contact">
                                                <Family
                                                    setChange={setChange}
                                                    setFamilyGet={setFamilyGet}
                                                    familyList={familyGet ? familyGet : []}
                                                />
                                            </Tab>
                                            <Tab eventKey={9} onClick={() => updateStep(9)} id="skill" title="Skills">
                                                <Skills
                                                    setChange={setChange}
                                                    dateOfBirth={getAllData.dateOfBirth}
                                                    setSkillget={setSkillget}
                                                    skillsList={skillGet ? skillGet : []}
                                                />
                                            </Tab>
                                            <Tab
                                                eventKey={10}
                                                onClick={() => updateStep(10)}
                                                id="compensationHistory"
                                                title="Miscellaneous"
                                            >
                                                <CompensationHistoryView
                                                    id={getAllData.id}
                                                    locId={getAllData.locationId}
                                                />
                                                <LoanTrackingView
                                                    id={getAllData.id}
                                                    locId={getAllData.locationId}
                                                />
                                            </Tab>
                                        </Tabs>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div>
                        {cleanedFormErrors && Object.keys(cleanedFormErrors).length > 0 ? (
                            <p style={{ marginLeft: '8%' }} className="error">
                                Values are missing for the below mandatory fields/Incorrect values.
                                {'('}
                                {Object.keys(cleanedFormErrors).join(', ')}
                                {')'}
                            </p>
                        ) : (
                            ''
                        )}
                    </div>

                    <div style={{ marginTop: '7%' }}>
                        <div className="btnCenter mb-3">
                            <Button
                                id="profileUpdate"
                                variant="addbtn"
                                className="Button"
                                onClick={onUpdateHandler}
                            >
                                Update
                            </Button>
                            <Button
                                id="profileClose"
                                className="Button"
                                variant="secondary"
                                onClick={() => navigate('/')}
                            >
                                {cancelButtonName}
                            </Button>
                        </div>
                    </div>
                    {/* modal popup for all history entitys */}
                    <Modal
                        centered={heading == 'Annexure' ? true : false}
                        show={showModal}
                        onHide={onShowModalCloseHandler}
                        backdrop="static"
                        size={heading == 'Change Photo' ? '' : 'lg'}
                        keyboard={false}
                    >
                        <Modal.Header closeButton onHide={() => onShowModalCloseHandler(heading)}>
                            <Modal.Title>{heading}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body
                            style={{
                                maxHeight: heading == 'Annexure' ? '70vh' : '',
                                overflowY: heading == 'Annexure' ? 'auto' : ''
                            }}
                        >
                            {heading == 'Marital History' && (
                                <MaritalStatusModal
                                    table={!userDetails.profileEditable ? true : false}
                                    setMarriageStatusDate={setMarriageStatusDate}
                                    setMaritalStatusName={setMaritalStatusName}
                                    onShowModalCloseHandler={() => onShowModalCloseHandler(heading)}
                                    maritalStatusName={maritalStatusName}
                                    maritalStatusDto={maritalStatusDto}
                                    maritalStatus={maritalStatus}
                                    setShowModal={setShowModal}
                                    dateOfBirth={dateOfBirth}
                                    doj={dateOfJoining}
                                    setMaritalStatus={setMaritalStatus}
                                    setMaritalStatusDto={setMaritalStatusDto}
                                />
                            )}

                            {heading == 'Employee Shifts' && (
                                <EmployeeShifts
                                    table={!userDetails.profileEditable ? true : false}
                                    setShiftName={setShiftName}
                                    onShowModalCloseHandler={() => onShowModalCloseHandler(heading)}
                                    shiftName={shiftName}
                                    shiftsDtos={shiftsDtos}
                                    shift={shift}
                                    setShowModal={setShowModal}
                                    doj={dateOfJoining}
                                    locId={getAllData.locationId}
                                    locationData={locationData}
                                    loactionShiftDtos={loactionShiftDtos}
                                    setShift={setShift}
                                    setShiftsDtos={setShiftsDtos}
                                />
                            )}

                            {heading == 'Annexure' && (
                                <Annexure
                                    templateId={templateId}
                                    averageSal={ctc}
                                    action={action}
                                    currencyCode={'INR'}
                                />
                            )}
                            {heading == 'Job Role' && (
                                <JobRoleModal
                                    table={!userDetails.profileEditable ? true : false}
                                    setJobRoleDtos={setJobRoleDtos}
                                    jobRoleDtos={jobRoleDtos}
                                    jobRoleName={jobRoleName}
                                    setJobRoleName={setJobRoleName}
                                    jobRole={jobRole}
                                    setShowModal={setShowModal}
                                    doj={dateOfJoining}
                                    orgDate={orgDate}
                                    setJobRole={setJobRole}
                                    onShowModalCloseHandler={() => onShowModalCloseHandler(heading)}
                                />
                            )}

                            {heading == 'Change Photo' && (
                                <form className="modalFormBody">
                                    <center>
                                        <div className="mb-3">
                                            {(getAllData && getAllData.photo != null) ||
                                                photo != null ? (
                                                <img
                                                    src={
                                                        photo
                                                            ? URL.createObjectURL(photo)
                                                            : userDetails &&
                                                            userDetails.employeeId !== null &&
                                                            `data:image/jpeg;base64,${getAllData.photo}`
                                                    }
                                                    height={'150px'}
                                                    alt="Photo"
                                                />
                                            ) : (
                                                <img
                                                    src="/dist/Images/profileImage.png"
                                                    height={'100px'}
                                                    alt="image"
                                                />
                                            )}
                                        </div>

                                        <Form.Control
                                            title="allowed only jpeg and png"
                                            accept="image/jpeg, image/png"
                                            style={{ width: '250px' }}
                                            size="sm"
                                            onChange={(e) => handleFileSelect(e)}
                                            name="photo"
                                            type="file"
                                        />
                                        <p
                                            style={{
                                                // textAlign: "left",2
                                                fontSize: '100%',
                                                fontWeight: '500',
                                                color: '#374681'
                                            }}
                                        >
                                            {''}
                                            'Only JPEG,PNG and JPG are accepted'
                                        </p>
                                        <p className="error">
                                            {formErrors && formErrors.photoSize}
                                        </p>
                                    </center>
                                </form>
                            )}
                        </Modal.Body>
                        {heading == 'Change Photo' && (
                            <div className="btnCenter mb-3">
                                <Button
                                    id="profilePhotoUpdate"
                                    variant="addbtn"
                                    type="button"
                                    className="Button"
                                    onClick={handleFileUpload}
                                >
                                    Upload
                                </Button>

                                <Button
                                    id="profilePhotoClose"
                                    variant="secondary"
                                    type="button"
                                    className="Button"
                                    onClick={() => onShowModalCloseHandler('Change Photo')}
                                >
                                    {cancelButtonName}
                                </Button>
                            </div>
                        )}
                    </Modal>
                </div>
            )}
        </>
    )
}
export default EmployeeProfileDetails
