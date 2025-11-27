import React, { useEffect, useState, useRef } from 'react'
import DragAndDrop from './DragAndDrop'
import Select from 'react-select'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import DragAndDropDed from './DragAndDropDed'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
    getAllById,
    getAllByOrgId,
    getById,
    save,
    update
} from '../../../Common/Services/CommonService'
import { toast } from 'react-toastify'
import Annexure from '../Reports/Annexure'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getPercentage } from '../../../Common/Services/OtherServices'
import {
    compareArrayOfObjects,
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'

const SalaryTemplate = () => {
    // Retrieve user details from the global state using Redux's useSelector
    const userDetails = useSelector((state) => state.user.userDetails)

    // Hook for navigation
    const navigate = useNavigate()

    // Hook for getting the current location (URL state)
    const location = useLocation()

    // Local state variables
    const [mode, setMode] = useState('') // Holds the mode of operation (create or edit)
    const [heads, setHeads] = useState([]) // Holds the list of salary components (heads)
    const [totalPercentage, setTotalPercentage] = useState(0) // Holds the total percentage value
    const [saveObj, setSaveObj] = useState(null) // Holds the object to be saved (could be a form data)
    const [currencyCode, setCurrencyCode] = useState(null) // Holds the currency code
    const [locationIds, setLocationIds] = useState([]) // Holds selected location IDs
    const [loading, setLoading] = useState(true) // Controls the loading state
    const pdfRef = useRef() // Reference to PDF rendering (likely used for exporting data as PDF)
    const isDisabled = totalPercentage > 100 // Determines if the form should be disabled based on the total percentage

    const [daData, setDaData] = useState([]) // Holds the data for DA (Dearness Allowance) components

    // Function to fetch the list of salary components (e.g., earnings, deductions) from the API
    const getAllSalaryComponentsList = () => {
        getAllByOrgId({
            entity: 'salarycomponents',
            organizationId: userDetails.organizationId
        }).then((res) => {
            if (res.statusCode == 200) {
                // Set the heads (salary components data)
                setHeads(res && res.data)

                // Filter and set DA data
                setDaData(res.data && res.data.filter((e) => e.da))

                // Filter and set earning components (excluding 'Basic' earning)
                const earningData = res.data.filter((e) => e.type.label === 'Earning' && !e.da);
                const earningsData = earningData.filter((e) => !e.basic)
                setData(
                    earningsData.map((e) => ({
                        id: e.id,
                        name: e.name,
                        headId: e.headId,
                        headName: e.headName
                    }))
                )

                // Filter and set deduction components
                const deductionData = res.data.filter((e) => e.type.label == 'Deduction')
                setList(
                    deductionData.map((e) => ({
                        id: e.id,
                        name: e.name,
                        headId: e.headId,
                        headName: e.headName
                    }))
                )
            }
        })
    }

    // State variables for locations and location-specific data
    const [locations, setLocations] = useState([])

    // Function to fetch locations based on the user's access rights
    const getAllLocationById = () => {
        getAllById({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    // Filter locations based on whether user has global or restricted access
                    const filteredLocations =
                        userDetails.accessible == 'Global'
                            ? res.data
                            : res.data.filter((item1) =>
                                userDetails.allowedLocations.some((item2) => item1.id === item2)
                            )

                    setLocations(filteredLocations)
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    // Local state for holding the selected location ID

    // Handler for location change (multiple selections)
    const handleLocationHandler = (selectedOptions) => {
        const selectedIds = selectedOptions.map((option) => option.value)
        setLocationIds(selectedIds)
        setChange(false)
    }

    // Mapping of locations to dropdown options for the select component
    const locationOptions = locations
        ? locations.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : []

    // Effect hook to handle initial loading of data based on location
    useEffect(() => {
        // Fetch the list of salary components
        getAllSalaryComponentsList()
        // Check if the page is in "create" or "edit" mode based on the state from URL
        if (location.state.id == null) {
            setMode('create')
            setLoading(false)
        } else {
            setMode('edit')
            getAllEmployeeById() // Fetch employee data for editing
        }

        // Call to fetch currency data (likely needed for processing)
        onGetCurrencyHandler()

        // Fetch locations if locationId exists
        getAllLocationById()
    }, [])

    // State hooks for managing form data, selected components, and updates
    const [data, setData] = useState([]) // Holds the data for some entity (not fully clear)
    const [updateData, setUpdateData] = useState([]) // Holds updated earnings data (likely salary components)

    const [list, setList] = useState([]) // Holds the list of deductions for drag and drop functionality
    const [listUpdateData, setListUpdateData] = useState([]) // Holds updated deductions data

    const [minValue, setMinVal] = useState(null) // Holds the minimum range value for some field
    const [maxValue, setMaxVal] = useState(null) // Holds the maximum range value for some field
    const [templateId, setTemplateId] = useState(null) // Holds the template ID (could relate to salary template)

    const [getData, setGetData] = useState({}) // Stores data retrieved from API for salary template (initial fetch)
    const [componentId, setComponentId] = useState() // Holds the selected component ID (likely for a salary component)
    const [change, setChange] = useState(true)
    // Function to handle the selection of the basic component (probably for salary calculation)
    const handleSlectBasicComponent = (select) => {
        setChange(false) // Toggle change state to trigger re-render
        setComponentId(select.value) // Set selected component ID
        onPercentageHandler(select.value) // Call handler to validate percentage based on selected component
    }

    // Function to handle percentage calculation and validation for the salary template
    const onPercentageHandler = (value) => {
        const obj = {
            organizationId: userDetails.organizationId, // Organization ID
            name: formData.name, // Template name
            fromRange: formData.fromRange, // Salary range start value
            toRange: formData.toRange, // Salary range end value
            basicComponentId: value ? value : componentId, // Basic component ID, either passed in or from state
            currencyId: currencyId, // Currency ID
            earnings: updateData.map((e) => e.id), // Earnings (updated)
            deductions: listUpdateData.map((e) => e.id) // Deductions (updated)
        }

        // Validate if essential fields are missing before proceeding
        if (!obj.name) {
            setFormErrors(validate1(obj)) // Call validation function
        } else if (
            !obj.fromRange ||
            !obj.toRange ||
            obj.currencyId == undefined ||
            obj.basicComponentId == undefined
        ) {
            setFormErrors(validate1(obj)) // Call validation if fields are missing
        } else {
            // If all fields are valid, proceed to get the percentage from API
            getPercentage({ organizationId: userDetails.organizationId, body: obj }).then((res) => {
                if (res.statusCode == 200) {
                    setTotalPercentage(res.data.percentage) // Set total percentage from response
                    // Check if total percentage exceeds 100% and set an error if necessary
                    if (res.data.percentage > 100) {
                        setFormErrors({
                            ...formErrors,
                            totalPercentage: 'The component total is adding to more than 100%'
                        })
                    } else {
                        setFormErrors({ ...formErrors, totalPercentage: '' }) // Reset error if valid
                    }
                }
            })
        }
    }
    const [templateEdit, setTemplateEdit] = useState({})
    // Fetch salary template data by its ID to prepopulate form fields
    const getAllEmployeeById = () => {
        setLoading(true) // Set loading state to true while fetching data
        getById({
            entity: 'salarytemplates',
            organizationId: userDetails.organizationId,
            id: location.state.id
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false) // Set loading state to false once data is loaded
                setGetData(res.data) // Store fetched data in state
                setFormData(res.data) // Set form data with fetched salary template details
                setTemplateEdit(res.data) // Set template edit data with fetched salary template details
                setDa(res.data && res.data.daComponentId) // Set DA (Dearness Allowance) component ID
                setUpdateData(res.data.earnings) // Set earnings (updated)
                setListUpdateData(res.data.deductions) // Set deductions (updated)
                setComponentId(res.data.basicComponentId) // Set the basic component ID
                setCurrencyId(res.data.currencyId) // Set the currency ID
                setCurrencyCode(res.data.currencyCode) // Set the currency code
                setLocationIds(res.data.locationIds || []) // Set location IDs (if any)
                setTotalPercentage(res.data.percentage) // Set the percentage from fetched data
            }
        })
    }

    // Effect hook to handle percentage calculation on page load if the template is in edit mode
    useEffect(() => {
        if (location.state.id != null) {
            onPercentageHandler() // Call the percentage handler if an ID is available (edit mode)
        }
    }, []) // This effect runs once on mount

    // State hook for managing form data input
    const [formData, setFormData] = useState({}) // Form data state for the template (name, range, etc.)

    // Input change handler for form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value // This will set the field to "" if cleared
        }))
    }

    // Filter the components list to get only those marked as "basic"
    const components = heads.filter((e) => {
        if (e.basic) {
            return e // Return only basic components
        }
    })

    // Map basic components to select options for the dropdown
    const basciComponentOptions = components
        ? components.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : [] // If components exist, map them to an array of options

    // State hook for managing the selected DA (Dearness Allowance) component
    const [da, setDa] = useState(null)

    // Mapping the DA data to options format for use in a select dropdown
    const daOptions = daData
        ? daData.map((option) => ({
            value: option.id, // value is the DA component ID
            label: option.name // label is the DA component name
        }))
        : [] // Default to an empty array if daData is not available

    // Handler for DA component selection
    const handleDaSelectHandler = (select) => {
        setChange(false)
        setDa(select.value) // Sets the selected DA component's ID
    }

    // State hook for managing the list of currencies
    const [curriencies, setCurriencies] = useState([])

    // Function to fetch all available currencies for the organization
    const onGetCurrencyHandler = () => {
        getAllById({
            entity: 'currencies', // Fetching currencies entity
            organizationId: userDetails.organizationId // Organization ID
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setCurriencies(res.data) // If response is successful, store currency data
                }
            })
            .catch((err) => {
                console.log(err, 'error') // Log any errors that occur during the fetch
            })
    }

    // Mapping the currency data to options format for use in a select dropdown
    const currenciesOptions = curriencies
        ? curriencies.map((option) => ({
            value: option.id, // value is the currency ID
            label: option.currencyCode // label is the currency code
        }))
        : [] // Default to an empty array if currencies data is not available

    // State hook for managing the selected currency ID
    const [currencyId, setCurrencyId] = useState()

    // Handler for currency selection
    const handleCurrencySelection = (option) => {
        setChange(false)
        setCurrencyId(option.value) // Sets the selected currency's ID
        setCurrencyCode(option.label) // Sets the selected currency's code
    }

    // State hook for managing form validation errors
    const [formErrors, setFormErrors] = useState({})

    // Function to validate the form fields
    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required' // Name is required
        }
        if (!values.fromRange) {
            errors.fromRange = 'Required' // From range is required
        }
        if (!values.toRange) {
            errors.toRange = 'Required' // To range is required
        }
        if (values.currencyId == undefined) {
            errors.currencyId = 'Required' // Currency is required
        }
        if (values.basicComponentId == undefined) {
            errors.basicComponentId = 'Required' // Basic component is required
        }
        if (updateData.length == 0) {
            errors.earnings = 'Required' // Earnings data is required
        }
        if (listUpdateData.length == 0) {
            errors.deductions = 'Required' // Deductions data is required
        }

        return errors // Return the errors object containing validation messages
    }

    // Simplified validation for range
    const validate1 = () => {
        const errors = {}
        // (Currently not used) Would validate fromRange if uncommented
        return errors
    }

    // Simplified validation for the "to range" field
    const validate2 = (values) => {
        const errors = {}
        if (!values.toRange) {
            errors.toRange = 'Required' // To range is required
        }
        return errors
    }

    // Simplified validation for the basic component field
    const validate3 = (values) => {
        const errors = {}
        if (values.basicComponentId == undefined) {
            errors.basicComponentId = 'Required' // Basic component is required
        }
        return errors
    }

    // Handler for saving the salary template data
    const onSaveHandler = () => {
        // Set loading state to true during the save operation
        const obj = {
            organizationId: userDetails.organizationId, // Organization ID
            name: formData.name, // Template name
            fromRange: formData.fromRange, // From salary range
            toRange: formData.toRange, // To salary range
            basicComponentId: componentId, // Basic component ID
            currencyId: currencyId, // Currency ID
            percentage: totalPercentage, // Total percentage
            daComponentId: da, // DA component ID
            earnings: updateData.map((e) => e.id), // Earnings (selected components)
            deductions: listUpdateData.map((e) => e.id), // Deductions (selected components)
            locationIds: locationIds // Locations associated with the template
        }

        // Perform validations before proceeding with saving
        if (!obj.name) {
            setFormErrors(validate(obj)) // Validate the form fields
        } else if (!obj.fromRange) {
            setFormErrors(validate(obj)) // Validate if fromRange is missing
        } else if (!obj.toRange) {
            setFormErrors(validate(obj)) // Validate if toRange is missing
        } else if (obj.currencyId == undefined) {
            setFormErrors(validate(obj)) // Validate if currencyId is missing
        } else if (obj.basicComponentId == undefined) {
            setFormErrors(validate(obj)) // Validate if basicComponentId is missing
        } else if (updateData.length == 0) {
            setFormErrors(validate(obj)) // Validate if earnings data is missing
        } else if (listUpdateData.length == 0) {
            setFormErrors(validate(obj)) // Validate if deductions data is missing
        } else if (totalPercentage > 100) {
            setFormErrors({
                ...formErrors,
                totalPercentage: 'The component total is adding to more than 100%'
            }) // Error if total percentage exceeds 100
            toast.error('The component total is adding to more than 100%') // Show error message
        } else if (Number(formData.fromRange) > Number(formData.toRange)) {
            toast.error('Please enter valid range') // Show error if fromRange is greater than toRange
        } else {
            // Proceed with saving the data if no errors
            setLoading(true)
            save({
                entity: 'salarytemplates',
                organizationId: userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Salarytemplate',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false) // Hide loading after successful save
                        ToastSuccess(res.message) // Show success message
                        navigate('/salaryTemplateList') // Redirect to the salary template list page
                    }
                })
                .catch((err) => {
                    setLoading(false) // Hide loading after an error
                    console.log(err, 'error') // Log the error
                    ToastError(err.message) // Show error message
                })
        }
    }

    // Handler to edit the salary template
    // ...existing code...
    const onEditHandler = () => {
        const obj = {
            id: formData.id,
            name: formData.name,
            fromRange: formData.fromRange.toString(),
            currencyId: currencyId,
            daComponentId: da,
            percentage: totalPercentage,
            toRange: formData.toRange,
            basicComponentId: componentId,
            earnings: updateData.map((e) => e.id),
            deductions: listUpdateData.map((e) => e.id),
            locationIds: locationIds
        }

        // Validate required fields first
        const errors = validate(obj)
        if (
            !formData.name ||
            !formData.fromRange.toString() ||
            !formData.toRange ||
            obj.currencyId === undefined ||
            obj.basicComponentId === undefined ||
            updateData.length === 0 ||
            listUpdateData.length === 0
        ) {
            setFormErrors(errors)
            return
        }
        if (totalPercentage > 100) {
            setFormErrors({
                ...formErrors,
                totalPercentage: 'The component total is adding to more than 100%'
            })
            toast.error('The component total is adding to more than 100%')
            return
        }

        // Only check for "no changes" after required validations
        if (
            updateValidation(formData, templateEdit) &&
            change &&
            compareArrayOfObjects(
                updateData.map((e) => e.id),
                templateEdit.earnings.map((e) => e.id)
            ) &&
            compareArrayOfObjects(
                listUpdateData.map((e) => e.id),
                templateEdit.deductions.map((e) => e.id)
            )
        ) {
            toast.info('No changes made to update')
            return
        }

        setLoading(true)
        update({
            entity: 'salarytemplates',
            organizationId: userDetails.organizationId,
            body: obj,
            id: getData.id,
            toastSuccessMessage: commonCrudSuccess({
                screen: 'Salarytemplate',
                operationType: 'update'
            })
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    ToastSuccess(res.message)
                    navigate('/salaryTemplateList')
                }
            })
            .catch((err) => {
                setLoading(false)
                ToastError(err.message)
                console.log(err, 'error')
            })
    }
    // Function to export the annexure as a PDF
    const exportAnnexure = () => {
        const input = pdfRef.current // Get the DOM element to be converted into PDF
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png') // Convert the canvas to image data
            const pdf = new jsPDF() // Create a new PDF document
            const imgProps = pdf.getImageProperties(imgData) // Get the image properties
            const pdfWidth = pdf.internal.pageSize.getWidth() // Get the width of the PDF page
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width // Calculate the height based on the aspect ratio
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight) // Add the image to the PDF
            pdf.save('Annexure.pdf') // Save the PDF with the name 'Annexure.pdf'
        })
    }

    // State hook for managing the visibility of the "Generate Annexure" popup
    const [generate, setGenerate] = useState(false)

    // Handler for generating the annexure
    const onGenerateHandler = () => {
        const obj = {
            organizationId: userDetails.organizationId, // Organization ID
            name: formData.name, // Template name
            fromRange: formData.fromRange, // From salary range
            toRange: formData.toRange, // To salary range
            basicComponentId: componentId, // Basic component ID
            currencyId: currencyId, // Currency ID
            daComponentId: da, // DA component ID
            earnings: updateData.map((e) => e.id), // Earnings selected (IDs)
            deductions: listUpdateData.map((e) => e.id) // Deductions selected (IDs)
        }

        // Validate the form fields before generating the annexure
        if (!obj.name) {
            setFormErrors(validate(obj)) // Name is required
        } else if (!obj.fromRange) {
            setFormErrors(validate(obj)) // From range is required
        } else if (!obj.toRange) {
            setFormErrors(validate(obj)) // To range is required
        } else if (obj.currencyId == undefined) {
            setFormErrors(validate(obj)) // Currency is required
        } else if (obj.basicComponentId == undefined) {
            setFormErrors(validate(obj)) // Basic component is required
        } else if (updateData.length == 0) {
            setFormErrors(validate(obj)) // Earnings are required
        } else if (listUpdateData.length == 0) {
            setFormErrors(validate(obj)) // Deductions are required
        } else {
            // Prepare for annexure generation
            setMinVal(formData.fromRange) // Set minimum value for range
            setMaxVal(formData.toRange) // Set maximum value for range
            setTemplateId(formData.id) // Set the template ID
            setSaveObj(obj) // Set the object to be saved for later use
            setGenerate(true) // Trigger the generation process
        }
    }

    // Handler to close the "Generate Annexure" popup
    const onGenerateCloseHandler = () => {
        setGenerate(false) // Hide the "Generate Annexure" popup
    }

    return (
        <div>
            {/* // The section element represents the main container for the salary template form. */}
            <section
                style={{ marginTop: '50px' }}
                className={
                    location.state.count && location.state.count != 0
                        ? 'disabledDAD detailBackground'
                        : 'detailBackground'
                }
            >
                {loading ? <DetailLoader /> : ''}
                {/* If loading, display a loading spinner (DetailLoader) */}
                {/* Main container */}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            {/* Page Header: Displays the title of the page (either Add or Update Salary Template depending on mode) */}
                            <PageHeader
                                pageTitle={
                                    mode == 'create'
                                        ? 'Add Salary Template'
                                        : 'Update Salary Template'
                                }
                            />

                            {/* Form container */}
                            <div className="formBody" style={{ marginTop: '6%' }}>
                                {/* Location Selection */}
                                <div className="col-8">
                                    <Form.Group
                                        as={Row}
                                        className="mb-4"
                                        controlId="formGroupToDate"
                                    >
                                        <Form.Label column sm={3}>
                                            Location
                                        </Form.Label>
                                        <Col sm={6}>
                                            {/* Location select dropdown using React Select, allowing multiple selections */}
                                            <Select
                                                value={locationIds.map((id) =>
                                                    locationOptions.find((opt) => opt.value === id)
                                                )}
                                                onChange={handleLocationHandler} // Handles location change
                                                options={locationOptions} // Location options passed here
                                                isMulti={true} // Allow multi-selection
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Name input field */}
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupToDate"
                                    >
                                        <Form.Label column sm={4}>
                                            Name <span className="error">*</span>
                                        </Form.Label>
                                        <Col md={8}>
                                            {/* Input for name, validates on blur and on input */}
                                            <Form.Control
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)} // Handle key press for validation
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)} // Handle paste action for validation
                                                onInput={(e) => handleKeyPress(e, setFormErrors)} // Handle input action for validation
                                                onChange={handleInputChange} // Update form data on change
                                                name="name"
                                                maxLength={50}
                                                defaultValue={getData.name} // Pre-fill the name field if editing
                                                onBlur={(e) => {
                                                    handleInputChange(e) // Ensure formData is updated on blur
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            name: 'Required'
                                                        })
                                                        : setFormErrors({ ...formErrors, name: '' })
                                                }}
                                            />
                                            {/* Display error message if validation fails */}
                                            <p style={{ marginTop: '1%' }} className="error">
                                                {formErrors.name}
                                            </p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Salary Range inputs (From and To) */}
                                <div className="row" style={{ marginLeft: '3px' }}>
                                    <div className="col-6">
                                        <Form.Group
                                            as={Row}
                                            className="mb-2"
                                            controlId="formGroupBranch"
                                        >
                                            <Form.Label column sm={4}>
                                                Salary Range <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={4}>
                                                {/* Salary from range input */}
                                                <Form.Control
                                                    onChange={handleInputChange}
                                                    name="fromRange"
                                                    maxlength="12" // Max length of input
                                                    onInput={(e) => {
                                                        // Only allow numeric input for salary range
                                                        e.target.value = e.target.value.replace(
                                                            /\D/g,
                                                            ''
                                                        )
                                                    }}
                                                    defaultValue={formData.fromRange} // Pre-fill if editing
                                                    onBlur={(e) =>
                                                        !e.target.value
                                                            ? setFormErrors({
                                                                ...formErrors,
                                                                fromRange: 'Required'
                                                            })
                                                            : setFormErrors({
                                                                ...formErrors,
                                                                fromRange: ''
                                                            })
                                                    } // Validation on blur
                                                />
                                                {/* Display error message if validation fails */}
                                                <p style={{ marginTop: '1%' }} className="error">
                                                    {formErrors.fromRange}
                                                </p>
                                            </Col>
                                            <Col sm={4} style={{ marginLeft: '-10px' }}>
                                                {/* Salary to range input */}
                                                <Form.Control
                                                    onChange={handleInputChange}
                                                    name="toRange"
                                                    maxlength="12" // Max length of input
                                                    onInput={(e) => {
                                                        // Only allow numeric input for salary range
                                                        e.target.value = e.target.value.replace(
                                                            /\D/g,
                                                            ''
                                                        )
                                                    }}
                                                    min={0} // Set minimum value to 0
                                                    defaultValue={getData.toRange} // Pre-fill if editing
                                                    onBlur={(e) =>
                                                        !e.target.value
                                                            ? setFormErrors({
                                                                ...formErrors,
                                                                toRange: 'Required'
                                                            })
                                                            : setFormErrors({
                                                                ...formErrors,
                                                                toRange: ''
                                                            })
                                                    } // Validation on blur
                                                />
                                                {/* Display error message if validation fails */}
                                                <p style={{ marginTop: '1%' }} className="error">
                                                    {formErrors.toRange}
                                                </p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                </div>

                                {/* Currency selection */}
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupToDate"
                                    >
                                        <Form.Label column sm={4}>
                                            Currency <span className="error">*</span>
                                        </Form.Label>
                                        <Col md={8}>
                                            {/* Currency select dropdown */}
                                            <Select
                                                onChange={handleCurrencySelection} // Handles currency change
                                                options={currenciesOptions} // Currency options
                                                value={currenciesOptions.filter(
                                                    (e) => e.value == currencyId
                                                )} // Pre-select the current currency
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
                                                } // Validation on blur
                                            />
                                            {/* Display error message if validation fails */}
                                            <p style={{ marginTop: '1%' }} className="error">
                                                {formErrors.currencyId}
                                            </p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Basic Component selection */}
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupToDate"
                                    >
                                        <Form.Label column sm={4}>
                                            Select Basic <span className="error">*</span>
                                        </Form.Label>
                                        <Col md={8}>
                                            {/* Basic component select dropdown */}
                                            <Select
                                                onChange={handleSlectBasicComponent} // Handles basic component change
                                                options={basciComponentOptions} // Options for basic components
                                                value={basciComponentOptions.filter(
                                                    (e) => e.value == componentId
                                                )} // Pre-select the current basic component
                                                onBlur={() =>
                                                    !componentId
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            basicComponentId: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            basicComponentId: ''
                                                        })
                                                } // Validation on blur
                                            />
                                            {/* Display error message if validation fails */}
                                            <p style={{ marginTop: '1%' }} className="error">
                                                {formErrors.basicComponentId}
                                            </p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* DA Component selection (optional) */}
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupToDate"
                                    >
                                        <Form.Label column sm={4}>
                                            Select DA
                                        </Form.Label>
                                        <Col md={8}>
                                            {/* DA component select dropdown */}
                                            <Select
                                                onChange={handleDaSelectHandler} // Handles DA selection
                                                options={daOptions} // DA options
                                                value={daOptions.filter((e) => e.value == da)} // Pre-select the current DA component
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Earnings Section */}
                                <label style={{ marginLeft: '13px', marginTop: '3%' }}>
                                    Earning Components
                                </label>
                                {/* Show total percentage of earnings */}
                                <label
                                    style={{
                                        marginLeft: '540px',
                                        marginTop: '3%'
                                    }}
                                >
                                    Percentage :{' '}
                                    {totalPercentage > 0 ? (
                                        <span className={totalPercentage > 100 ? 'error' : 'green'}>
                                            {' '}
                                            {totalPercentage.toFixed(1)}
                                        </span>
                                    ) : (
                                        0.0
                                    )}
                                    %
                                </label>

                                {/* Drag and Drop for Earning Components */}
                                <div>
                                    <DragAndDrop
                                        percentageCalc={onPercentageHandler} // Handler for percentage calculation
                                        totalPercentage={totalPercentage}
                                        formErrors={formErrors}
                                        data={data}
                                        componentId={componentId}
                                        formData={formData}
                                        setFormErrors={setFormErrors}
                                        updateData={updateData}
                                        setData={setData}
                                        validate1={validate1}
                                        validate2={validate2}
                                        validate3={validate3}
                                        setUpdateData={setUpdateData}
                                    />
                                </div>

                                {/* Deductions Section */}
                                <label style={{ marginLeft: '13px', marginTop: '3%' }}>
                                    Deduction Components
                                </label>
                                <div>
                                    {/* Drag and Drop for Deduction Components */}
                                    <DragAndDropDed
                                        percentageCalc={onPercentageHandler}
                                        totalPercentage={totalPercentage}
                                        data={list}
                                        formErrors={formErrors}
                                        updateData={listUpdateData}
                                        setList={setList}
                                        setListUpdateData={setListUpdateData}
                                        validate1={validate1}
                                        validate2={validate2}
                                        validate3={validate3}
                                        formData={formData}
                                        componentId={componentId}
                                        setFormErrors={setFormErrors}
                                    />
                                </div>

                                {/* Display error for total percentage if any */}
                                <p style={{ marginTop: '1%' }} className="error">
                                    {formErrors.totalPercentage}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* buttons for save and update */}
            {mode == 'create' && (
                <div className="btnCenter mb-3">
                    <Button variant="addbtn" className="Button" onClick={onSaveHandler}>
                        Save
                    </Button>
                    <Button
                        variant="addbtn"
                        className="Button"
                        onClick={onGenerateHandler}
                        disabled={isDisabled}
                    >
                        Preview
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={() => navigate('/salaryTemplateList')}
                    >
                        {cancelButtonName}
                    </Button>
                </div>
            )}
            {mode == 'edit' && (
                <div className="btnCenter mb-3">
                    {location && location.state.count != 0 ? (
                        ''
                    ) : (
                        <Button variant="addbtn" className="Button" onClick={onEditHandler}>
                            Update
                        </Button>
                    )}
                    <Button
                        variant="addbtn"
                        className="Button"
                        onClick={onGenerateHandler}
                        disabled={isDisabled}
                    >
                        Preview
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={() => navigate('/salaryTemplateList')}
                    >
                        {cancelButtonName}
                    </Button>
                </div>
            )}

            {/* modal for anexure generator */}
            <Modal show={generate} onHide={onGenerateCloseHandler} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Annexure Generate</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Annexure
                        currencyCode={currencyCode}
                        body={saveObj}
                        mode={mode}
                        ref={pdfRef}
                        minValue={minValue}
                        maxValue={maxValue}
                        templateId={templateId}
                    />
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={exportAnnexure}>
                        Download
                    </Button>

                    <Button className="Button" variant="secondary" onClick={onGenerateCloseHandler}>
                        {cancelButtonName}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export default SalaryTemplate
