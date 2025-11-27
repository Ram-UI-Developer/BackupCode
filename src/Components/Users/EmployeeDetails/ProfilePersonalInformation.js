import { DatePicker } from 'antd'
import moment from 'moment'
import React from 'react'
import { Col, Form, Row, Tab, Tabs } from 'react-bootstrap'
import Select from 'react-select'
import { handleKeyPress } from '../../../Common/CommonComponents/FormControlValidation'
import { ChangeIcon } from '../../../Common/CommonIcons/CommonIcons'

export const ProfilePersonalInformation = (props) => {

    const { getAllData, usersList, gender, setFormErrors, formErrors, handleGenderSelection, genderOptions, handleDateOfBirth, dateOfBirth, handleInputChange,
        countriesOptions, countryId, countryIsoCode, handleCurrencySelection, aCountryId, aCountryIsoCode, AHandleCurrencySelection, maritalStatusName,
        maritalStatusHistoryName, onShowModal, maritalStatusDto, marriageStatusDate, handleMarriageDate, marriageDate, bloodGroup, formData, bloodGroupOptions, handleBloodGroupSelection } = props
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
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupDateOfBirth"
                                                //controlId="formGroupDateOfBirth"
                                                >
                                                    <Form.Label
                                                        id="formGroupDateOfBirth"
                                                        column
                                                        sm={4} >
                                                        Date of Birth
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <DatePicker
                                                            id="formGroupDateOfBirth"
                                                            placeholder="Select Date"
                                                            inputReadOnly={true}
                                                            onChange={handleDateOfBirth}
                                                            disabled={!usersList && getAllData.status == 'Active'}
                                                            disabledDate={(current) => current && current < moment('01-01-1900').endOf('day')}
                                                            value={dateOfBirth == null ? null : moment(dateOfBirth)}
                                                            onBlur={(e) => !e.target.value ? setFormErrors({ ...formErrors, dateOfBirth: 'Required' }) : setFormErrors({ ...formErrors, dateOfBirth: '' })}
                                                            format={'DD-MM-YYYY'}
                                                            allowClear={false}
                                                            size="sm"
                                                            name="dateOfBirth"
                                                        />
                                                        <p className="error">
                                                            {formErrors.dateOfBirth}
                                                        </p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="employeeGender"
                                                >
                                                    <Form.Label
                                                        id="employeeGender"
                                                        column
                                                        sm={4}>
                                                        Gender{' '}
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <Select
                                                            id="employeeGender"
                                                            placeholder=""
                                                            isDisabled={!usersList && getAllData.status == 'Active' && getAllData.genderId != null}
                                                            onChange={handleGenderSelection}
                                                            options={genderOptions}
                                                            value={genderOptions.filter((e) => e.value == gender)}
                                                            size="sm"
                                                            onBlur={() => !gender
                                                                ? setFormErrors({ ...formErrors, gender: 'Required' })
                                                                : setFormErrors({ ...formErrors, gender: '' })
                                                            }
                                                        />
                                                        <p className="error">{formErrors.gender}</p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupAlternateEmail"
                                                //controlId="formGroupAlternateEmail"
                                                >
                                                    <Form.Label
                                                        id="formGroupAlternateEmail"
                                                        column
                                                        sm={4}
                                                    >
                                                        Alternate Email
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <Form.Control
                                                            id="formGroupAlternateEmail"
                                                            onChange={handleInputChange}
                                                            required
                                                            size="sm"
                                                            type="email"
                                                            maxLength={50}
                                                            defaultValue={getAllData && getAllData.alternateEmail}
                                                            name="alternateEmail"
                                                        />
                                                        <p className="error">
                                                            {formErrors.alternateEmail}
                                                        </p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupPlaceOfBirth"
                                                //controlId="formGroupPlaceOfBirth"
                                                >
                                                    <Form.Label
                                                        id="formGroupPlaceOfBirth"
                                                        column
                                                        sm={4}
                                                    >
                                                        Place of Birth
                                                    </Form.Label>
                                                    <Col sm={6}
                                                    >
                                                        <Form.Control
                                                            id="formGroupPlaceOfBirth"
                                                            required
                                                            size="sm"
                                                            name="placeOfBirth"
                                                            maxLength={100}
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
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupPhoneNumber"
                                                //controlId="formGroupPhoneNumber"
                                                >
                                                    <Form.Label
                                                        id="formGroupPhoneNumber"
                                                        column
                                                        sm={4}
                                                    >
                                                        Phone
                                                        Number{' '}
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col
                                                        sm={3}
                                                    >
                                                        <Select
                                                            id="formGroupPhoneNumber"
                                                            isDisabled={!usersList && getAllData.status == 'Active'}
                                                            value={countriesOptions.filter((e) => e.value == countryId && e.label == countryIsoCode)}
                                                            size="xs"
                                                            placeholder="Country"
                                                            options={countriesOptions}
                                                            onChange={handleCurrencySelection}
                                                        />
                                                        <p className="error">{formErrors.countryId}</p>
                                                    </Col>
                                                    <Col sm={3}
                                                    >
                                                        <Form.Control
                                                            id="formGroupPhoneNumber"
                                                            size="sm"
                                                            disabled={true}
                                                            value={getAllData && getAllData.phoneNumber}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupAlternatePhoneNumber"
                                                //controlId="formGroupAlternatePhoneNumber"
                                                >
                                                    <Form.Label
                                                        id="formGroupAlternatePhoneNumber"
                                                        column
                                                        sm={4}
                                                    >
                                                        Alternate Phone Number
                                                    </Form.Label>
                                                    <Col
                                                        sm={3}
                                                    >
                                                        <Select
                                                            id="formGroupAlternatePhoneNumber"
                                                            value={countriesOptions.filter((e) => e.value == aCountryId && e.label == aCountryIsoCode)}
                                                            size="xs"
                                                            placeholder="Country"
                                                            options={countriesOptions}
                                                            onChange={AHandleCurrencySelection}
                                                        />
                                                        <p className="error">{formErrors.aCountryId}</p>
                                                    </Col>
                                                    <Col sm={3}
                                                    >
                                                        <Form.Control
                                                            id="formGroupAlternatePhoneNumber"
                                                            required
                                                            size="sm"
                                                            name="alternatePhoneNumber"
                                                            defaultValue={getAllData &&
                                                                getAllData.alternatePhoneNumber}
                                                            disabled={!aCountryId}
                                                            onChange={handleInputChange}
                                                            maxLength={15}
                                                            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }}
                                                        />
                                                        <p className="error">{formErrors.alternatePhoneNumber}</p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={
                                                        Row
                                                    }
                                                    className="mb-"
                                                    controlId="formGroupMaritalStatus"
                                                //controlId="formGroupMaritalStatus"
                                                >
                                                    <Form.Label
                                                        id="formGroupMaritalStatus"
                                                        column
                                                        sm={4}
                                                    >
                                                        Marital Status
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={5}
                                                        style={{ marginTop: '10px' }}
                                                    >
                                                        <div>
                                                            <span>
                                                                {maritalStatusName
                                                                    ? maritalStatusHistoryName &&
                                                                    maritalStatusHistoryName.martialStatusName
                                                                    : getAllData.latestMaritalStatus}
                                                            </span>{' '}
                                                            <span>
                                                                <a
                                                                    className=""
                                                                    id="formGroupMaritalStatus"
                                                                    style={{ fontWeight: '600' }}
                                                                    onClick={() => onShowModal('Marital History', 'readOnly')}
                                                                    variant="addbtn"
                                                                >
                                                                    {maritalStatusDto.length != 0 ? (<ChangeIcon />) : (<u>
                                                                        Add Marital Status
                                                                    </u>)}
                                                                </a>
                                                            </span>
                                                        </div>
                                                        <p className="error">{formErrors.popupDtos}</p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupMarriageDate"
                                                //controlId="formGroupMarriageDate"
                                                >
                                                    <Form.Label
                                                        id="formGroupMarriageDate"
                                                        column
                                                        sm={4}
                                                    >
                                                        Marriage Date
                                                    </Form.Label>
                                                    <Col sm={6} >
                                                        <DatePicker
                                                            id="formGroupMarriageDate"
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
                                                    controlId="formGroupNationality"
                                                // controlId="formGroupNationality"
                                                >
                                                    <Form.Label
                                                        id="formGroupNationality"
                                                        column
                                                        sm={4}
                                                    >
                                                        Nationality
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <Form.Control
                                                            id="formGroupNationality"
                                                            onChange={handleInputChange}
                                                            required
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

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupNoOfChildren"
                                                //controlId="formGroupNoOfChildren"
                                                >
                                                    <Form.Label
                                                        id="formGroupNoOfChildren"
                                                        column
                                                        sm={4}
                                                    >
                                                        No of Children
                                                    </Form.Label>
                                                    <Col sm={6}
                                                    >
                                                        <Form.Control
                                                            id="formGroupNoOfChildren"
                                                            min="0"
                                                            max="20"
                                                            onInput={(e) => {
                                                                let value = e.target.value.replace(/[^0-9]/g, '') // Remove non-numeric
                                                                if (value === '' || Number(value) < 0)
                                                                    value = '0'
                                                                if (Number(value) > 20)
                                                                    value = '20'
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

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupBloodGroup"
                                                //controlId="formGroupBloodGroup"
                                                >
                                                    <Form.Label
                                                        id="formGroupBloodGroup"
                                                        column
                                                        sm={4}
                                                    >
                                                        Blood Group
                                                    </Form.Label>
                                                    <Col
                                                        sm={3}
                                                    >
                                                        <Select
                                                            id="formGroupBloodGroup"
                                                            onChange={handleBloodGroupSelection}
                                                            options={bloodGroupOptions}
                                                            required
                                                            type="text"
                                                            value={bloodGroupOptions.filter((e) => e.value == bloodGroup)}
                                                            name="bloodGroup"
                                                            size="sm"
                                                        />
                                                    </Col>
                                                    <Col sm={3}>
                                                        {bloodGroup != 'Others' ? (
                                                            <div
                                                                style={{ marginTop: '10%' }}
                                                            >
                                                                {bloodGroup}
                                                            </div>
                                                        ) : (
                                                            <Form.Control
                                                                id="employeeBloodGroup" // Unique ID for the Blood Group select input
                                                                onChange={handleInputChange}
                                                                type="text"
                                                                defaultValue={formData.bloodGroup}
                                                                name="bloodGroup"
                                                                size=""
                                                            />
                                                        )}
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupAllergies"
                                                //controlId="formGroupAllergies"
                                                >
                                                    <Form.Label
                                                        id="formGroupAllergies"
                                                        column
                                                        sm={4}
                                                    >
                                                        Allergies
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <Form.Control
                                                            id="formGroupAllergies"
                                                            required
                                                            size="sm"
                                                            maxLength={80}
                                                            onKeyPress={(e) =>handleKeyPress(e,setFormErrors)}
                                                            onPaste={(e) =>handleKeyPress(e,setFormErrors)}
                                                            onInput={(e) =>handleKeyPress(e,setFormErrors)}
                                                            defaultValue={getAllData &&getAllData.allergies}
                                                            onChange={handleInputChange}
                                                            name="allergies"
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
