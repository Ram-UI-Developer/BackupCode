import { DatePicker } from 'antd'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Button, Col, Form, Row, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'
import { save } from '../../../Common/Services/CommonService'
import { getAllEmployeesById, getPeers } from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

export const HRGenerate = (props) => {
    const { locations, onCloseHandler } = props
    // Destructuring `locations` and `onCloseHandler` from props passed into this component

    const userDetails = useSelector((state) => state.user.userDetails)
    // Using Redux's `useSelector` to access the `userDetails` from the Redux store

    const [locationId, setLocationId] = useState()
    // State to store the selected location ID
    const [reviewPeriodFrom, setReviewPeriodFrom] = useState(null)
    // State to store the "Review From" date
    const [reviewPeriodTo, setReviewPeriodTo] = useState(null)

    // Mapping the `locations` prop into an array of options for the location dropdown
    const locationOptions = locations
        ? locations.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : []

    // Handling the location selection and fetching employees based on the selected location
    const handleLocationSelection = (selection) => {
        setLocationId(selection.value) // Setting the selected location ID
        getEmployeesById(selection.value) // Fetching employees for the selected location
    }

    // Method to fetch the list of previous months for displaying review periods
    const handleYearView = () => {
        let currentDate = new Date()
        const previousMonths = []
        let m = new Date()
        let month = new Date().getMonth() + 1

        // Logic to iterate through the previous months up to the current month
        if (m.setMonth(currentDate.getMonth() - 1)) {
            let c = 12 + month
            for (let i = 0; i < c; i++) {
                let lastMonth = new Date()
                lastMonth.setMonth(currentDate.getMonth() - i)
                previousMonths.push(moment(lastMonth).format('MMM-YYYY'))
            }
        }
    }

    // Method to get the short month-year format (e.g., Jan-2024) for the previous months
    const getShortMonthYearFromLastYearToNowDescending = () => {
        const months = []
        const currentDate = new Date()
        const startYear = currentDate.getFullYear() - 1

        // Start from the current month and move backwards through the months to the start of last year
        let date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

        while (date >= new Date(startYear, 0, 1)) {
            // Format the month to short month name (e.g., Jan, Feb, etc.)
            const monthName = date.toLocaleString('default', { month: 'short' })
            // Get the year for that month
            const year = date.getFullYear()
            // Combine month and year into one string (e.g., "Jan-2024")
            months.push(`${monthName}-${year}`)

            // Move to the previous month
            date.setMonth(date.getMonth() - 1)
        }

        return months
    }

    // Get all months in descending order (from the current month to the same month of the previous year)
    const allMonths = getShortMonthYearFromLastYearToNowDescending()

    // Mapping the `allMonths` array to create options for the "Review From" dropdown
    const reviewFromMonthOptions = allMonths.map((option, index) => ({
        value: '01' + '-' + option, // Formatting value as "01-MonthYear"
        label: option, // Display month-year
        index: index // Storing the index of the month
    }))

    const [reviewToDates, setReviewToDates] = useState([])
    // State to store available "Review To" dates based on the selected "Review From" date

    // Handling the selection of the "Review From" month and updating the available "Review To" months
    const handleReviewFromMonthSelect = (select) => {
        setReviewToDates(allMonths.slice(0, select.index + 1)) // Showing months up to the selected "Review From" month
        setReviewPeriodFrom(moment(select.value).format('YYYY-MM-DD')) // Setting the "Review From" date
        setReviewPeriodTo(null)
    }

    // Mapping the available "Review To" months for the dropdown
    const reviewToMonthOptions = reviewToDates.map((option) => ({
        value: option, // The value is the month-year
        label: option // Display month-year
    }))

    // Handling the selection of the "Review To" month and calculating the last day of the selected month
    const handleReviewToMonthSelect = (select) => {
        const currentDate = new Date(select.value)
        const lastDateOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0) // Last date of the selected month
        setReviewPeriodTo(moment(lastDateOfMonth).format('YYYY-MM-DD')) // Setting the "Review To" date
    }

    // Calling `handleYearView` on component mount to initialize the list of previous months
    useEffect(() => {
        handleYearView()
    }, [])

    // State to store selected employee IDs (used later)
    const [rid, setId] = useState([])

    // Removing duplicate employee IDs from `rid` array
    const originalValues = rid.filter((item, index) => rid.indexOf(item) === index)

    // State to store the list of employees
    const [employees, setEmployees] = useState([])

    // Fetching the list of employees based on the selected location ID
    const getEmployeesById = (id) => {
        getAllEmployeesById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            locationId: id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setEmployees(res.data ? res.data : []) // Setting the employees data
                    getPeerEmpolyees()
                }
            })
            .catch((err) => {
                console.log(err) // Logging any errors
            })
    }

    const [peerEmployees, setPeerEmployees] = useState([])
    // State to store the list of peer employees fetched from the backend
    // Function to fetch the peer employees using an API call
    const getPeerEmpolyees = () => {
        getPeers({ entity: 'employees', organizationId: userDetails.organizationId }).then(
            (res) => {
                if (res.statusCode == 200) {
                    setPeerEmployees(res.data) // Store the fetched peer employees data
                }
            }
        )
    }

    // Mapping the `peerEmployees` to create options for selecting peer employees
    const peerOptions = peerEmployees.map((option) => ({
        value: option.id, // ID of the peer
        label: option.name // Name of the peer
    }))

    const [array, setArray] = useState([])
    // State to store an array of employee data with additional attributes (e.g., `hasPeer`, `peerId`)

    const chek = [
        ...array,
        // Creating a new array `chek` by adding `hasPeer` and `peerId` properties to each employee object in `array`
        array.map((e) => {
            let obj = {
                ...e, // Spread existing properties of employee
                hasPeer: false, // Initially no peer assigned
                peerId: null // Initially no peer ID
            }
            return obj
        })
    ]

    const [selectPeerId, setSelectPeerId] = useState([])
    // State to store the list of selected peer IDs

    // Options for selecting titles (e.g., Mr., Mrs., Miss)
    const options = [
        { label: 'Mr', value: 'Mr.' },
        { label: 'Mrs', value: 'Mrs.' },
        { label: 'Miss', value: 'Miss.' }
    ]

    const [title, setTitle] = useState([])
    // State to store selected titles

    // Remove duplicates from the `title` array
    const originalTitleSelectValues = title.filter((item, index) => title.indexOf(item) === index)

    const onSelectionHandler = (select, index) => {
        let newData = [...chek]
        newData[index].managerTitle = select.value // Setting the manager's title for the selected index
        setTitle((prev) => [...prev, index]) // Add the index of the selected title to the `title` state
    }

    const [peerChecked, setPeerChecked] = useState([])
    // State to track which peers have been selected (peer checkboxes)

    // Remove duplicates from the `peerChecked` array
    const originalPeerValues = peerChecked.filter(
        (item, index) => peerChecked.indexOf(item) === index
    )

    // Filtering the `chek` array to only include employees whose `id` is in the `rid` list
    const gen = chek.filter(function (item) {
        return rid.includes(item.id) // Filter out employees that are not in the `rid` list
    })

    // Handle the checkbox selection for each individual employee
    const handleCheck = (event, index) => {
        console.log(index, 'chekingIndexFromIndex')
        const { id, checked } = event.target // Get the checkbox id and checked status
        if (checked) {
            setId((prev) => [...prev, Number(id)]) // Add the selected employee's ID to the `id` state
            setArray(employees) // Update `array` state with the list of employees
        } else {
            setId((prevIds) => prevIds.filter((Ids) => Ids !== Number(id))) // Remove the employee's ID from `id` state
            setPeerChecked((prevIds) => prevIds.filter((Ids) => Ids !== Number(id))) // Remove from `peerChecked`
            setSelectPeerId((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
            setArray(employees) // Reset the `array` state with the updated employee list
        }
    }

    // Handle the "Select All" checkbox to select or deselect all employees
    const handleSelectAll = (e) => {
        const { checked } = e.target // Get checkbox id and checked status
        if (checked) {
            employees.map((e) => {
                return setId((prev) => [...prev, Number(e.id)]) // Select all employees by adding their IDs to `id` state
            })
            setArray(employees) // Update `array` state to include all employees
        } else {
            setId([]) // Deselect all employees by clearing the `id` state
            setPeerChecked([])
            setSelectPeerId([])
        }
    }

    // Handle input changes for specific fields for each employee in the `chek` array
    const onInputHandler = (value, index, name) => {
        let newData = [...chek]
        newData[index][name] = value // Update the specific field (e.g., `name`, `position`, etc.) of the employee at the given index
    }

    // Handle the checkbox for peer selection (assigning peers to employees)
    const handlePeerCheck = (event, index) => {
        const newData = [...chek]
        const { id, checked } = event.target
        if (checked) {
            newData[index].hasPeer = checked // Set `hasPeer` to true if the checkbox is checked
            setPeerChecked((prev) => [...prev, Number(id)]) // Add the peer's ID to the `peerChecked` state
            newData[index].peerId = undefined // Clear the `peerId` when peer is selected
        } else {
            newData[index].hasPeer = checked // Set `hasPeer` to false if the checkbox is unchecked
            setPeerChecked((prevIds) => prevIds.filter((Ids) => Ids !== Number(id))) // Remove the peer's ID from `peerChecked` state
            setSelectPeerId((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)])
        }
    }

    // Handle the "Select All Peers" checkbox to select or deselect all peers
    const handleAllPeerSelect = (e) => {
        const { checked } = e.target // Get checkbox id and checked status
        if (checked) {
            setArray(employees) // Set `array` to all employees
            employees.map((e) => {
                return setPeerChecked((prev) => [...prev, Number(e.id)]) // Select all peers by adding their IDs to `peerChecked`
            })
        } else {
            setArray(employees) // Reset `array` to all employees
            setPeerChecked([]) // Deselect all peers
            chek.forEach((e) => (e.peerId = 0)) // Reset `peerId` to 0 for all employees
            chek.forEach((e) => (e.hasPeer = false)) // Reset `hasPeer` to false for all employees
            setSelectPeerId([])
        }
    }

    const [submissionDeadLine, setSubmissionDeadLine] = useState(null)
    // State to store the submission deadline date

    const [managerReviewDeadLine, setManagerReviewDeadLine] = useState(null)
    // State to store the manager review deadline date
    console.log(managerReviewDeadLine, 'chekingDeadLine')
    const [hrReviewDeadLine, setHrReviewDeadLine] = useState(null)
    // State to store the HR review deadline date

    const [peerReviewdaedLine, setPeerReviewdaedLine] = useState(null)
    // State to store the peer review deadline date

    // Function to handle the selection of a peer for a given employee (index)
    const handlePeerSelect = (select, index) => {
        const newData = [...chek]
        const selectedPeerId = select.value
        // Update peerId in your data copy
        newData[index].peerId = selectedPeerId
        // Update selectPeerId by replacing the value at `index`
        setSelectPeerId((prev) => {
            // Remove any previous entry for the same user index
            const filtered = prev.filter((entry) => entry.userIndex !== index)
            // Add the new peerId for this user
            return [...filtered, { userIndex: index, peerId: selectedPeerId }]
        })
    }

    // Define columns for the employee data table, where each column has a header, accessor, and custom cell render logic
    const GenerateColumns = [
        {
            Header: (row) => (
                <div className="text-center ">
                    {employees.length != 0 ? (
                        <input
                            type="checkbox"
                            id={row.data.id}
                            checked={employees.length == originalValues.length}
                            onChange={(e) => handleSelectAll(e)}
                        />
                    ) : (
                        ''
                    )}
                </div>
            ),
            accessor: 'checked', // Column for checkbox selection
            disableSortBy: true, // Disable sorting for this column
            Cell: ({ row }) => (
                <div className="text-center rowHight ">
                    <input
                        type="checkbox"
                        id={row.original.id}
                        checked={rid.some((e) => e == row.original.id)} // Checkbox checked if the employee ID is in `rid`
                        onChange={(event) => handleCheck(event, row.index)} // Handle individual checkbox change
                    />
                </div>
            )
        },
        {
            Header: 'Employee Id',
            accessor: 'code' // Column for displaying employee ID
        },
        {
            Header: 'Employee Name',
            accessor: 'name' // Column for displaying employee name
        },
        {
            Header: 'Joining Date',
            accessor: 'dateOfJoining' // Column for displaying joining date
        },
        {
            Header: 'Designation',
            accessor: 'designation', // Column for displaying employee designation
            Cell: ({ row }) => (
                <>
                    <Tooltip style={{ maxWidth: '120px' }} title={row.original.designation} open>
                        {row.original.designation}
                    </Tooltip>
                    <div className="tableLength">{row.original.designation}</div>
                </>
            )
        },
        {
            Header: 'Peer Review', // Column for peer review selection
            accessor: 'hasPeer',
            Cell: ({ row }) => (
                <>
                    {rid.some((e) => e == row.original.id) ? ( // Only show checkbox if the employee ID is in `rid`
                        <div className="text-center">
                            <input
                                type="checkbox"
                                id={row.original.id}
                                checked={peerChecked.some((e) => e == row.original.id)} // Check if peer review is enabled
                                onChange={(event) => handlePeerCheck(event, row.index)} // Handle peer review checkbox change
                            />
                        </div>
                    ) : (
                        <span>{''}</span>
                    )}
                </>
            )
        },
        {
            Header: () => <div className="header text-center">Peer Name</div>, // Column for selecting peer name
            accessor: 'peerName',
            Cell: ({ row }) => (
                <>
                    {peerChecked.some((e) => e == row.original.id) ? ( // Only show peer selection if `peerChecked` is true for the employee
                        <div className="row">
                            <div className="col-sm-12">
                                <Select
                                    onChange={(e) => handlePeerSelect(e, row.index)} // Handle peer selection change
                                    options={peerOptions} // Options for the peer dropdown
                                    defaultValue={peerOptions.filter(
                                        (e) => e.value == row.original.peerId
                                    )} // Default selected value
                                />
                            </div>
                        </div>
                    ) : (
                        <span>{''}</span>
                    )}
                </>
            )
        },
        {
            Header: () => <div className="header text-center">Manager Name</div>, // Column for manager name
            accessor: 'managerName',
            Cell: ({ row }) => (
                <div>
                    {rid.some((e) => e == row.original.id) ? ( // Show manager selection only if the employee ID is in `rid`
                        <div className="row">
                            <div className="col-sm-1"></div>
                            <div className="col-sm-5 titledropdown">
                                <Select
                                    onChange={(e) => onSelectionHandler(e, row.index)} // Handle title selection change
                                    options={options} // Options for manager title dropdown
                                    defaultValue={options.filter(
                                        (e) => e.value == row.original.managerTitle
                                    )} // Default manager title
                                />
                            </div>
                            <div className="col-sm-5 managerName">
                                <Form.Control
                                    maxLength={50} // Limit the input length for manager name
                                    onChange={(e) =>
                                        onInputHandler(e.target.value, row.index, 'managerName')
                                    } // Handle manager name input change
                                    name="managerName"
                                    defaultValue={row.original.managerName} // Default manager name
                                />
                            </div>
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            )
        },
        {
            Header: () => <div className=" header text-center">Manager Email</div>, // Column for manager email
            accessor: 'managerEmail',
            Cell: ({ row }) => (
                <>
                    {rid.some((e) => e == row.original.id) ? ( // Show email input field only if the employee ID is in `rid`
                        <div className="box">
                            <div className="">
                                <Form.Control
                                    maxLength={50} // Limit the input length for manager email
                                    onChange={(e) =>
                                        onInputHandler(e.target.value, row.index, 'managerEmail')
                                    } // Handle manager email input change
                                    name="managerEmail"
                                    defaultValue={row.original.managerEmail} // Default manager email
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Tooltip title={row.original.managerEmail} open>
                                {row.original.managerEmail}
                            </Tooltip>
                            <div className="tableLength">{row.original.managerEmail}</div>
                        </>
                    )}
                </>
            )
        }
    ]

    // Function to handle the submission deadline date change
    const handleSubmissionDeadline = (e) => {
        setSubmissionDeadLine(moment(e).format('YYYY-MM-DD')) // Format and set the submission deadline
        setManagerReviewDeadLine(null)
        setPeerReviewdaedLine(null)
        setHrReviewDeadLine(null)
    }

    // Function to handle the manager review deadline date change
    const handleManagerDeadline = (e) => {
        setManagerReviewDeadLine(moment(e).format('YYYY-MM-DD')) // Format and set the manager review deadline
        setHrReviewDeadLine(null)
    }

    // Function to handle the peer review deadline date change
    const handlePeerDeadLine = (e) => {
        setPeerReviewdaedLine(moment(e).format('YYYY-MM-DD')) // Set the peer review deadline
    }

    // Function to handle the HR review deadline date change
    const handleHrDeadline = (e) => {
        setHrReviewDeadLine(moment(e).format('YYYY-MM-DD')) // Format and set the HR review deadline
    }

    // State to store form validation errors
    const [formErrors, setFormErrors] = useState({})

    // Validation function for form fields
    const validate = (values) => {
        const errors = {}

        if (values.locationId == null) {
            errors.locationId = 'Required' // Error if location ID is missing
        }
        if (values.reviewPeriodFrom == null) {
            errors.reviewPeriodFrom = 'Required' // Error if review period start is missing
        }
        if (values.reviewPeriodTo == null) {
            errors.reviewPeriodTo = 'Required' // Error if review period end is missing
        }
        if (values.managerReviewDeadline == null) {
            errors.managerReviewDeadline = 'Required' // Error if manager review deadline is missing
        }
        if (values.peerSubmissionDeadline == null && peerChecked.length != 0) {
            errors.peerSubmissionDeadline = 'Required' // Error if peer submission deadline is missing and peers are selected
        }
        if (values.hrReviewDeadline == null) {
            errors.hrReviewDeadline = 'Required' // Error if HR review deadline is missing
        }
        if (values.submissionDeadline == null) {
            errors.submissionDeadline = 'Required' // Error if submission deadline is missing
        }

        return errors // Return all validation errors
    }

    //  Helper Function to isolate validation logic
    const getMissingField = (obj) => {
        if (obj.locationId == null) return 'locationId'
        if (!obj.reviewPeriodFrom) return 'reviewPeriodFrom'
        if (!obj.reviewPeriodTo) return 'reviewPeriodTo'
        if (!obj.managerReviewDeadline) return 'managerReviewDeadline'
        if (!obj.hrReviewDeadline) return 'hrReviewDeadline'
        if (
            (!obj.peerSubmissionDeadline && peerChecked.length >= 1) ||
            obj.peerSubmissionDeadline === ''
        )
            return 'peerSubmissionDeadline'
        if (!obj.submissionDeadline) return 'submissionDeadline'
        return null
    }

    console.log(originalPeerValues, selectPeerId, 'chekingPeerSelectPeerIds')
    // Function to handle the generation of appraisal data
    const handleGenerateHandler = () => {
        const newObj = gen.map((e) => ({
            employeeId: e.id,
            managerName: e.managerName,
            managerEmail: e.managerEmail,
            managerTitle: e.managerTitle,
            hasPeer: !!e.peerId,
            peerId: e.peerId
        }))

        const obj = {
            organizationId: userDetails.organizationId,
            locationId,
            reviewPeriodFrom,
            reviewPeriodTo,
            managerReviewDeadline: managerReviewDeadLine,
            submissionDeadline: submissionDeadLine,
            peerSubmissionDeadline: peerReviewdaedLine,
            hrReviewDeadline: hrReviewDeadLine,
            generateAppraisalDTOs: newObj
        }
        console.log(obj, 'chekingObjectfromGenerateList')
        const missingField = getMissingField(obj)
        if (missingField) {
            setFormErrors(validate(obj))
            return
        }

        if (rid.length === 0) return toast.error('Please Select Employees')
        if (originalPeerValues.length !== selectPeerId.length)
            return toast.error('Please Select Peer')
        if (originalValues.length !== originalTitleSelectValues.length)
            return toast.error('Please Select Title')

        save({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            body: obj,
            toastSuccessMessage: commonCrudSuccess({ screen: 'appraisals', operationType: 'save' }),
            screenName: 'appraisals'
        })
            .then((res) => {
                if (res.statusCode === 200) {
                    toast.success('Appraisals generated successfully')
                    onCloseHandler()
                }
            })
            .catch((err) => {
                console.log(err, 'error')
                ToastError(err.message)
            })
    }
    return (
        <div>
            <from>
                {/* // A row component to create a layout with two columns */}
                <Row>
                    {/* Column with a width of 6 (out of 12 grid) */}
                    <div className="col-6">
                        {/* Form group that includes a label and an input field */}
                        <Form.Group
                            as={Row} // Makes the group display as a row for better alignment
                            className="mb-3" // Applies margin-bottom spacing
                        >
                            {/* Label for the Location input field */}
                            <Form.Label column sm={5}>
                                Location <span className="error">*</span>{' '}
                                {/* Asterisk indicates required field */}
                            </Form.Label>
                            {/* Column for the select input field */}
                            <Col sm={6}>
                                {/* Select component for choosing a location */}
                                <Select
                                    // When an option is selected, `handleLocationSelection` function is triggered
                                    onChange={handleLocationSelection}
                                    // `locationOptions` provides the list of options for the dropdown
                                    options={locationOptions}
                                    // onBlur event triggers when the field loses focus
                                    onBlur={() =>
                                        // If `locationId` is not set, show an error message
                                        !locationId
                                            ? setFormErrors({
                                                ...formErrors,
                                                locationId: 'Required' // Set error message for the field
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                locationId: '' // Clear error message when a valid location is selected
                                            })
                                    }
                                    // Set the selected value based on the current `locationId`
                                    value={locationOptions.filter(
                                        (e) => e.value == locationId // Find the location option that matches `locationId`
                                    )}
                                />
                                {/* Display error message if any for locationId */}
                                <p className="error">{formErrors.locationId}</p>
                            </Col>
                        </Form.Group>
                    </div>
                </Row>

                {/* // A Row component to structure a layout with multiple form fields */}
                <Row>
                    {/* First Column (left side of the row) */}
                    <div className="col-6">
                        {/* Form group for 'Review Period From' field */}
                        <Form.Group
                            as={Row} // Makes the group display as a row for better alignment
                            className="mb-3" // Adds bottom margin for spacing
                        >
                            {/* Label for the 'Review Period From' input field */}
                            <Form.Label column sm={5}>
                                Review Period From <span className="error">*</span>{' '}
                                {/* Asterisk indicates required field */}
                            </Form.Label>
                            <Col sm={6}>
                                {/* Select dropdown for choosing the start month of the review period */}
                                <Select
                                    options={reviewFromMonthOptions} // Options for the dropdown
                                    onChange={handleReviewFromMonthSelect} // Handles selection
                                    onBlur={() =>
                                        // When the input loses focus, validate if the field is filled
                                        !reviewPeriodFrom
                                            ? setFormErrors({
                                                ...formErrors,
                                                reviewPeriodFrom: 'Required' // Set error if no value is selected
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                reviewPeriodFrom: '' // Clear error if a valid value is selected
                                            })
                                    }
                                />
                                {/* Display error message if there's any for 'Review Period From' */}
                                <p className="error">{formErrors.reviewPeriodFrom}</p>
                            </Col>
                        </Form.Group>
                    </div>

                    {/* Second Column (right side of the row) */}
                    <div className="col-6">
                        {/* Form group for 'Review Period To' field */}
                        <Form.Group
                            as={Row} // Keeps the label and input aligned
                            className="mb-3" // Margin-bottom for spacing
                        >
                            {/* Label for the 'Review Period To' field */}
                            <Form.Label column sm={5}>
                                Review Period To <span className="error">*</span>
                            </Form.Label>
                            <Col sm={6}>
                                {/* Select dropdown for choosing the end month of the review period */}
                                <Select
                                    value={reviewPeriodTo ? { value: reviewPeriodTo, label: moment(reviewPeriodTo).format("MMMM YYYY") } : null}
                                    options={reviewToMonthOptions} // Options for the dropdown
                                    onChange={handleReviewToMonthSelect} // Handles the month selection
                                    onBlur={() =>
                                        // Validation onBlur to check if the field is filled
                                        !reviewPeriodTo
                                            ? setFormErrors({
                                                ...formErrors,
                                                reviewPeriodTo: 'Required' // Error if not filled
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                reviewPeriodTo: '' // Clear error if valid
                                            })
                                    }
                                />
                                {/* Display error message for 'Review Period To' */}
                                <p className="error">{formErrors.reviewPeriodTo}</p>
                            </Col>
                        </Form.Group>
                    </div>

                    {/* Third Column for 'Submission Deadline' */}
                    <div className="col-6">
                        {/* Form group for selecting submission deadline */}
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={5}>
                                Submission Deadline <span className="error">*</span>
                            </Form.Label>
                            <Col sm={6}>
                                {/* DatePicker for selecting the submission deadline */}
                                <DatePicker
                                    inputReadOnly={true} // Makes the input field read-only
                                    onChange={handleSubmissionDeadline} // Handles date change
                                    defaultValue={submissionDeadLine} // Sets the default value
                                    placeholder="Select Date" // Placeholder text
                                    allowClear={false} // Prevents clearing the date
                                    onBlur={(e) =>
                                        // Validation onBlur to check if the date is selected
                                        !e.target.value
                                            ? setFormErrors({
                                                ...formErrors,
                                                submissionDeadline: 'Required' // Error if no date is selected
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                submissionDeadline: '' // Clear error if valid
                                            })
                                    }
                                    disabledDate={(current) =>
                                        // Disables dates earlier than today (cannot select past dates)
                                        current && current < moment().endOf('day')
                                    }
                                />
                                {/* Display error message for 'Submission Deadline' */}
                                <p className="error">{formErrors.submissionDeadline}</p>
                            </Col>
                        </Form.Group>
                    </div>

                    {/* Fourth Column for 'Peer Deadline' */}
                    <div className="col-6">
                        {/* Form group for selecting peer review deadline */}
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={5}>
                                Peer Deadline <span className="error">*</span>
                            </Form.Label>
                            <Col sm={6}>
                                {/* DatePicker for selecting peer review deadline */}
                                <DatePicker
                                    inputReadOnly={true} // Read-only input
                                    onChange={handlePeerDeadLine} // Handles date change
                                    value={
                                        peerReviewdaedLine == null
                                            ? null
                                            : moment(peerReviewdaedLine)
                                    } // Default value
                                    placeholder="Select Date" // Placeholder text
                                    allowClear={false} // Prevents clearing
                                    disabled={peerChecked.length == 0 ? true : false} // Disables field if no peers are checked
                                    onBlur={(e) =>
                                        // Validation to ensure peer review deadline is set if peers are checked
                                        !e.target.value && peerChecked.length >= 1
                                            ? setFormErrors({
                                                ...formErrors,
                                                peerSubmissionDeadline: 'Required' // Error if not filled
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                peerSubmissionDeadline: '' // Clear error if valid
                                            })
                                    }
                                    disabledDate={(current) =>
                                        // Disables dates before submission deadline or after manager review deadline
                                        (current &&
                                            current < moment(submissionDeadLine).endOf('day')) ||
                                        (current &&
                                            current > moment(managerReviewDeadLine).endOf('day'))
                                    }
                                />
                                {/* Display error message for 'Peer Deadline' */}
                                <p className="error">{formErrors.peerSubmissionDeadline}</p>
                            </Col>
                        </Form.Group>
                    </div>

                    {/* Fifth Column for 'Manager Review Deadline' */}
                    <div className="col-6">
                        {/* Form group for selecting manager review deadline */}
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={5}>
                                Manager Review Deadline <span className="error">*</span>
                            </Form.Label>
                            <Col sm={6}>
                                {/* DatePicker for selecting manager review deadline */}
                                <DatePicker
                                    inputReadOnly={true} // Read-only input
                                    onChange={handleManagerDeadline} // Handles date change
                                    value={
                                        managerReviewDeadLine == null
                                            ? null
                                            : moment(managerReviewDeadLine)
                                    } // Default value
                                    disabled={submissionDeadLine == null} // Disables if submission deadline is not set
                                    placeholder="Select Date" // Placeholder text
                                    allowClear={false} // Prevent clearing
                                    onBlur={(e) =>
                                        // Validation to check if manager review deadline is filled
                                        !e.target.value
                                            ? setFormErrors({
                                                ...formErrors,
                                                managerReviewDeadline: 'Required' // Error if empty
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                managerReviewDeadline: '' // Clear error if valid
                                            })
                                    }
                                    disabledDate={(current) => {
                                        const disdates = peerReviewdaedLine == null ? submissionDeadLine : peerReviewdaedLine
                                        return current && (
                                            // Disables dates before submission deadline
                                            current && current < moment(disdates).endOf('day')
                                        )
                                    }
                                    }
                                />
                                {/* Display error message for 'Manager Review Deadline' */}
                                <p className="error">{formErrors.managerReviewDeadline}</p>
                            </Col>
                        </Form.Group>
                    </div>

                    {/* Sixth Column for 'HR Review Deadline' */}
                    <div className="col-6">
                        {/* Form group for selecting HR review deadline */}
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={5}>
                                HR Review Deadline <span className="error">*</span>
                            </Form.Label>
                            <Col sm={6}>
                                {/* DatePicker for selecting HR review deadline */}
                                <DatePicker
                                    onChange={handleHrDeadline} // Handles date change
                                    value={
                                        hrReviewDeadLine == null ? null : moment(hrReviewDeadLine)
                                    } // Default value
                                    inputReadOnly={true} // Read-only input
                                    placeholder="Select Date" // Placeholder text
                                    allowClear={false} // Prevents clearing
                                    disabled={managerReviewDeadLine == null} // Disables if manager review deadline is not set
                                    onBlur={(e) =>
                                        // Validation to check if HR review deadline is filled
                                        !e.target.value
                                            ? setFormErrors({
                                                ...formErrors,
                                                hrReviewDeadline: 'Required' // Error if empty
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                hrReviewDeadline: '' // Clear error if valid
                                            })
                                    }
                                    disabledDate={(current) =>
                                        // Disables dates before manager review deadline
                                        current &&
                                        current < moment(managerReviewDeadLine).endOf('day')
                                    }
                                />
                                {/* Display error message for 'HR Review Deadline' */}
                                <p className="error">{formErrors.hrReviewDeadline}</p>
                            </Col>
                        </Form.Group>
                    </div>

                    {/* Checkbox for 'Peer Review Required' */}
                    {employees.length != 0 && employees.length == originalValues.length ? (
                        <div className="col-6">
                            {/* Form group for 'Peer Review Required' checkbox */}
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={5}>
                                    Peer Review Required ?
                                </Form.Label>
                                <Col sm={6}>
                                    <input
                                        onChange={handleAllPeerSelect} // Handles the checkbox change
                                        type="checkbox"
                                        checked={employees.length == originalPeerValues.length} // Checked if all employees have peer values
                                    />
                                </Col>
                            </Form.Group>
                        </div>
                    ) : (
                        <span>{''}</span>
                    )}
                </Row>
            </from>
            <div style={{ marginTop: '2%' }}>
                {employees.length != 0 ? (
                    <Table data={employees} columns={GenerateColumns} />
                ) : (
                    <></>
                )}
            </div>

            <div className="btnCenter">
                <Button className="Button" variant="addbtn" onClick={handleGenerateHandler}>
                    Generate
                </Button>
                <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                    {cancelButtonName}
                </Button>
            </div>
        </div>
    )
}
