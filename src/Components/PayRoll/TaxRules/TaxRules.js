import React, { useEffect, useState } from 'react'
import { InputGroup } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import {
    getByIdwithOutOrg,
    saveWithoutOrg,
    updateWithoutOrg
} from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import PTRules from './PTRules'
import TaxSlabs from './TaxSlabs'
import {
    compareArrayOfObjects,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const TaxRules = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetails from redux
    // React Router hook to access current location object
    const location = useLocation()
    // Get state passed through navigation (e.g., rulesId from previous screen)
    const rulesId = useLocation().state
    // State to manage income tax slab entries
    const [taxSlabs, setTaxSlabs] = useState([
        {
            fromAmount: 0,
            toAmount: '',
            percentage: '',
            taxRuleId: ''
        }
    ])
    // State to manage professional tax slab entries
    const [pTSlabs, setPTSlabs] = useState([
        {
            fromValue: 0,
            toValue: '',
            amount: '',
            taxRuleId: ''
        }
    ])
    // Controls loader/spinner visibility
    const [loading, setLoading] = useState(false)
    // Stores the selected tax rule name or object
    const [rules, setRules] = useState('')
    // React Router hook for navigation
    const navigate = useNavigate()
    // Holds form validation errors, currently scoped to taxSlabs
    const [formErrors, setFormErrors] = useState({ taxSlabs: '' })

    // PF configuration object (e.g., limits, contributions)
    const [pf, setPf] = useState({})
    // ESI configuration object
    const [esi, setEsi] = useState({})
    // Main form data object for tax configuration form
    const [formData, setFormData] = useState({
        id: null,
        yearFrom: '',
        yearTo: '',
        standardDeduction: '',
        assessmentYear: '',
        educationCess: '',
        fromMonth: '',
        toMonth: ''
    })

    // Controls the visibility of a modal, dropdown, or UI section; starts hidden
    const [, setShow] = useState(false)

    const [data, setData] = useState({})

    const monthOptions = [
        { label: 'Jan', value: 'January' },
        { label: 'Feb', value: 'February' },
        { label: 'Mar', value: 'March' },
        { label: 'Apr', value: 'April' },
        { label: 'May', value: 'May' },
        { label: 'Jun', value: 'June' },
        { label: 'Jul', value: 'July' },
        { label: 'Aug', value: 'August' },
        { label: 'Sep', value: 'September' },
        { label: 'Oct', value: 'October' },
        { label: 'Nov', value: 'November' },
        { label: 'Dec', value: 'December' }
    ]

    useEffect(() => {
        const { state } = location

        if (state && state.id) {
            onGetTaxHandler()
        } else {
            setFormData({
                id: null,
                yearFrom: '',
                yearTo: '',
                standardDeduction: '',
                assessmentYear: '',
                educationCess: ''
            })
            setTaxSlabs([])
        }
    }, [location.state])

    const validate = (values) => {
        const errors = {}
        if (!values.yearFrom) {
            errors.yearFrom = 'Required'
        }
        if (!values.yearTo) {
            errors.yearTo = 'Required'
        }
        if (!values.assessmentYear) {
            errors.assessmentYear = 'Required'
        }
        if (!values.standardDeduction) {
            errors.standardDeduction = 'Required'
        }
        if (!values.educationCess) {
            errors.educationCess = 'Required'
        }
        if (!values.inPercentage) {
            errors.inPercentage = 'Required'
        }
        if (!values.employeeFixedValue) {
            errors.employeeFixedValue = 'Required'
        }
        if (!values.employeerFixedValue) {
            errors.employeerFixedValue = 'Required'
        }
        if (!values.minBasic) {
            errors.minBasic = 'Required'
        }
        if (!values.esiEligibility) {
            errors.esiEligibility = 'Required'
        }
        if (!values.disabilityESI) {
            errors.disabilityESI = 'Required'
        }
        if (!values.seniorCitizenESI) {
            errors.seniorCitizenESI = 'Required'
        }
        if (!values.esiValue) {
            errors.esiValue = 'Required'
        }
        if (!values.fromMonth) {
            errors.fromMonth = 'Required'
        }
        if (!values.toMonth) {
            errors.toMonth = 'Required'
        }
        if (!values.fromMonth) {
            errors.fromMonth = 'Required'
        }
        if (!values.toMonth) {
            errors.toMonth = 'Required'
        }
        return errors
    }

    /**
     * Handles the save action for the form data provided, validates the form fields,
     * and saves the data to the backend.
     * @param {Event} e - The event object.
     * @returns None
     */
    const onSaveHandler = (e) => {
        e.preventDefault()

        const itemObj = {
            id: rulesId && rulesId.id,
            yearFrom: formData.yearFrom ? formData.yearFrom : rules.yearFrom,
            yearTo: formData.yearTo ? formData.yearTo : rules.yearTo,
            assessmentYear: formData.assessmentYear
                ? formData.assessmentYear
                : rules.assessmentYear,
            standardDeduction: formData.standardDeduction
                ? formData.standardDeduction
                : rules.standardDeduction,
            educationCess: formData.educationCess
                ? formData.educationCess.endsWith('%')
                    ? formData.educationCess
                    : `${formData.educationCess}%`
                : rules.educationCess,
            taxSlabs: taxSlabs,
            professionalTax: pTSlabs,
            providentFunds: {
                inPercentage: formData.inPercentage ? formData.inPercentage : rules.inPercentage,
                employeeFixedValue: formData.employeeFixedValue
                    ? formData.employeeFixedValue
                    : rules.employeeFixedValue,
                employeerFixedValue: formData.employeerFixedValue
                    ? formData.employeerFixedValue
                    : rules.employeerFixedValue,
                minBasic: formData.minBasic ? formData.minBasic : rules.minBasic
            },
            esiRules: {
                esiEligibility: formData.esiEligibility
                    ? formData.esiEligibility
                    : rules.esiEligibility,
                disabilityESI: formData.disabilityESI
                    ? formData.disabilityESI
                    : rules.disabilityESI,
                seniorCitizenESI: formData.seniorCitizenESI
                    ? formData.seniorCitizenESI
                    : rules.seniorCitizenESI,
                esiValue: formData.esiValue ? formData.esiValue : rules.esiValue
            },
            fromMonth: formData.fromMonth ? formData.fromMonth : rules.fromMonth,
            toMonth: formData.toMonth ? formData.toMonth : rules.toMonth,
            financialYear: null
        }

        if (!itemObj.yearFrom) {
            setFormErrors(validate(itemObj))
        } else if (!itemObj.yearTo) {
            setFormErrors(validate(itemObj))
        } else if (!itemObj.standardDeduction) {
            setFormErrors(validate(itemObj))
        } else if (!itemObj.educationCess) {
            setFormErrors(validate(itemObj))
        } else if (!itemObj.assessmentYear) {
            setFormErrors(validate(itemObj))
        } else if (!itemObj.fromMonth) {
            setFormErrors(validate(itemObj))
        } else if (!itemObj.toMonth) {
            setFormErrors(validate(itemObj))
        } else if (String(taxSlabs[taxSlabs.length - 1].percentage).length <= 0) {
            setFormErrors(validate(itemObj))
        } else if (String(pTSlabs[pTSlabs.length - 1].percentage).length <= 0) {
            setFormErrors(validate(itemObj))
        } else {
            setLoading(true)
            saveWithoutOrg({
                entity: 'taxrules',
                body: itemObj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Taxrules',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode === 200) {
                        ToastSuccess('Saved successfully.')
                        setShow(false)
                        navigate('/taxRuleslist')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    /**
     * Handles the update operation for tax rules based on the form data provided.
     * @param {Event} e - The event object triggering the update.
     * @returns None
     */
    const onUpdateHandler = (e) => {
        e.preventDefault()
        setLoading(true)
        const itemObj = {
            id: rulesId && rulesId.id,
            yearFrom: formData.yearFrom ? parseInt(formData.yearFrom, 10) : rules.yearFrom,
            yearTo: formData.yearTo ? parseInt(formData.yearTo, 10) : rules.yearTo,
            assessmentYear: formData.assessmentYear
                ? formData.assessmentYear
                : rules.assessmentYear,
            standardDeduction: formData.standardDeduction
                ? formData.standardDeduction
                : rules.standardDeduction,
            educationCess: formData.educationCess
                ? formData.educationCess.endsWith('%')
                    ? formData.educationCess
                    : `${formData.educationCess}%`
                : rules.educationCess,
            taxSlabs: taxSlabs,
            professionalTax: pTSlabs,
            providentFunds: {
                id: pf.id ? pf.id : rules.id,
                taxRuleId: rules.id,
                inPercentage: pf.inPercentage ? parseFloat(pf.inPercentage) : rules.inPercentage,
                employeeFixedValue: pf.employeeFixedValue
                    ? parseFloat(pf.employeeFixedValue)
                    : rules.employeeFixedValue,
                employeerFixedValue: pf.employeerFixedValue
                    ? parseFloat(pf.employeerFixedValue)
                    : rules.employeerFixedValue,
                minBasic: pf.minBasic ? parseInt(pf.minBasic) : rules.minBasic
            },
            esiRules: {
                id: esi.id ? esi.id : rules.id,
                taxRuleId: rules.id,
                esiEligibility: esi.esiEligibility
                    ? parseFloat(esi.esiEligibility)
                    : rules.esiEligibility,
                disabilityESI: esi.disabilityESI
                    ? parseFloat(esi.disabilityESI)
                    : rules.disabilityESI,
                seniorCitizenESI: esi.seniorCitizenESI
                    ? parseInt(esi.seniorCitizenESI)
                    : rules.seniorCitizenESI,
                esiValue: esi.esiValue ? parseFloat(esi.esiValue) : rules.esiValue
            },
            fromMonth: formData.fromMonth ? formData.fromMonth : rules.fromMonth,
            toMonth: formData.toMonth ? formData.toMonth : rules.toMonth,
            financialYear: rules.financialYear,

            createdDate: rules.createdDate, // keep existing value from getById
            modifiedDate: rules.modifiedDate || null, // set new modified date          
            createdBy: rules.createdBy || null, // keep existing value from getById
            modifiedBy: userDetails.getEmployeeId || null, // set new modifier
        }

        if (String(taxSlabs[taxSlabs.length - 1].percentage).length <= 0) {
            setFormErrors(validate(itemObj))
        }
        if (String(pTSlabs[pTSlabs.length - 1].percentage).length <= 0) {
            setFormErrors(validate(itemObj))
        } else if (
            updateValidation(itemObj, data) &&
            compareArrayOfObjects(itemObj.taxSlabs, data.taxSlabs) &&
            compareArrayOfObjects(itemObj.professionalTax, data.professionalTax) &&
            compareArrayOfObjects(itemObj.providentFunds, data.providentFunds) &&
            compareArrayOfObjects(itemObj.esiRules, data.esiRules)
        ) {
            toast.info('No changes detected to update')
            setLoading(false)
        } else {
            setLoading(true)
            updateWithoutOrg({
                entity: 'taxrules',
                id: rulesId && rulesId.id,
                body: itemObj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Taxrules',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess('Saved successfully.')
                        setLoading(false)
                        setShow(false)
                        navigate('/taxRuleslist')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    /**
     * Handles the logic for retrieving tax rules data from the server.
     * Sets loading state to true, makes a GET request to retrieve tax rules data,
     * processes the response data, updates state variables accordingly, and sets loading state to false.
     * @returns None
     */
    const onGetTaxHandler = () => {
        setLoading(true)
        getByIdwithOutOrg({
            entity: 'taxrules',
            id: rulesId && rulesId.id
        })
            .then((res) => {
                if (res.statusCode === 200 && res.data) {
                    setData(res.data)
                    setLoading(false)
                    const getList =
                        res.data.taxSlabs && res.data.taxSlabs.filter((e) => e.deleted !== 1)
                    const ptList =
                        res.data.professionalTax &&
                        res.data.professionalTax.filter((e) => e.deleted !== 1)

                    setPTSlabs(ptList || [])
                    setTaxSlabs(getList || [])

                    setPf(res.data.providentFunds)
                    setEsi(res.data.esiRules)
                    setFormData({
                        id: res.data.id || '',
                        yearFrom: res.data.yearFrom || '',
                        yearTo: res.data.yearTo || '',
                        standardDeduction: res.data.standardDeduction || '',
                        assessmentYear: res.data.assessmentYear || '',
                        educationCess: res.data.educationCess
                            ? res.data.educationCess.replace('%', '')
                            : '',
                        fromMonth: res.data.fromMonth || '',
                        toMonth: res.data.toMonth || ''
                    })

                    setRules(res.data)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const handleKeyPress = (event) => {
        const regex = /^[0-9.]$/
        const key = String.fromCharCode(event.charCode)

        // Test the key against the regex
        if (!regex.test(key)) {
            event.preventDefault()
        }
        const currentValue = event.target.value
        const digitCount = (currentValue.match(/\d/g) || []).length

        // Only allow more digits if less than 9 digits are present
        if (/\d/.test(key) && digitCount >= 9) {
            event.preventDefault()
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        let newValue = value.trimStart().replace(/\s+/g, ' ') // Normalize spaces

        // Special case for 'educationCess'
        if (name === 'educationCess') {
            newValue = Math.max(0, Math.min(100, parseFloat(newValue) || 0))
            newValue = newValue.toString()
        }

        setPf((prevData) => {
            const updatedFormData = {
                ...prevData,
                [name]: newValue === '' ? null : newValue // Update with value, or null if empty
            }
            return updatedFormData
        })
        setEsi((prevData) => {
            const updatedFormData = {
                ...prevData,
                [name]: newValue === '' ? null : newValue // Update with value, or null if empty
            }
            return updatedFormData
        })

        // Update state with the new value
        setFormData((prevData) => {
            const updatedFormData = {
                ...prevData,
                [name]: newValue === '' ? null : newValue // Update with value, or null if empty
            }

            // Handle 'yearTo' logic separately if needed
            if (name === 'yearTo') {
                const yearTo = parseInt(newValue, 10)

                if (isNaN(yearTo) || newValue.length < 4) {
                    updatedFormData.assessmentYear = ''
                } else {
                    const nextYear = yearTo + 1
                    const nextYearShort = nextYear.toString().slice(-2)
                    updatedFormData.assessmentYear = `${yearTo}-${nextYearShort}`
                }
            }

            return updatedFormData
        })

        // Set form errors if needed (optional)
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: newValue === '' ? 'Required' : ''
        }))
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-13">
                            <PageHeader
                                pageTitle={`${formData.yearFrom && formData.yearTo
                                    ? `${formData.yearFrom}-${formData.yearTo} Payroll Settings`
                                    : 'Payroll Settings'
                                    }`}
                            />
                            <br />

                            <div style={{ marginLeft: '10rem' }}>
                                <div style={{ fontSize: '18px', fontWeight: '600' }}>TDS Rules</div>
                                <hr
                                    style={{
                                        marginTop: '-0.8rem',
                                        width: '50rem',
                                        marginLeft: '5.3rem',
                                        borderWidth: '3px',
                                        borderColor: 'black'
                                    }}
                                />
                            </div>
                            <div className="formBody" style={{ marginLeft: '5%' }}>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={4}>
                                        Financial Year From <span className="error">* </span>
                                    </Form.Label>
                                    <Col md={7} className="d-flex justify-content-center">
                                        <Row className="form-row">
                                            <Form.Label column sm={3} className="form-label">
                                                Month <span className="error">* </span>
                                            </Form.Label>
                                            <Col sm={3}>
                                                <Select
                                                    options={monthOptions}
                                                    onChange={(selectedOption) => {
                                                        setFormData((prevData) => ({
                                                            ...prevData,
                                                            fromMonth: selectedOption.value // Update fromMonth in formData
                                                        }))
                                                    }}
                                                    value={
                                                        formData.fromMonth
                                                            ? {
                                                                value: formData.fromMonth,
                                                                label: formData.fromMonth
                                                            }
                                                            : null
                                                    } // Ensure value is properly set
                                                />
                                                <p className="error">{formErrors.fromMonth}</p>
                                            </Col>
                                            <Form.Label
                                                column
                                                sm={2}
                                                className="form-label"
                                                style={{ marginLeft: 'auto' }}
                                            >
                                                Year <span className="error">* </span>
                                            </Form.Label>
                                            <Col sm={3}>
                                                <Form.Control
                                                    name="yearFrom"
                                                    className="from"
                                                    defaultValue={formData.yearFrom}
                                                    onChange={handleInputChange}
                                                    size="sm"
                                                    maxLength={4}
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ''
                                                        )
                                                    }}
                                                />
                                                <p className="error">{formErrors.yearFrom}</p>
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col sm={4} className="d-flex  justify-content-center"></Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={4}>
                                        Financial Year To <span className="error">* </span>
                                    </Form.Label>
                                    <Col md={7} className="d-flex justify-content-center">
                                        <Row className="form-row">
                                            <Form.Label column sm={3} className="form-label">
                                                Month <span className="error">* </span>
                                            </Form.Label>
                                            <Col sm={3}>
                                                <Select
                                                    options={monthOptions}
                                                    onChange={(selectedOption) => {
                                                        setFormData((prevData) => ({
                                                            ...prevData,
                                                            toMonth: selectedOption.value // Update toMonth in formData
                                                        }))
                                                    }}
                                                    value={
                                                        formData.toMonth
                                                            ? {
                                                                value: formData.toMonth,
                                                                label: formData.toMonth
                                                            }
                                                            : null
                                                    } // Ensure value is properly set
                                                />
                                                <p className="error">{formErrors.toMonth}</p>
                                            </Col>
                                            <Form.Label
                                                column
                                                sm={2}
                                                className="form-label"
                                                style={{ marginLeft: 'auto' }}
                                            >
                                                Year <span className="error">* </span>
                                            </Form.Label>
                                            <Col sm={3}>
                                                <Form.Control
                                                    name="yearTo"
                                                    className="to"
                                                    size="sm"
                                                    onChange={handleInputChange}
                                                    value={formData.yearTo}
                                                    maxLength={4}
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ''
                                                        )
                                                    }}
                                                />
                                                <p className="error">{formErrors.yearTo}</p>
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col sm={4} className="d-flex  justify-content-center"></Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Assessment Year <span className="error">* </span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            name="assessmentYear"
                                            className="assessmentYear"
                                            size="sm"
                                            value={formData.assessmentYear}
                                            readOnly
                                        />
                                        <p className="error taxRules">
                                            {formErrors.assessmentYear}
                                        </p>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Standard Deduction <span className="error">* </span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            name="standardDeduction"
                                            type="number"
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            size="sm"
                                            value={formData.standardDeduction}
                                            min="1"
                                        />
                                        <p className="error taxRules">
                                            {formErrors.standardDeduction}
                                        </p>
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Education Cess <span className="error">* </span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <InputGroup size="sm">
                                            <Form.Control
                                                name="educationCess"
                                                className="educationCess text-right"
                                                type="number"
                                                onChange={handleInputChange}
                                                onKeyPress={handleKeyPress}
                                                value={formData.educationCess}
                                                min={0}
                                            />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                        <p className="error">{formErrors.educationCess}</p>
                                    </Col>
                                </Form.Group>
                            </div>

                            <br />
                            <TaxSlabs taxSlabs={taxSlabs} setTaxSlabs={setTaxSlabs} />

                            <div className="table">
                                <br />
                            </div>
                            <div style={{ marginLeft: '10rem' }}>
                                <div style={{ fontSize: '18px', fontWeight: '600' }}>PF Rules</div>
                                <hr
                                    style={{
                                        marginTop: '-0.8rem',
                                        width: '50rem',
                                        marginLeft: '4.5rem',
                                        borderWidth: '3px',
                                        borderColor: 'black'
                                    }}
                                />
                            </div>
                            <div className="formBody" style={{ marginLeft: '5%' }}>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Employee Contribution (%) on Basic + DA{' '}
                                        <span className="error">* </span>
                                    </Form.Label>

                                    <Col sm={5}>
                                        <InputGroup size="sm">
                                            <Form.Control
                                                name="inPercentage"
                                                className="inPercentage text-right"
                                                type="number"
                                                size="sm"
                                                min={0}
                                                value={pf.inPercentage}
                                                onChange={handleInputChange}
                                                onKeyPress={(e) => {
                                                    const key = String.fromCharCode(e.charCode)
                                                    const regex = /^[0-9.]$/
                                                    if (!regex.test(key)) {
                                                        e.preventDefault()
                                                        return
                                                    }

                                                    const currentValue = e.target.value || ''
                                                    const digitCount = (
                                                        currentValue.match(/\d/g) || []
                                                    ).length
                                                    if (/\d/.test(key) && digitCount >= 9) {
                                                        e.preventDefault()
                                                    }
                                                }}
                                            />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                        <p className="error">{formErrors.inPercentage}</p>
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Employee Contribution in Case of a Fixed Value{' '}
                                        <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            name="employeeFixedValue"
                                            className="employeeFixedValue text-right"
                                            type="number"
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            value={pf.employeeFixedValue}
                                            min={0}
                                        />

                                        <p className="error">{formErrors.employeeFixedValue}</p>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Employer Contribution in Case of a Fixed Value{' '}
                                        <span className="error">* </span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            name="employeerFixedValue"
                                            className="employeerFixedValue text-right"
                                            type="number"
                                            min={0}
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            size="sm"
                                            value={pf.employeerFixedValue}
                                        />
                                        <p className="error">{formErrors.employeerFixedValue}</p>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label className="mb-3" column sm={5}>
                                        Minimum Monthly Salary for Fixed PF Eligibility{' '}
                                        <span className="error">* </span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            name="minBasic"
                                            className="minBasic"
                                            type="number"
                                            size="sm"
                                            min={0}
                                            value={pf.minBasic}
                                            onChange={handleInputChange}
                                            onKeyPress={(e) => {
                                                const key = String.fromCharCode(e.charCode)
                                                const regex = /^[0-9.]$/
                                                if (!regex.test(key) || key === '-' || key === '+') {
                                                    e.preventDefault()
                                                    return
                                                }

                                                const currentValue = e.target.value || ''
                                                const digitCount = (currentValue.match(/\d/g) || [])
                                                    .length
                                                if (/\d/.test(key) && digitCount >= 9) {
                                                    e.preventDefault()
                                                }
                                            }}
                                        />
                                        <p className="error">{formErrors.minBasic}</p>
                                    </Col>
                                </Form.Group>
                            </div>
                            <div style={{ marginLeft: '10rem' }}>
                                <div style={{ fontSize: '18px', fontWeight: '600' }}>PT Rules</div>
                                <hr
                                    style={{
                                        marginTop: '-0.8rem',
                                        width: '50rem',
                                        marginLeft: '4.5rem',
                                        borderWidth: '3px',
                                        borderColor: 'black'
                                    }}
                                />
                            </div>
                            <div>
                                <PTRules pTSlabs={pTSlabs} setPTSlabs={setPTSlabs} />
                            </div>
                            <div style={{ marginLeft: '10rem' }}>
                                <div style={{ fontSize: '18px', fontWeight: '600' }}>ESI Rules</div>
                                <hr
                                    style={{
                                        marginTop: '-0.8rem',
                                        width: '50rem',
                                        marginLeft: '4.5rem',
                                        borderWidth: '3px',
                                        borderColor: 'black'
                                    }}
                                />
                            </div>
                            <div className="formBody mb-4" style={{ marginLeft: '5%' }}>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Employee Contribution % <span className="error">* </span>
                                    </Form.Label>

                                    <Col sm={5}>
                                        <InputGroup size="sm">
                                            <Form.Control
                                                name="esiValue"
                                                className="esiValue text-right"
                                                type="number"
                                                size="sm"
                                                min={0}
                                                value={esi.esiValue || ''} // Ensure this holds a number
                                                onChange={(e) => {
                                                    // Remove any non-numeric characters (e.g., percentage sign)
                                                    const value = e.target.value.replace(
                                                        /[^0-9.]/g,
                                                        ''
                                                    )
                                                    handleInputChange({
                                                        target: { name: 'esiValue', value }
                                                    })
                                                }}
                                                onKeyPress={(e) => {
                                                    const key = String.fromCharCode(e.charCode)
                                                    const regex = /^[0-9.]$/
                                                    if (!regex.test(key)) {
                                                        e.preventDefault()
                                                        return
                                                    }

                                                    const currentValue = e.target.value || ''
                                                    const digitCount = (
                                                        currentValue.match(/\d/g) || []
                                                    ).length
                                                    if (/\d/.test(key) && digitCount >= 9) {
                                                        e.preventDefault()
                                                    }
                                                }}
                                            />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                        <p className="error">{formErrors.esiValue}</p>
                                    </Col>
                                </Form.Group>

                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Minimum Monthly Salary for ESI Eligibility{' '}
                                        <span className="error">* </span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            name="esiEligibility"
                                            className="esiEligibility"
                                            type="number"
                                            size="sm"
                                            min={0}
                                            value={esi.esiEligibility}
                                            onChange={handleInputChange}
                                            onKeyPress={(e) => {
                                                const key = String.fromCharCode(e.charCode)
                                                const regex = /^[0-9.]$/
                                                if (!regex.test(key) || key === '-' || key === '+') {
                                                    e.preventDefault()
                                                    return
                                                }

                                                const currentValue = e.target.value || ''
                                                const digitCount = (currentValue.match(/\d/g) || [])
                                                    .length
                                                if (/\d/.test(key) && digitCount >= 9) {
                                                    e.preventDefault()
                                                }
                                            }}
                                        />
                                        <p className="error">{formErrors.esiEligibility}</p>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Minimum Monthly Salary for Physically Challenged{' '}
                                        <span className="error">* </span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            name="disabilityESI"
                                            className="disabilityESI"
                                            type="number"
                                            size="sm"
                                            min={0}
                                            value={esi.disabilityESI}
                                            onChange={handleInputChange}
                                            onKeyPress={(e) => {
                                                const key = String.fromCharCode(e.charCode)
                                                const regex = /^[0-9.]$/
                                                if (!regex.test(key) || key === '-' || key === '+') {
                                                    e.preventDefault()
                                                    return
                                                }

                                                const currentValue = e.target.value || ''
                                                const digitCount = (currentValue.match(/\d/g) || [])
                                                    .length
                                                if (/\d/.test(key) && digitCount >= 9) {
                                                    e.preventDefault()
                                                }
                                            }}
                                        />
                                        <p className="error">{formErrors.disabilityESI}</p>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                    <Form.Label column sm={5}>
                                        Minimum Monthly Salary for Senior Citizens{' '}
                                        <span className="error">* </span>
                                    </Form.Label>
                                    <Col sm={5}>
                                        <Form.Control
                                            name="seniorCitizenESI"
                                            className="seniorCitizenESI"
                                            type="number"
                                            size="sm"
                                            value={esi.seniorCitizenESI}
                                            min={0}
                                            onChange={handleInputChange}
                                            onKeyPress={(e) => {
                                                const key = String.fromCharCode(e.charCode)
                                                const regex = /^[0-9.]$/
                                                if (!regex.test(key) || key === '-' || key === '+') {
                                                    e.preventDefault()
                                                    return
                                                }

                                                const currentValue = e.target.value || ''
                                                const digitCount = (currentValue.match(/\d/g) || [])
                                                    .length
                                                if (/\d/.test(key) && digitCount >= 9) {
                                                    e.preventDefault()
                                                }
                                            }}
                                        />
                                        <p className="error">{formErrors.seniorCitizenESI}</p>
                                    </Col>
                                </Form.Group>
                            </div>
                            <div className="btnCenter mb-3">
                                {formData.id == null ? (
                                    <Button
                                        className="Button"
                                        variant="addbtn"
                                        type="button"
                                        onClick={onSaveHandler}
                                        disabled={
                                            taxSlabs.length > 0 &&
                                            (String(taxSlabs[taxSlabs.length - 1].percentage)
                                                .length <= 0 ||
                                                taxSlabs[taxSlabs.length - 1].toAmount) ||
                                            pTSlabs.length > 0 &&
                                            (String(pTSlabs[pTSlabs.length - 1].percentage)
                                                .length <= 0 ||
                                                pTSlabs[pTSlabs.length - 1].toValue)
                                        }
                                    >
                                        Save
                                    </Button>
                                ) : (
                                    <Button
                                        className="Button"
                                        variant="addbtn"
                                        type="button"
                                        onClick={onUpdateHandler}
                                        disabled={
                                            taxSlabs.length > 0 &&
                                            (String(taxSlabs[taxSlabs.length - 1].percentage)
                                                .length <= 0 ||
                                                taxSlabs[taxSlabs.length - 1].toAmount) ||
                                            pTSlabs.length > 0 &&
                                            (String(pTSlabs[pTSlabs.length - 1].percentage)
                                                .length <= 0 ||
                                                pTSlabs[pTSlabs.length - 1].toValue)
                                        }
                                    >
                                        Update
                                    </Button>
                                )}
                                <Button
                                    className="Button"
                                    variant="secondary"
                                    type="button"
                                    onClick={() => navigate('/taxRulesList')}
                                >
                                    {cancelButtonName}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default TaxRules
