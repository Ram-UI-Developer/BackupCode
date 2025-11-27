import React, { useEffect, useState } from 'react'
import { cancelButtonName } from '../../../../Common/Utilities/Constants' // Importing the constant for the cancel button's label
import TableWith5Rows from '../../../../Common/Table/TableWith5Rows' // Importing the Table component used to display marital status history
import { Button, Col, Form, Row } from 'react-bootstrap' // Importing Bootstrap components for form layout and buttons
import { DatePicker } from 'antd' // Importing DatePicker component from Ant Design for selecting dates
import { getAllByOrgId } from '../../../../Common/Services/CommonService' // Importing API function to fetch marital status data by org ID
import moment from 'moment' // Importing Moment.js for date formatting
import Select from 'react-select' // Importing the Select component for dropdown selection
import { useSelector } from 'react-redux' // Importing the useSelector hook to access state from Redux
import { toast } from 'react-toastify' // Importing toast notifications for error or success messages

const MaritalStatusModal = (props) => {
    // Destructuring the props passed to the component
    const {
        maritalStatusDto,
        setShowModal,
        table,
        setMaritalStatusDto,
        doj,
        setMarriageStatusDate,
        setMaritalStatusName,
        maritalStatusName,
        onShowModalCloseHandler,
        maritalStatus,
        setMaritalStatus,
        dateOfBirth
    } = props
    console.log(doj, 'chekingDojIn')
    // Getting user details from Redux state (assuming user details contain information about the logged-in user)
    const userDetails = useSelector((state) => state.user.userDetails)
    const maritalStatusDtoDate = maritalStatusDto.length != 0 ? maritalStatusDto[0].startDate : doj

    // State to track form validation errors
    const [formErrors, setFormErrors] = useState({})

    // Validation function for marital status
    const validateForMaritalStatus = (values) => {
        const errors = {}
        // Check if maritalStatusId is selected
        if (values.martialStatusId == null) {
            errors.martialStatusId = 'Required'
        }
        // Check if startDate is provided
        if (values.startDate == null) {
            errors.startDate = 'Required'
        }

        return errors
    }

    // State to track the selected start date
    const [startDate, setStartDate] = useState(null)

    // Handler for selecting the start date of marital status
    const handleStartDateForMStatus = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        const allowedDateOfJoining = new Date(dateOfBirth) // Ensuring start date is after the date of birth
        const doj = allowedDateOfJoining.getFullYear()
        const date = new Date(selectedDate)
        const effectiveDate = date.getFullYear()

        // If the effective date is after the year of birth, allow it
        if (effectiveDate > doj) {
            setStartDate(selectedDate)
        } else {
            toast.error('Effective date must not precede date of Birth')
            setStartDate(null) // Reset the start date if invalid
        }
    }

    // Fetching marital status list from an API when the component is mounted
    useEffect(() => {
        getAllmaritalStatusList()
    }, []) // Empty dependency array ensures it runs only once when the component mounts

    // State to store the list of marital statuses fetched from the API
    const [maritalStatusList, setmaritalStatusList] = useState([])

    // Function to fetch marital status list for the organization
    const getAllmaritalStatusList = () => {
        getAllByOrgId({ entity: 'maritalstatus', organizationId: userDetails.organizationId }).then(
            (res) => {
                if (res.statusCode == 200) {
                    setmaritalStatusList(res.data) // Store the fetched marital statuses in the state
                }
            }
        )
            .catch((err) => {
                console.log(err, 'error') // Log any errors that occur during the API call
            })
    }

    // Mapping the maritalStatusList to options for the Select dropdown
    const maritalStatusOptions = maritalStatusList
        ? maritalStatusList.map((option) => ({
            value: option.id, // The value of each option
            label: option.name // The name of each option displayed in the dropdown
        }))
        : []

    // Handler for when a marital status is selected from the dropdown
    const handlemaritalStatusSelection = (selection) => {
        setMaritalStatus(selection.value) // Set the selected marital status ID
        setMaritalStatusName(selection.label) // Set the selected marital status name
        setMarriageStatusDate(selection.label)
    }

    // Function to add marital status data to the maritalStatusDto array
    const addMaritalStatusDto = () => {
        const maritalObj = {
            id: null, // Placeholder for new marital status entry
            startDate: startDate,
            martialStatusId: maritalStatus,
            martialStatusName: maritalStatusName
        }

        // Validate the form before adding the data
        if (maritalObj.martialStatusId == undefined || maritalObj.martialStatusId == null) {
            setFormErrors(validateForMaritalStatus(maritalObj)) // Show error if maritalStatusId is missing
        } else if (maritalObj.startDate == null) {
            setFormErrors(validateForMaritalStatus(maritalObj)) // Show error if startDate is missing
        } else {
            const nullObj = maritalStatusDto.findIndex((e) => e.id === null)
            if (nullObj !== -1) {
                maritalStatusDto[nullObj] = maritalObj
            }
            else {
                // Add the valid marital status object to the list and close the modal
                const managerData = [...maritalStatusDto, maritalObj]
                setMaritalStatusDto(managerData) // Update the marital status data in the parent component
                setMaritalStatus() // Reset the marital status selection
            }
            setShowModal(false) // Close the modal after adding
        }
    }

    // Columns definition for the marital status table
    const COLUMNS = [
        {
            Header: () => (
                <div className="text-left header" style={{ marginLeft: '8rem' }}>
                    Name
                </div>
            ),
            accessor: 'martialStatusName', // Column for marital status name
            Cell: ({ row }) => (
                <div style={{ marginLeft: '8rem' }} className="text-left">
                    {row.original.martialStatusName}
                </div>
            )
        },
        {
            Header: () => (
                <div className="text-left header" style={{ marginRight: '3.8rem' }}>
                    Start Date
                </div>
            ),
            accessor: 'startDate', // Column for the start date of marital status
            Cell: ({ row }) => (
                <div className="text-left" style={{ marginRight: '3.8rem' }}>
                    {row.original.startDate}
                </div>
            )
        },
        {
            Header: () => <div className="text-left header">End Date</div>,
            accessor: 'endDate', // Column for the end date of marital status
            Cell: ({ row }) => <div className="text-left">{row.original.endDate}</div>
        }
    ]

    return (
        <>
            {/* Conditionally render the table or form based on the "table" prop */}
            {table ? (
                <div className="table">
                    {maritalStatusDto != null ? (
                        <TableWith5Rows
                            columns={COLUMNS}
                            serialNumber={true}
                            data={maritalStatusDto}
                        /> // Displaying marital status history table
                    ) : (
                        []
                    )}
                </div>
            ) : (
                <div>
                    <div className="row table">
                        <Row>
                            <div className="col-6">
                                {/* Form for selecting marital status */}
                                <Form.Group as={Row} controlId="status" className="mb-3">
                                    <Form.Label id="status" column sm={4}>
                                        Status
                                        <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={7}>
                                        <Select
                                            id="status"
                                            placeholder=""
                                            onChange={handlemaritalStatusSelection} // Handle selection change
                                            options={maritalStatusOptions} // Options for the dropdown
                                            required
                                            onBlur={() =>
                                                !maritalStatus
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        martialStatusId: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        martialStatusId: ''
                                                    })
                                            }
                                            value={maritalStatusOptions.filter(
                                                (e) => e.value == maritalStatus
                                            )}
                                        />
                                        <p className="error">
                                            {formErrors.martialStatusId}{' '}
                                            {/* Display validation error for marital status */}
                                        </p>
                                    </Col>
                                </Form.Group>
                            </div>
                            <div className="col-6" style={{ marginRight: '-50px' }}>
                                {/* Form for selecting effective date */}
                                <Form.Group as={Row} className="mb-3" controlId="maritalStatusDate">
                                    <Form.Label id="maritalStatusDate" column sm={5}>
                                        Effective Date <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={7}>
                                        <DatePicker
                                            id="maritalStatusDate"
                                            placeholder="Select Date"
                                            allowClear={false}
                                            onChange={handleStartDateForMStatus} // Handle date selection
                                            disabledDate={(current) => {
                                                // maritalStatusDtoDate is expected to be a string in 'YYYY-MM-DD' format or a Date object
                                                const effectiveDate = moment(maritalStatusDtoDate, 'YYYY-MM-DD');
                                                // Disable all dates before the effective date (inclusive)
                                                return current && current.isBefore(effectiveDate, 'day');
                                            }}
                                            value={startDate == null ? null : moment(startDate)} // Display the selected start date
                                            required
                                            format={'DD-MM-YYYY'}
                                            size="sm"
                                            onBlur={(e) =>
                                                !e.target.value
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        startDate: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        startDate: ''
                                                    })
                                            }
                                        />
                                        <p className="error">
                                            {formErrors.startDate}{' '}
                                            {/* Display validation error for start date */}
                                        </p>
                                    </Col>
                                </Form.Group>
                            </div>
                        </Row>
                    </div>
                    <div className="table">
                        {maritalStatusDto != null ? (
                            <TableWith5Rows
                                columns={COLUMNS}
                                serialNumber={true}
                                data={maritalStatusDto}
                            />
                        ) : (
                            []
                        )}
                    </div>
                    <div className="btnCenter">
                        {/* Buttons for adding or canceling */}
                        <Button
                            id="AddMaritalStatus"
                            className="Button"
                            variant="addbtn"
                            onClick={addMaritalStatusDto} // Add marital status on click
                        >
                            Add
                        </Button>
                        <Button
                            id="CancelMaritalStatus"
                            className="Button"
                            variant="secondary"
                            onClick={onShowModalCloseHandler} // Close the modal on cancel
                        >
                            {cancelButtonName}
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}

export default MaritalStatusModal // Exporting the component
