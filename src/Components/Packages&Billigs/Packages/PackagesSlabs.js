import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import Table from '../../../Common/Table/Table1'
import { DatePicker } from 'antd'
import moment from 'moment'
import Select from 'react-select'
import { toast } from 'react-toastify'

const PackagesSlabs = ({ totalPrice, setSlabsData, slabsData, checked }) => {
    // Declare state variables
    const [discountData, setDiscountData] = useState([]) // State to store discount data
    const [data, setData] = useState(slabsData) // State to store slabs data (initially set from slabsData prop)
    const [effectiveDate, setEffectiveDate] = useState(null) // State to store the selected effective date (initially null)
    const [index, setIndex] = useState() // State to store the index (for tracking the selected row or data)
    const [isPercentage, setIsPercentage] = useState(true) // State to track if the discount is in percentage or value (initially true)

    const handleEffectiveDate = (selection) => {
        // Set the effective date in the desired format (YYYY-MM-DD) when the user selects a date
        setEffectiveDate(moment(selection).format('YYYY-MM-DD'))
    }

    console.log(discountData, 'discountDataFromSlabs') // Log the discount data for debugging
    const onUnitHanlder = (selection) => {
        // Handle change in discount unit type (either percentage or value)
        setIsPercentage(selection.value)
    }

    useEffect(() => {
        // Update data state whenever slabsData changes
        setData(slabsData)
    }, [slabsData])

    // Options for discount unit selection (either percentage or value)
    const options = [
        { label: '%', value: true }, // Option for percentage discount
        { label: 'Value', value: false } // Option for value discount
    ]

    // Function to format numbers (e.g., currency formatting)
    const formatNumber = (number) => {
        if (number == null) return '' // Return empty string if the number is null
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2, // Ensure at least two decimal places
            maximumFractionDigits: 2 // Limit to two decimal places
        }).format(number) // Format the number using the 'en-IN' locale for currency format
    }

    // Define the columns for the discount data table
    const discountColumns = [
        {
            Header: 'Effective Date', // Column header for effective date
            accessor: 'startDate', // Accessor for the start date of the discount
            headerAlign: 'left',
            Cell: ({ row }) => (
                <div className="" style={{ marginLeft: '0.5rem' }}>
                    {row.original.startDate}
                </div> // Render the start date in the table cell
            )
        },
        {
            Header: 'End Date', // Column header for end date
            accessor: 'endDate' // Accessor for the end date of the discount
        },
        {
            Header: 'Discount', // Column header for discount value
            accessor: 'value', // Accessor for the discount value
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '0.4rem' }}>
                    {/* Conditional rendering for discount value based on whether it's a percentage or value */}
                    {row.original.percentage ? (
                        <span>{row.original.value}%</span>
                    ) : (
                        <span>&#8377;{formatNumber(row.original.value)}</span>
                    )}
                </div>
            )
        }
    ]

    // Declare state variables for form handling
    const [mode, setMode] = useState('') // State to track the form mode (e.g., 'add', 'edit')
    const [formData, setFormData] = useState({ value: '0' }) // State to store the form data
    const [formErrors, setFormErrors] = useState({}) // State to store any form validation errors

    // Validation function to check for required fields in the form
    const validate = (values) => {
        const errors = {} // Object to store validation errors

        // Check if the 'fromRange' value is present, otherwise set an error message
        if (!values.fromRange) {
            errors.fromRange = 'Required'
        }

        // Check if the 'toRange' value is present, otherwise set an error message
        if (!values.toRange) {
            errors.toRange = 'Required'
        }

        // Check if the 'startDate' (effective date) is present, otherwise set an error message
        if (!values.startDate) {
            errors.effectiveDate = 'Required'
        }

        return errors // Return the validation errors object
    }

    // Handle changes to input fields in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target // Destructure the name and value from the input event
        // Update formData with the new input value
        setFormData({ ...formData, [name]: value })

        // If the input field is empty, set an error for that field as 'Required'
        // Otherwise, clear the error for that field
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    // Object to hold the discount values for adding/updating a discount
    const addObj = {
        id: null,
        percentage: isPercentage,
        startDate: effectiveDate,
        value: checked ? '100' : formData.value,
        perUnit: isPercentage
            ? (totalPrice - (totalPrice * (checked ? 100 : Number(formData.value)) / 100)) /
            (Number(formData.toRange) - Number(formData.fromRange) + 1)
            : (totalPrice - (checked ? 100 : Number(formData.value))) /
            (Number(formData.toRange) - Number(formData.fromRange) + 1)
    }

    // Handler to save a new discount slab
    const onSaveHandler = () => {
        // Prepare the object to be saved
        const obj = {
            percentage: isPercentage, // Use the state to determine if the discount is a percentage
            fromRange: formData.fromRange, // Get the 'from' range from form data
            toRange: formData.toRange, // Get the 'to' range from form data
            discounts: [...discountData, addObj] // Add the new discount object to the existing discount data
        }
        // Validate the input fields before proceeding
        if (!obj.fromRange || !obj.toRange) {
            // If the fromRange or toRange is not filled, trigger validation errors
            setFormErrors(validate(obj))
        } else if (Number(formData.toRange) < Number(formData.fromRange)) {
            // If the 'toRange' is less than 'fromRange', show an error toast
            toast.error('Please enter valid range')
        } else if (isPercentage && addObj.value > 100) {
            // If the discount value exceeds 100% for a percentage discount, show an error toast
            toast.error('Please enter valid units')
        } else if (!addObj.value) {
            // If no discount value is provided, show an error toast
            toast.error('Please add discount')
        } else if (!isPercentage && addObj.value > totalPrice) {
            // If the discount value exceeds the total price for a fixed value discount, show an error toast
            toast.error('Please enter value below total price')
        } else if (!addObj.startDate) {
            // If the start date (effective date) is not selected, trigger validation errors
            setFormErrors(validate(obj))
        } else {
            // If all validation checks pass, proceed with adding the new discount slab
            const addData = [...data, obj] // Add the new discount slab to the existing data
            setSlabsData(addData) // Update the slabs data state
            setData(addData) // Update the data state with the new discount slab
            handleSlabCloseHandler() // Close the modal or form after saving the data
        }
    }

    // Handler to update an existing discount slab
    const onUpdateHandler = () => {
        // Prepare the object to be updated
        const obj = {
            id: formData.id,
            fromRange: formData.fromRange, // Get the 'from' range from form data
            toRange: formData.toRange, // Get the 'to' range from form data
            percentage: isPercentage, // Use the state to determine if the discount is a percentage
            discounts: [...discountData, addObj] // Add the updated discount object to the existing discount data
        }
        console.log(obj, "chekingObj")
        // Validate the input fields before proceeding
        if (!obj.fromRange || !obj.toRange) {
            // If the fromRange or toRange is not filled, trigger validation errors
            setFormErrors(validate(obj))
        } else if (isPercentage && addObj.value > 100) {
            // If the discount value exceeds 100% for a percentage discount, show an error toast
            toast.error('Please enter valid units')
        } else if (!isPercentage && addObj.value > totalPrice) {
            // If the discount value exceeds the total price for a fixed value discount, show an error toast
            toast.error('Please enter value below total price')
        } else if (!addObj.startDate) {
            // If the start date (effective date) is not selected, trigger validation errors
            setFormErrors(validate(obj))
        } else if (!addObj.value) {
            // If no discount value is provided, show an error toast
            toast.error('Please add discount')
        } else {
            const nullObj = discountData.findIndex((e) => e.id === null)
            if (nullObj !== -1) {
                discountData[nullObj] = addObj
            } else {
                // If all validation checks pass, proceed with updating the existing discount slab
                const updatedData = [...data] // Clone the current data array
                updatedData[index] = obj // Update the slab at the selected index with the new data
                setSlabsData(updatedData) // Update the slabs data state
                setData(updatedData) // Update the data state with the updated discount slab
                setDiscountData((prevDiscounts) => [...prevDiscounts, addObj]) // Add the updated discount object to the discount data array
            }
            handleSlabCloseHandler()
        }
    }

    // State variables for managing the delete modal and selected index
    const [deleteShow, setDeleteShow] = useState(false) // Controls the visibility of the delete confirmation modal
    const [ind, setInd] = useState() // Stores the index of the item to be deleted

    // Handles showing the delete confirmation modal and stores the index of the item to be deleted
    const onDeleteHandler = (i) => {
        setDeleteShow(true) // Set delete modal to show
        setInd(i) // Store the index of the item to be deleted
    }

    // Closes the delete confirmation modal without performing any action
    const onDeleteCloseHandler = () => {
        setDeleteShow(false) // Set delete modal to hide
    }

    // Handles the deletion of an item from the data when the user confirms
    const proceedDeleteHandler = (e) => {
        e.preventDefault() // Prevents default form submission behavior
        const rows = [...data] // Creates a shallow copy of the current data array
        rows.splice(ind, 1) // Removes the item at the specified index
        setSlabsData(rows) // Updates the slabs data with the updated array
        setDeleteShow(false) // Close the delete modal after deletion
    }

    // Column definition for the table. Each column has specific headers, data accessors, and cell rendering logic
    const column = [
        {
            Header: 'User Slab',
            accessor: 'span', // Data field for user slab range (fromRange - toRange)
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div className="numericData">
                    {/* // Display the range for each row */}
                    {row.original.fromRange + '-' + row.original.toRange}
                </div>
            )
        },
        {
            Header: 'Per User',
            accessor: 'perUser', // Data field for the 'perUser' value
            headerAlign: 'right',
            Cell: ({ row }) => {
                // Get the last discount object in the row's 'discounts' array
                const lastDiscount = row.original.discounts[row.original.discounts.length - 1]
                // Calculate the price based on whether it's percentage or value-based
                const price = isPercentage
                    ? (totalPrice - totalPrice * (lastDiscount.value / 100)).toFixed(2) // For percentage
                    : (totalPrice - lastDiscount.value).toFixed(2) // For value-based discount
                return (
                    <div className="numericData">
                        {/* // Display per unit price or calculated price */}
                        &#8377;{' '}
                        {row.original.perUnit
                            ? formatNumber(row.original.perUnit)
                            : formatNumber(price)}
                    </div>
                )
            }
        },
        {
            Header: 'Price',
            accessor: 'price', // Data field for price
            headerAlign: 'right',
            Cell: ({ row }) => {
                // Get the last discount object in the row's 'discounts' array
                const lastDiscount = row.original.discounts[row.original.discounts.length - 1]
                // Calculate the price based on whether it's percentage or value-based
                const price = isPercentage
                    ? (totalPrice - totalPrice * (lastDiscount.value / 100)).toFixed(2) // For percentage
                    : (totalPrice - lastDiscount.value).toFixed(2) // For value-based discount

                return (
                    <div className="numericData">
                        {/* // Display after discount price or calculated price for range */}
                        &#8377;{' '}
                        {row.original.afterDiscount
                            ? formatNumber(row.original.afterDiscount)
                            : formatNumber(price * row.original.toRange)}
                    </div>
                )
            }
        },
        {
            Header: (
                <div className=" text-right header" style={{ marginRight: '1rem' }}>
                    Actions
                </div>
            ),
            accessor: 'actions', // Data field for action buttons (edit/delete)
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className=" text-right ">
                    {/* Button to trigger the edit modal */}
                    <Button
                        variant=""
                        className="iconWidth"
                        onClick={() => handleSlabsCreationShow('update', row.original, row.index)}
                    >
                        <EditIcon />
                    </Button>
                    |{/* Button to trigger the delete confirmation modal */}
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        onClick={() => onDeleteHandler(row.index)}
                    >
                        <DeleteIcon />
                    </Button>
                </div>
            )
        }
    ]

    // State variable to manage the visibility of the slab creation modal
    const [slabShow, setSlabShow] = useState(false)

    // Handler to show the slab creation or update modal
    const handleSlabsCreationShow = (action, row, index) => {
        console.log(row, 'chekingrowFromDiscounts') // Logs the row data for debugging
        if (action == 'create') {
            setSlabShow(true) // Show the modal for creating a new slab
            setMode('create') // Set mode to 'create' for slab creation
            setDiscountData([]) // Clear any previous discount data
        } else {
            setSlabShow(true) // Show the modal for updating an existing slab
            setMode('update') // Set mode to 'update' for slab update
            setFormData(row) // Pre-populate the form with existing slab data
            setDiscountData(row.discounts) // Pre-populate the discounts for the selected slab
            setIndex(index) // Store the index of the slab being updated
        }
    }

    // Handler to close the slab modal and reset form data
    const handleSlabCloseHandler = () => {
        setSlabShow(false) // Hide the slab modal
        setFormData({}) // Reset form data
        setFormErrors({}) // Clear any validation errors
        setEffectiveDate(null) // Clear the effective date
    }

    // Keydown event handler to restrict inputs to numeric values only
    const handleKeyDown = (event) => {
        // Allow specific keys like Backspace, Tab, Arrow keys, Delete, and Enter
        if (
            event.key === 'Backspace' ||
            event.key === 'Tab' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowRight' ||
            event.key === 'Delete' ||
            event.key === 'Enter'
        ) {
            return // Allow these keys without any restriction
        }

        // Prevent non-numeric characters from being entered
        if (!/\d/.test(event.key)) {
            event.preventDefault() // Prevent the keypress if it's not a number
        }

        // Prevent the entry of the '+' or '-' symbols
        if (event.key == '-' || event.key == '+') {
            event.preventDefault()
        }
    }

    return (
        <div>
            <div className="card-body">
                {/* Button to trigger the slab creation modal */}
                <Button
                    className="addButton" // CSS class for styling the add button
                    variant="addbtn" // Button variant for styling, can be used with a specific design
                    onClick={() => handleSlabsCreationShow('create')} // Calls the handleSlabsCreationShow function with "create" action
                >
                    {/* Add icon inside the button */}
                    <AddIcon />
                </Button>

                {/* Conditionally rendering the table or a message */}
                {data ? (
                    // If 'data' is available, display the Table component
                    <Table
                        columns={column} // Pass the column definitions for the table
                        data={data} // Pass the data to display in the table
                        serialNumber={true} // Optionally include a serial number column in the table
                        name={'slab records'} // Name of the table for identification or use in the component
                    />
                ) : (
                    // If no data is available, show a message indicating that no slab records are present
                    <p className="emptyDataMessage">No slab records added yet!</p>
                )}
            </div>

            <Modal
                size="lg" // Set the size of the modal to large
                show={slabShow} // Modal visibility is controlled by the 'slabShow' state
                onHide={handleSlabCloseHandler} // Close the modal when the user clicks outside or presses the close button
            >
                {/* Modal Header */}
                <Modal.Header closeButton={handleSlabCloseHandler}>
                    {/* Set the title of the modal based on the 'mode' */}
                    <Modal.Title>{mode == 'create' ? 'Slab Creation' : 'Slab Update'}</Modal.Title>
                </Modal.Header>

                {/* Modal Body */}
                <Modal.Body>
                    <div className="">
                        {/* Form to input slab details */}
                        <form className="modalFormBody">
                            <Row>
                                {/* Range inputs (From and To) */}
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-2"
                                        controlId="formGroupBranch"
                                    >
                                        {/* Range Label */}
                                        <Form.Label column sm={5}>
                                            Range <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={3}>
                                            {/* From Range Input */}
                                            <Form.Control
                                                type="text"
                                                className="text-wrap text-right"
                                                pattern="^\d{1,6}$" // Input must be a number with 1-6 digits
                                                defaultValue={formData.fromRange}
                                                name="fromRange"
                                                onKeyDown={handleKeyDown} // Restrict input to numbers
                                                onChange={handleInputChange} // Handle changes to input
                                            />
                                            {/* Display error if fromRange is invalid */}
                                            <p className="error">{formErrors.fromRange}</p>
                                        </Col>
                                        <Col sm={3}>
                                            {/* To Range Input */}
                                            <Form.Control
                                                name="toRange"
                                                type="text"
                                                className="text-wrap text-right"
                                                pattern="^\d{1,6}$" // Input must be a number with 1-6 digits
                                                onChange={handleInputChange} // Handle changes to input
                                                onKeyDown={handleKeyDown} // Restrict input to numbers
                                                defaultValue={formData.toRange}
                                            />
                                            {/* Display error if toRange is invalid */}
                                            <p className="error">{formErrors.toRange}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Effective Date */}
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-2"
                                        controlId="formGroupBranch"
                                    >
                                        {/* Effective Date Label */}
                                        <Form.Label column sm={5}>
                                            Effective Date <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            {/* DatePicker for selecting the effective date */}
                                            <DatePicker
                                                onChange={(e) => handleEffectiveDate(e)} // Handle date change
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            effectiveDate: 'Required' // Display error if no date is selected
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            effectiveDate: '' // Clear error when a valid date is selected
                                                        })
                                                }
                                                disabledDate={(current) => {
                                                    // Disable dates before today
                                                    return (
                                                        current &&
                                                        current.isSameOrBefore(moment(), 'day')
                                                    )
                                                }}
                                            />
                                            {/* Display error if effectiveDate is invalid */}
                                            <p className="error">{formErrors.effectiveDate}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Discount Value */}
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-2"
                                        controlId="formGroupBranch"
                                    >
                                        {/* Discount Label */}
                                        <Form.Label column sm={5}>
                                            Discount <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            {/* Discount Value Input */}
                                            <Form.Control
                                                pattern="^\d{1,6}$"
                                                maxlength="4"
                                                className="text-wrap text-right"
                                                placeholder={checked ? '100' : '0'} // Placeholder text for the input
                                                onKeyDown={handleKeyDown} // Restrict input to numbers
                                                onChange={handleInputChange} // Handle changes to the input
                                                name="value"
                                                disabled={checked} // Disable input if 'checked' is false
                                                type="text" // Only accept numerical input
                                                defaultValue={formData.value}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Units Selector (Percentage/Value) */}
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-2"
                                        controlId="formGroupBranch"
                                    >
                                        {/* Units Label */}
                                        <Form.Label column sm={5}>
                                            Units
                                            {/* <span className="error">*</span> */}
                                        </Form.Label>
                                        <Col sm={6}>
                                            {/* Select input to choose between percentage or value */}
                                            <Select
                                                isDisabled={checked} // Disable the select input if 'checked' is false
                                                options={options} // Options for percentage or value
                                                value={options.filter(
                                                    (option) => option.value == isPercentage
                                                )} // Select the active unit (percentage or value)
                                                onChange={onUnitHanlder} // Update the unit when selection changes
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                        </form>
                    </div>

                    {/* Table to display existing discounts */}
                    <div style={{ marginTop: '20px' }}>
                        <Table data={discountData} columns={discountColumns} />
                    </div>
                </Modal.Body>

                {/* Modal Footer with action buttons */}
                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    {/* Add button (for "create" mode) */}
                    {mode == 'create' && (
                        <Button variant="addbtn" className="Button" onClick={onSaveHandler}>
                            Add
                        </Button>
                    )}

                    {/* Update button (for "update" mode) */}
                    {mode == 'update' && (
                        <Button variant="addbtn" className="Button" onClick={onUpdateHandler}>
                            Update
                        </Button>
                    )}

                    {/* Close button */}
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={handleSlabCloseHandler} // Close the modal
                    >
                        Close
                    </Button>
                </div>
            </Modal>
            {/* modal for delete */}
            <Modal
                show={deleteShow}
                onHide={onDeleteCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header className="" closeButton={() => onDeleteCloseHandler()}>
                    <Modal.Title>Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onDeleteCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export default PackagesSlabs
