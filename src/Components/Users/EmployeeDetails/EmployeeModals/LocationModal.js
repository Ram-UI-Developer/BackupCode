import { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { cancelButtonName } from '../../../../Common/Utilities/Constants' // Importing the cancel button name constant
import TableWith5Rows from '../../../../Common/Table/TableWith5Rows' // Importing a custom table component that likely shows rows of data
import { DatePicker } from 'antd' // DatePicker component from Ant Design for selecting dates
import Select from 'react-select' // Select component for dropdown options
import moment from 'moment' // Moment.js for date manipulation and formatting
import { toast } from 'react-toastify' // Toast for displaying notifications like success, error, etc.

const LocationModal = (props) => {
    // Destructuring props to get data and functions passed from parent component
    const {
        locationDtos,
        setShowModal,
        setLocationId,
        locationId,
        locationOptions,
        setLocationDtos,
        doj,
        locationName,
        setLocationName,
        onShowModalCloseHandler,
        orgDate
    } = props

    // State to track form errors (validations for the form fields)
    const [formErrors, setFormErrors] = useState({})

    // Validation function to check if required fields are filled
    const validate = (values) => {
        const errors = {}
        // If locationId is not selected, add an error
        if (values.locationId == null) {
            errors.locationId = 'Required'
        }
        // If effective date is not selected, add an error
        if (values.startDate == null) {
            errors.effectiveDate = 'Required'
        }

        return errors
    }

    // Handler for when a location is selected from the dropdown
    const handleLocationSelection = (selection) => {
        // Set selected location name and ID
        setLocationName(selection.label)
        setLocationId(selection.value)
    }

    // State to track selected effective date
    const [effectiveDate, setEffectiveDate] = useState(null)

    // Handler for selecting effective date
    const hnadleSelectEffectiveDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        // Check if the selected date is before the organization's foundation date
        if (selectedDate < orgDate) {
            toast.error('Effective date must not precede foundation date')
            setEffectiveDate(null) // Reset effective date if invalid
        } else {
            setEffectiveDate(selectedDate)
        }
    }

    console.log(locationDtos, "chekingLOcationDtos")
    // Function to add a location object to the locationDtos array
    const addLocationeDtos = () => {
        const locationObj = {
            id: null,
            locationId: locationId,
            startDate: effectiveDate,
            locationName: locationName
        }

        // Validating location object fields before adding to the array
        if (locationObj.locationId == undefined || locationObj.locationId == null) {
            setFormErrors(validate(locationObj))
        } else if (locationObj.startDate == null) {
            setFormErrors(validate(locationObj))
        } else {
            const nullObj = locationDtos.findIndex((e) => e.id === null)
            if (nullObj !== -1) {
                locationDtos[nullObj] = locationObj
            }
            else {
                // Adding the new location to the list (locationDtos)
                const locationData = [...locationDtos, locationObj]
                setLocationDtos(locationData) // Updating the parent component's state
            }
            setShowModal(false) // Closing the modal after successful addition
        }
    }
    const newEffectiveDate =
        locationDtos.length == 0 ? '' : locationDtos && locationDtos[0].startDate
    // Columns definition for displaying location history in a table
    const locationHistoryColumns = [
        {
            Header: () => (
                <div className="text-left header" style={{ marginLeft: '8rem' }}>
                    Name
                </div>
            ),
            accessor: 'locationName',
            Cell: ({ row }) => (
                <div style={{ marginLeft: '8rem' }} className="text-left">
                    {row.original.locationName}
                </div>
            )
        },
        {
            Header: () => (
                <div className="text-left header" style={{ marginRight: '3.8rem' }}>
                    Start Date
                </div>
            ),
            accessor: 'startDate',
            Cell: ({ row }) => (
                <div className="text-left" style={{ marginRight: '3.8rem' }}>
                    {row.original.startDate}
                </div>
            )
        },
        {
            Header: () => <div className="text-left header">End Date</div>,
            accessor: 'endDate',
            Cell: ({ row }) => <div className="text-left">{row.original.endDate}</div>
        }
    ]

    return (
        <>
            {/* Form for selecting location and effective date */}
            <div className="row ">
                <Row>
                    <div className="col-6">
                        <Form.Group as={Row} className="mb-3" controlId="locationId">
                            <Form.Label id="locationId" column sm={4}>
                                Location
                                <span className="error">*</span>
                            </Form.Label>
                            <Col sm={7}>
                                <Select
                                    placeholder=""
                                    id="locationId"
                                    onChange={handleLocationSelection} // Handle selection
                                    options={locationOptions} // Options passed from parent
                                    required
                                    onBlur={() =>
                                        !locationId
                                            ? setFormErrors({
                                                ...formErrors,
                                                locationId: 'Required'
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                locationId: ''
                                            })
                                    }
                                    value={locationOptions.filter(
                                        (e) => e.value == locationId // Display selected value
                                    )}
                                />
                                <p className="error">
                                    {formErrors.locationId} {/* Display validation error */}
                                </p>
                            </Col>
                        </Form.Group>
                    </div>
                    <div className="col-6" style={{ marginRight: '-50px' }}>
                        <Form.Group as={Row} className="mb-3" controlId="locationDate">
                            <Form.Label id="locationDate" column sm={5}>
                                Effective Date
                                <span className="error">*</span>
                            </Form.Label>
                            <Col sm={7}>
                                <DatePicker
                                    id="locationDate"
                                    placeholder="Select Date"
                                    allowClear={false}
                                    onChange={hnadleSelectEffectiveDate} // Handle date selection
                                    disabledDate={(current) => {
                                        // Disable dates before the foundation date
                                        const tomorrow = new Date(
                                            newEffectiveDate ? newEffectiveDate : doj
                                        )
                                        tomorrow.setDate(tomorrow.getDate())
                                        let customDate = moment(tomorrow).format('YYYY-MM-DD')
                                        return current.isSameOrBefore(customDate, 'day')
                                    }}
                                    required
                                    format={'DD-MM-YYYY'}
                                    size="sm"
                                    onBlur={(e) =>
                                        !e.target.value
                                            ? setFormErrors({
                                                ...formErrors,
                                                jobRoleDate: 'Required'
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                jobRoleDate: ''
                                            })
                                    }
                                    name="dateOfJoining"
                                />
                                <p className="error">
                                    {formErrors.effectiveDate} {/* Display validation error */}
                                </p>
                            </Col>
                        </Form.Group>
                    </div>
                </Row>
            </div>

            {/* Table displaying location history */}
            <div className="table">
                {locationDtos != null ? (
                    <TableWith5Rows
                        columns={locationHistoryColumns} // Table for displaying location history
                        serialNumber={true} // Displaying serial number
                        data={locationDtos}
                    />
                ) : (
                    []
                )}
            </div>

            {/* Buttons for adding location or closing the modal */}
            <div className="btnCenter">
                <Button
                    id="AddLocation"
                    className="Button"
                    variant="addbtn"
                    onClick={addLocationeDtos} // Handle add location click
                >
                    Add
                </Button>
                <Button
                    id="CloseLocation"
                    className="Button"
                    variant="secondary"
                    onClick={onShowModalCloseHandler} // Close modal without saving
                >
                    {cancelButtonName}
                </Button>
            </div>
        </>
    )
}
export default LocationModal
