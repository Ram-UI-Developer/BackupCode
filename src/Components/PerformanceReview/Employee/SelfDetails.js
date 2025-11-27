import { parsePhoneNumberFromString } from 'libphonenumber-js' // Library for phone number validation
import React, { useEffect, useState } from 'react'
import { Form, Tooltip } from 'react-bootstrap' // Importing Bootstrap components
import { useSelector } from 'react-redux' // Redux hook to fetch user data from the store
import Select from 'react-select' // Importing react-select for dropdown
import { handleKeyPress } from '../../../Common/CommonComponents/FormControlValidation' // Form control validation helper
import PageHeader from '../../../Common/CommonComponents/PageHeader' // Page header component
import { getAllById } from '../../../Common/Services/CommonService' // Service to fetch data from API

// SelfDetails component to display employee self details and handle inputs
const SelfDetails = ({ apprisalForm, errors, readOnly }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Access user details from Redux store
    const [countries, setCountries] = useState() // State to store country data
    const [countryId, setCountryId] = useState(apprisalForm && apprisalForm.countryId) // State for selected country ID
    const [countryIsoCode, setCountryIsoCode] = useState() // State for country ISO code
    const [countryIsdCode, setCountryIsdCode] = useState() // State for country ISD code
    const [formErrors, setFormErrors] = useState({}) // State to store form errors

    // Input handler to update form data and handle validation for phone number
    const onInputHandler = (e) => {
        const { name, value } = e.target
        apprisalForm[name] = value // Update the apprisalForm object with the new value

        if (name === 'managerContactNumber') {
            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' }) // Mark as required if no value is entered
            }
            let value1 = '+' + countryIsdCode + value // Format phone number with ISD code
            const phoneNumber = parsePhoneNumberFromString(value1, countryIsoCode) // Validate phone number
            if (phoneNumber && phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: '' }) // Clear errors if phone number is valid
            } else {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' }) // Show error if phone number is invalid
            }
        }
    }

    // Effect hook to initialize values when the apprisalForm is updated
    useEffect(() => {
        setCountryId(apprisalForm.countryId) // Set the country ID based on apprisalForm data
        data() // Update country-related data when apprisalForm changes
    }, [apprisalForm])

    // Function to fetch country-related data and update country code and ISD code
    const data = () => {
        const matchedCountry =
            countries && countries.find((country) => country.countryId === apprisalForm.countryId)
        if (matchedCountry) {
            setCountryIsoCode(matchedCountry.isoCode + '+' + matchedCountry.isdCode) // Set country ISO and ISD code
            setCountryIsdCode(matchedCountry.isdCode) // Set ISD code
        }
    }

    // Effect hook to fetch countries data on component mount
    useEffect(() => {
        onGetCurrencyHandler() // Fetch country data on component mount
        data() // Update country-related data
    }, [])

    // Function to fetch country data from API
    const onGetCurrencyHandler = () => {
        getAllById({
            entity: 'organizationCountry',
            organizationId: userDetails.organizationId // Use organization ID from Redux store
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    const filteredCountries = res.data.filter((country) => !country.deleted) // Filter out deleted countries
                    setCountries(filteredCountries) // Store filtered countries in state
                }
            })
            .catch((err) => {
                console.log(err, 'error') // Log any error fetching country data
            })
    }

    // Map the countries data to options for the select dropdown
    const countriesOptions = countries
        ? countries.map((option) => ({
              value: option.countryId,
              label: option.isoCode + '+' + option.isdCode,
              isdCode: option.isdCode
          }))
        : []

    // Handle country selection from dropdown
    const handleCurrencySelection = (option) => {
        setFormErrors({
            ...formErrors,
            countryId: !option ? 'Required' : '' // Show error if country is not selected
        })
        setCountryId(option.value) // Set the selected country ID
        apprisalForm['countryId'] = option.value // Update countryId in apprisalForm
        setCountryIsoCode(option.label) // Set the country ISO code
        setCountryIsdCode(option.isdCode) // Set the country ISD code
    }

    return (
        <div>
            <section className="">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle="Appraisal Form" />{' '}
                                {/* Display page header */}
                            </div>
                            <div className="selfDetails">
                                {/* Display employee details */}
                                <div className="row mb-2">
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label>Employee Id</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.code}</span>{' '}
                                                {/* Display employee ID */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label> Employee Name</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.employeeName}</span>{' '}
                                                {/* Display employee name */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* More employee information fields */}
                                <div className="row mb-2">
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label>Date Of Joining</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.dateOfJoining}</span>{' '}
                                                {/* Display date of joining */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label> Designation</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.designation}</span>{' '}
                                                {/* Display designation */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* More employee information fields */}
                                <div className="row mb-2">
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label>Location</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.locationName}</span>{' '}
                                                {/* Display location */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label> Skill and Competencies</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span>
                                                    {' '}
                                                    {apprisalForm.skills == '[]'
                                                        ? ''
                                                        : apprisalForm.skills}
                                                </span>{' '}
                                                {/* Display skills */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Manager Details */}
                                <div className="row mb-2">
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label> Manager Name</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span>{apprisalForm.title}</span>{' '}
                                                <span> {apprisalForm.managerName}</span>{' '}
                                                {/* Display manager name */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label>Manager Email</label>
                                            </div>
                                            <div className="col-sm-5 taskLength">
                                                <Tooltip title={apprisalForm.managerEmail} open>
                                                    {apprisalForm.managerEmail}{' '}
                                                    {/* Display manager email */}
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Projects and Manager's Contact Number fields */}
                                <div className="row mb-2">
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label>
                                                    Projects/Clients{' '}
                                                    <span className="error">*</span>
                                                </label>
                                            </div>
                                            <div className="col-sm-5">
                                                <Form.Control
                                                    onPaste={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    } // Handling paste action
                                                    onChange={onInputHandler}
                                                    disabled={readOnly}
                                                    name="projects"
                                                    defaultValue={apprisalForm.projects}
                                                    maxLength={50}
                                                />
                                                <p className="error">
                                                    {errors && errors.projects
                                                        ? errors.projects
                                                        : ' '}
                                                </p>{' '}
                                                {/* Display project validation error */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label> Manager Phone #</label>
                                            </div>
                                            {apprisalForm.status === 'Saved' ? (
                                                <div className="custom-col">
                                                    <Select
                                                        value={countriesOptions.find(
                                                            (e) =>
                                                                e.value === countryId &&
                                                                e.label === countryIsoCode
                                                        )}
                                                        size="xs"
                                                        placeholder="Country"
                                                        options={countriesOptions}
                                                        onChange={handleCurrencySelection} // Country selection handler
                                                    />
                                                    <p className="error">{formErrors.countryId}</p>
                                                </div>
                                            ) : null}
                                            <div className="custom-coll">
                                                <Form.Control
                                                    disabled={readOnly}
                                                    onChange={onInputHandler}
                                                    name="managerContactNumber"
                                                    defaultValue={apprisalForm.managerContactNumber}
                                                    maxLength={15}
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(
                                                            /\D/g,
                                                            ''
                                                        ) // Remove non-numeric characters
                                                    }}
                                                />
                                                <p className="error">
                                                    {formErrors.managerContactNumber}
                                                </p>{' '}
                                                {/* Display manager contact validation error */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default SelfDetails
