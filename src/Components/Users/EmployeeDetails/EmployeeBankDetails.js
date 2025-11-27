// Import necessary components and hooks from React and React Bootstrap
import React, { useState } from 'react'
import { Col, Form, Modal, Row, Tab, Tabs } from 'react-bootstrap'
import { handleKeyPress } from '../../../Common/CommonComponents/FormControlValidation'
import { ChangeIcon } from '../../../Common/CommonIcons/CommonIcons' // Change icon for sensitive data
import MaskingModel from './EmployeeModals/MaskingModel' // Modal for masking sensitive data

// EmployeeBankDetails component that manages the employee's bank-related details
const EmployeeBankDetails = ({
    modeShow,
    getAllEmployees,
    setFormData,
    setPfType,
    setChange,
    pfType,
    formData,
    getAllDta,
    setGetAllData,
    formErrors,
    setFormErrors
}) => {
    // Local state for managing the visibility of the mask modal and heading
    const [maskModal, setMaskModal] = useState(false)
    const [heading, setheading] = useState('')

    // Handle form input changes and update the formData state accordingly
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value == '' ? null : value }) // Update formData state, setting value to null if empty
    }

    // Handle number-specific input changes
    const fieldLengthRules = {
        accountNumber: { min: 9, max: 18, label: 'Account Number' },
        panNumber: { min: 10, max: 10, label: 'PAN Number' },
        pfNumber: { min: 22, max: 22, label: 'PF Number' },
        pfUan: { min: 12, max: 12, label: 'UAN Number' },
        esiNumber: { min: 17, max: 17, label: 'ESI Number' }
    }

    const handelNUmberChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value == '' ? null : value }) // Update formData state, setting value to null if empty

        // Validate length and set error
        if (fieldLengthRules[name]) {
            const { min, max, label } = fieldLengthRules[name]
            let error = ''
            if (
                value &&
                (value.length < min || value.length > max || (min === max && value.length !== min))
            ) {
                if (min === max) {
                    error = `${label} must be exactly ${min} characters.`
                } else if (value.length < min) {
                    error = `${label} must be at least ${min} characters.`
                } else if (value.length > max) {
                    error = `${label} must be at most ${max} characters.`
                }
            }
            setFormErrors((prev) => ({ ...prev, [name]: error }))
        }
    }

    // Handle radio button clicks for PF type selection (Percentage/Fixed)
    const handleRadioClick = (value) => {
        setPfType(value)
        setChange(false) // Set change state to true when PF type is selected
    }

    // Show modal for masking sensitive data (e.g., account number, PAN, PF number)
    const onShowModal = (heading) => {
        setMaskModal(true) // Show the masking modal
        setheading(heading) // Set the heading for the modal
    }

    // Close the modal
    const onCloseHandler = () => {
        setMaskModal(false) // Close the masking modal
    }

    const handleKeyDown = (event) => {
        const { value } = event.target
        const key = event.key

        // Convert to lowercase to make the check case-insensitive
        const lowerKey = key.toLowerCase()

        // Allow only lowercase a-z and numbers 0-9
        const isLetter = lowerKey >= 'a' && lowerKey <= 'z'
        const isNumber = key >= '0' && key <= '9'

        // Allow control keys like Backspace, Arrow keys, etc.
        const allowedControlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete']
        if (allowedControlKeys.includes(key)) {
            return
        }

        if (!isLetter && !isNumber) {
            event.preventDefault()
            return
        }

        // Prevent input if value is already 20+ chars and doesn't contain a '.'
        if (value.length >= 22 && !value.includes('.')) {
            event.preventDefault()
        }
    }

    // Main JSX structure of the EmployeeBankDetails component
    return (
        <div>
            {/* Tabs to organize form sections */}
            <Tabs>
                <Tab eventKey="family">
                    <div className="" style={{ marginTop: '2%' }}>
                        <form className="modalFormBody">
                            <Row>
                                {/* Bank Name Input */}
                                <div className="col-6">
                                    <Form.Group controlId="bankName" as={Row} className="mb-3">
                                        <Form.Label id="bankName" column sm={4}>
                                            Bank Name
                                        </Form.Label>
                                        <Col sm={5}>
                                            <Form.Control
                                                size='sm'
                                                id="bankName"
                                                maxLength={50} // Limits the length of the input
                                                onChange={handleInputChange} // Handles input changes
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)} // Custom key press validation
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)} // Handle paste event for validation
                                                onInput={(e) => handleKeyPress(e, setFormErrors)} // Handle input event for validation
                                                defaultValue={getAllDta.bankName} // Pre-filled value from getAllDta
                                                onBlur={handleInputChange} // Handles blur event to update formData
                                                name="bankName"
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Account Number Input */}
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="accountNumber">
                                        <Form.Label id="accountNumber" column sm={4}>
                                            Account Number
                                        </Form.Label>
                                        <Col sm={5}>
                                            <Form.Control
                                                size='sm'
                                                id="accountNumber"
                                                onPaste={(e) => e.preventDefault()}
                                                autoComplete="off"
                                                className="eliminateControls" // Custom class for styling
                                                defaultValue={getAllDta.accountNumber}
                                                onChange={handelNUmberChange} // Handles number input changes
                                                readOnly={getAllDta.accountNumber != null} // Makes the field read-only if account number is present
                                                name="accountNumber"
                                                maxLength={18} // Limits the length of the input
                                                inputMode="numeric" // Specifies numeric input type
                                                onKeyDown={handleKeyDown}
                                            />
                                            {formErrors.accountNumber && (
                                                <div className="error">
                                                    {' '}
                                                    {formErrors.accountNumber}
                                                </div>
                                            )}
                                        </Col>
                                        <Col sm={3}>
                                            {getAllDta.accountNumber != null ? ( // Conditional rendering of icon if account number exists
                                                <span>
                                                    <a
                                                        className=""
                                                        id="accountNumberChange"
                                                        style={{ fontWeight: '600' }}
                                                        onClick={() =>
                                                            onShowModal('Account Number')
                                                        }
                                                        variant="addbtn"
                                                    >
                                                        <ChangeIcon />{' '}
                                                        {/* Icon to trigger modal for changing account number */}
                                                    </a>
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* PF Number Input */}
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="pfNumber">
                                        <Form.Label id="pfNumber" column sm={4}>
                                            PF Number
                                        </Form.Label>
                                        <Col sm={5}>
                                            <Form.Control
                                                size='sm'
                                                id="pfNumber"
                                                onPaste={(e) => e.preventDefault()}
                                                autoComplete="off"
                                                onChange={handelNUmberChange} // Handles number input changes
                                                defaultValue={getAllDta.pfNumber}
                                                className="eliminateControls"
                                                readOnly={getAllDta.pfNumber != null} // Makes field read-only if PF number exists
                                                inputMode="numeric"
                                                name="pfNumber"
                                                onKeyDown={handleKeyDown}
                                            />
                                            {formErrors.pfNumber && (
                                                <div className="error"> {formErrors.pfNumber}</div>
                                            )}
                                        </Col>
                                        <Col sm={3}>
                                            {getAllDta.pfNumber != null ? ( // Conditional rendering of icon if PF number exists
                                                <span>
                                                    <a
                                                        id="pfNumberChange"
                                                        className=""
                                                        style={{ fontWeight: '600' }}
                                                        onClick={() => onShowModal('PF Number')}
                                                        variant="addbtn"
                                                    >
                                                        <ChangeIcon />{' '}
                                                        {/* Icon to trigger modal for changing PF number */}
                                                    </a>
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* PAN Number Input */}
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="panNumber">
                                        <Form.Label id="panNumber" column sm={4}>
                                            PAN Number
                                        </Form.Label>
                                        <Col sm={5}>
                                            <Form.Control
                                                size='sm'
                                                id="panNumber"
                                                onPaste={(e) => e.preventDefault()} // Disable paste
                                                autoComplete="off"
                                                defaultValue={getAllDta.panNumber}
                                                onChange={handelNUmberChange}
                                                readOnly={getAllDta.panNumber != null} // Makes field read-only if PAN number exists
                                                name="panNumber"
                                                maxLength={10}
                                                inputMode="numeric"
                                                onKeyDown={handleKeyDown}
                                            />
                                            {formErrors.panNumber && (
                                                <div className="error"> {formErrors.panNumber}</div>
                                            )}
                                        </Col>
                                        <Col sm={3}>
                                            {getAllDta.panNumber != null ? ( // Conditional rendering of icon if PAN number exists
                                                <span>
                                                    <a
                                                        className=""
                                                        id="panNumberChange"
                                                        style={{ fontWeight: '600' }}
                                                        onClick={() => onShowModal('Pan Number')}
                                                        variant="addbtn"
                                                    >
                                                        <ChangeIcon />{' '}
                                                        {/* Icon to trigger modal for changing PAN number */}
                                                    </a>
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* PF Preference (Percentage/Fixed) Input */}
                                {modeShow && ( // Conditionally rendered based on modeShow
                                    <div className="col-6">
                                        <Form.Group as={Row} className="mb-3" controlId="pfType">
                                            <Form.Label id="pfType" column sm={4}>
                                                PF Preference <span className="error">*</span>{' '}
                                            </Form.Label>
                                            <Col md={5} style={{ marginTop: '2%' }}>
                                                <span>
                                                    <input
                                                        size='sm'
                                                        id="pfTypePercentage"
                                                        value={{ label: 'Percentage', value: 1 }}
                                                        type="radio"
                                                        checked={
                                                            pfType && pfType.label === 'Percentage'
                                                        } // Check if Percentage is selected
                                                        onChange={() =>
                                                            handleRadioClick({
                                                                value: 1,
                                                                label: 'Percentage'
                                                            })
                                                        }
                                                    />{' '}
                                                    <span>Percentage</span>
                                                    &ensp; &emsp;
                                                    <input
                                                        size='sm'
                                                        id="pfTypeFixed"
                                                        value={{ label: 'Fixed', value: 2 }}
                                                        type="radio"
                                                        checked={pfType && pfType.label === 'Fixed'} // Check if Fixed is selected
                                                        onChange={() =>
                                                            handleRadioClick({
                                                                value: 2,
                                                                label: 'Fixed'
                                                            })
                                                        }
                                                    />{' '}
                                                    <span>Fixed</span>
                                                </span>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                )}

                                {/* UAN Number Input */}
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="pfUan">
                                        <Form.Label id="pfUan" column sm={4}>
                                            UAN Number
                                        </Form.Label>
                                        <Col sm={5}>
                                            <Form.Control
                                                id="pfUan"
                                                size='sm'
                                                onPaste={(e) => e.preventDefault()}
                                                autoComplete="off"
                                                defaultValue={getAllDta.pfUan}
                                                onChange={handelNUmberChange}
                                                readOnly={getAllDta.pfUan != null} // Makes field read-only if UAN number exists
                                                maxLength={12}
                                                inputMode="numeric"
                                                className="eliminateControls"
                                                name="pfUan"
                                                onKeyDown={handleKeyDown}
                                            />
                                            {formErrors.pfUan && (
                                                <div className="error">{formErrors.pfUan}</div>
                                            )}
                                        </Col>
                                        <Col sm={3}>
                                            {getAllDta.pfUan != null ? ( // Conditional rendering of icon if UAN number exists
                                                <span>
                                                    <a
                                                        className=""
                                                        id="pfUanChange"
                                                        style={{ fontWeight: '600' }}
                                                        onClick={() => onShowModal('UAN Number')}
                                                        variant="addbtn"
                                                    >
                                                        <ChangeIcon />{' '}
                                                        {/* Icon to trigger modal for changing UAN number */}
                                                    </a>
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* ESI Number Input */}
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="esiNumber">
                                        <Form.Label id="esiNumber" column sm={4}>
                                            ESI Number
                                        </Form.Label>
                                        <Col sm={5}>
                                            <Form.Control
                                                size='sm'
                                                id="esiNumber"
                                                onPaste={(e) => e.preventDefault()}
                                                autoComplete="off"
                                                defaultValue={getAllDta.esiNumber}
                                                onChange={handelNUmberChange}
                                                readOnly={getAllDta.esiNumber != null} // Makes field read-only if ESI number exists
                                                maxLength={17}
                                                inputMode="numeric"
                                                className="eliminateControls"
                                                name="esiNumber"
                                                onKeyDown={handleKeyDown}
                                            />
                                            {formErrors.esiNumber && (
                                                <div className="error">{formErrors.esiNumber}</div>
                                            )}
                                        </Col>
                                        <Col sm={3}>
                                            {getAllDta.esiNumber != null ? ( // Conditional rendering of icon if ESI number exists
                                                <span>
                                                    <a
                                                        className=""
                                                        id="esiNumberChange"
                                                        style={{ fontWeight: '600' }}
                                                        onClick={() => onShowModal('Esi Number')}
                                                        variant="addbtn"
                                                    >
                                                        <ChangeIcon />{' '}
                                                        {/* Icon to trigger modal for changing ESI number */}
                                                    </a>
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                        </form>
                    </div>

                    {/* Modal to show when sensitive data needs to be masked */}
                    <Modal
                        show={maskModal}
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                        size="md"
                    >
                        <Modal.Header className="" closeButton={onCloseHandler}>
                            <Modal.Title>{heading}</Modal.Title>{' '}
                            {/* Display the heading of the modal */}
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            <MaskingModel
                                getAllEmployees={getAllEmployees}
                                employeeId={getAllDta.id} // Pass the employee ID to MaskingModel
                                heading={heading} // Pass the heading to MaskingModel
                                onShowModalCloseHandler={() => onCloseHandler()} // Close handler for the modal
                                setGetAllData={setGetAllData} // Function to update the employee data
                                getAllDta={getAllDta} // Pass the current
                            />
                        </Modal.Body>
                    </Modal>
                </Tab>
            </Tabs>
        </div>
    )
}
export default EmployeeBankDetails
