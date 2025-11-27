import React, { useState, useEffect } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const ContactPersonList = ({
    contactPersons,
    sendToParent,
    formError,
    countryIsdCode,
    countryIsoCode
}) => {
    // State to store input values
    const [formData, setFormData] = useState('')
    // State to store input validation errors
    const [formErrors, setFormErrors] = useState({})

    // Update local formErrors state whenever parent error props change
    useEffect(() => {
        setFormErrors(formError)
    }, [formError])

    // Regex for basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Handler for input field changes
    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        // Validation for phoneNumber field
        if (name === 'phoneNumber') {
            let valueWithISD = '+' + countryIsdCode + value
            const phoneNumber = parsePhoneNumberFromString(valueWithISD, countryIsoCode)

            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
            } else if (phoneNumber && !phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }
        // Validation for alternatePhoneNumber (only if present)
        else if (name === 'alternatePhoneNumber') {
            let valueWithISD = '+' + countryIsdCode + value
            const phoneNumber = parsePhoneNumberFromString(valueWithISD, countryIsoCode)

            if (!value) {
                setFormErrors({ ...formErrors, [name]: '' }) // optional field
            } else if (phoneNumber && !phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }
        // Validation for email
        else if (name === 'email') {
            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
            } else if (!emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }
        // Validation for alternateEmail (only if present)
        else if (name === 'alternateEmail') {
            if (value && !emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        } else {
            // Reset error for other fields
            setFormErrors({ ...formErrors, [name]: '' })
        }
    }

    // Send updated form data to parent component
    sendToParent(formData)

    return (
        <>
            <div>
                <div className="">
                    <div class="row">
                        {/* First Name */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                <Form.Label className="fieldLable" column md={6}>
                                    First Name <span className="error">*</span>
                                </Form.Label>
                                <Col md={6}>
                                    <Form.Control
                                        className="textFieldSub"
                                        readOnly={contactPersons.id}
                                        defaultValue={contactPersons.firstName}
                                        onChange={onChangeHandler}
                                        name="firstName"
                                        type="text"
                                        maxLength={50}
                                        onBlur={(e) =>
                                            !e.target.value
                                                ? setFormErrors({
                                                      ...formErrors,
                                                      firstName: 'Required'
                                                  })
                                                : setFormErrors({ ...formErrors, firstName: '' })
                                        }
                                    />
                                    <p className="error textFieldSub">
                                        {formErrors && formErrors.firstName}
                                    </p>
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Last Name */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                <Form.Label className="fieldLable sub" column md={6}>
                                    Last Name <span className="error">*</span>
                                </Form.Label>
                                <Col md={6}>
                                    <Form.Control
                                        className="textField"
                                        readOnly={contactPersons.id}
                                        defaultValue={contactPersons.lastName}
                                        onChange={onChangeHandler}
                                        name="lastName"
                                        type="text"
                                        maxLength={50}
                                        onBlur={(e) =>
                                            !e.target.value
                                                ? setFormErrors({
                                                      ...formErrors,
                                                      lastName: 'Required'
                                                  })
                                                : setFormErrors({ ...formErrors, lastName: '' })
                                        }
                                    />
                                    <p className="error textField">
                                        {formErrors && formErrors.lastName}
                                    </p>
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Email */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                <Form.Label className="fieldLable" column md={6}>
                                    Email <span className="error">*</span>
                                </Form.Label>
                                <Col md={6}>
                                    <Form.Control
                                        className="textFieldSub"
                                        readOnly={contactPersons.id}
                                        defaultValue={contactPersons.email}
                                        onChange={onChangeHandler}
                                        name="email"
                                        type="text"
                                        maxLength={100}
                                        onBlur={(e) =>
                                            !e.target.value
                                                ? setFormErrors({
                                                      ...formErrors,
                                                      email: 'Required'
                                                  })
                                                : setFormErrors({ ...formErrors, email: '' })
                                        }
                                    />
                                    <p className="error textFieldSub">
                                        {formErrors && formErrors.email}
                                    </p>
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Alternate Email */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                <Form.Label className="fieldLable sub" column md={6}>
                                    Alternate Email
                                </Form.Label>
                                <Col md={6}>
                                    <Form.Control
                                        className="textField"
                                        readOnly={contactPersons.id}
                                        defaultValue={contactPersons.alternateEmail}
                                        onChange={onChangeHandler}
                                        name="alternateEmail"
                                        maxLength={100}
                                        type="text"
                                    />
                                    <p className="error textField">
                                        {formErrors && formErrors.alternateEmail}
                                    </p>
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Phone Number */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-4" controlId="formGroupToDate">
                                <Form.Label className="fieldLable" column md={6}>
                                    Phone Number <span className="error">*</span>
                                </Form.Label>
                                <Col md={6}>
                                    <Form.Control
                                        className="textFieldSub"
                                        readOnly={contactPersons.id}
                                        defaultValue={contactPersons.phoneNumber}
                                        onChange={onChangeHandler}
                                        maxLength={15}
                                        name="phoneNumber"
                                        type="text"
                                        onInput={(e) => {
                                            // Allow only digits
                                            e.target.value = e.target.value.replace(/[^0-9]/g, '')
                                        }}
                                        onBlur={(e) =>
                                            !e.target.value
                                                ? setFormErrors({
                                                      ...formErrors,
                                                      phoneNumber: 'Required'
                                                  })
                                                : setFormErrors({ ...formErrors, phoneNumber: '' })
                                        }
                                    />
                                    <p className="error textFieldSub">
                                        {formErrors && formErrors.phoneNumber}
                                    </p>
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Alternate Phone Number */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-4" controlId="formGroupToDate">
                                <Form.Label className="fieldLable sub" column md={6}>
                                    Alternate Phone Number
                                </Form.Label>
                                <Col md={6}>
                                    <Form.Control
                                        className="textField"
                                        readOnly={contactPersons.id}
                                        defaultValue={contactPersons.alternatePhoneNumber}
                                        onChange={onChangeHandler}
                                        maxLength={15}
                                        name="alternatePhoneNumber"
                                        type="text"
                                        onInput={(e) => {
                                            // Allow only digits
                                            e.target.value = e.target.value.replace(/[^0-9]/g, '')
                                        }}
                                    />
                                    <p className="error">
                                        {formErrors && formErrors.alternatePhoneNumber}
                                    </p>
                                </Col>
                            </Form.Group>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ContactPersonList
