import { DatePicker } from 'antd'
import moment from 'moment'
import React from 'react'
import { Col, Form, Row, Tab, Tabs } from 'react-bootstrap'
import Select from 'react-select'; // Importing Select component for dropdowns
import { handleKeyPress } from '../../../Common/CommonComponents/FormControlValidation';
import { ChangeIcon } from '../../../Common/CommonIcons/CommonIcons';

export const PersonalInformation = (props) => {
    const { getAllData, dateOfBirth, handleDateOfBirth, formErrors, setFormErrors, handleGenderSelection, genderOptions, gender, handleInputChange, handleCurrencySelection, countryId,
        countryIsoCode, countriesOptions, AHandleCurrencySelection, aCountryId, aCountryIsoCode, maritalStatusName, maritalStatusHistoryName, onShowModal, maritalStatusDto,
        marriageStatusDate, handleMarriageDate, marriageDate, handleBloodGroupSelection, bloodGroupOptions, bloodGroup, formData, handlePHDCheck, phdValue } = props
    return (
        <>
            <Tabs>
                <Tab eventKey="personalInformation">
                    <section className="section">
                        <div className="container-fluid">
                            <div className='row'>
                                <div className='card-body'>
                                    <form>
                                        <Row>
                                            <div className="col-6">
                                                {/* Form group for Date of Birth field with margin-bottom spacing */}
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeDateOfBirth" // Unique ID for the Date of Birth form group
                                                //controlId="formGroupDateOfBirth"  {/* Commented out controlId */}
                                                >
                                                    {/* Label for Date of Birth field with required indicator (asterisk) */}
                                                    <Form.Label
                                                        id="employeeDateOfBirth"
                                                        column
                                                        sm={5}>Date of Birth{' '}
                                                        <span className="error">*</span>{' '}
                                                        {/* Asterisk indicates required field */}
                                                    </Form.Label>

                                                    <Col sm={6}>
                                                        {/* DatePicker component for selecting the Date of Birth */}
                                                        <DatePicker
                                                            id="employeeDateOfBirth" // Unique ID for the Date of Birth input field
                                                            placeholder="Select Date" // Placeholder text when the date is not selected
                                                            inputReadOnly={true} // Set the input field to read-only (user can't type directly)
                                                            onChange={handleDateOfBirth} // Trigger handleDateOfBirth when a date is selected
                                                            // Disable the date picker if the status is "Active"
                                                            disabled={getAllData.status == 'Active'}
                                                            // Disable dates before 01-01-1900
                                                            disabledDate={(current) => current && current < moment('01-01-1900').endOf('day')}
                                                            // Set the selected date value, or null if no date is selected
                                                            value={dateOfBirth == null ? null : moment(dateOfBirth)}
                                                            // onBlur event to handle form validation for required field
                                                            onBlur={(e) => !e.target.value
                                                                ? setFormErrors({ ...formErrors, dateOfBirth: 'Required' })
                                                                : setFormErrors(
                                                                    { ...formErrors, dateOfBirth: '' }
                                                                )
                                                            }
                                                            format={'DD-MM-YYYY'} // Set the date format to "DD-MM-YYYY"
                                                            allowClear={false} // Disallow clearing the selected date
                                                            size="sm" // Set input field size to small
                                                            name="dateOfBirth" // Name for the input field
                                                        />
                                                        {/* Display error message for the Date of Birth field */}
                                                        <p className="error">{formErrors.dateOfBirth}</p>{' '}
                                                        {/* Show validation error if any */}
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                {/* Form group for Gender dropdown field with margin-bottom spacing */}
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeGender" // Unique ID
                                                //controlId="formGroupGender"  {/* Commented out controlId */}
                                                >
                                                    {/* Label for Gender field with required indicator */}
                                                    <Form.Label
                                                        id="employeeGender"
                                                        column
                                                        sm={4}>
                                                        Gender{' '}
                                                        <span className="error">*</span>{' '}
                                                        {/* Asterisk indicates required field */}
                                                    </Form.Label>

                                                    <Col sm={6}>
                                                        {/* Dropdown for selecting Gender */}
                                                        <Select
                                                            id="employeeGender" // Unique ID for
                                                            placeholder="" // Empty placeholder text
                                                            // Disable the dropdown if status is "Active" and genderId is not null
                                                            isDisabled={getAllData.status == 'Active' && getAllData.genderId != null}
                                                            onChange={handleGenderSelection} // Trigger handleGenderSelection when an option is selected
                                                            options={genderOptions} // Set available gender options
                                                            // Set the selected value based on the current gender
                                                            value={genderOptions.filter((e) => e.value == gender)}
                                                            size="sm" // Set the input field size to small
                                                            // onBlur event to set the gender error message if no gender is selected
                                                            onBlur={() => !gender
                                                                ? setFormErrors({ ...formErrors, gender: 'Required' }) : setFormErrors(
                                                                    { ...formErrors, gender: '' })}
                                                        />
                                                        {/* Display error message for the Gender field */}
                                                        <p className="error">{formErrors.gender}</p>{' '}
                                                        {/* Show validation error if any */}
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                {/* Form group for Alternate Email input field with margin-bottom spacing */}
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeAlternateEmail" // Unique ID for the Alternate Email form group
                                                //controlId="formGroupAlternateEmail"  {/* Commented out controlId */}
                                                >
                                                    {/* Label for Alternate Email field */}
                                                    <Form.Label
                                                        id="employeeAlternateEmail"
                                                        column
                                                        sm={5}
                                                    >
                                                        Alternate Email{' '}
                                                        {/* Label text for the alternate email field */}
                                                    </Form.Label>

                                                    <Col
                                                        sm={6}>
                                                        {/* Input field for Alternate Email */}
                                                        <Form.Control
                                                            id="employeeAlternateEmail" // Unique ID for the input field
                                                            maxLength={50}
                                                            onChange={handleInputChange} // Trigger handleInputChange on input change
                                                            required // Mark the field as required
                                                            size="sm" // Set input field size to small
                                                            type="email" // Define the input type as email for validation
                                                            // Set default value to the alternate email from getAllData if available
                                                            defaultValue={getAllData && getAllData.alternateEmail}
                                                            name="alternateEmail" // Name for the input field
                                                        />
                                                        {/* Display error message for the Alternate Email field */}
                                                        <p className="error">{formErrors.alternateEmail}</p>{' '}
                                                        {/* Show validation error if any */}
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeePlaceOfBirth" // Unique ID for the Place of Birth form group
                                                //controlId="formGroupPlaceOfBirth"
                                                >
                                                    <Form.Label
                                                        id="employeePlaceOfBirth"
                                                        column
                                                        sm={4}
                                                    >
                                                        Place of Birth
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <Form.Control
                                                            id="employeePlaceOfBirth" // Unique ID for the input field
                                                            required
                                                            size="sm"
                                                            maxLength={100}
                                                            name="placeOfBirth"
                                                            onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                            onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                            onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                            defaultValue={getAllData && getAllData.placeOfBirth}
                                                            onChange={handleInputChange}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                {/* Form group for Phone Number field with margin-bottom spacing */}
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                //controlId="formGroupPhoneNumber"  {/* Commented out controlId */}
                                                >
                                                    {/* Label for Phone Number field with required indicator (asterisk) */}
                                                    <Form.Label
                                                        column
                                                        sm={5}
                                                    >
                                                        Phone Number{' '}
                                                        <span className="error">*</span>{' '}
                                                        {/* Asterisk indicates required field */}
                                                    </Form.Label>

                                                    <Col
                                                        sm={3}
                                                    >
                                                        {/* Select dropdown for choosing the Country with phone number */}
                                                        <Select
                                                            value={countriesOptions.filter((e) => e.value == countryId && e.label == countryIsoCode)}
                                                            onBlur={() =>
                                                                !countryId
                                                                    ? setFormErrors(
                                                                        { ...formErrors, countryId: 'Required' }
                                                                    ) : setFormErrors(
                                                                        { ...formErrors, countryId: '' })
                                                            }
                                                            size="sm" // Set the size of the select input to extra small
                                                            placeholder="Country" // Placeholder text for the dropdown
                                                            options={countriesOptions} // List of countries options
                                                            onChange={handleCurrencySelection} // Trigger handleCurrencySelection when the country is selected
                                                        />
                                                        {/* Display error message for the Country field */}
                                                        <p className="error">
                                                            {formErrors.countryId}</p>{' '}
                                                        {/* Show validation error if any */}
                                                    </Col>

                                                    <Col sm={3}
                                                    >
                                                        {/* Input field for Phone Number */}
                                                        <Form.Control
                                                            required // Mark the field as required
                                                            size="sm" // Set input field size to small
                                                            name="phoneNumber" // Name for the input field
                                                            onBlur={handleInputChange} // Trigger handleInputChange when the field loses focus
                                                            defaultValue={getAllData && getAllData.phoneNumber} // Set default value to phone number from getAllData if available
                                                            disabled={!countryId} // Disable the input field if no country is selected
                                                            onChange={handleInputChange} // Trigger handleInputChange on input change
                                                            maxLength={15} // Set the maximum length for the phone number to 15 characters
                                                            onInput={(e) => { e.target.value = e.target.value.replace(/ '\D'/g, '') }}
                                                        />
                                                        {/* Display error message for the Phone Number field */}
                                                        <p className="error">{formErrors.phoneNumber}</p>{' '}
                                                        {/* Show validation error if any */}
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                {/* Form group for Alternate Phone Number field with margin-bottom spacing */}
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeAlternatePhoneNumber" // Unique ID for the Alternate Phone Number form group
                                                //controlId="formGroupAlternatePhoneNumber"  {/* Commented out controlId */}
                                                >
                                                    {/* Label for Alternate Phone Number field (no required asterisk) */}
                                                    <Form.Label
                                                        id="employeeAlternatePhoneNumber"
                                                        column
                                                        sm={4}
                                                    >Alternate Phone  Number{' '}
                                                        {/* No asterisk here indicating the field is optional */}
                                                    </Form.Label>

                                                    <Col
                                                        sm={3}

                                                    >
                                                        {/* Select dropdown for choosing the Country for the Alternate Phone Number */}
                                                        <Select
                                                            id="employeeAlternateCountry" // Unique ID for the alternate country dropdown
                                                            value={countriesOptions.filter((e) => e.value == aCountryId && e.label == aCountryIsoCode)}
                                                            size="sm" // Set the size of the select input to extra small
                                                            placeholder="Country" // Placeholder text for the dropdown
                                                            options={countriesOptions} // List of country options for selection
                                                            onChange={AHandleCurrencySelection} // Trigger AHandleCurrencySelection when the country is selected
                                                        />
                                                        {/* Display error message for the Alternate Country selection field */}
                                                        <p className="error">{formErrors.aCountryId}</p>{' '}
                                                        {/* Show validation error for country if any */}
                                                    </Col>

                                                    <Col sm={3} >
                                                        {/* Input field for Alternate Phone Number */}
                                                        <Form.Control
                                                            id="employeeAlternatePhoneNumber" // Unique ID for the input field
                                                            required // Mark the field as required
                                                            size="sm" // Set input field size to small
                                                            name="alternatePhoneNumber" // Name for the input field
                                                            defaultValue={getAllData && getAllData.alternatePhoneNumber}
                                                            disabled={!aCountryId} // Disable the input field if no country is selected for alternate phone number
                                                            onChange={handleInputChange} // Trigger handleInputChange on input change
                                                            maxLength={15} // Set the maximum length for the alternate phone number to 15 characters
                                                            onInput={(e) => { e.target.value = e.target.value.replace(/ '\D'/g, '') }}
                                                        />
                                                        {/* Display error message for the Alternate Phone Number field */}
                                                        <p className="error">{formErrors.alternatePhoneNumber}{' '}</p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeMaritalStatus" // Unique ID for the Marital Status form group
                                                //controlId="formGroupMaritalStatus"
                                                >
                                                    <Form.Label id="employeeMaritalStatus"
                                                        column
                                                        sm={5}
                                                    >
                                                        Marital Status
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col
                                                        sm={6}
                                                        style={{ marginTop: '10px' }}
                                                    >
                                                        <div>
                                                            <span>
                                                                {maritalStatusName
                                                                    ? maritalStatusHistoryName &&
                                                                    maritalStatusHistoryName.martialStatusName
                                                                    : getAllData.latestMaritalStatus}
                                                            </span>{' '}
                                                            {getAllData.status == 'Terminated' ? ('') : (
                                                                <span>
                                                                    <a
                                                                        id="employeeMaritalStatus"
                                                                        className=""
                                                                        style={{ fontWeight: '600' }}
                                                                        onClick={() => onShowModal('Marital History', 'readOnly')}
                                                                        variant="addbtn"
                                                                    >
                                                                        {maritalStatusDto.length != 0 ? (<ChangeIcon />) : (<u>Add Marital Status</u>)}
                                                                    </a>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="error">
                                                            {formErrors.locationDto}
                                                        </p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeMarriageDate" // Unique ID for the Marriage Date form group
                                                >
                                                    <Form.Label
                                                        id="employeeMarriageDate"
                                                        column
                                                        sm={4}
                                                    >
                                                        Marriage Date{' '}
                                                    </Form.Label>
                                                    <Col sm={6}
                                                    >
                                                        <DatePicker
                                                            id="employeeMarriageDate" // Unique ID for the Marriage Date input field
                                                            allowClear={false}
                                                            placeholder="Select Date"
                                                            inputReadOnly={true}
                                                            disabled={marriageStatusDate != 'Married'}
                                                            disabledDate={(current) =>
                                                                (current && current > moment().endOf('day')) ||
                                                                (dateOfBirth && current < moment(dateOfBirth, 'YYYY-MM-DD').startOf('day'))
                                                            }
                                                            onChange={handleMarriageDate}
                                                            value={marriageDate == null ? null : moment(marriageDate)}
                                                            required
                                                            size="sm"
                                                            format={'DD-MM-YYYY'}
                                                            name="marriageDate"
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeNationality" // Unique ID for the National
                                                >
                                                    <Form.Label
                                                        id="employeeNationality"
                                                        column
                                                        sm={5}
                                                    >
                                                        Nationality
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <Form.Control
                                                            id="employeeNationality" // Unique ID for the input field
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                            onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                            onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                            defaultValue={getAllData && getAllData.nationality}
                                                            name="nationality"
                                                            size="sm"
                                                            maxLength={72}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            {/* Input field for No of Children */}
                                            <div className="col-6 mb-2">
                                                <Form.Group
                                                    controlId="employeeNoOfChildren" // Unique ID for the No of Children form group
                                                    as={Row}
                                                    className="mb-3"
                                                >
                                                    <Form.Label
                                                        id="employeeNoOfChildren"
                                                        column
                                                        sm={4}
                                                    >
                                                        No of Children
                                                    </Form.Label>
                                                    <Col sm={6}
                                                    >
                                                        <Form.Control
                                                            id="employeeNoOfChildren" // Unique ID for the input field
                                                            min="0"
                                                            max="20"
                                                            onInput={(e) => {
                                                                let value = e.target.value.replace(/[^0-9]/g, '') // Remove non-numeric
                                                                if (value === '' || Number(value) < 0) value = '0'
                                                                if (Number(value) > 20) value = '20'
                                                                e.target.value = value
                                                                handleInputChange(e)
                                                            }}
                                                            onChange={handleInputChange}
                                                            required
                                                            size="sm"
                                                            type="number"
                                                            defaultValue={getAllData && getAllData.noOfChildren}
                                                            name="noOfChildren"
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6 mb-2">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeBloodGroup" // Unique ID for the Blood Group form group
                                                //controlId="formGroupBloodGroup"
                                                >
                                                    <Form.Label
                                                        id="employeeBloodGroup"
                                                        column
                                                        sm={5}
                                                    >
                                                        Blood Group
                                                    </Form.Label>
                                                    <Col sm={3}>
                                                        <Select
                                                            id="employeeBloodGroup" // Unique ID for the Blood Group select input
                                                            onChange={handleBloodGroupSelection}
                                                            options={bloodGroupOptions}
                                                            required
                                                            type="text"
                                                            value={bloodGroupOptions.filter((e) => e.value == bloodGroup)}
                                                            name="bloodGroup"
                                                            size="sm"
                                                        />
                                                    </Col>
                                                    <Col
                                                        sm={3}
                                                    >
                                                        {bloodGroup !=
                                                            'Others' ? (
                                                            <div style={{ marginTop: '7%' }}>
                                                                {bloodGroup}
                                                            </div>
                                                        ) : (
                                                            <Form.Control
                                                                id="employeeBloodGroup" // Unique ID for the Blood Group select input
                                                                onChange={handleInputChange}
                                                                type="text"
                                                                defaultValue={formData.bloodGroup}
                                                                name="bloodGroup"
                                                                size="sm"
                                                            />
                                                        )}
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    controlId="employeeAllergies" // Unique ID for the Allergies form group
                                                    as={Row}
                                                    className="mb-3"
                                                //controlId="formGroupAllergies"
                                                >
                                                    <Form.Label
                                                        id="employeeAllergies"
                                                        column
                                                        sm={4}
                                                    >
                                                        Allergies
                                                    </Form.Label>
                                                    <Col
                                                        sm={6}
                                                    >
                                                        <Form.Control
                                                            id="employeeAllergies" // Unique ID for the input field
                                                            required
                                                            size="sm"
                                                            maxLength={80}
                                                            onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                            onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                            onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                            defaultValue={getAllData && getAllData.allergies}
                                                            onChange={handleInputChange}
                                                            name="allergies"
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="physicallyChallenged" // Unique ID for the Physically Challenged form group
                                                //controlId="formGroupNoticePeriodDays"
                                                >
                                                    <Form.Label
                                                        id="physicallyChallenged"
                                                        column
                                                        sm={5}
                                                    >
                                                        Are You Physically Challenged
                                                    </Form.Label>
                                                    <Col
                                                        sm={4}
                                                        style={{ marginTop: '1%' }}
                                                    >
                                                        <input
                                                            id="physicallyChallenged" // Unique ID for the Physically Challenged checkbox
                                                            type="checkbox"
                                                            onChange={(e) => handlePHDCheck(e)}
                                                            defaultChecked={phdValue}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                </Tab>
            </Tabs>
        </>
    )
}
