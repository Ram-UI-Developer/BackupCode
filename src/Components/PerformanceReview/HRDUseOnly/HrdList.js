import React, { useEffect, useState } from 'react' // Importing React, hooks, and components for managing state and lifecycle
import PreviousYearRecord from './PreviousYearRecord' // Importing a custom component for displaying the previous year's records
import PerformanceReviewRecord from './PerformanceReviewRecord' // Importing a custom component for performance review
import { Col, Form, Row } from 'react-bootstrap' // Importing Bootstrap components for layout and form handling
import { DatePicker } from 'antd' // Importing DatePicker from Ant Design for date selection
import moment from 'moment' // Importing moment.js for handling date formatting and manipulation
import { getByIdwithOutOrg } from '../../../Common/Services/CommonService' // Importing service for API call to get organization data
import { useSelector } from 'react-redux' // Importing the useSelector hook to access Redux store

// Functional component to manage HRD list form
const HrdList = ({ apprisalForm, error, setFormErrors }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Getting user details from the Redux store
    // useEffect hook to call API to get organization date when the component mounts
    useEffect(() => {
        getByOrgId()
    }, [])

    // Function to handle input changes in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target // Extracting name and value from the input field
        apprisalForm.hrReviewDTO[name] = value // Updating the apprisalForm with new values
        apprisalForm.hrReviewDTO['closingDate'] = apprisalForm.hrReviewDeadline // Assigning closing date
        apprisalForm.hrReviewDTO['letterIssuedDate'] = apprisalForm.generatedDate // Assigning letter issued date
    }

    // Function to handle date change for last year evaluation date
    const handleEvaluationdate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD') // Formatting the selected date to "YYYY-MM-DD"
        apprisalForm.hrReviewDTO['lastYearEvaluationDate'] = selectedDate // Storing the date in the apprisalForm
    }

    // Function to handle date change for performance review form received date
    const handleEvaluationReciveddate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD') // Formatting the date
        apprisalForm.hrReviewDTO['recievedDate'] = selectedDate // Storing the received date
    }

    const [orgDate, setOrgDate] = useState('') // State to store the organization's foundation date

    // Function to fetch the organization data
    const getByOrgId = () => {
        getByIdwithOutOrg({ entity: 'organizations', id: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    setOrgDate(res.data ? res.data.foundationDate : '') // Set the foundation date if available
                }
            })
            .catch((err) => {
                console.log(err, 'err') // Log any errors from the API call
            })
    }

    return (
        <div>
            <div style={{ marginLeft: '5%' }}>
                {/* Form group for selecting the last year's performance evaluation date */}
                <div className="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label column sm={6}>
                            Last year Performance evaluation date
                        </Form.Label>
                        <Col md={3}>
                            {/* DatePicker for last year performance evaluation */}
                            <DatePicker
                                placeholder="Select Date"
                                disabled={apprisalForm.status == 'Completed'} // Disables datepicker if status is "Completed"
                                onChange={handleEvaluationdate} // Handling date change
                                disabledDate={(current) => {
                                    const tomorrow = new Date(orgDate) // Disabling dates before tomorrow based on the organization date
                                    tomorrow.setDate(tomorrow.getDate() + 1)
                                    let customDate = moment(tomorrow).format('YYYY-MM-DD')
                                    return current && current < moment(customDate, 'YYYY-MM-DD')
                                }}
                                defaultValue={
                                    apprisalForm.hrReviewDTO['lastYearEvaluationDate'] == null
                                        ? null
                                        : moment(apprisalForm.hrReviewDTO['lastYearEvaluationDate'])
                                }
                            />
                        </Col>
                    </Form.Group>
                </div>

                {/* Form group for selecting the current year's performance evaluation form received date */}
                <div className="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label column sm={6}>
                            Current year Performance evaluation Form Received On
                        </Form.Label>
                        <Col sm={3}>
                            {/* DatePicker for current year's performance review received date */}
                            <DatePicker
                                placeholder="Select Date"
                                disabled={apprisalForm.status == 'Completed'}
                                onChange={handleEvaluationReciveddate} // Handling date change
                                disabledDate={(current) => {
                                    const tomorrow = new Date(orgDate) // Disabling dates before tomorrow based on org date
                                    tomorrow.setDate(tomorrow.getDate() + 1)
                                    let customDate = moment(tomorrow).format('YYYY-MM-DD')
                                    return current && current < moment(customDate, 'YYYY-MM-DD')
                                }}
                                defaultValue={
                                    apprisalForm.generatedDate == null
                                        ? null
                                        : moment(apprisalForm.generatedDate)
                                } // Default value of date picker
                            />
                        </Col>
                    </Form.Group>
                </div>

                {/* Form group for displaying current year appraisal closing date (disabled) */}
                <div className="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label column sm={6}>
                            Current Year Performance Appraisal closing date
                        </Form.Label>
                        <Col md={3}>
                            {/* DatePicker for appraisal closing date (disabled) */}
                            <DatePicker
                                disabled={true} // Disabled, cannot be edited
                                value={moment(apprisalForm.hrReviewDeadline)} // Value set to the apprisalForm's hrReviewDeadline
                            />
                        </Col>
                    </Form.Group>
                </div>

                {/* Form group for entering last year salary revision percentage */}
                <div className="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label column sm={6}>
                            Last year Salary Revision %
                        </Form.Label>
                        <Col md={3}>
                            {/* Input field for last year salary revision percentage */}
                            <Form.Control
                                disabled={apprisalForm.status == 'Completed'} // Disables input if status is "Completed"
                                type="number"
                                min={0} // Minimum value for percentage
                                maxLength={5} // Max length for input
                                onChange={handleInputChange} // Handling input change
                                name="lastRevision" // Input field name for tracking in apprisalForm
                                defaultValue={apprisalForm.hrReviewDTO['lastRevision']} // Default value from apprisalForm
                            />
                        </Col>
                    </Form.Group>
                </div>

                {/* Form group for entering current year salary revision percentage */}
                <div className="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label column sm={6}>
                            Current Year Salary Revision %
                        </Form.Label>
                        <Col md={3}>
                            {/* Input field for current year salary revision percentage */}
                            <Form.Control
                                disabled={apprisalForm.status == 'Completed'} // Disables input if status is "Completed"
                                type="number"
                                min={0} // Minimum value
                                maxLength={5} // Max length
                                name="currentRevision" // Name for tracking the value in apprisalForm
                                onChange={handleInputChange} // Handle change
                                defaultValue={apprisalForm.hrReviewDTO['currentRevision']} // Default value from apprisalForm
                            />
                        </Col>
                    </Form.Group>
                </div>

                {/* Form group for displaying appraisal letter issued date (disabled) */}
                <div className="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label column sm={6}>
                            Appraisal Letter Issued On
                        </Form.Label>
                        <Col md={3}>
                            {/* DatePicker for showing letter issued date */}
                            <DatePicker
                                disabled={true} // Disabled, cannot be edited
                                value={moment(apprisalForm.letterIssuedDate)} // Display the letter issued date from apprisalForm
                            />
                        </Col>
                    </Form.Group>
                </div>
            </div>

            {/* Render Previous Year Record and Performance Review Record components */}
            <PreviousYearRecord apprisalForm={apprisalForm} />
            <PerformanceReviewRecord
                error={error}
                setFormErrors={setFormErrors}
                apprisalForm={apprisalForm}
            />
        </div>
    )
}

export default HrdList
