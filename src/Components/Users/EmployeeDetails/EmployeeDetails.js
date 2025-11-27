import { DatePicker } from 'antd'; // Importing DatePicker component from Ant Design for date selection
import { useEffect, useState } from 'react'; // Importing React and necessary hooks
import { Col, Form, Modal, Row, Tabs } from 'react-bootstrap'; // Importing Bootstrap components for layout and styling
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'; // Importing OverlayTrigger to show tooltips
import Tab from 'react-bootstrap/Tab'; // Importing Tab component from react-bootstrap for tab navigation
import Select from 'react-select'; // Importing Select component from react-select for dropdown selection
import {
    getAllByOrgId, // Importing service to fetch employee types
    getById, // Importing service to get data by ID
    getByIdwithOutOrg,
    SaveWithFile, // Importing service for saving data with files
    UpdateWithFile
} from '../../../Common/Services/CommonService'; // Importing various services for CRUD operations
import Address from '../EmployeeDetails/Address'; // Importing Address component for employee's address details
import Education from '../EmployeeDetails/Education'; // Importing Education component for employee's education details
import Experience from './Experience'; // Importing Experience component for employee's work experience
import Family from './Family'; // Importing Family component for employee's family details
import IdProofs from './IdProof'; // Importing IdProofs component for employee's identification proofs
import Manager from './Manager'; // Importing Manager component for employee's manager details
import Reference from './Reference'; // Importing Reference component for employee's reference details
import Skills from './Skill'; // Importing Skills component for employee's skills details

import { parsePhoneNumberFromString } from 'libphonenumber-js'; // Importing phone number parser from libphonenumber-js
import moment from 'moment'; // Importing moment.js for date manipulation
import { Button } from 'react-bootstrap'; // Importing Button component from react-bootstrap
import Tooltip from 'react-bootstrap/Tooltip'; // Importing Tooltip component from react-bootstrap
import { useDispatch, useSelector } from 'react-redux'; // Importing useSelector to access Redux store
import { useLocation, useNavigate } from 'react-router-dom'; // Importing hooks for React Router (useLocation for location state and useNavigate for navigation)
import { toast } from 'react-toastify'; // Importing toast for notifications
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'; // Importing function for displaying success toast messages
import {
    compareArrayOfObjects,
    comparePhoto,
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'; // Importing utility functions for form control validation
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'; // Importing DetailLoader component for detailed loading state
import PageHeader from '../../../Common/CommonComponents/PageHeader'; // Importing PageHeader component for page title
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'; // Importing functions for customized error and success toast notifications
import { ChangeIcon } from '../../../Common/CommonIcons/CommonIcons'; // Importing ChangeIcon component for managing icons
import { getAllById, getAllStatus, updateStatus } from '../../../Common/Services/OtherServices'; // Importing additional services
import { cancelButtonName } from '../../../Common/Utilities/Constants'; // Importing constants for cancel button name, console value, and organization ID
import { ROUTE_NAME } from '../../../reducers/constants'; // Importing route constants
import Annexure from '../../PayRoll/Reports/Annexure'; // Importing Annexure component for payroll reports
import CompensationHistory from './CompensationHistory'; // Importing CompensationHistory component for managing compensation history
import CompensationHistoryView from './CompensationHistoryView'; // Importing CompensationHistoryView for viewing compensation history details
import EmployeeBankDetails from './EmployeeBankDetails'; // Importing EmployeeBankDetails for managing employee's bank details
import EmployeeLeaveBalance from './EmployeeLeaveBalance'; // Importing EmployeeLeaveBalance component for managing employee leave balance
import EmployeeShifts from './EmployeeModals/EmployeeShifts'; // Importing EmployeeShifts component for managing employee shifts
import FinancialYear from './EmployeeModals/FinancialYear'; // Importing FinancialYear component for managing financial year details
import JobRoleModal from './EmployeeModals/JobRoleModal'; // Importing JobRoleModal component for managing job roles
import LocationModal from './EmployeeModals/LocationModal'; // Importing LocationModal for managing employee's location
import MaritalStatusModal from './EmployeeModals/MaritalStatusModal'; // Importing MaritalStatusModal component for managing marital status
import EmployeeProjectDetails from './EmployeeProjectDetails'; // Importing EmployeeProjectDetails component for employee project details
import LoanTrackingView from './LoanTrackingView'; // Importing LoanTrackingView for viewing loan tracking details
import { PersonalInformation } from './PersonalInformation';

const EmployeeDetails = () => {
    const [next, setNext] = useState(0) // Declaring a state variable 'next' to keep track of the current step and 'setNext' function to update it
    const employeeData = useLocation().state // Using useLocation to get the state passed through React Router to this component (e.g., employee data)
    const [formErrors, setFormErrors] = useState({}) // Declaring a state variable 'formErrors' to store any validation errors in the form
    const updateStep = (step) => {
        // Function to update the current step (likely in a multi-step form or wizard)
        if (step == next) {
            // If the current step is the same as the 'next' step, do nothing
            return step // Return the current step (no changes)
        } else {
            // Otherwise, update the 'next' step to the new 'step' value
            setNext(step) // Update the 'next' step with the new step
        }
    }

    const [countries, setCountries] = useState([]) // Declaring a state variable 'countries' to store the list of countries, initialized as 'undefined'

    const onGetCurrencyHandler = () => {
        // Function to get the list of countries associated with the organization
        getAllById({
            // Call to fetch data for countries associated with the organization using the 'getAllById' function
            entity: 'organizationCountry', // Specify the entity type as 'organizationCountry'
            id: userDetails.organizationId // Pass the organization ID from userDetails as the parameter
        })
            .then((res) => {
                // If the API call is successful
                if (res.statusCode == 200) {
                    // Check if the status code is 200 (OK)
                    const filteredCountries = res.data.filter((country) => !country.deleted)
                    setCountries(filteredCountries) // Set the 'countries' state with the filtered countries data
                    if (employeeData.id != null) {
                        getAllEmployeeById(filteredCountries) // Call the 'getAllEmployeeById' function with the filtered countries
                    } else {
                        setLoading(false)
                    }
                }
            })
            .catch((err) => {
                // If the API call fails
                console.log(err, 'error') // Log the error to the console
            })
    }

    const countriesOptions = countries // Map 'countries' to create a list of options for a dropdown or select field
        ? countries.map((option) => ({
            // For each country, create an object with value, label, and ISD code
            value: option.countryId, // Use the countryId as the value
            label: option.isoCode + '+' + option.isdCode, // Label combines ISO code and ISD code (e.g., 'IN+91')
            isdCode: option.isdCode // Store the ISD code separately for easy access
        }))
        : [] // If 'countries' is empty or undefined, return an empty array

    // State variables to store selected country details
    const [countryId, setCountryId] = useState(null) // Stores the ID of the selected country
    const [countryIsoCode, setCountryIsoCode] = useState() // Stores the ISO code of the selected country
    const [countryIsdCode, setCountryIsdCode] = useState() // Stores the ISD code of the selected country

    const [aCountryId, setACountryId] = useState() // Stores the ID of another selected country (potentially for an alternate country)
    const [aCountryIsoCode, setACountryIsoCode] = useState() // Stores the ISO code of the alternate country
    const [aCountryIsdCode, setACountryIsdCode] = useState() // Stores the ISD code of the alternate country

    const handleCurrencySelection = (option) => {
        // Function to handle selection of country in the currency dropdown
        setFormErrors({
            // Set form validation errors based on the selection
            ...formErrors,
            countryId: !option ? 'Required' : '' // If no option is selected, mark it as 'Required'
        })
        setCountryId(option.value) // Set the selected country's ID
        setFormData({ ...formData, countryId: option.value }) //#1758: Update the form data with the selected country's ID
        setCountryIsoCode(option.label) // Set the selected country's ISO code (combination of isoCode and isdCode)
        setCountryIsdCode(option.isdCode) // Set the selected country's ISD code
    }

    const AHandleCurrencySelection = (option) => {
        // Similar function for alternate country selection
        setFormErrors({
            // Set form validation errors based on the selection
            ...formErrors,
            aCountryId: !option ? 'Required' : '' // If no option is selected, mark it as 'Required'
        })
        setACountryId(option.value) // Set the alternate country's ID
        setFormData({ ...formData, alternateCountryId: option.value }) //#1758: Update the form data with the alternate country's ID
        setACountryIsoCode(option.label) // Set the alternate country's ISO code
        setACountryIsdCode(option.isdCode) // Set the alternate country's ISD code
    }

    const userDetails = useSelector((state) => state.user.userDetails) // Get the current user details from Redux store
    const [formData, setFormData] = useState('') // State for storing form data, initially empty
    const [dateOfBirth, setDateOfBirth] = useState(null) // State for storing the selected date of birth
    const [dateOfJoining, setDateOfJoining] = useState(null) // State for storing the selected date of joining
    const [marriageDate, setMarriageDate] = useState(null) // State for storing the selected marriage date
    const [change, setChange] = useState(true)
    const [photo, setPhoto] = useState(null) // State for storing the selected profile photo
    const [experienceSelectedFiles, setExperienceSelectedFiles] = useState([]) // State for storing selected experience-related files
    const [idproofSelectedFiles, setIdproofSelectedFiles] = useState([]) // State for storing selected ID proof files
    const [educationSelectedFiles, setEducationSelectedFiles] = useState([]) // State for storing selected education-related files

    // Function to handle the date of birth selection and calculate the age
    const handleDateOfBirth = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD') // Format the selected date to "YYYY-MM-DD"
        setDateOfBirth(selectedDate) // Set the selected date of birth
        setFormData({ ...formData, dateOfBirth: selectedDate }) //#1758: Update the form data with the selected date of birth
        let today = new Date()
        let birthDate = new Date(selectedDate)
        let age = today.getFullYear() - birthDate.getFullYear() // Calculate age based on the selected date of birth
        let m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age-- // Adjust t he age if the birthday has not occurred yet this year
        }
        if (age < 18) {
            // Check if the person is at least 18 years old
            toast.error('You must be at least 18 years old to register.') // Show an error message if the person is under 18
            setDateOfBirth(null) // Reset the date of birth state if underage
            setFormData({ ...formData, dateOfBirth: null }) //#1758: Reset the date of birth in the form data
        }
    }

    // State for storing the organization's foundation date
    const [orgDate, setOrgDate] = useState('')

    // Function to fetch the organization's foundation date based on the organization's ID
    const getByOrgId = () => {
        getByIdwithOutOrg({
            // Call to get the organization details without the org ID
            entity: 'organizations', // Specify the entity as 'organizations'
            id: userDetails.organizationId // Pass the organization ID from the user details
        })
            .then((res) => {
                // If the API call is successful
                if (res.statusCode == 200) {
                    // Check if the status code is 200 (OK)
                    setOrgDate(res.data ? res.data.foundationDate : '') // Set the foundation date of the organization
                }
            })
            .catch((err) => {
                // If the API call fails
                console.log(err, 'err') // Log the error to the console
            })
    }

    const handleDateOfJoining = (e) => {
        // Function to handle the change in the date of joining
        const selectedDate = moment(e).format('YYYY-MM-DD') // Format the selected date to "YYYY-MM-DD"
        setDateOfJoining(selectedDate) // Set the date of joining
        setChange(false)
        setFormErrors({
            ...formErrors,
            locationDto: ''
        })
        setFormData({ ...formData, dateOfJoining: selectedDate }) //#1758: Update the form data with the selected date of joining
        const allowedDateOfJoining = new Date(dateOfBirth) // Calculate the minimum allowed date of joining (18 years after birth date)
        allowedDateOfJoining.setFullYear(allowedDateOfJoining.getFullYear() + 18) // Add 18 years to the birth date to get the allowed date of joining
        const doj = moment(allowedDateOfJoining).format('YYYY-MM-DD') // Format the allowed date of joining to "YYYY-MM-DD"

        // Check if the selected date of joining is before the organization's foundation date
        if (selectedDate < orgDate) {
            toast.error('Join date must not precede foundation date') // Show an error if the join date is before the foundation date
            setDateOfJoining(null) // Reset the date of joining if the condition is met
            setFormData({ ...formData, dateOfJoining: null }) //#1758: Reset the date of joining in the form data
        }
        // Check if the selected date of joining is before the minimum allowed date (18 years after birth)
        else if (selectedDate < doj) {
            toast.error('Required minimum 18 years gap between birth and join dates') // Show an error if the join date is too soon
            setDateOfJoining(null) // Reset the date of joining if the condition is met
        }
    }

    const handleMarriageDate = (e) => {
        // Function to handle the change in the marriage date
        const selectedDate = moment(e).format('YYYY-MM-DD') // Format the selected date to "YYYY-MM-DD"
        setMarriageDate(selectedDate) // Set the marriage date
        setChange(false)
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // Regular expression for validating email format
    const handleInputChange = (e) => {
        // Function to handle changes in form input fields
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value == '' ? null : value }) // Update the form data state with the new value
        const errors = validate({ ...formData, [name]: value === '' ? null : value })
        // Validate the phone number input
        if (name === 'phoneNumber') {
            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' }) // Show error if phone number is empty
                return
            }
            let value1 = '+' + countryIsdCode + value // Format the phone number with the country ISD code
            const phoneNumber = parsePhoneNumberFromString(value1, countryIsoCode) // Parse the phone number
            if (phoneNumber && phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: '' }) // If valid, clear any existing errors
            } else {
                setFormErrors({ ...formErrors, [name]: 'Invalid' }) // If invalid, show error
            }
        }
        // Validate the alternate phone number input
        else if (name === 'alternatePhoneNumber') {
            let value1 = '+' + aCountryIsdCode + value // Format the alternate phone number with the alternate country ISD code
            const phoneNumber = parsePhoneNumberFromString(value1, aCountryIsoCode) // Parse the phone number
            if (!value) {
                setFormErrors({ ...formErrors, [name]: '' }) // If empty, clear error
            } else if (phoneNumber && !phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: 'Invalid' }) // If invalid, show error
            } else {
                setFormErrors({ ...formErrors, [name]: '' }) // If valid, clear any existing errors
            }
        }
        // Validate the email input
        else if (name == 'email') {
            if (value && !emailRegex.test(value)) {
                // Check if the email format is valid
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' }) // Show error if invalid format
            } else if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' }) // Show error if email is empty
            } else {
                setFormErrors({ ...formErrors, [name]: '' }) // If valid, clear error
            }
        }
        // Validate the alternate email input
        else if (name == 'alternateEmail') {
            if (value && !emailRegex.test(value)) {
                // Check if the alternate email format is valid
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' }) // Show error if invalid format
            } else {
                setFormErrors({ ...formErrors, [name]: '' }) // If valid, clear error
            }
        }
        // Handle other input fields
        else {
            if (errors[name]) {
                setFormErrors({ ...formErrors, [name]: errors[name] })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }
    }

    // Handle file selection for the profile picture
    const handleFileSelect = (e) => {
        const profile = e.target.files[0] // Get the selected file
        let img = new Image()
        img.src = e.target.files[0] && window.URL.createObjectURL(e.target.files[0]) // Create an image URL for preview
        img.onload = () => {
            // Once the image loads, check its dimensions and file size
            if (img.width < img.height) {
                // Check if the height is greater than the width (aspect ratio check)
                if (e.target.files.length > 0 && e.target.files[0].size > 500000) {
                    // Check if file size exceeds 500KB
                    setFormErrors({
                        ...formErrors,
                        photoSize: 'File size should not exceed more than 500kb' // Show error if file is too large
                    })
                    setPhoto(null) // Reset the photo state
                } else {
                    setFormErrors({ ...formErrors, photoSize: '' }) // Clear the error if file size is okay
                }
            } else {
                setFormErrors({
                    ...formErrors,
                    photoSize: 'Height and width ratio should be 2:1' // Show error if the aspect ratio is incorrect
                })
            }
        }
        // Check for unsupported file types (PDF or CSV)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!allowedTypes.includes(profile.type)) {
            setFormErrors({
                ...formErrors,
                photoSize: 'Please slect JPEG/PNG/JPG file'
            })
        } else {
            setFormErrors({}) // Clear any errors if the file type is valid
        }
        setPhoto(e.target.files[0]) // Set the selected photo in the state
    }

    // Handle file upload for profile photo validation
    const handleFileUpload = () => {
        let img = new Image()
        img.src = photo && window.URL.createObjectURL(photo) // Create an image URL for preview
        img.onload = () => {
            // Once the image loads, check its dimensions and file size
            if (img.width < img.height) {
                // Check if the height is greater than the width (aspect ratio check)
                if (photo && photo.size > 500000) {
                    // Check if file size exceeds 500KB
                    setFormErrors({
                        ...formErrors,
                        photoSize: 'Please select another file' // Show error if the file is too large
                    })
                } else {
                    setShowModal(false) // Close the modal if the photo is valid
                }
            } else {
                setFormErrors({
                    ...formErrors,
                    photoSize: 'Height and width ratio should be 2:1' // Show error if the aspect ratio is incorrect
                })
            }
        }
    }

    // States for handling location-related data
    const [locationId, setLocationId] = useState()
    const [locationName, setLocationName] = useState('') // State for storing the location name
    const [locationData, setLocationData] = useState([]) // State for storing location data
    const [locationDtos, setLocationDtos] = useState([]) // State for storing location-related DTOs
    const [loactionShiftDtos, setLoactionShiftDtos] = useState([]) // State for storing shift-related data for locations

    // Function to map location data to options
    const locationOptions = locationData
        ? locationData.map((option) => ({
            value: option.id, // Set the location ID as the value
            label: option.name, // Set the location name as the label
            month: option.locationSettings && option.locationSettings.financialYearStartMonth // Add the financial year start month if available
        }))
        : []

    // Fetch gender data on component mount
    useEffect(() => {
        getAllGenderData()
    }, [])

    // State for storing gender-related data
    const [genderList, setGenderList] = useState([])

    // Fetch gender data from the API
    const getAllGenderData = () => {
        getAllByOrgId({ entity: 'gender', organizationId: userDetails.organizationId }).then(
            (res) => {
                if (res.statusCode == 200) {
                    setGenderList(res.data) // Store the fetched gender data
                }
            }
        )
            .catch((err) => {
                console.log(err, 'error') // Log any errors that occur during the API call
            }) // Catch any errors from the promise rejection
    }

    // State for storing selected gender
    const [gender, setgender] = useState()

    // Handle gender selection
    const handleGenderSelection = (selection) => {
        setChange(false)
        setgender(selection.value) // Set the selected gender
        setFormData({ ...formData, genderId: selection.value, genderName: selection.label }) //#1758: Update the form data with the
        // setChange(false)
    }

    // Map gender data to options for dropdown
    const genderOptions = genderList
        ? genderList.map((option) => ({
            value: option.id, // Set the gender ID as the value
            label: option.name // Set the gender name as the label
        }))
        : []

    // State for marital status-related data
    const [maritalStatusDto, setMaritalStatusDto] = useState([])
    const [maritalStatusName, setMaritalStatusName] = useState('') // State for storing marital status name
    const [maritalStatus, setMaritalStatus] = useState() // State for storing selected marital status

    const maritalStatusHistoryName =
        maritalStatusDto && maritalStatusDto[maritalStatusDto.length - 1]
    // State to manage the selected employee type
    const [employeeType, setEmployeeType] = useState()
    const [employeeTypeName, setEmployeeTypeName] = useState("")

    // State to store employee type data fetched from the server
    const [employeeTypeData, setEmployeeTypeData] = useState([])

    // Function to fetch all employee types from the server
    const getAllEmployeeTypes = () => {
        getAllByOrgId({ entity: 'employmenttypes', organizationId: userDetails.organizationId }) // Fetch employee types for the organization
            .then((res) => {
                setEmployeeTypeData(res.data) // Set the fetched employee type data into the state
            })
            .catch((err) => {
                console.log(err, 'error') // Log any errors that occur during the API call
            }) // Catch any errors from the promise rejection
    }

    // Dispatch function to change the route name (used for routing purposes)
    const dispatch = useDispatch()

    // UseEffect to dispatch the action to update the route name when the component is mounted
    useEffect(() => {
        dispatch({
            type: ROUTE_NAME, // Action type to update route name
            payload: '/employeeList' // The new route to navigate to
        })
    }, []) // Empty dependency array, so this effect runs only once after the component mounts

    // Map employee type data to options for a dropdown or select input
    const employeeOptions = employeeTypeData
        ? employeeTypeData.map((option) => ({
            value: option.id, // Set the employee type ID as the value
            label: option.name // Set the employee type name as the label
        }))
        : [] // Empty array if no employee type data is available

    // Function to handle the selection of an employee type
    const handleEmployeeSelection = (selection) => {
        setContractToDate(null) // Reset the contract to date
        setChange(false)
        setEmployeeType(selection.value) // Update the selected employee type
        setEmployeeTypeName(selection.label) // Update the employee type name
        setFormData({
            ...formData,
            employmentTypeId: selection.value,
            employmentTypeName: selection.label
        }) //#1758: Update the form data with the selected employee type
        // setChange(false)
        setFormErrors({
            ...formErrors, contractToDate: ''
        })
    }

    // UseEffect to trigger various functions when the component is mounted
    useEffect(() => {
        getByOrgId() // Fetch organization data (probably organization-specific details)
        onGetCurrencyHandler() // Fetch and update the country data
        getAllLocationByClientId() // Fetch all locations for the client
        getAllEmployeeTypes() // Fetch employee types for the organization
    }, []) // This effect runs only once, when the component is first mounted

    // Function to fetch all locations for the client based on organization ID
    const getAllLocationByClientId = () => {
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId }) // Fetch locations for the organization
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLocationData(res.data) // Set location data in the state
                        setLoactionShiftDtos(res.data && res.data.map((e) => e.shiftDTos)) // Extract and set shift DTOs for each location
                    }
                },
            )
            .catch((error) => {
                console.log(error) // Log any errors from the promise rejection
            })
    }

    // validations for objcet mandotary Fields
    const validate = (values) => {
        const errors = {}
        if (!values.code) {
            errors.code = 'Required'
        }
        if (!values.email) {
            errors.email = 'Required'
        }
        if (dateOfBirth == null) {
            errors.dateOfBirth = 'Required'
        }
        if (dateOfJoining == null) {
            errors.dateOfJoining = 'Required'
        }
        if (employeeTypeName && employeeTypeName.toLowerCase().includes('contract') && contractToDate == null) {
            errors.contractToDate = 'Required'
        }
        if (employeeType == null) {
            errors.employmentTypeId = 'Required'
        }
        if (values.countryId == null) {
            errors.countryId = 'Required'
        }
        if (gender == undefined || null) {
            errors.gender = 'Required'
        }
        if (!values.firstName) {
            errors.firstName = 'Required'
        }
        if (!values.lastName) {
            errors.lastName = 'Required'
        }
        if (!values.phoneNumber) {
            errors.phoneNumber = 'Required'
        }
        if (!values.noticePeriodDays) {
            errors.noticePeriodDays = 'Required'
        }
        return errors
    }

    // Options for selecting the title (salutation) of the employee
    const categoryOptions = [
        { label: 'Mr.', value: 'Mr.' }, // Mr. as an option
        { label: 'Ms.', value: 'Ms.' }, // Ms. as an option
        { label: 'Mrs.', value: 'Mrs.' } // Mrs. as an option
    ]

    // State to store the selected title
    const [title, setTitle] = useState('') // Initial state set to an empty string

    // Function to handle the selection of a title (e.g., Mr., Ms., Mrs.)
    const handleCategorySelection = (selection) => {
        setChange(false)
        setTitle(selection.value) // Set the selected title in the state
        setFormData({ ...formData, title: selection.value }) //#1758: Update the form data with the selected title
    }

    // State to store the status of the employee
    const [status, setStatus] = useState('') // Initial state set to an empty string
    // Function to handle the status update of the employee (set to "Active")
    const handleStatusActive = (e) => {
        // Check if a reporting manager is selected, show error if not
        if (managerGet == null) {
            toast.error('Please Select Reporting Manager')
        }
        // Validate the form fields if some required fields are empty
        if (!formData.code) {
            setFormErrors(validate(formData)) // Validate form data if employee code is missing
        } else if (!formData.noticePeriodDays) {
            setFormErrors(validate(formData)) // Validate form data if notice period days are missing
        }
        // Additional validation checks for form fields like email, first name, etc.
        else if (!getAllData.title) {
            toast.error('Please select title.') // Show error if title is not selected
        } else if (!formData.email) {
            setFormErrors(validate(formData)) // Validate form data if email is missing
        } else if (!formData.firstName) {
            setFormErrors(validate(formData)) // Validate form data if first name is missing
        } else if (!formData.lastName) {
            setFormErrors(validate(formData)) // Validate form data if last name is missing
        } else if (getAllData.dateOfBirth == null) {
            setFormErrors(validate(getAllData)) // Validate form data if date of birth is missing
        } else if (getAllData.genderId == null) {
            setFormErrors(validate(getAllData)) // Validate form data if gender is missing
        } else if (getAllData.dateOfJoining == null) {
            setFormErrors(validate(getAllData)) // Validate form data if date of joining is missing
        } else if (!formData.phoneNumber) {
            setFormErrors(validate(formData)) // Validate form data if phone number is missing
        } else if (getAllData.employmentTypeId == null) {
            setFormErrors(validate(getAllData)) // Validate form data if employment type is missing
        } else if (getAllData.countryId == null) {
            setFormErrors(validate(getAllData)) // Validate form data if country is not selected
        }
        // Check if the email format is valid
        else if (!emailRegex.test(formData.email)) {
            toast.error('Invalid email format') // Show error if email format is invalid
        }
        // Check if the alternate email format is valid
        else if (
            getAllData.alternateEmail != undefined &&
            getAllData.alternateEmail != '' &&
            !emailRegex.test(getAllData.alternateEmail)
        ) {
            toast.error('Invalid alternate email format') // Show error if alternate email format is invalid
        }
        // Check if the phone number length is valid
        else if (getAllData.phoneNumber.length <= 1) {
            toast.error('Invalid phone number') // Show error if phone number length is too short
        }
        // If all validations pass, update the status to 'Active'
        else {
            updateStatus({
                entity: 'employees', // Entity name, which is employees in this case
                organizationId: userDetails.organizationId, // Organization ID from user details
                id: employeeData && employeeData.id, // Employee ID from employee data
                status: 'Active', // Set the employee status to "Active"
                remarks: '' // Empty remarks field
            })
                .then((res) => {
                    // If the status update is successful, show success toast
                    if (res.statusCode == 200) {
                        toast.success('Activated successfully.') // Show success message
                        onUpdateHandler(e, false) // Call the handler function for any further updates
                        navigate('/employeeList') // Navigate to the Employee List page
                    } else {
                        toast.error(res.errorMessage) // Show error message if the response status code is not 200
                    }
                })
                .catch((err) => {
                    console.log(err, 'error') // Log any error that occurs during the API call
                })
        }
    }

    // useEffect hook to call the onDepartmentsHandler function when the component mounts
    useEffect(() => {
        onDepartmentsHandler() // Fetch the department list when the component is mounted
    }, []) // Empty dependency array ensures it runs only once, when the component mounts

    // State to store the list of departments
    const [departmentList, setDepartmentList] = useState([]) // Initially set to an empty array

    // State to store the selected department ID
    const [departmentId, setDepartmentId] = useState() // Initially set to undefined

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

    // Create options for a dropdown or select input based on the department list
    const departmentOptions = departmentList.map((option) => ({
        value: option.id, // Set the department's ID as the value
        label: option.name // Set the department's name as the label
    }))

    // Function to handle department selection from a dropdown
    const handleDepartMentSelect = (select) => {
        setChange(false)
        setDepartmentId(select.value) // Sets the department ID when a department is selected
        setFormData({ ...formData, departmentId: select.value, departmentName: select.label }) //#1758: Updates the form data with the selected department ID and name
    }

    // State to store the list of job roles
    const [jobRoleDtos, setJobRoleDtos] = useState([]) // Initially set to an empty array

    const jobRoleLastHistoryName = jobRoleDtos && jobRoleDtos[jobRoleDtos.length - 1]
    // State to store the name of the selected job role
    const [jobRoleName, setJobRoleName] = useState('') // Initially set to an empty string

    // State to store the selected job role's ID or object
    const [jobRole, setJobRole] = useState(null) // Initially set to null

    // State to store the list of shifts
    const [shiftsDtos, setShiftsDtos] = useState([]) // Initially set to an empty array

    // State to store the name of the selected shift
    const [shiftName, setShiftName] = useState('') // Initially set to an empty string

    // State to store the selected shift
    const [shift, setShift] = useState(null) // Initially set to null
    const shiftLastHistoryName = shiftsDtos && shiftsDtos[shiftsDtos.length - 1]
    // State to store the Provident Fund (PF) type
    const [pfType, setPfType] = useState({ value: 1, label: 'Percentage' })
    // Initializes the PF type state to have a value of 1 (Percentage) with the label "Percentage"

    // State to store PhD status (whether the person has a PhD)
    const [phdValue, setPhdValue] = useState() // Initially set to undefined

    // Function to handle changes when the PhD checkbox is checked/unchecked
    const handlePHDCheck = (e) => {
        setChange(false)
        setPhdValue(e.target.checked) // Sets the PhD value to true or false based on whether the checkbox is checked
        setFormData({ ...formData, physicallyChallenged: e.target.checked }) //#1758: Updates the form data with the PhD status
    }

    const [marriageStatusDate, setMarriageStatusDate] = useState(null)
    const [bloodGroup, setBloodGroup] = useState('') // State to store the selected blood group
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


    const handleContrctToDateChange = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD') // Format the selected date to "YYYY-MM-DD"
        setContractToDate(selectedDate) // Set the contract end date    
        setChange(false)
    }


    // onSaveHandler is the function that handles saving the employee data when the form is submitted
    const onSaveHandler = (e) => {
        e.preventDefault() // Prevents the default form submit action
        // Mapping and modifying the education data to ensure files are properly set
        const modifiedEduList = educationGet
            ? educationGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null // If a file has an ID, retain the file, else set it to null
                }))
            }))
            : [] // If educationGet is null or undefined, use an empty array

        // Mapping and modifying the experience data to ensure files are properly set
        const modifiedExpList = experienceGet
            ? experienceGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null // Same as above, check if file has an ID, retain or nullify
                }))
            }))
            : [] // Use an empty array if experienceGet is null or undefined

        // Mapping and modifying the ID proof data to ensure files are properly set
        const modifiedIdProofList = idproofGet
            ? idproofGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null // Same check for ID proof files
                }))
            }))
            : [] // Use an empty array if idproofGet is null or undefined

        // Construct the main object that holds all the employee's data
        const objAll = {
            code: formData.code,
            email: formData.email,
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            alternateEmail: formData.alternateEmail,
            dateOfBirth: dateOfBirth,
            dateOfJoining: dateOfJoining,
            phoneNumber: formData.phoneNumber,
            nationality: formData.nationality,
            martialStatusDTOs: maritalStatusDto,
            marriageDate: marriageStatusDate != 'Married' ? null : marriageDate,
            locationId: locationId,
            noOfChildren: formData.noOfChildren,
            placeOfBirth: formData.placeOfBirth,
            noticePeriodDays: formData.noticePeriodDays,
            genderId: gender,
            departmentId: departmentId,
            title: title,
            pfPreference: pfType,
            physicallyChallenged: phdValue,
            previousEarningsDTO: financialYearData,
            status: 'Draft', // Setting status to Draft initially
            shiftDTOs: shiftsDtos,
            jobRoleDTOs: jobRoleDtos,
            allergies: formData.allergies,
            employmentTypeId: employeeType,
            alternatePhoneNumber: formData.alternatePhoneNumber,
            bloodGroup: bloodGroup != 'Others' ? bloodGroup : formData.bloodGroup,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            pfNumber: formData.pfNumber,
            esiNumber: formData.esiNumber,
            panNumber: formData.panNumber,
            pfUan: formData.pfUan,
            locationDTOs: locationDtos ? locationDtos : [], // Use locationDtos or an empty array
            organizationId: userDetails.organizationId,
            addressDTOs: addressGet ? addressGet : [], // Use addressGet or an empty array
            educationDTOs: modifiedEduList,
            experienceDTOs: modifiedExpList,
            familyDTOs: familyGet ? familyGet : [],
            idProofDTOs: modifiedIdProofList,
            skillDTOs: skillGet ? skillGet : [],
            reportingmanagerDTOs: managerGet ? managerGet : [],
            referenceDTOs: referenceGet ? referenceGet : [],
            countryId: countryId,
            alternateCountryId: aCountryId,
            clientName: formData.clientName,
            contractEndDate: contractToDate,
        }

        // Formatting phone number and alternate phone number to include ISD code
        let value = '+' + countryIsdCode + objAll.phoneNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        let value1 = '+' + countryIsdCode + objAll.alternatePhoneNumber
        const alternatePhoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)

        // Validating the fields in the form
        if (!objAll.code) {
            setFormErrors(validate(objAll)) // Validate if code is missing
        } else if (Object.keys(cleanedFormErrors).length > 0) {
            setLoading(false)
        } else if (!objAll.email) {
            setFormErrors(validate(objAll)) // Validate if email is missing
        } else if (!objAll.title) {
            toast.error('Please select title.') // Title is required
        } else if (!objAll.firstName) {
            setFormErrors(validate(objAll)) // Validate if first name is missing
        } else if (!objAll.lastName) {
            setFormErrors(validate(objAll)) // Validate if last name is missing
        } else if (objAll.dateOfBirth == null) {
            setFormErrors(validate(objAll)) // Validate if date of birth is missing
        } else if (objAll.genderId == undefined || null) {
            setFormErrors(validate(objAll)) // Validate if gender is not selected
        } else if (objAll.dateOfJoining == null) {
            setFormErrors(validate(objAll)) // Validate if date of joining is missing
        } else if (!objAll.phoneNumber) {
            setFormErrors(validate(objAll)) // Validate if phone number is missing
        } else if (objAll.employmentTypeId == null) {
            setFormErrors(validate(objAll)) // Validate if employment type is missing
        } else if (employeeTypeName && employeeTypeName.toLowerCase().includes('contract') && !contractToDate) {
            setFormErrors(validate(objAll)) // Validate if employment type is missing
        } else if (objAll.countryId == null) {
            setFormErrors(validate(objAll)) // Validate if country ID is missing
        } else if (!formData.noticePeriodDays) {
            setFormErrors(validate(objAll)) // Validate if notice period is missing
        } else if (maritalStatusDto.length == 0) {
            toast.error('Please select marital status') // Marital status is required
        } else if (jobRoleDtos.length == 0) {
            toast.error('Please select job role') // Job role is required
        } else if (locationDtos.length == 0) {
            toast.error('Please Select Location') // Location is required
        } else if (!emailRegex.test(formData.email)) {
            toast.error('Invalid email format') // Check if email format is valid
        } else if (
            objAll.alternateEmail != undefined &&
            objAll.alternateEmail != '' &&
            !emailRegex.test(objAll.alternateEmail)
        ) {
            toast.error('Invalid alternate email format') // Check if alternate email format is valid
        } else if (objAll.phoneNumber.length <= 1) {
            toast.error('Invalid phone number') // Validate if phone number is too short
        } else if (!phoneNumber.isValid()) {
            toast.error('Invalid phone number') // Check if phone number is valid
        }
        else if (objAll.alternatePhoneNumber && objAll.alternatePhoneNumber.length <= 1 && objAll.countryId && objAll.countryId != aCountryId) {
            toast.error('Please enter country code') // Validate if alternate phone number is too short
        }
        else if (objAll.alternatePhoneNumber && objAll.alternatePhoneNumber.length <= 1) {
            toast.error('Invalid alternate phone number') // Validate if alternate phone number is too short
        } else if (objAll.alternatePhoneNumber && !alternatePhoneNumber.isValid()) {
            toast.error('Invalid alternate phone number') // Check if alternate phone number is valid
        } else {
            // If all validations pass, prepare the data for submission
            let empData = new FormData()

            // Append files if selected (photo, education, experience, id proof)
            photo && empData.append('photo', photo)
            educationSelectedFiles &&
                educationSelectedFiles.forEach((file) => {
                    empData.append('educationfiles', file)
                })
            experienceSelectedFiles &&
                experienceSelectedFiles.forEach((file) => {
                    empData.append('experiencefiles', file)
                })
            idproofSelectedFiles &&
                idproofSelectedFiles.forEach((file) => {
                    empData.append('idprooffiles', file)
                })

            // Append the main employee data
            empData.append('employees', JSON.stringify(objAll))

            // Make the API call to save the data with files
            SaveWithFile({
                entity: 'employees',
                organizationId: userDetails.organizationId,
                body: empData,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Employee',
                    operationType: 'save'
                }),
                screenName: 'employees'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message) // Show success message if the API call is successful
                        navigate('/employeeList') // Redirect to the employee list page
                    }
                })
                .catch((err) => {
                    console.log(err, 'error')
                    ToastError(err.message) // Show error message if the API call fails
                })
        }
    }

    // Declare a state variable to hold the list of status names
    const [statusName, setStatusName] = useState([])

    // Function to fetch the status names for a specific employee ID
    const statusGetFrom = (id) => {
        // Fetch the status names from an API using the employee ID and organization ID
        getAllStatus({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            id: id
        })
            .then((res) => {
                // On successful API response, store the status data in the state
                setStatusName(res.data)
            })
            .catch((err) => {
                // Handle any errors that may occur during the API call
                console.log(err, 'error')
            })
    }

    // Mapping the status names into the format required by a dropdown or selection input
    const enumOptions = statusName
        ? statusName.map((option) => ({
            value: option, // The value is the status name
            label: option // The label is also the status name (for display purposes)
        }))
        : [] // If statusName is empty or undefined, return an empty array

    // Function to handle the selection of a status from the dropdown
    const handleSelectionForEnum = (selection) => {
        // Set the selected status value into the state
        setStatus(selection.value)
    }

    // Function to handle the update of employee status
    const handleStatusUpdate = () => {
        // Perform the status update API call
        updateStatus({
            entity: 'employees',
            id: employeeData.id, // The ID of the employee whose status is being updated
            status: status, // The selected status value to update
            organizationId: userDetails.organizationId, // Organization ID
            remarks: formData.remarks // Any remarks related to the status update
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    // If the API call is successful, close the modal (assuming there's a modal)
                    toast.success('Employee status changed successfully.') // Show success message
                    setShowModal(false)
                }
            })
            .catch((err) => {
                // Log any errors that occur during the status update process
                console.log(err, 'error')
                toast.error(err.message) // Show error message if the API call fails
            })
    }

    // State variables to hold data from the employee API
    const [getAllData, setGetAllData] = useState([])
    const [referenceGet, setReferenceGet] = useState([])
    const [skillGet, setSkillget] = useState([])
    const [experienceGet, setExperienceGet] = useState([])
    const [educationGet, setEducationGet] = useState([])
    const [idproofGet, setIdproofGet] = useState([])
    const [familyGet, setFamilyGet] = useState([])
    const [addressGet, setAddressGet] = useState([])
    const [managerGet, setManagerGet] = useState([])

    // Additional state variables
    const [templateId, setTemplateId] = useState()
    const [action, setAction] = useState('') // Action like 'edit', 'create', etc.
    const [ctc, setCtc] = useState('0000') // CTC of the employee

    const [showModal, setShowModal] = useState(false) // Flag to show or hide modal
    const [heading, setHeading] = useState('') // Modal heading text

    const [financialYearData, setFinancialYearData] = useState({}) // Data related to financial year

    // Function to show the modal with the relevant heading and action
    const onShowModal = (headingname, mode) => {
        if (
            ['Location', 'Marital History', 'Job Role'].includes(headingname) &&
            dateOfJoining == null
        ) {
            setShowModal(false)
            setFormErrors({
                ...formErrors,
                locationDto: 'Please Add Date Of Joining',
                dateOfJoining: 'Required' // Set error message if no date is selected
            })
        } else {
            setShowModal(true) // Open the modal
            setAction(mode) // Set the mode of the action ('edit', 'view', etc.)
            setHeading(headingname) // Set the heading of the modal
            if (headingname == 'Employee Status') statusGetFrom(employeeData.id) // Get status of the employee from the API
        }
    }
    // Function to close the modal with specific action handling for each case
    const onShowModalCloseHandler = (e) => {
        if (e == 'Job Role') {
            setShowModal(false)
            setJobRole()
            setFormErrors({})
        } else if (e == 'Employee Shifts') {
            setShowModal(false)
            setShift()
            setFormErrors({})
        } else if (e == 'Marital History') {
            setShowModal(false)
            setMaritalStatus()
            setFormErrors({})
        } else if (e == 'Employee Status') {
            setShowModal(false)
            setStatus()
            setFormErrors({})
        } else if (e == 'Change Photo') {
            setShowModal(false)
            setPhoto(null)
            setFormErrors({})
        } else if (e == 'Location') {
            setShowModal(false)
            setLocationId()
            setFormErrors({})
            if (locationDtos.length < 1) {
                setLocationName('')
            }
        } else {
            setShowModal(false)
        }
    }

    // Loading state to manage the fetching process
    const [loading, setLoading] = useState(true)
    // Function to fetch employee data from API based on employee ID
    const getAllEmployeeById = (filteredCountries) => {
        getById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            id: employeeData && employeeData.id
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false) // Data fetched, set loading to false
                setGetAllData(res.data) // Store the employee data
                setEmployeeTypeName(res.data && res.data.employmentTypeName)
                setContractToDate(res.data && res.data.contractEndDate)
                // Set various state values from the fetched employee data
                setgender(res.data && res.data.genderId)
                setEmployeeType(res.data && res.data.employmentTypeId)
                setDepartmentId(res.data && res.data.departmentId)
                setDateOfBirth(res.data && res.data.dateOfBirth)
                setDateOfJoining(res.data && res.data.dateOfJoining)
                setStatus(res.data && res.data.status)
                setPfType(res.data && res.data.pfPreference)
                setFinancialYearData(res.data && res.data.previousEarningsDTO)
                setMarriageDate(res.data ? res.data.marriageDate : null)
                setBloodGroup(res.data && res.data.bloodGroup)
                setMaritalStatusDto(
                    res.data && res.data.martialStatusDTOs == null ? [] : res.data.martialStatusDTOs
                )
                setAddressGet(res.data ? res.data.addressDTOs : [])
                setEducationGet(res.data ? res.data.educationDTOs : [])
                setExperienceGet(res.data ? res.data.experienceDTOs : [])
                setFamilyGet(res.data ? res.data.familyDTOs : [])
                setReferenceGet(res.data ? res.data.referenceDTOs : [])
                setSkillget(res.data ? res.data.skillDTOs : [])
                setIdproofGet(res.data ? res.data.idProofDTOs : [])
                setMarriageStatusDate(res.data && res.data.latestMaritalStatus)
                setManagerGet(res.data ? res.data.reportingmanagerDTOs : [])
                setMaritalStatus(res.data && res.data.maritalStatus)
                setJobRoleDtos(res.data && res.data.jobRoleDTOs == null ? [] : res.data.jobRoleDTOs)
                const tit = res.data && res.data.title
                setTitle(tit && tit.endsWith('.') ? tit : tit + '.') // Ensure title ends with a period ('.')
                setShiftsDtos(res.data && res.data.shiftDTOs == null ? [] : res.data.shiftDTOs)
                setTemplateId(res.data.templateId)
                setLocationId(res.data && res.data.locationId)
                setLocationDtos(
                    res.data && res.data.locationDTOs == null ? [] : res.data.locationDTOs
                )
                setCtc(res.data && res.data.ctc)
                setPhdValue(res.data && res.data.physicallyChallenged)
                setFormData(res.data) // Set all form data from the API response

                // Set country-related data
                const matchedCountry =
                    filteredCountries &&
                    filteredCountries.find((country) => country.countryId === res.data.countryId)
                setCountryId(res.data && res.data.countryId)
                if (matchedCountry) {
                    setCountryIsoCode(matchedCountry.isoCode + '+' + matchedCountry.isdCode)
                    setCountryIsdCode(matchedCountry.isdCode)
                }

                // Set alternate country-related data
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
                console.log(err, 'error') // Log any errors that occur during the API call
                setLoading(false) // Stop loading even if there's an error
            })
    }

    // Declare a state variable 'mode' and a setter function 'setMode' to handle the current mode (create, edit, view)
    const [mode, setMode] = useState('')

    // useEffect hook to initialize the mode based on the provided employee data
    useEffect(() => {
        if (employeeData && employeeData.id == null) {
            setMode('create') // If no employee id exists, set mode to 'create'
            setLoading(false) // Stop the loading state
        } else {
            setMode('edit') // If employee id exists, set mode to 'edit'
        }

        if (employeeData && employeeData.viewId != null) {
            setMode('view') // If a viewId exists, set mode to 'view'
        }
    }, [])
    // onUpdateHandler function for handling the employee update operation
    const onUpdateHandler = (e, action = true) => {
        // Modifying education data to nullify file id if not present in the records
        const modifiedEduList = educationGet
            ? educationGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null
                }))
            }))
            : []

        // Modifying experience data in a similar manner
        const modifiedExpList = experienceGet
            ? experienceGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null
                }))
            }))
            : []

        // Modifying ID Proof data similarly
        const modifiedIdProofList = idproofGet
            ? idproofGet.map((item) => ({
                ...item,
                files: item.files.map((e) => ({
                    ...e,
                    file: e.id ? e.file : null
                }))
            }))
            : []

        // Creating the object 'objAll' with all the necessary fields to update the employee
        const objAll = {
            id: employeeData.id,
            organizationId: userDetails.organizationId,
            code: formData.code ? formData.code : getAllData.code,
            email: formData.email ? formData.email : getAllData.email,
            firstName: formData.firstName ? formData.firstName : getAllData.firstName,
            locationId: locationId ? locationId : getAllData.locationId,
            middleName: formData.middleName,
            lastName: formData.lastName ? formData.lastName : getAllData.lastName,
            alternateEmail: formData.alternateEmail,
            dateOfBirth: dateOfBirth ? dateOfBirth : getAllData.dateOfBirth,
            dateOfJoining: dateOfJoining ? dateOfJoining : getAllData.dateOfJoining,
            jobRoleDTOs: jobRoleDtos ? jobRoleDtos : [],
            departmentId: departmentId ? departmentId : getAllData.departmentId,
            title: title ? title : getAllData.title,
            status: e == 'Active' ? e : status, // Check if status is 'Active'
            phoneNumber: formData.phoneNumber ? formData.phoneNumber : getAllData.phoneNumber,
            alternatePhoneNumber: formData.alternatePhoneNumber,
            nationality: formData.nationality,
            ctc: getAllData.ctc,
            martialStatusDTOs: maritalStatusDto ? maritalStatusDto : [],
            marriageDate: marriageStatusDate != 'Married' ? null : marriageDate,
            noOfChildren: formData.noOfChildren,
            noticePeriodDays: formData.noticePeriodDays
                ? formData.noticePeriodDays
                : getAllData.noticePeriodDays,
            placeOfBirth: formData.placeOfBirth,
            genderId: gender ? gender : getAllData.genderId,
            allergies: formData.allergies,
            employmentTypeId: employeeType ? employeeType : getAllData.employmentTypeId,
            bloodGroup: bloodGroup != 'Others' ? bloodGroup : formData.bloodGroup,
            pfPreference: pfType,
            physicallyChallenged: phdValue,
            previousEarningsDTO: financialYearData,
            templateId: getAllData.templateId,
            shiftDTOs: shiftsDtos ? shiftsDtos : [],
            photo: photo ? photo : getAllData.photo,
            locationDTOs: locationDtos ? locationDtos : [],
            bankName: formData.bankName,
            accountNumber: formData.accountNumber
                ? formData.accountNumber
                : getAllData.accountNumber,
            pfNumber: formData.pfNumber ? formData.pfNumber : getAllData.pfNumber,
            panNumber: formData.panNumber ? formData.panNumber : getAllData.panNumber,
            pfUan: formData.pfUan ? formData.pfUan : getAllData.pfUan,
            esiNumber: formData.esiNumber ? formData.esiNumber : getAllData.esiNumber,
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
            clientName: formData.clientName ? formData.clientName : getAllData.clientName,
            contractEndDate: contractToDate ? contractToDate : getAllData.contractEndDate,

        }
        // Validate phone numbers by parsing with country ISD codes
        let value = '+' + countryIsdCode + objAll.phoneNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        let value1 = '+' + aCountryIsdCode + objAll.alternatePhoneNumber
        const alternatePhoneNumber = parsePhoneNumberFromString(value1, aCountryIsoCode)

        // Input validation checks and error messages for each field
        if (
            updateValidation(getAllData, formData) &&
            compareArrayOfObjects(getAllData.shiftDTOs, shiftsDtos) &&
            comparePhoto(getAllData, objAll) &&
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
            compareArrayOfObjects(getAllData.referenceDTOs, referenceGet) &&
            JSON.stringify(getAllData.previousEarningsDTO) === JSON.stringify(financialYearData) &&
            action
        ) {
            // if (action !== "ActiveStatus") {
            toast.info('No changes made to update.')
            // }
        } else if (Object.keys(cleanedFormErrors).length > 0) {
            setLoading(false)
        } else if (!formData.code) {
            setFormErrors(validate(formData))
        } else if (!formData.noticePeriodDays) {
            setFormErrors(validate(formData))
        } else if (!objAll.title) {
            toast.error('Please select title.') // Ensure title is selected
        } else if (!formData.email) {
            setFormErrors(validate(formData)) // Validate email
        } else if (!formData.firstName) {
            setFormErrors(validate(formData)) // Validate first name
        } else if (!formData.lastName) {
            setFormErrors(validate(formData)) // Validate last name
        } else if (objAll.dateOfBirth == null) {
            setFormErrors(validate(objAll)) // Validate date of birth
        } else if (objAll.genderId == null) {
            setFormErrors(validate(objAll)) // Validate gender
        } else if (objAll.dateOfJoining == null) {
            setFormErrors(validate(objAll)) // Validate date of joining
        } else if (!formData.phoneNumber) {
            setFormErrors(validate(formData)) // Validate phone number
        } else if (objAll.employmentTypeId == null) {
            setFormErrors(validate(objAll)) // Validate employment type
        } else if (objAll.countryId == null) {
            setFormErrors(validate(objAll)) // Validate country
        } else if (employeeTypeName && employeeTypeName.toLowerCase().includes('contract') && !contractToDate) {
            setFormErrors(validate(objAll)) // Validate if employment type is missing
        } else if (!emailRegex.test(formData.email)) {
            toast.error('Invalid email format') // Validate email format
        } else if (
            objAll.alternateEmail != undefined &&
            objAll.alternateEmail != '' &&
            !emailRegex.test(objAll.alternateEmail)
        ) {
            toast.error('Invalid alternate email format') // Validate alternate email format
        } else if (objAll.phoneNumber.length <= 1) {
            toast.error('Invalid phone number') // Check phone number length
        } else if (phoneNumber && !phoneNumber.isValid()) {
            toast.error('Invalid phone number') // Validate phone number
        } else if (objAll.alternatePhoneNumber && objAll.alternatePhoneNumber.length <= 1) {
            toast.error('Invalid alternate phone number') // Validate alternate phone number
        } else if (
            alternatePhoneNumber &&
            objAll.alternatePhoneNumber &&
            !alternatePhoneNumber.isValid()
        ) {
            toast.error('Invalid alternate phone number') // Validate alternate phone number
        } else if (maritalStatusDto.length == 0) {
            toast.error('Please Select Marital Status') // Ensure marital status is selected
        } else if (jobRoleDtos.length == 0) {
            toast.error('Please Select Job Role') // Ensure job role is selected
        } else if (managerGet.length == 0) {
            toast.error('Please Select Reporting Manager')
        } else {
            // Prepare the FormData object with employee data and files for upload
            let empData = new FormData()
            photo && empData.append('photo', photo) // Append photo file if exists
            const filteredFiles = educationSelectedFiles.filter((file) => file instanceof File)
            filteredFiles.forEach((file) => {
                empData.append('educationfiles', file) // Append education files
            })

            const expFilteredFiles = experienceSelectedFiles.filter((file) => file instanceof File)
            expFilteredFiles.forEach((file) => {
                empData.append('experiencefiles', file) // Append experience files
            })

            const idpFilteredFiles = idproofSelectedFiles.filter((file) => file instanceof File)
            idpFilteredFiles.forEach((file) => {
                empData.append('idprooffiles', file) // Append ID proof files
            })
            empData.append('employees', JSON.stringify(objAll)) // Append employee data as JSON
            setLoading(true) // Set loading state to true before API call

            // Call the update function to send the data
            UpdateWithFile({
                entity: 'employees',
                organizationId: userDetails.organizationId,
                id: objAll.id,
                body: empData,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Employee',
                    operationType: 'update'
                }),
                screenName: 'employees'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false) // Stop loading state after successful API call
                        e != 'Active' && ToastSuccess(res.message) // Show success message if employee status is not "Active"
                        employeeData.id ? navigate('/employeeList') : navigate('/') // Navigate to employee list or home
                    }
                })
                .catch((err) => {
                    setLoading(false) // Stop loading state in case of an error
                    console.log(err, 'error')
                    ToastError(err.message) // Show error message from the API
                })
        }
    }

    // handleNavigate function to redirect to employee list page
    const navigate = useNavigate()
    const handleNavigate = () => {
        navigate('/employeeList') // Navigate to employee list page
    }

    // Tooltip component for displaying a message when the user hovers over an element
    const tooltip = (
        <Tooltip id="tooltip">Click here to Update your photo</Tooltip> // Tooltip message when hovered
    )

    // Function to format a number into the Indian number format (e.g., 1,00,000)
    const formatNumber = (number) => {
        if (number == null) return '' // Return an empty string if number is null
        return new Intl.NumberFormat('en-IN').format(number) // Format the number as per Indian locale
    }

    // Function to handle key press events on inputs
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

    // Function to clean up form errors by removing any keys with empty string values
    const cleanFormErrors = (errors) => {
        for (const key in errors) {
            if (errors[key] === '') {
                // Check if the error value is an empty string
                delete errors[key] // Remove the key from errors if its value is empty
            }
        }
        return errors // Return the cleaned errors object
    }
    console.log(formErrors, 'chekingFormErrors')
    // Clean the form errors by removing any empty error values
    const cleanedFormErrors = cleanFormErrors(formErrors) // Apply the cleaning function on formErrors object
    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <div className="detailBackground">
                <section className="section ">
                    <div className="">
                        <div className="container ">
                            <div className="row mb-2">
                                <div className="col-sm-12">
                                    <div className="row mb-2"></div>
                                    {/* Tabs component with active key set to 'next' and 'updateStep' function for step selection */}
                                    <Tabs activeKey={next} onSelect={updateStep}>
                                        <Tab
                                            className="tabText" // Applying 'tabText' class for styling this specific Tab
                                            eventKey={0} // The event key to identify the tab. Here, it's set to '0', which means it's the first tab.
                                            onClick={() => updateStep(0)} // On click of this tab, the 'updateStep' function is called with the argument '0'
                                            id="officialInformation" // Unique ID for the tab, used for identifying it
                                            title="Official Information" // The title of the tab which will be displayed to the user
                                        >
                                            <section className="">
                                                {' '}
                                                {/* A section element, likely used to group the content for the tab */}
                                                <div className="container-fluid">
                                                    {' '}
                                                    {/* A container with full-width support */}
                                                    <div className="row">
                                                        {' '}
                                                        {/* Grid row for responsive layout */}
                                                        <div className="col-md-12">
                                                            {' '}
                                                            {/* A full-width column for medium screens and up */}
                                                            <div className="">
                                                                {' '}
                                                                {/* Empty div, likely used for additional styling or structure */}
                                                                <PageHeader pageTitle="Employee Details" />{' '}
                                                                {/* Rendering a header component with the title 'Employee Details' */}
                                                                <div>
                                                                    <>
                                                                        {/* Conditional rendering based on the status and employeeData */}
                                                                        {status == 'Draft' ||
                                                                            employeeData.id == null ? ( // If status is "Draft" or employeeData.id is null, do not show the following components
                                                                            ''
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    marginLeft:
                                                                                        '53%'
                                                                                }}
                                                                            >
                                                                                {' '}
                                                                                {/* If the condition is not met, render these elements with flex styling and margin-left */}
                                                                                <div>
                                                                                    {/* Rendering EmployeeLeaveBalance component with data passed as props */}

                                                                                    <EmployeeLeaveBalance
                                                                                        status={status} // Passing status to EmployeeLeaveBalance component
                                                                                        employeeData={
                                                                                            employeeData
                                                                                        } // Passing employeeData to EmployeeLeaveBalance component
                                                                                        employee={
                                                                                            getAllData
                                                                                        } // Passing additional data to the EmployeeLeaveBalance component
                                                                                    />


                                                                                </div>
                                                                                &emsp; &ensp;{' '}
                                                                                {/* Adding some spacing between the two divs */}
                                                                                <div>
                                                                                    {/* Rendering EmployeeProjectDetails component with data passed as props */}
                                                                                    <EmployeeProjectDetails
                                                                                        employeeData={
                                                                                            employeeData
                                                                                        } // Passing employeeData to EmployeeProjectDetails component
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>

                                                                    <div className="card-body">
                                                                        <div
                                                                            style={{
                                                                                marginTop: '5%',
                                                                                marginLeft: '38px'
                                                                            }}
                                                                        >
                                                                            <form>
                                                                                <Row>
                                                                                    <div className="col-6">
                                                                                        {/* Form group for location, conditionally styling based on employeeData */}
                                                                                        <Form.Group
                                                                                            controlId="employeeLocation"
                                                                                            as={Row}
                                                                                            style={{
                                                                                                // If employeeData exists and has a non-null id, add a 10% top margin
                                                                                                marginTop:
                                                                                                    employeeData &&
                                                                                                        employeeData.id !==
                                                                                                        null
                                                                                                        ? '10%'
                                                                                                        : '0%'
                                                                                            }}
                                                                                            className="mb-0"
                                                                                        //controlId="formGroupBranch"  {/* Commented out controlId */}
                                                                                        >
                                                                                            {/* Label for Location field */}
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
                                                                                                </span>{' '}
                                                                                                {/* Asterisk indicates a required field */}
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
                                                                                                {/* Displaying location name if available, fallback to getAllData.locationName */}
                                                                                                <div>
                                                                                                    <span>
                                                                                                        {locationName
                                                                                                            ? locationName
                                                                                                            : getAllData.locationName}
                                                                                                    </span>{' '}
                                                                                                    {/* Link to trigger modal for changing the location */}
                                                                                                    <span>
                                                                                                        <a
                                                                                                            id="employeeLocation"
                                                                                                            className=""
                                                                                                            style={{
                                                                                                                fontWeight:
                                                                                                                    '600'
                                                                                                            }}
                                                                                                            onClick={() =>
                                                                                                                onShowModal(
                                                                                                                    'Location',
                                                                                                                    'readOnly'
                                                                                                                )
                                                                                                            } // onClick triggers modal
                                                                                                        >
                                                                                                            {/* Display "Change" icon if locationDtos is not empty, otherwise show "Add Location" */}
                                                                                                            {locationDtos.length !==
                                                                                                                0 ? (
                                                                                                                <ChangeIcon />
                                                                                                            ) : (
                                                                                                                <u>
                                                                                                                    Add
                                                                                                                    Location
                                                                                                                </u>
                                                                                                            )}
                                                                                                        </a>
                                                                                                    </span>
                                                                                                </div>
                                                                                                <p className="error">
                                                                                                    {
                                                                                                        formErrors.locationDto
                                                                                                    }
                                                                                                </p>
                                                                                            </Col>
                                                                                            {/* Closing Form.Group */}
                                                                                        </Form.Group>
                                                                                    </div>

                                                                                    <div className="col-6">
                                                                                        {/* Form group for photo upload, with margin and styling adjustments */}
                                                                                        <Form.Group
                                                                                            as={Row}
                                                                                            className="mb-3"
                                                                                            controlId="employeePhoto" // Unique ID for the photo form group
                                                                                        //controlId="formGroupBranch"  {/* Commented out controlId */}
                                                                                        >
                                                                                            {/* Label for Photo field, with conditional marginTop based on employeeData */}
                                                                                            <Form.Label
                                                                                                id="employeePhoto"
                                                                                                style={{
                                                                                                    // If employeeData exists and has a non-null id, add a 10% top margin
                                                                                                    marginTop:
                                                                                                        employeeData &&
                                                                                                            employeeData.id !==
                                                                                                            null
                                                                                                            ? '10%'
                                                                                                            : '0%'
                                                                                                }}
                                                                                                column
                                                                                                sm={
                                                                                                    4
                                                                                                }
                                                                                            >
                                                                                                Photo{' '}
                                                                                                {/* Label text for the photo field */}
                                                                                            </Form.Label>

                                                                                            {/* Check if formData.id is null (indicating new data) */}
                                                                                            {formData.id ==
                                                                                                null ? (
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    {/* Input field for file selection (photo upload), only accepting JPEG, PNG, JPG */}
                                                                                                    <Form.Control
                                                                                                        id="employeePhoto"
                                                                                                        type="file"
                                                                                                        size="sm"
                                                                                                        accept="image/jpg, image/jpeg, image/png" // Supported file types
                                                                                                        onChange={(
                                                                                                            event
                                                                                                        ) => {
                                                                                                            handleFileSelect(
                                                                                                                event
                                                                                                            ) // Function to handle file selection
                                                                                                        }}
                                                                                                        name="file" // Name for the file input
                                                                                                    />
                                                                                                    {/* Display error message if there's an issue with the file size */}
                                                                                                    <p className="error">
                                                                                                        {formErrors &&
                                                                                                            formErrors.photoSize}{' '}
                                                                                                        {/* Display specific error related to photo size */}
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
                                                                                                                'Only JPEG, PNG and JPG are accepted'
                                                                                                            }{' '}
                                                                                                            {/* Inform user of acceptable file types */}
                                                                                                        </p>
                                                                                                    </p>
                                                                                                </Col>
                                                                                            ) : (
                                                                                                // If formData.id is not null (existing data), display the photo
                                                                                                <>
                                                                                                    <Col
                                                                                                        sm={
                                                                                                            4
                                                                                                        }
                                                                                                    >
                                                                                                        {/* Overlay trigger to show tooltip when hovering over the photo */}
                                                                                                        <OverlayTrigger
                                                                                                            id="employeePhoto"
                                                                                                            placement="bottom"
                                                                                                            overlay={
                                                                                                                tooltip
                                                                                                            } // Tooltip content
                                                                                                        >
                                                                                                            {/* Display the photo if available or fallback to profile image */}
                                                                                                            {photo ||
                                                                                                                getAllData.photo ? (
                                                                                                                <img
                                                                                                                    id="employeePhoto"
                                                                                                                    src={
                                                                                                                        // Display either selected photo or base64-encoded employee photo
                                                                                                                        photo
                                                                                                                            ? URL.createObjectURL(
                                                                                                                                photo
                                                                                                                            ) // Local image URL
                                                                                                                            : employeeData.id !==
                                                                                                                            null &&
                                                                                                                            `data:image/jpeg;base64,${getAllData.photo}` // Base64 encoded image for existing data
                                                                                                                    }
                                                                                                                    style={{
                                                                                                                        height: '100px', // Set image height
                                                                                                                        float: 'right' // Align image to the right
                                                                                                                    }}
                                                                                                                    alt="please Upload Photo" // Alt text if the image is not loaded
                                                                                                                    onClick={() =>
                                                                                                                        onShowModal(
                                                                                                                            'Change Photo',
                                                                                                                            'readOnly'
                                                                                                                        )
                                                                                                                    } // Trigger modal to change photo
                                                                                                                />
                                                                                                            ) : (
                                                                                                                // If no photo is available, show default profile image
                                                                                                                <img
                                                                                                                    id="employeePhoto"
                                                                                                                    src="/dist/Images/profileImage.png" // Default profile image path
                                                                                                                    height={
                                                                                                                        '100px'
                                                                                                                    } // Set image height
                                                                                                                    alt="image" // Alt text for the default image
                                                                                                                    onClick={() =>
                                                                                                                        onShowModal(
                                                                                                                            'Change Photo',
                                                                                                                            'readOnly'
                                                                                                                        )
                                                                                                                    } // Trigger modal to change photo
                                                                                                                />
                                                                                                            )}
                                                                                                        </OverlayTrigger>
                                                                                                    </Col>
                                                                                                </>
                                                                                            )}
                                                                                        </Form.Group>
                                                                                    </div>

                                                                                    <div className="col-6">
                                                                                        {/* Form group for Employee Code input field with margin-bottom spacing */}
                                                                                        <Form.Group
                                                                                            as={Row}
                                                                                            className="mb-3"
                                                                                            controlId="employeeCode" // Unique ID for the Employee Code form group
                                                                                        //controlId="formGroupCode"  {/* Commented out controlId */}
                                                                                        >
                                                                                            {/* Label for Employee Code field with required indicator */}
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
                                                                                                </span>{' '}
                                                                                                {/* Asterisk indicates the field is required */}
                                                                                            </Form.Label>
                                                                                            <Col
                                                                                                sm={
                                                                                                    6
                                                                                                }
                                                                                            >
                                                                                                {/* Input field for Employee Code */}
                                                                                                <Form.Control
                                                                                                    id="employeeCode" // Unique ID for the input field
                                                                                                    // onKeyDown handler to prevent specific keys from being typed in the input field
                                                                                                    onKeyDown={(
                                                                                                        e
                                                                                                    ) => {
                                                                                                        // Prevent the user from entering symbols like +, -, /, ., ,, and =
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
                                                                                                            e.preventDefault() // Prevent default action if any of the restricted keys are pressed
                                                                                                        }
                                                                                                    }}
                                                                                                    size="sm" // Set input field size to small
                                                                                                    required // Mark the field as required
                                                                                                    name="code" // Name for the input field
                                                                                                    onBlur={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange function when the field loses focus
                                                                                                    defaultValue={
                                                                                                        getAllData &&
                                                                                                        getAllData.code
                                                                                                    } // Set default value to the existing code from getAllData
                                                                                                    onChange={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange function on input change
                                                                                                    maxLength={
                                                                                                        50
                                                                                                    }
                                                                                                />
                                                                                                {/* Display error message for the Employee Code field */}
                                                                                                <p className="error">
                                                                                                    {
                                                                                                        formErrors.code
                                                                                                    }
                                                                                                </p>{' '}
                                                                                                {/* Show any validation error related to the code field */}
                                                                                            </Col>
                                                                                        </Form.Group>
                                                                                    </div>

                                                                                    <div className="col-6">
                                                                                        {/* Form group for First Name input field, with margin-bottom spacing */}
                                                                                        <Form.Group
                                                                                            as={Row}
                                                                                            className="mb-3"
                                                                                            controlId="employeeFirstName" // Unique ID for the First Name form group
                                                                                        //controlId="formGroupFirstName"  {/* Commented out controlId */}
                                                                                        >
                                                                                            {/* Label for First Name field with required indicator */}
                                                                                            <Form.Label
                                                                                                id="employeeFirstName"
                                                                                                column
                                                                                                sm={
                                                                                                    4
                                                                                                }
                                                                                            >
                                                                                                First
                                                                                                Name{' '}
                                                                                                <span className="error">
                                                                                                    *
                                                                                                </span>{' '}
                                                                                                {/* Asterisk indicates required field */}
                                                                                            </Form.Label>

                                                                                            <Col
                                                                                                sm={
                                                                                                    2
                                                                                                }
                                                                                                style={{
                                                                                                    width: '109px'
                                                                                                }}
                                                                                            >
                                                                                                {/* Dropdown for selecting the title (e.g., Mr., Mrs., etc.) */}
                                                                                                <Select
                                                                                                    size="sm" // Set the size of the dropdown to small
                                                                                                    id="employeeTitle" // Unique ID for the title dropdown
                                                                                                    // Filter the categoryOptions to find the selected title based on the value
                                                                                                    value={categoryOptions.filter(
                                                                                                        (
                                                                                                            e
                                                                                                        ) =>
                                                                                                            e.value ==
                                                                                                            title
                                                                                                    )}
                                                                                                    // Disable the dropdown if the status is "Active" and title is not null
                                                                                                    isDisabled={
                                                                                                        getAllData.status ==
                                                                                                        'Active' &&
                                                                                                        getAllData.title !=
                                                                                                        null
                                                                                                    }
                                                                                                    placeholder="" // Empty placeholder text
                                                                                                    options={
                                                                                                        categoryOptions
                                                                                                    } // Set available options for the dropdown
                                                                                                    onChange={
                                                                                                        handleCategorySelection
                                                                                                    } // Trigger handleCategorySelection when an option is selected
                                                                                                />
                                                                                            </Col>

                                                                                            <Col
                                                                                                sm={
                                                                                                    4
                                                                                                }
                                                                                                style={{
                                                                                                    marginLeft:
                                                                                                        '-18px'
                                                                                                }}
                                                                                            >
                                                                                                {/* Input field for First Name */}
                                                                                                <Form.Control
                                                                                                    id="employeeFirstName" // Unique ID for the input field
                                                                                                    size='sm'
                                                                                                    required // Mark the field as required
                                                                                                    // Set default value to the first name from getAllData if available
                                                                                                    defaultValue={
                                                                                                        getAllData &&
                                                                                                        getAllData.firstName
                                                                                                    }
                                                                                                    name="firstName" // Name for the input field
                                                                                                    maxLength={
                                                                                                        100
                                                                                                    }
                                                                                                    onBlur={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange when the field loses focus
                                                                                                    onChange={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange on input change
                                                                                                    // Key press, paste, and input events to handle validation or formatting errors
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
                                                                                                />
                                                                                                {/* Display error message for the First Name field */}
                                                                                                <p className="error">
                                                                                                    {
                                                                                                        formErrors.firstName
                                                                                                    }
                                                                                                </p>{' '}
                                                                                                {/* Show validation error if any */}
                                                                                            </Col>
                                                                                        </Form.Group>
                                                                                    </div>

                                                                                    <div className="col-6">
                                                                                        {/* Form group for Middle Name input field with margin-bottom spacing */}
                                                                                        <Form.Group
                                                                                            controlId="employeeMiddleName" // Unique ID for the Middle Name form group
                                                                                            as={Row}
                                                                                            className="mb-3"
                                                                                        //controlId="formGroupMiddleName"  {/* Commented out controlId */}
                                                                                        >
                                                                                            {/* Label for Middle Name field */}
                                                                                            <Form.Label
                                                                                                id="employeeMiddleName"
                                                                                                column
                                                                                                sm={
                                                                                                    5
                                                                                                }
                                                                                            >
                                                                                                Middle
                                                                                                Name{' '}
                                                                                                {/* Label text for the middle name field */}
                                                                                            </Form.Label>

                                                                                            <Col
                                                                                                sm={
                                                                                                    6
                                                                                                }
                                                                                            >
                                                                                                {/* Input field for Middle Name */}
                                                                                                <Form.Control
                                                                                                    id="employeeMiddleName" // Unique ID for the input field
                                                                                                    onChange={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange on input change
                                                                                                    required // Mark the field as required
                                                                                                    size="sm" // Set the input field size to small
                                                                                                    type="text" // Define the input type as text
                                                                                                    maxLength={
                                                                                                        100
                                                                                                    }
                                                                                                    // Key press, paste, and input events to handle validation or formatting errors
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
                                                                                                    // Set default value to the middle name from getAllData if available
                                                                                                    defaultValue={
                                                                                                        getAllData &&
                                                                                                        getAllData.middleName
                                                                                                    }
                                                                                                    name="middleName" // Name for the input field
                                                                                                />
                                                                                            </Col>
                                                                                        </Form.Group>
                                                                                    </div>

                                                                                    <div className="col-6">
                                                                                        {/* Form group for Last Name input field with margin-bottom spacing */}
                                                                                        <Form.Group
                                                                                            as={Row}
                                                                                            controlId="employeeLastName" // Unique ID for the Last Name form group
                                                                                            className="mb-3"
                                                                                        //controlId="formGroupLastName"  {/* Commented out controlId */}
                                                                                        >
                                                                                            {/* Label for Last Name field, with a required indicator (asterisk) */}
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
                                                                                                </span>{' '}
                                                                                                {/* Asterisk indicates required field */}
                                                                                            </Form.Label>

                                                                                            <Col
                                                                                                sm={
                                                                                                    6
                                                                                                }
                                                                                            >
                                                                                                {/* Input field for Last Name */}
                                                                                                <Form.Control
                                                                                                    id="employeeLastName" // Unique ID for the input field
                                                                                                    required // Mark the field as required
                                                                                                    size="sm" // Set the input field size to small
                                                                                                    maxLength={
                                                                                                        100
                                                                                                    }
                                                                                                    name="lastName" // Name for the input field
                                                                                                    // Key press, paste, and input events to handle validation or formatting errors
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
                                                                                                    onBlur={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange when the field loses focus
                                                                                                    // Set default value to the last name from getAllData if available
                                                                                                    defaultValue={
                                                                                                        getAllData &&
                                                                                                        getAllData.lastName
                                                                                                    }
                                                                                                    onChange={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange on input change
                                                                                                />
                                                                                                {/* Display error message for the Last Name field */}
                                                                                                <p className="error">
                                                                                                    {
                                                                                                        formErrors.lastName
                                                                                                    }
                                                                                                </p>{' '}
                                                                                                {/* Show validation error if any */}
                                                                                            </Col>
                                                                                        </Form.Group>
                                                                                    </div>


                                                                                    <div className="col-6">
                                                                                        {/* Form group for Email input field with margin-bottom spacing */}
                                                                                        <Form.Group
                                                                                            as={Row}
                                                                                            className="mb-3"
                                                                                            controlId="employeeEmail" // Unique ID for the Email form group
                                                                                        //controlId="formGroupEmail"  {/* Commented out controlId */}
                                                                                        >
                                                                                            {/* Label for Email field, with required indicator (asterisk) */}
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
                                                                                                </span>{' '}
                                                                                                {/* Asterisk indicates required field */}
                                                                                            </Form.Label>

                                                                                            <Col
                                                                                                sm={
                                                                                                    6
                                                                                                }
                                                                                            >
                                                                                                {/* Input field for Email */}
                                                                                                <Form.Control
                                                                                                    id="employeeEmail" // Unique ID for the input field
                                                                                                    maxLength={
                                                                                                        50
                                                                                                    } // Set the maximum length for the email input to 50 characters
                                                                                                    size="sm" // Set input field size to small
                                                                                                    // Disable the field if the status is "Active"
                                                                                                    disabled={
                                                                                                        getAllData.status ==
                                                                                                        'Active'
                                                                                                    }
                                                                                                    required // Mark the field as required
                                                                                                    name="email" // Name for the input field
                                                                                                    onBlur={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange when the field loses focus
                                                                                                    // Set default value to the email from getAllData if available
                                                                                                    defaultValue={
                                                                                                        getAllData &&
                                                                                                        getAllData.email
                                                                                                    }
                                                                                                    onChange={
                                                                                                        handleInputChange
                                                                                                    } // Trigger handleInputChange on input change
                                                                                                />
                                                                                                {/* Display error message for the Email field */}
                                                                                                <p className="error">
                                                                                                    {
                                                                                                        formErrors.email
                                                                                                    }
                                                                                                </p>{' '}
                                                                                                {/* Show validation error if any */}
                                                                                            </Col>
                                                                                        </Form.Group>
                                                                                    </div>

                                                                                    <div className="col-6">
                                                                                        {/* Form group for Date of Joining field with margin-bottom spacing */}
                                                                                        <Form.Group
                                                                                            as={Row}
                                                                                            className="mb-3"
                                                                                            controlId="employeeDateOfJoining" // Unique ID for the Date of Joining form group
                                                                                        //controlId="formGroupDateOfJoining"  {/* Commented out controlId */}
                                                                                        >
                                                                                            {/* Label for Date of Joining field with required indicator (asterisk) */}
                                                                                            <Form.Label
                                                                                                id="employeeDateOfJoining"
                                                                                                column
                                                                                                sm={
                                                                                                    4
                                                                                                }
                                                                                            >
                                                                                                Date
                                                                                                of
                                                                                                Joining{' '}
                                                                                                <span className="error">
                                                                                                    *
                                                                                                </span>{' '}
                                                                                                {/* Asterisk indicates required field */}
                                                                                            </Form.Label>

                                                                                            <Col
                                                                                                sm={
                                                                                                    3
                                                                                                }
                                                                                            >
                                                                                                {/* DatePicker component for selecting the Date of Joining */}
                                                                                                <DatePicker
                                                                                                    id="employeeDateOfJoining" // Unique ID for the Date of Joining input field
                                                                                                    placeholder="Select Date" // Placeholder text when the date is not selected
                                                                                                    inputReadOnly={
                                                                                                        true
                                                                                                    } // Set the input field to read-only (user can't type directly)
                                                                                                    allowClear={
                                                                                                        false
                                                                                                    } // Disallow clearing the selected date
                                                                                                    onChange={
                                                                                                        handleDateOfJoining
                                                                                                    } // Trigger handleDateOfJoining when a date is selected
                                                                                                    // Disable the date picker if the status is "Active"
                                                                                                    disabled={
                                                                                                        getAllData.status ==
                                                                                                        'Active'
                                                                                                    }
                                                                                                    // Disable dates before the day after the selected Date of Birth
                                                                                                    disabledDate={(
                                                                                                        current
                                                                                                    ) => {
                                                                                                        const tomorrow =
                                                                                                            new Date(
                                                                                                                dateOfBirth
                                                                                                            ) // Create a new Date object for Date of Birth
                                                                                                        tomorrow.setDate(
                                                                                                            tomorrow.getDate() +
                                                                                                            1
                                                                                                        ) // Set the date to the day after Date of Birth
                                                                                                        let customDate =
                                                                                                            moment(
                                                                                                                tomorrow
                                                                                                            ).format(
                                                                                                                'YYYY-MM-DD'
                                                                                                            ) // Format the date to "YYYY-MM-DD"
                                                                                                        return (
                                                                                                            current &&
                                                                                                            current <
                                                                                                            moment(
                                                                                                                customDate,
                                                                                                                'YYYY-MM-DD'
                                                                                                            ) // Disable dates before the formatted custom date
                                                                                                        )
                                                                                                    }}
                                                                                                    // Set the selected value, or null if no date is selected
                                                                                                    value={
                                                                                                        dateOfJoining ==
                                                                                                            null
                                                                                                            ? null
                                                                                                            : moment(
                                                                                                                dateOfJoining
                                                                                                            )
                                                                                                    }
                                                                                                    required // Mark the field as required
                                                                                                    format={
                                                                                                        'DD-MM-YYYY'
                                                                                                    } // Set the date format to "DD-MM-YYYY"
                                                                                                    size="sm" // Set input field size to small
                                                                                                    // onBlur event to handle form validation for required field
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
                                                                                                                        'Required' // Set error message if no date is selected
                                                                                                                }
                                                                                                            )
                                                                                                            : setFormErrors(
                                                                                                                {
                                                                                                                    ...formErrors,
                                                                                                                    dateOfJoining:
                                                                                                                        '' // Clear error message if date is selected
                                                                                                                }
                                                                                                            )
                                                                                                    }
                                                                                                    name="dateOfJoining" // Name for the input field
                                                                                                />
                                                                                                {/* Display error message for the Date of Joining field */}
                                                                                                <p className="error">
                                                                                                    {
                                                                                                        formErrors.dateOfJoining
                                                                                                    }
                                                                                                </p>{' '}
                                                                                                {/* Show validation error if any */}
                                                                                            </Col>

                                                                                            {/* Link for Earnings, displayed next to the Date of Joining field */}
                                                                                            <Col
                                                                                                sm={
                                                                                                    3
                                                                                                }
                                                                                                style={{
                                                                                                    marginTop:
                                                                                                        '2%'
                                                                                                }}
                                                                                            >
                                                                                                <span>
                                                                                                    <a
                                                                                                        id="addEarnings"
                                                                                                        className=""
                                                                                                        style={{
                                                                                                            fontWeight:
                                                                                                                '600'
                                                                                                        }}
                                                                                                        onClick={() =>
                                                                                                            onShowModal(
                                                                                                                'Financial Year',
                                                                                                                'readOnly'
                                                                                                            )
                                                                                                        }
                                                                                                        variant="addbtn"
                                                                                                    >
                                                                                                        <u>
                                                                                                            Earnings
                                                                                                        </u>{' '}
                                                                                                        {/* Link to open Earnings modal */}
                                                                                                    </a>
                                                                                                </span>
                                                                                            </Col>
                                                                                        </Form.Group>
                                                                                    </div>

                                                                                    {/* Input field for Place of Employment Type */}
                                                                                    <div className="col-6">
                                                                                        <Form.Group
                                                                                            as={Row}
                                                                                            className="mb-3"
                                                                                            controlId="employeeEmploymentType" // Unique ID for the Employment Type form group
                                                                                        //controlId="formGroupEmployeeType"
                                                                                        >
                                                                                            <Form.Label
                                                                                                id="employeeEmploymentType"
                                                                                                column
                                                                                                sm={
                                                                                                    5
                                                                                                }
                                                                                            >
                                                                                                Employment Type
                                                                                                <span className="error"> *</span>{' '}
                                                                                            </Form.Label>
                                                                                            <Col
                                                                                                sm={
                                                                                                    6
                                                                                                }
                                                                                            >
                                                                                                <Select
                                                                                                    size="sm" // Set the size of the dropdown to small
                                                                                                    id="employeeEmploymentType" // Unique ID for the Employment Type select input
                                                                                                    placeholder=""
                                                                                                    onChange={
                                                                                                        handleEmployeeSelection
                                                                                                    }
                                                                                                    options={
                                                                                                        employeeOptions
                                                                                                    }
                                                                                                    required

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
                                                                                        {/* Modal Popup for Job Role */}
                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-"
                                                                                                controlId="employeeJobRole" // Unique ID for the Job Role form group
                                                                                            //controlId="formGroupMaritalStatus"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeJobRole"
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
                                                                                                                    id="employeeJobRole"
                                                                                                                    className=""
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
                                                                                                            formErrors.locationDto
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
                                                                                                            </Form.Label>
                                                                                                            <Col sm={6}>
                                                                                                                <Form.Control
                                                                                                                    size='sm'
                                                                                                                    placeholder={getAllData.clientName ? getAllData.clientName : "Not Assigned Yet"}
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
                                                                                                                <span className="error"> *</span>{' '}
                                                                                                            </Form.Label>
                                                                                                            <Col sm={6}
                                                                                                            >
                                                                                                                <DatePicker
                                                                                                                    allowClear={false}
                                                                                                                    onChange={handleContrctToDateChange}
                                                                                                                    disabled={!dateOfJoining}
                                                                                                                    onBlur={(e) => !e.target.value ? setFormErrors({ ...formErrors, contractToDate: 'Required' }) : setFormErrors({ ...formErrors, contractToDate: '' })}
                                                                                                                    value={contractToDate == null ? null : moment(contractToDate)}
                                                                                                                    disabledDate={(current) => {
                                                                                                                        const tomorrow = new Date(dateOfJoining)
                                                                                                                        tomorrow.setDate(tomorrow.getDate())
                                                                                                                        let customDate =
                                                                                                                            moment(tomorrow).format('YYYY-MM-DD')
                                                                                                                        return (
                                                                                                                            current &&
                                                                                                                            current < moment(customDate, 'YYYY-MM-DD')
                                                                                                                        )
                                                                                                                    }}
                                                                                                                />
                                                                                                                <p className="error">{formErrors.contractToDate}</p>
                                                                                                            </Col>
                                                                                                        </Form.Group>
                                                                                                    </div>
                                                                                                </>
                                                                                            )
                                                                                        }
                                                                                        {/* Input field for Place of Department */}
                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-3"
                                                                                                controlId="employeeDepartment" // Unique ID for the Department form group
                                                                                            // controlId="formGroupDepartment"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeDepartment"
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
                                                                                                                departmentId
                                                                                                        )}
                                                                                                        options={
                                                                                                            departmentOptions
                                                                                                        }
                                                                                                        onChange={
                                                                                                            handleDepartMentSelect
                                                                                                        }
                                                                                                        name="department"
                                                                                                    />
                                                                                                    <p className="error"></p>
                                                                                                </Col>
                                                                                            </Form.Group>
                                                                                        </div>
                                                                                        {/* Input field for Place of  Notice Period */}
                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-3"
                                                                                                controlId="employeeNoticePeriodDays" // Unique ID for the Notice Period form group
                                                                                            //controlId="formGroupNoticePeriodDays"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeNoticePeriodDays"
                                                                                                    column
                                                                                                    sm={
                                                                                                        4
                                                                                                    }
                                                                                                >
                                                                                                    Notice
                                                                                                    Period{' '}
                                                                                                    <span className="error">
                                                                                                        *
                                                                                                    </span>{' '}
                                                                                                </Form.Label>
                                                                                                <Col
                                                                                                    sm={
                                                                                                        6
                                                                                                    }
                                                                                                >
                                                                                                    <Form.Control
                                                                                                        id="employeeNoticePeriodDays" // Unique ID for the Notice Period input field
                                                                                                        max={
                                                                                                            200
                                                                                                        }
                                                                                                        min={0} maxLength={
                                                                                                            3
                                                                                                        }
                                                                                                        onKeyPress={
                                                                                                            handleKeyDown
                                                                                                        }
                                                                                                        onChange={
                                                                                                            handleInputChange
                                                                                                        }
                                                                                                        required
                                                                                                        size="sm"
                                                                                                        onBlur={
                                                                                                            handleInputChange
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

                                                                                        {status ==
                                                                                            'Draft' ||
                                                                                            employeeData.id ==
                                                                                            null ? (
                                                                                            ''
                                                                                        ) : (
                                                                                            //Modal Popup for Employee Status
                                                                                            <div className="col-6">
                                                                                                <Form.Group
                                                                                                    as={
                                                                                                        Row
                                                                                                    }
                                                                                                    className="mb-3"
                                                                                                    controlId="employeeStatus" // Unique ID for the Status form group
                                                                                                // controlId="formGroupStatus"
                                                                                                >
                                                                                                    <Form.Label
                                                                                                        column
                                                                                                        sm={
                                                                                                            5
                                                                                                        }
                                                                                                    >
                                                                                                        Status
                                                                                                    </Form.Label>
                                                                                                    <Col
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
                                                                                                                {status
                                                                                                                    ? status
                                                                                                                    : getAllData.status}
                                                                                                            </span>{' '}
                                                                                                            <span>
                                                                                                                <a
                                                                                                                    id="employeeStatus"
                                                                                                                    className=""
                                                                                                                    style={{
                                                                                                                        fontWeight:
                                                                                                                            '600'
                                                                                                                    }}
                                                                                                                    onClick={() =>
                                                                                                                        onShowModal(
                                                                                                                            'Employee Status',
                                                                                                                            'readOnly'
                                                                                                                        )
                                                                                                                    }
                                                                                                                >
                                                                                                                    <ChangeIcon />
                                                                                                                </a>
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </Col>
                                                                                                </Form.Group>
                                                                                            </div>
                                                                                        )}
                                                                                        {/* Modal Popup for Employee Status */}
                                                                                        <div className="col-6">
                                                                                            <Form.Group
                                                                                                as={
                                                                                                    Row
                                                                                                }
                                                                                                className="mb-"
                                                                                                controlId="employeeShift" // Unique ID for the Shift form group
                                                                                            //controlId="formGroupMaritalStatus"
                                                                                            >
                                                                                                <Form.Label
                                                                                                    id="employeeShift"
                                                                                                    column
                                                                                                    sm={
                                                                                                        getAllData.status ==
                                                                                                            'Draft' ||
                                                                                                            employeeData.id ==
                                                                                                            null
                                                                                                            ? 5
                                                                                                            : 4
                                                                                                    }
                                                                                                >
                                                                                                    Shift
                                                                                                    Timings
                                                                                                    {/* <span className="error">*</span> */}
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
                                                                                                        {/* {shiftName == "" || shiftName == null ? <>Regular Shift Hours</> : shiftName} */}
                                                                                                        {shiftName
                                                                                                            ? shiftLastHistoryName &&
                                                                                                            shiftLastHistoryName.shiftName
                                                                                                            : getAllData.shiftName ||
                                                                                                            'Regular Shift Hours'}
                                                                                                        {getAllData.status ==
                                                                                                            'Terminated' ? (
                                                                                                            ''
                                                                                                        ) : (
                                                                                                            <span>
                                                                                                                <a
                                                                                                                    id="employeeShift"
                                                                                                                    className=""
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
                                                                                        {/* Modal Popup for Reporting Manager */}
                                                                                        <>
                                                                                            {employeeData.id ==
                                                                                                null ? (
                                                                                                ''
                                                                                            ) : (
                                                                                                <>
                                                                                                    <div className="col-6">
                                                                                                        <Manager
                                                                                                            dateOfJoining={
                                                                                                                dateOfJoining
                                                                                                            }
                                                                                                            getAllData={
                                                                                                                getAllData
                                                                                                            }
                                                                                                            employeeData={
                                                                                                                employeeData
                                                                                                            }
                                                                                                            setManagerGet={
                                                                                                                setManagerGet
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

                                                                                                    {/* Modal Popup for Compensation */}
                                                                                                    <div className="col-6">
                                                                                                        <Form.Group
                                                                                                            as={
                                                                                                                Row
                                                                                                            }
                                                                                                            className="mb-3"
                                                                                                            controlId="employeeCompensation" // Unique ID for the Compensation form group
                                                                                                        //controlId="formGroupBloodGroup"
                                                                                                        >
                                                                                                            <Form.Label
                                                                                                                id="employeeCompensation"
                                                                                                                column
                                                                                                                sm={
                                                                                                                    getAllData.status ==
                                                                                                                        'Draft' ||
                                                                                                                        employeeData.id ==
                                                                                                                        null
                                                                                                                        ? 5
                                                                                                                        : 4
                                                                                                                }
                                                                                                            >
                                                                                                                Compensation
                                                                                                            </Form.Label>
                                                                                                            <Col
                                                                                                                sm={
                                                                                                                    4
                                                                                                                }
                                                                                                            >
                                                                                                                {parseFloat(ctc) >
                                                                                                                    0 ? (
                                                                                                                    <a
                                                                                                                        id="employeeCompensation"
                                                                                                                        onClick={() =>
                                                                                                                            onShowModal(
                                                                                                                                'Annexure',
                                                                                                                                'readOnly'
                                                                                                                            )
                                                                                                                        }
                                                                                                                        className=""
                                                                                                                    >
                                                                                                                        <u>
                                                                                                                            {
                                                                                                                                getAllData.currencySymbol
                                                                                                                            }
                                                                                                                            {ctc &&
                                                                                                                                ctc ==
                                                                                                                                0
                                                                                                                                ? ''
                                                                                                                                : formatNumber(
                                                                                                                                    ctc
                                                                                                                                )}
                                                                                                                        </u>
                                                                                                                    </a>
                                                                                                                ) : (
                                                                                                                    ''
                                                                                                                )}
                                                                                                                &ensp;
                                                                                                                {getAllData.status !=
                                                                                                                    'Active' ? (
                                                                                                                    ''
                                                                                                                ) : (
                                                                                                                    <span>
                                                                                                                        <a
                                                                                                                            className=""
                                                                                                                            id="viewComponsesation"
                                                                                                                            style={{
                                                                                                                                fontWeight:
                                                                                                                                    '600'
                                                                                                                            }}
                                                                                                                            onClick={() =>
                                                                                                                                onShowModal(
                                                                                                                                    'Compensation History',
                                                                                                                                    'readOnly'
                                                                                                                                )
                                                                                                                            }
                                                                                                                        >
                                                                                                                            <ChangeIcon />
                                                                                                                        </a>
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </Col>
                                                                                                        </Form.Group>
                                                                                                    </div>
                                                                                                </>
                                                                                            )}
                                                                                        </>
                                                                                    </>
                                                                                </Row>
                                                                            </form>
                                                                        </div>
                                                                    </div>
                                                                    {/* getAllData={employeeData.id !== null ? employeeData.row : ""} */}
                                                                    {/*  */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </Tab>
                                        {/* Tab section for remaing entitys */}

                                        <Tab
                                            eventKey={1}
                                            onClick={() => updateStep(1)}
                                            id="personalInformation"
                                            title="Personal Information"
                                        >
                                            <PersonalInformation
                                                dateOfBirth={dateOfBirth}
                                                setDateOfBirth={setDateOfBirth}
                                                handleDateOfBirth={handleDateOfBirth}
                                                formErrors={formErrors}
                                                setFormErrors={setFormErrors}
                                                getAllData={getAllData}
                                                handleGenderSelection={handleGenderSelection}
                                                handleBloodGroupSelection={handleBloodGroupSelection}
                                                genderOptions={genderOptions}
                                                bloodGroupOptions={bloodGroupOptions}
                                                gender={gender}
                                                handleInputChange={handleInputChange}
                                                handleCurrencySelection={handleCurrencySelection}
                                                countriesOptions={countriesOptions}
                                                countryId={countryId}
                                                countryIsoCode={countryIsoCode}
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
                                                bloodGroup={bloodGroup}
                                                formData={formData}
                                                handlePHDCheck={handlePHDCheck}
                                                phdValue={phdValue}
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
                                                setChange={setChange}
                                                setFormData={setFormData}
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
                                                educationSelectedFiles={educationSelectedFiles}
                                                dateOfBirth={dateOfBirth}
                                            />
                                        </Tab>
                                        <Tab eventKey={5} onClick={() => updateStep(5)} id="experience" title="Experience">
                                            <Experience
                                                dateOfBirth={dateOfBirth}
                                                doj={dateOfJoining}
                                                setChange={setChange}
                                                setExperienceGet={setExperienceGet}
                                                experienceList={experienceGet ? experienceGet : []}
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
                                                setIdproofSelectedFiles={setIdproofSelectedFiles}
                                                employeeId={getAllData.id}
                                            />
                                        </Tab>
                                        <Tab eventKey={7} onClick={() => updateStep(7)} id="reference" title="References">
                                            <Reference
                                                setChange={setChange}
                                                setReferenceGet={setReferenceGet}
                                                references={referenceGet ? referenceGet : []}
                                                countries={countries}
                                            />
                                        </Tab>
                                        <Tab
                                            eventKey={8}
                                            onClick={() => updateStep(8)}
                                            id="emergencyContact"
                                            title="Emergency Contact"
                                        >
                                            <Family
                                                setChange={setChange}
                                                setFamilyGet={setFamilyGet}
                                                familyList={familyGet ? familyGet : []}
                                                countries={countries}
                                            />
                                        </Tab>
                                        <Tab eventKey={9} onClick={() => updateStep(9)} id="skill" title="Skills">
                                            <Skills
                                                setChange={setChange}
                                                dateOfBirth={dateOfBirth}
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
                    {mode == 'create' && (
                        <div className="btnCenter mb-3">
                            <Button
                                variant="addbtn"
                                id="employeeSave"
                                className="Button"
                                onClick={onSaveHandler}
                            >
                                Save
                            </Button>
                            <Button
                                id="employeeCancel"
                                className="Button"
                                variant="secondary"
                                onClick={handleNavigate}
                            >
                                {cancelButtonName}
                            </Button>
                        </div>
                    )}

                    {mode == 'edit' && (
                        <div className="btnCenter mb-3">
                            {/* {
                getAllData.status == "Draft" || getAllData.status == "Active" ? */}
                            <Button
                                id="employeeUpdate"
                                variant="addbtn"
                                className="Button"
                                onClick={onUpdateHandler}
                            >
                                Update
                            </Button>
                            {/* :""} */}

                            {getAllData.status == 'Draft' ? (
                                <Button
                                    id="employeeActive"
                                    className="Button"
                                    variant="addbtn"
                                    disabled={
                                        (getAllData.reportingmanagerDTOs &&
                                            getAllData.reportingmanagerDTOs.length <= 0) ||
                                        (getAllData && getAllData.reportingmanagerDTOs == null)
                                    }
                                    onClick={() => handleStatusActive('Active')}
                                >
                                    Active
                                </Button>
                            ) : (
                                ''
                            )}

                            <Button
                                id="employeeCancel"
                                variant="secondary"
                                className="Button"
                                onClick={handleNavigate}
                            >
                                {cancelButtonName}
                            </Button>
                        </div>
                    )}

                    {mode == 'view' && (
                        <div className="btnCenter mb-3">
                            <Button
                                id="employeePerformanceAppraisal"
                                className="Button"
                                variant="secondary"
                                onClick={() => navigate('/performanceAppraisal')}
                            >
                                {cancelButtonName}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Modal for All history screens */}
                <Modal
                    centered={heading == 'Annexure' ? true : false}
                    show={showModal}
                    // onHide={() => onShowModalCloseHandler(heading)}
                    backdrop="static"
                    size={
                        (heading && heading == 'Employee Status') ||
                            (heading && heading == 'Change Photo')
                            ? ''
                            : 'lg'
                    }
                    keyboard={false}
                >
                    <Modal.Header
                        id="closeAnnexure"
                        closeButton
                        onHide={() => onShowModalCloseHandler(heading)}
                    >
                        <Modal.Title>{heading}</Modal.Title>
                        {/* <Button variant='' onClick={() => onShowModalCloseHandler(heading)}>
              <IoIosCloseCircle style={{ fontSize: "40px", color: "gray" }} />
            </Button> */}
                    </Modal.Header>
                    <Modal.Body
                        style={{
                            maxHeight: heading == 'Annexure' ? '70vh' : '',
                            overflowY: heading == 'Annexure' ? 'auto' : ''
                        }}
                    >
                        {heading == 'Job Role' && (
                            <JobRoleModal
                                setJobRoleDtos={setJobRoleDtos}
                                jobRoleDtos={jobRoleDtos}
                                jobRoleName={jobRoleName}
                                setJobRoleName={setJobRoleName}
                                jobRole={jobRole}
                                setShowModal={setShowModal}
                                doj={getAllData.dateOfJoining || dateOfJoining}
                                orgDate={orgDate}
                                setJobRole={setJobRole}
                                onShowModalCloseHandler={() => onShowModalCloseHandler(heading)}
                            />
                        )}
                        {heading == 'Marital History' && (
                            <MaritalStatusModal
                                setMaritalStatusName={setMaritalStatusName}
                                setMarriageStatusDate={setMarriageStatusDate}
                                onShowModalCloseHandler={() => onShowModalCloseHandler(heading)}
                                maritalStatusName={maritalStatusName}
                                maritalStatusDto={maritalStatusDto}
                                maritalStatus={maritalStatus}
                                setShowModal={setShowModal}
                                dateOfBirth={dateOfBirth}
                                doj={getAllData.dateOfJoining || dateOfJoining}
                                setMaritalStatus={setMaritalStatus}
                                setMaritalStatusDto={setMaritalStatusDto}
                            />
                        )}
                        {heading == 'Employee Shifts' && (
                            <EmployeeShifts
                                setShiftName={setShiftName}
                                onShowModalCloseHandler={() => onShowModalCloseHandler(heading)}
                                shiftName={shiftName}
                                shiftsDtos={shiftsDtos}
                                shift={shift}
                                setShowModal={setShowModal}
                                doj={getAllData.dateOfJoining || dateOfJoining}
                                locId={locationId}
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

                        {heading == 'Location' && (
                            <LocationModal
                                onShowModalCloseHandler={() => onShowModalCloseHandler(heading)}
                                setLocationId={setLocationId}
                                setShowModal={setShowModal}
                                setLocationName={setLocationName}
                                locationName={locationName}
                                locationData={locationData}
                                locationId={locationId}
                                doj={getAllData.dateOfJoining || dateOfJoining}
                                locationOptions={locationOptions}
                                setLocationDtos={setLocationDtos}
                                locationDtos={locationDtos}
                            />
                        )}
                        {heading == 'Financial Year' && (
                            <FinancialYear
                                setShowModal={setShowModal}
                                financialYearData={financialYearData}
                                setFinancialYearData={setFinancialYearData}
                                onShowModalCloseHandler={() => onShowModalCloseHandler(heading)}
                            />
                        )}
                        {heading == 'Compensation History' && (
                            <div style={{ marginTop: '-13%' }}>
                                <CompensationHistory
                                    booleanValue={true}
                                    id={getAllData.id}
                                    doj={getAllData.dateOfJoining}
                                    locId={getAllData.locationId}
                                    onCompensationCloseHandler={() =>
                                        onShowModalCloseHandler(heading)
                                    }
                                />
                                <div className="singleBackButton">
                                    <Button
                                        id="componesationCloseFromEmployeeDetails"
                                        variant="secondary"
                                        className="Button"
                                        onClick={() => onShowModalCloseHandler(heading)}
                                    >
                                        {cancelButtonName}
                                    </Button>
                                </div>
                            </div>
                        )}
                        {heading == 'Employee Status' && (
                            <div className="formBody">
                                <div className="col-">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="EmployeeStatus" // Unique ID for the Employee Status form group
                                    //controlId="formGroupBranch"
                                    >
                                        <Form.Label id="EmployeeStatus" column sm={4}>
                                            Status
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Select
                                                id="EmployeeStatus"
                                                value={
                                                    status
                                                        ? { label: status }
                                                        : enumOptions.filter(
                                                            (e) => e.value == status
                                                        )
                                                }
                                                options={enumOptions}
                                                onChange={handleSelectionForEnum}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>
                                <div className="col-">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="statusRemarks" // Unique ID for the Status Remarks form group
                                    //controlId="formGroupBranch"
                                    >
                                        <Form.Label id="statusRemarks" column sm={4}>
                                            Remarks
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                as="textarea"
                                                id="statusRemarks"
                                                className=""
                                                style={{ width: '100%' }}
                                                onChange={handleInputChange}
                                                name="remarks"
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>
                            </div>
                        )}

                        {heading == 'Change Photo' && (
                            <form className="modalFormBody">
                                <center>
                                    <div className="mb-3">
                                        {(getAllData && getAllData.photo != null) ||
                                            photo != null ? (
                                            <img
                                                id="employeePhoto"
                                                src={
                                                    photo
                                                        ? URL.createObjectURL(photo)
                                                        : employeeData &&
                                                        employeeData.id !== null &&
                                                        `data:image/jpeg;base64,${getAllData.photo}`
                                                }
                                                height={'150px'}
                                                alt="Photo"
                                            />
                                        ) : (
                                            <img
                                                id="employeePhoto"
                                                src="/dist/Images/profileImage.png"
                                                height={'100px'}
                                                alt="image"
                                            />
                                        )}
                                    </div>

                                    <Form.Control
                                        id="employeePhoto"
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
                                    <p className="error">{formErrors && formErrors.photoSize}</p>
                                </center>
                            </form>
                        )}
                    </Modal.Body>
                    {heading == 'Employee Status' && (
                        <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                            <Button
                                id="employeeStatusUpdate"
                                className="Button"
                                variant="addbtn"
                                onClick={handleStatusUpdate}
                            >
                                Proceed
                            </Button>
                            <Button
                                id="employeeStatusCancel"
                                className="Button"
                                variant="secondary"
                                onClick={() => onShowModalCloseHandler(heading)}
                            >
                                {cancelButtonName}
                            </Button>
                        </div>
                    )}
                    {heading == 'Change Photo' && (
                        <div className="btnCenter" style={{ marginBottom: '2%' }}>
                            <Button
                                id="employeePhotoUpload"
                                variant="addbtn"
                                type="button"
                                className="Button"
                                onClick={handleFileUpload}
                            >
                                Upload
                            </Button>

                            <Button
                                id="employeePhotoCancel"
                                variant="secondary"
                                type="button"
                                className="Button"
                                onClick={() => onShowModalCloseHandler(heading)}
                            >
                                {cancelButtonName}
                            </Button>
                        </div>
                    )}
                </Modal>
            </div>
        </>
    )
}
export default EmployeeDetails
