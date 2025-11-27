// Importing necessary dependencies and components
import { DatePicker } from 'antd' // Ant Design DatePicker for year selection
import moment from 'moment' // Moment.js for date formatting and manipulation
import React, { useState } from 'react' // React hooks (useState, useEffect)
import { Col, Form, Row } from 'react-bootstrap' // Bootstrap components for UI

// PerformanceReviewRecord Component that accepts props for the appraisal form, errors, and form error setters
const PerformanceReviewRecord = ({ apprisalForm, error, setFormErrors }) => {
    const { RangePicker } = DatePicker // Destructuring RangePicker from DatePicker to use year selection range

    // Function to handle input changes for fields like rating, CTC, etc.
    const handleInputChange = (e) => {
        const { name, value } = e.target // Extracting name and value from input
        console.log(name, 'nameofthedata') // Logging input name
        apprisalForm.hrReviewDTO[name] = value // Update the form data with new value
    }

    // Function to handle date selection for the year range
    const handleDateSelector = (e) => {
        const selectedDate = e ? e.map((e) => moment(e).format('YYYY')) : [] // Format selected dates to 'YYYY'
        const dateString = selectedDate.toString() // Convert array to string
        apprisalForm.hrReviewDTO['year'] = dateString // Set the selected year range in form data
    }

    // Function to restrict input length
    const maxLengthCheck = (object) => {
        if (object.target.value.length > object.target.maxLength) {
            // Check if input length exceeds maxLength
            object.target.value = object.target.value.slice(0, object.target.maxLength) // Slice the string to fit maxLength
        }
    }

    // State to track character count for the 'New Designation' field
    const [charCount, setCharCount] = useState(
        apprisalForm.hrReviewDTO.recommendedDesignation
            ? apprisalForm.hrReviewDTO.recommendedDesignation.length
            : 0 // Initialize count based on existing value
    )

    // Function to handle changes to the 'New Designation' field
    const handleChange = (event) => {
        const { value } = event.target // Get the new value from input
        console.log(apprisalForm.hrReviewDTO, 'chekingHrReviewDto') // Log the form data for debugging
        if (value.length <= 50) {
            // Ensure value length does not exceed 50 characters
            setCharCount(value.length) // Update character count
            handleInputChange(event) // Call the original input change handler to update form data
        }
    }

    // Formatting year value
    const y = apprisalForm.hrReviewDTO.year ? apprisalForm.hrReviewDTO.year : '2024,2025' // Default to "2024,2025" if no year is selected
    const year = y.replace(',', ' - ') // Replace comma with dash for display format

    return (
        <div>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <h5 style={{ marginLeft: '1%', marginTop: '1%', color: '#364781' }}>
                                    <label>Performance Review And Recommendation</label>
                                </h5>
                                {/* Form for capturing performance review data */}
                                <form className="card-body formBody">
                                    {/* Time Frame Input */}
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Time Frame <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={6}>
                                                {apprisalForm.status == 'Completed' ? ( // If the status is "Completed", disable date input
                                                    <Form.Control
                                                        value={year}
                                                        disabled={
                                                            apprisalForm.status == 'Completed'
                                                        } // Disable input if status is "Completed"
                                                    />
                                                ) : (
                                                    <RangePicker
                                                        inputReadOnly={true}
                                                        picker="year"
                                                        onChange={handleDateSelector} // Date range selection
                                                        placeholder="Select Date"
                                                        onBlur={(e) =>
                                                            !e.target.value
                                                                ? setFormErrors({
                                                                      ...error,
                                                                      year: 'Required' // Show error if no date is selected
                                                                  })
                                                                : setFormErrors({
                                                                      ...error,
                                                                      year: '' // Clear error if date is selected
                                                                  })
                                                        }
                                                    />
                                                )}
                                                <p className="error">{error.year}</p>{' '}
                                                {/* Display error if year is not selected */}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {/* New Designation Input */}
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                New Designation <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={6}>
                                                <Form.Control
                                                    name="recommendedDesignation"
                                                    onChange={handleChange} // Handle changes in designation input
                                                    maxLength={50} // Limit input length to 50 characters
                                                    disabled={apprisalForm.status == 'Completed'} // Disable input if status is "Completed"
                                                    defaultValue={
                                                        apprisalForm.hrReviewDTO
                                                            .recommendedDesignation
                                                    }
                                                    onBlur={(e) =>
                                                        !e.target.value
                                                            ? setFormErrors({
                                                                  ...error,
                                                                  recommendedDesignation: 'Required' // Show error if no designation is entered
                                                              })
                                                            : setFormErrors({
                                                                  ...error,
                                                                  recommendedDesignation: '' // Clear error if designation is entered
                                                              })
                                                    }
                                                />
                                                <div className="d-flex justify-content-end">
                                                    <small>{charCount} / 50 </small>{' '}
                                                    {/* Display character count */}
                                                </div>
                                                <p className="error">
                                                    {error.recommendedDesignation}
                                                </p>{' '}
                                                {/* Display error if designation is empty */}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {/* Rating Input */}
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Rating <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={6}>
                                                <Form.Control
                                                    name="overallRating"
                                                    onChange={(e) => {
                                                        const { value } = e.target
                                                        const rating = parseFloat(value)

                                                        // Allow only valid ratings between 0.0 and 5.0
                                                        if (
                                                            value === '' ||
                                                            (rating >= 0 && rating <= 5)
                                                        ) {
                                                            apprisalForm.hrReviewDTO.overallRating =
                                                                value
                                                            setFormErrors({
                                                                ...error,
                                                                overallRating: ''
                                                            })
                                                        } else {
                                                            setFormErrors({
                                                                ...error,
                                                                overallRating:
                                                                    'Rating must be between 0.0 and 5.0'
                                                            })
                                                        }
                                                    }}
                                                    disabled={apprisalForm.status == 'Completed'} // Disable input if status is "Completed"
                                                    defaultValue={
                                                        apprisalForm.hrReviewDTO.overallRating
                                                    }
                                                    type="number"
                                                    step="0.1" // Allow decimal values
                                                    onKeyPress={(e) => {
                                                        const key = e.key
                                                        const isDigit = key >= '0' && key <= '9'
                                                        const isDot = key === '.'
                                                        const value = e.target.value

                                                        // Prevent multiple dots or invalid characters
                                                        if (!isDigit && !isDot) {
                                                            e.preventDefault()
                                                        }
                                                        if (isDot && value.includes('.')) {
                                                            e.preventDefault()
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const { value } = e.target
                                                        if (!value) {
                                                            setFormErrors({
                                                                ...error,
                                                                overallRating: 'Required'
                                                            })
                                                        } else if (
                                                            parseFloat(value) < 0 ||
                                                            parseFloat(value) > 5
                                                        ) {
                                                            setFormErrors({
                                                                ...error,
                                                                overallRating:
                                                                    'Rating must be between 0.0 and 5.0'
                                                            })
                                                        }
                                                    }}
                                                />
                                                <p className="error">{error.overallRating}</p>{' '}
                                                {/* Display error message under the text box */}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {/* Percentage Hike Input */}
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                %Hike <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={6}>
                                                <Form.Control
                                                    name="percentageOfHike"
                                                    disabled={apprisalForm.status == 'Completed'} // Disable input if status is "Completed"
                                                    defaultValue={
                                                        apprisalForm.hrReviewDTO.percentageOfHike
                                                    }
                                                    onChange={handleInputChange} // Handle changes in percentage input
                                                    type="number"
                                                    maxLength={5} // Limit input length to 5 characters
                                                    onInput={maxLengthCheck} // Handle max length check for input
                                                    onBlur={(e) =>
                                                        !e.target.value
                                                            ? setFormErrors({
                                                                  ...error,
                                                                  percentageOfHike: 'Required' // Show error if no percentage is entered
                                                              })
                                                            : setFormErrors({
                                                                  ...error,
                                                                  percentageOfHike: '' // Clear error if percentage is entered
                                                              })
                                                    }
                                                />
                                                <p className="error">{error.percentageOfHike}</p>{' '}
                                                {/* Display error if percentage is not entered */}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {/* CTC Advice Input */}
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                CTC Advice <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={6}>
                                                <Form.Control
                                                    name="recommendedCTC"
                                                    onChange={handleInputChange} // Handle changes in CTC input
                                                    disabled={apprisalForm.status == 'Completed'} // Disable input if status is "Completed"
                                                    defaultValue={
                                                        apprisalForm.hrReviewDTO.recommendedCTC
                                                    }
                                                    min={0} // Minimum value for CTC is 0
                                                    maxLength={8} // Limit input length to 8 characters
                                                    onInput={maxLengthCheck} // Handle max length check for input
                                                    type="number"
                                                    onBlur={(e) =>
                                                        !e.target.value
                                                            ? setFormErrors({
                                                                  ...error,
                                                                  recommendedCTC: 'Required' // Show error if no CTC is entered
                                                              })
                                                            : setFormErrors({
                                                                  ...error,
                                                                  recommendedCTC: '' // Clear error if CTC is entered
                                                              })
                                                    }
                                                />
                                                <p className="error">{error.recommendedCTC}</p>{' '}
                                                {/* Display error if CTC is not entered */}
                                            </Col>
                                        </Form.Group>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PerformanceReviewRecord
