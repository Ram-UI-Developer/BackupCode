// Import necessary modules and components from libraries like React, react-bootstrap, redux, react-select, etc.
import { parsePhoneNumberFromString } from 'libphonenumber-js' // for phone number validation
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row, Tabs, Tooltip } from 'react-bootstrap'
import Tab from 'react-bootstrap/Tab'
import Select from 'react-select' // for selecting country with country code
import { toast } from 'react-toastify' // for showing notifications
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons' // Custom icons
import Table from '../../../Common/Table/Table' // Custom table component to display data

const Reference = ({ setReferenceGet, references, countries }) => {

    // States to handle modal visibility, form data, country list, and form errors
    const [show, setShow] = useState('')
    const [visible, setVisible] = useState(false)
    const [formData, setFormData] = useState('') // Stores form data


    // Convert country list into an array of options for Select component
    const countriesOptions = countries
        ? countries.map((option) => ({
            value: option.countryId,
            label: option.isoCode + '+' + option.isdCode,
            isdCode: option.isdCode
        }))
        : []

    // States to store selected country details
    const [countryId, setCountryId] = useState()
    const [countryIsoCode, setCountryIsoCode] = useState()
    const [countryIsdCode, setCountryIsdCode] = useState()

    // Handle country selection
    const handleCurrencySelection = (option) => {
        setFormErrors({
            ...formErrors,
            countryId: !option ? 'Required' : '' // Set error if country is not selected
        })
        setCountryId(option.value)
        setCountryIsoCode(option.label)
        setCountryIsdCode(option.isdCode)
    }

    // Columns definition for the reference table
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.name} open>
                            {row.original.name}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.name}</div>
                </>
            )
        },
        {
            Header: 'Occupation',
            accessor: 'occupation',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.occupation} open>
                            {row.original.occupation}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.occupation}</div>
                </>
            )
        },
        {
            Header: ' Phone Number',
            accessor: 'mobileNumber',
            Cell: ({ row }) => (
                <div className="tableData">
                    {'+' + row.original.isdCode + '-' + row.original.mobileNumber}
                </div>
            )
        },
        {
            Header: 'Email',
            accessor: 'email'
        },
        {
            Header: 'Address',
            accessor: 'address',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.address} open>
                            {row.original.address}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.address}</div>
                </>
            )
        },
        // Actions column for edit and delete buttons
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            variant=""
                            id="referenceEdit"
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            variant=""
                            id="referenceDelete"
                            className="iconWidth"
                            onClick={() => handleRemove(row.index)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    // States for handling deletion modal visibility and selected index
    const [deleteShow, setDeleteShow] = useState(false)
    const [indexs, setIndexS] = useState()

    // Show delete confirmation modal
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndexS(index)
    }

    // Handle deletion confirmation
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...data]
        rows.splice(indexs, 1) // Remove the item at the selected index
        setReferenceGet(rows) // Update the reference list
        setDeleteShow(false) // Close the delete confirmation modal
    }

    // State for form validation errors
    const [formErrors, setFormErrors] = useState({})

    // Email regex for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Handle form input changes and perform validation for phone and email
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

        // Validate email format
        if (name == 'email') {
            if (value && !emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }

        // Validate phone number format
        if (name === 'mobileNumber') {
            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
                return
            }
            let value1 = '+' + countryIsdCode + value
            const phoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)
            if (phoneNumber && phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' })
            }
        }
    }

    // Set the data (references) passed as props to the state
    useEffect(() => {
        setData(references)
    }, [references])

    const [data, setData] = useState(references) // State for storing reference data

    // Validate form data before saving
    const validate = (values) => {
        const errors = {}
        if (!values.mobileNumber) {
            errors.mobileNumber = 'Required'
        }
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.countryId) {
            errors.countryId = 'Required'
        }
        if (!values.occupation) {
            errors.occupation = 'Required'
        }
        return errors
    }

    // Save a new reference after validation
    const saveReference = () => {
        const refrebj = {
            email: formData.email,
            mobileNumber: formData.mobileNumber,
            name: formData.name,
            address: formData.address,
            occupation: formData.occupation,
            countryId: countryId,
            isdCode: countryIsdCode
        }
        let value = '+' + countryIsdCode + refrebj.mobileNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)

        // Perform validation for each field and show errors if needed
        if (!refrebj.mobileNumber) {
            setFormErrors(validate(refrebj))
        } else if (!refrebj.name) {
            setFormErrors(validate(refrebj))
        } else if (!refrebj.occupation) {
            setFormErrors(validate(refrebj))
        } else if (refrebj.email && !emailRegex.test(refrebj.email)) {
            toast.error('Invalid email format')
        } else if (!refrebj.countryId) {
            setFormErrors(validate(refrebj))
        } else if (refrebj.mobileNumber.length <= 1) {
            toast.error('Invalid phone number')
        } else if (!phoneNumber.isValid()) {
            toast.error('Invalid phone number')
        } else {
            const reference = [...data, refrebj]
            setReferenceGet(reference) // Update the references list
            setData(reference) // Update the reference data
            onCloseHandler() // Close the modal
        }
    }

    // Update an existing reference
    const updateReference = () => {
        const referenceObjUpdate = {
            id: referenceEdit.id,
            email: formData.email ? formData.email : referenceEdit.email,
            mobileNumber: formData.mobileNumber !== undefined
                ? formData.mobileNumber
                : referenceEdit.mobileNumber,
            name: formData.name !== undefined ? formData.name : referenceEdit.name,
            address: formData.address ? formData.address : referenceEdit.name,
            occupation: formData.occupation !== undefined ? formData.occupation : referenceEdit.occupation,
            countryId: countryId ? countryId : referenceEdit.countryId,
            organizationId: referenceEdit.organizationId,
            isdCode: countryIsdCode.toString() ? countryIsdCode.toString() : referenceEdit.isdCode
        }
        let value = '+' + countryIsdCode + referenceObjUpdate.mobileNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        console.log(referenceObjUpdate, 'refrebj')
        // Perform validation before updating the reference
        if (!referenceObjUpdate.mobileNumber) {
            setFormErrors(prev => ({ ...prev, mobileNumber: 'Required' }))
            return
        } else if (!referenceObjUpdate.name) {
            setFormErrors(prev => ({ ...prev, name: 'Required' }))
            return
        } else if (!referenceObjUpdate.occupation) {
            setFormErrors(prev => ({ ...prev, occupation: 'Required' }))
            return
        } else if (!referenceObjUpdate.countryId) {
            setFormErrors(validate(referenceObjUpdate))
        } else if (referenceObjUpdate.mobileNumber.length <= 1) {
            toast.error('Invalid phone number')
        } else if (!phoneNumber.isValid()) {
            toast.error('Invalid phone number')
        } else if (
            formData.email !== undefined &&
            referenceObjUpdate.email &&
            !emailRegex.test(formData.email)
        ) {
            toast.error('Invalid email format')
        } else {
            const referenceData = [...references]
            referenceData[index] = referenceObjUpdate // Update reference at selected index
            setReferenceGet(referenceData) // Update references list
            onCloseHandler() // Close modal
        }
    }

    const [referenceEdit, setReferenceEdit] = useState({}) // Stores reference being edited
    const [index, setIndex] = useState(null) // Stores index of reference being edited

    // Show handler for both creating and updating references
    const onShowHandler = (action, row, index) => {
        setIndex(index) // Set the index of the selected reference
        if (action === 'create') {
            setVisible('create')
            setShow(true)
            setCountryId()
            setCountryIsoCode('')
            setFormData('')
        } else {
            // Find country details for the selected reference
            const matchedCountry =
                countries && countries.find((country) => country.countryId === row.countryId)
            setCountryId(row.countryId)
            if (matchedCountry) {
                setCountryIsoCode(matchedCountry.isoCode + '+' + matchedCountry.isdCode)
                setCountryIsdCode(matchedCountry.isdCode)
            }
            setReferenceEdit(row) // Set reference data for updating
            setFormData(row)
            setVisible('update')
            setShow(true)
        }
    }

    // Close modal and reset states
    const onCloseHandler = () => {
        setShow(false)
        setReferenceEdit('')
        setFormErrors('')
        setDeleteShow(false)
    }

    // JSX structure for displaying the reference table, form modal, and delete confirmation modal
    return (
        <>
            <Tabs>
                <Tab eventKey="family">
                    <div className="card-body" style={{ marginTop: '1%' }}>
                        {/* Add reference button */}
                        <Button
                            className="addButton"
                            id="addReference"
                            variant="addbtn"
                            onClick={() => onShowHandler('create')}
                        >
                            <AddIcon />
                        </Button>
                        {
                            // Show reference table or message if no data available
                            data ? (
                                <Table
                                    columns={COLUMNS}
                                    data={data}
                                    serialNumber={true}
                                    name={'reference records'}
                                />
                            ) : (
                                <p className="emptyDataMessage">No reference records added yet!</p>
                            )
                        }
                    </div>
                </Tab>
            </Tabs>

            {/* Modal for adding/updating reference */}
            <Modal show={show} onHide={onCloseHandler} size="xl">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Reference</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <form className="modalFormBody">
                            {/* Form for entering reference details */}
                            <Row>
                                {/* Name and Occupation Fields */}
                                <div className="col-7">
                                    <Form.Group as={Row} className="mb-3" controlId="referenceName">
                                        <Form.Label id="referenceName" column sm={3}>
                                            Name <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="referenceName"
                                                required
                                                size="sm"
                                                name="name"
                                                maxLength={50}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            name: 'Required'
                                                        })
                                                        : setFormErrors({ ...formErrors, name: '' })
                                                }
                                                defaultValue={referenceEdit && referenceEdit.name}
                                                onChange={handleInputChange}
                                            />
                                            {formErrors.name && (
                                                <p className="error">{formErrors.name}</p>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-5">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="refernceOccupation"
                                    >
                                        <Form.Label id="refernceOccupation" column sm={5}>
                                            Occupation <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="refernceOccupation"
                                                required
                                                size="sm"
                                                maxLength={50}
                                                name="occupation"
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            occupation: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            occupation: ''
                                                        })
                                                }
                                                onChange={handleInputChange}
                                                defaultValue={
                                                    referenceEdit && referenceEdit.occupation
                                                }
                                            />
                                            <p className="error">{formErrors.occupation}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Mobile Number, Email and Address Fields */}
                                <div className="col-7">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="referenceMobileNumber"
                                    >
                                        <Form.Label id="referenceMobileNumber" column sm={3}>
                                            Mobile Number <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={3}>
                                            <Select
                                                id="referenceMobileNumber"
                                                value={countriesOptions.filter(
                                                    (e) =>
                                                        e.value == countryId &&
                                                        e.label == countryIsoCode
                                                )}
                                                size="sm"
                                                placeholder="Country"
                                                options={countriesOptions}
                                                onInput={(e) => {
                                                    // Filter out non-numeric characters from the phone number input
                                                    e.target.value = e.target.value.replace(
                                                        / '\D'/g,
                                                        ''
                                                    ) // Allow only numeric characters
                                                }}
                                                onChange={handleCurrencySelection}
                                            />
                                            {/* 1743 bug resolved*/}
                                            {/* Display error if country is not selected */}
                                            <p className="error">{formErrors.countryId}</p>
                                        </Col>
                                        <Col sm={3}>
                                            <Form.Control
                                            size='sm'
                                                id="referenceMobileNumber"
                                                required
                                                name="mobileNumber"
                                                defaultValue={
                                                    referenceEdit && referenceEdit.mobileNumber
                                                }
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            mobileNumber: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            mobileNumber: ''
                                                        })
                                                }
                                                onChange={handleInputChange}
                                                maxLength={15}
                                                onInput={(e) => {
                                                    // Filter out non-numeric characters
                                                    e.target.value = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        ''
                                                    )
                                                }}
                                                disabled={!countryId} /* 1743 bug resolved*/
                                            />
                                            {formErrors.mobileNumber && (
                                                <p className="error">
                                                    {formErrors.mobileNumber}
                                                </p>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-5">
                                    <Form.Group as={Row} className="mb-3" controlId="refrenceEmail">
                                        <Form.Label id="refrenceEmail" column sm={5}>
                                            Email
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="refrenceEmail"
                                                size="sm"
                                                name="email"
                                                maxLength={100}
                                                defaultValue={referenceEdit && referenceEdit.email}
                                                onChange={handleInputChange}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                {/* Address Field */}
                                <div className="col-7">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="refrenceAddress"
                                    >
                                        <Form.Label id="refrenceAddress" column sm={3}>
                                            Address
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="refrenceAddress"
                                                size="sm"
                                                name="address"
                                                maxLength={150}
                                                defaultValue={
                                                    referenceEdit && referenceEdit.address
                                                }
                                                onChange={handleInputChange}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Modal.Body>
                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    {visible === 'create' ? (
                        <Button
                            variant="addbtn"
                            id="referenceAdd"
                            className="Button"
                            onClick={saveReference}
                        >
                            Add
                        </Button>
                    ) : (
                        <Button
                            variant="addbtn"
                            className="Button"
                            id="updateReference"
                            onClick={updateReference}
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        className="Button"
                        id="closeReference"
                        onClick={onCloseHandler}
                    >
                        Close
                    </Button>
                </div>
            </Modal>

            {/* Delete confirmation modal */}
            <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        id="deleteYes"
                        className="Button"
                        variant="addbtn"
                        onClick={proceedDeleteHandler}
                    >
                        Yes
                    </Button>
                    <Button
                        id="deleteNo"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default Reference
