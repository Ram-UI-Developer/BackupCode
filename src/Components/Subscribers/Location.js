import React, { useEffect, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Select from 'react-select'
import { getAll, getById } from '../../Common/Services/CommonService'

// Main component
const Location = ({ LocationDetails, sendToParent, sendHeadOffice, formError }) => {
    // State to hold form data
    const [formData, setFormData] = useState('')
    const [formErrors, setFormErrors] = useState({}) // For tracking field validation errors

    // Set default country and state values from props
    useEffect(() => {
        setCountryId(LocationDetails.countryId)
        setStateId(LocationDetails.stateId)
    }, [LocationDetails])

    // Fetch countries/states on mount or when formError changes
    useEffect(() => {
        setFormErrors(formError)
        getAllCountries()
        getAllStates()
    }, [formError])

    // Country dropdown data
    const [country, setCountry] = useState([])
    const getAllCountries = () => {
        getAll({ entity: 'countries' }).then((res) => {
            setCountry(res.data)
        })
        .catch(() => {})
    }

    // Convert country list into react-select options
    const countryOptions = country.map((option) => ({
        value: option.id,
        label: option.name + '(' + option.isoCode + ')'
    }))

    // Country selection and loading corresponding states
    const [countryId, setCountryId] = useState(LocationDetails.country)
    const handleCountrySelection = (option) => {
        setCountryId(option.value)
        getAllStates(option.value) // Fetch states based on selected country
    }

    // State dropdown data
    const [state, setState] = useState([])
    const getAllStates = (id) => {
        getById({ entity: 'countries', id: id }).then((res) => {
            if (res.statusCode == 200) {
                setState(res.data.stateDTOs)
            }
        })
            .catch(() => { })
    }

    // Convert state list into react-select options
    const stateOptions = state.map((option) => ({
        value: option.id,
        label: option.name
    }))

    // State selection
    const [stateId, setStateId] = useState(LocationDetails.state)
    const handleStateSelection = (option) => {
        setStateId(option.value)
        setFormData({ ...formData, state: option.value }) // Add state to form data
    }

    // Generic input change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // Pass updated form data to parent component
    sendToParent(formData)

    return (
        <>
            <div>
                <div>
                    <div className="row">
                        {/* Location Name */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column md={7}>
                                    Location Name <span className="error">*</span>
                                </Form.Label>
                                <Col md={5}>
                                    <Form.Control
                                        onChange={handleInputChange}
                                        defaultValue={
                                            LocationDetails && LocationDetails.locationName
                                        }
                                        name="locationName"
                                        type="text"
                                        onBlur={(e) =>
                                            !e.target.value
                                                ? setFormErrors({
                                                    ...formErrors,
                                                    locationName: 'Required'
                                                })
                                                : setFormErrors({ ...formErrors, locationName: '' })
                                        }
                                    />
                                    <p className="error">
                                        {formErrors && formErrors.locationName}
                                    </p>
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Country Dropdown */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column md={7}>
                                    Country <span className="error">*</span>
                                </Form.Label>
                                <Col md={5}>
                                    <Select
                                        value={countryOptions.filter((e) => e.value == countryId)}
                                        onChange={handleCountrySelection}
                                        options={countryOptions}
                                        name="country"
                                    />
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Address 1 */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column md={7}>
                                    Address 1 <span className="error">*</span>
                                </Form.Label>
                                <Col md={5}>
                                    <Form.Control
                                        onChange={handleInputChange}
                                        defaultValue={LocationDetails && LocationDetails.address1}
                                        name="address1"
                                        type="text"
                                        onBlur={(e) =>
                                            !e.target.value
                                                ? setFormErrors({
                                                    ...formErrors,
                                                    address1: 'Required'
                                                })
                                                : setFormErrors({ ...formErrors, address1: '' })
                                        }
                                    />
                                    <p className="error">{formErrors.address1}</p>
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Address 2 (optional) */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column md={7}>
                                    Address 2
                                </Form.Label>
                                <Col md={5}>
                                    <Form.Control
                                        defaultValue={LocationDetails && LocationDetails.address2}
                                        onChange={handleInputChange}
                                        name="address2"
                                        type="text"
                                    />
                                </Col>
                            </Form.Group>
                        </div>

                        {/* City */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column md={7}>
                                    City <span className="error">*</span>
                                </Form.Label>
                                <Col md={5}>
                                    <Form.Control
                                        defaultValue={LocationDetails && LocationDetails.city}
                                        onChange={handleInputChange}
                                        name="city"
                                        type="text"
                                        onBlur={(e) =>
                                            !e.target.value
                                                ? setFormErrors({ ...formErrors, city: 'Required' })
                                                : setFormErrors({ ...formErrors, city: '' })
                                        }
                                    />
                                    <p className="error">{formErrors.city}</p>
                                </Col>
                            </Form.Group>
                        </div>

                        {/* State Dropdown */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column md={7}>
                                    State <span className="error">*</span>
                                </Form.Label>
                                <Col md={5}>
                                    <Select
                                        onChange={handleStateSelection}
                                        options={stateOptions}
                                        name="state"
                                        value={stateOptions.filter((e) => e.value == stateId)}
                                    />
                                </Col>
                            </Form.Group>
                        </div>

                        {/* Zip Code */}
                        <div class="col-6">
                            <Form.Group as={Row} className="mb-5">
                                <Form.Label column md={7}>
                                    Postal / Zip Code <span className="error">*</span>
                                </Form.Label>
                                <Col md={5}>
                                    <Form.Control
                                        defaultValue={LocationDetails && LocationDetails.zipCode}
                                        onChange={handleInputChange}
                                        name="zipCode"
                                        type="text"
                                        onBlur={(e) =>
                                            !e.target.value
                                                ? setFormErrors({
                                                    ...formErrors,
                                                    zipCode: 'Required'
                                                })
                                                : setFormErrors({ ...formErrors, zipCode: '' })
                                        }
                                    />
                                    <p className="error">{formErrors.zipCode}</p>
                                </Col>
                            </Form.Group>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Location
