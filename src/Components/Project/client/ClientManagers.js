import { parsePhoneNumberFromString } from 'libphonenumber-js'
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import {
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import TableHeader from '../../../Common/CommonComponents/TableHeader'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import { getAllById } from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

// Main component for managing client managers
const ClientManagers = ({ setManagerList, managerList, clientId, setChange }) => {
    const userDetails = useSelector((state) => state.user.userDetails)

    // Local state variables
    const [data, setData] = useState(managerList)
    const [mode, setMode] = useState()
    const [show, setShow] = useState(false)
    const [deleteShow, setDeleteShow] = useState(false)
    // const [edit, setEdit] = useState({})
    const [index, setIndex] = useState(null)
    const [formData, setFormData] = useState({})
    const [countryIsoCode, setCountryIsoCode] = useState()
    const [countryIsdCode, setCountryIsdCode] = useState()
    const [countries, setCountries] = useState()
    const [countryId, setCountryId] = useState()
    const [clientManager, setClientMAnager] = useState({})

    // Handle opening of add modal
    const onAddHandler = (action) => {
        onGetCurrencyHandler()
        setCountryId()
        setCountryIsoCode('')
        setMode(action)
        setShow(true)
    }

    // Fetch all countries related to the organization
    const onGetCurrencyHandler = () => {
        getAllById({
            entity: 'organizationCountry',
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    const filteredCountries = res.data.filter((country) => !country.deleted)
                    setCountries(filteredCountries)
                }
            })
            .catch(() => {})
    }

    // Map countries to select options
    const countriesOptions = countries
        ? countries.map((option) => ({
              value: option.countryId,
              label: option.isoCode + '+' + option.isdCode,
              isdCode: option.isdCode
          }))
        : []

    // Close the modal and reset form
    const handleClose = () => {
        // setEdit({})
        setShow(false)
        setFormErrors({})
        setFormData({})
    }

    // Handle editing of a manager
    const onEditHandler = (e, action, i) => {
        onGetCurrencyHandler()
        setClientMAnager(e)
        const matchedCountry =
            countries && countries.find((country) => country.countryId === e.countryId)
        setCountryId(e.countryId)
        if (matchedCountry) {
            setCountryIsoCode(matchedCountry.isoCode + '+' + matchedCountry.isdCode)
            setCountryIsdCode(matchedCountry.isdCode)
        }
        setShow(true)
        setFormData(e)
        setMode(action)
        setIndex(i)
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // Regular expression for validating email format

    // Handle input changes with validation
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name == 'email') {
            if (value && !emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        } else if (name === 'phoneNumber') {
            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
            }
            let value1 = '+' + countryIsdCode + value
            const phoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)
            if (phoneNumber && phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' })
            }
        } else {
            // Handle other inputs
            !value
                ? setFormErrors({ ...formErrors, [name]: 'Required' })
                : setFormErrors({ ...formErrors, [name]: '' })
        }
    }

    // Handle select change for country
    const handleCurrencySelection = (option) => {
        setFormErrors({
            ...formErrors,
            countryId: !option ? 'Required' : ''
        })
        setCountryId(option.value)
        setFormData({ ...formData, ['countryId']: option.value })
        setCountryIsoCode(option.label)
        setCountryIsdCode(option.isdCode)
    }

    // Update data when manager list changes
    useEffect(() => {
        setData(managerList)
    }, [managerList])

    // Handle deletion UI
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndex(index)
    }

    const onDeleteCloseHandler = () => {
        setDeleteShow(false)
    }

    // Delete confirmation
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...data]
        rows.splice(index, 1)
        setData(rows)
        setManagerList(rows)
        setDeleteShow(false)
        setChange(false)
    }

    const [formErrors, setFormErrors] = useState({}) // Track validation errors

    // Validation function
    const validate = (values) => {
        const errors = {}

        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.countryId) {
            errors.countryId = 'Required'
        }
        if (!values.email) {
            errors.email = 'Required'
        } else if (!emailRegex.test(values.email)) {
            errors.email = 'Invalid email format'
        }
        if (!values.phoneNumber) {
            errors.phoneNumber = 'Required'
        }
        return errors
    }

    // Save new manager to the list
    const saveObj = () => {
        const managerObj = {
            email: formData.email,
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            countryId: countryId
        }
        let value = '+' + countryIsdCode + managerObj.phoneNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        if (!emailRegex.test(managerObj.email)) {
            setFormErrors(validate(managerObj))
        } else if (!managerObj.name) {
            setFormErrors(validate(managerObj))
        } else if (!managerObj.countryId) {
            setFormErrors(validate(managerObj))
        } else if (!managerObj.phoneNumber) {
            setFormErrors(validate(managerObj))
        } else if (managerObj.phoneNumber.length <= 1) {
            toast.error('Invalid phone number')
        } else if (!phoneNumber.isValid()) {
            toast.error('Invalid phone number')
        } else {
            const newData = [...data, managerObj]
            setManagerList(newData)
            setData(newData)
            handleClose()
            setChange(false)
        }
    }

    // Update an existing manager's data
    const updateObj = () => {
        const managerObj = {
            ...formData,
            id: formData.id,
            email: formData.email,
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            countryId: countryId
        }
        let value = '+' + countryIsdCode + managerObj.phoneNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        if (updateValidation(formData, clientManager) && clientManager.countryId == countryId) {
            setChange(true)
            handleClose()
        } else if (!managerObj.email) {
            setFormErrors(validate(managerObj))
        } else if (!managerObj.name) {
            setFormErrors(validate(managerObj))
        } else if (!managerObj.countryId) {
            setFormErrors(validate(managerObj))
        } else if (!managerObj.phoneNumber) {
            setFormErrors(validate(managerObj))
        } else if (managerObj.phoneNumber.length <= 1) {
            toast.error('Invalid phone number')
        } else if (!phoneNumber.isValid()) {
            toast.error('Invalid phone number')
        } else {
            data[index] = managerObj
            setManagerList(data)
            handleClose()
            setChange(false)
        }
    }

    const navigate = useNavigate()

    // Navigate to user page
    const handleUserNavigate = (id, row, action) => {
        navigate('/user', { state: { id, row, action, clientId } })
    }

    // Define table columns
    const COLUMNS = [
        {
            Header: 'S.No',
            accessor: '',
            style: { overflowWrap: 'break-word' },
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-center">{row.index + 1}</div>
                </>
            )
        },
        {
            Header: 'Name',
            accessor: 'name'
        },
        {
            Header: 'Email',
            accessor: 'email'
        },
        {
            Header: 'Phone #',
            accessor: 'phoneNumber'
        },
        {
            Header: 'User Name',
            accessor: 'username',
            Cell: ({ row }) => {
                return (
                    <>
                        {row.original.username != null ? (
                            <span>{row.original.username}</span>
                        ) : row.original.id != null ? (
                            <a
                                className=""
                                onClick={() =>
                                    handleUserNavigate(row.original.id, row.original, 'External')
                                }
                            >
                                <u>Active</u>
                            </a>
                        ) : (
                            <></>
                        )}
                    </>
                )
            }
        },

        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            onClick={() => onEditHandler(row.original, 'update', row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            onClick={() => handleRemove(row.index)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    return (
        <>
            <div style={{ marginTop: '5%' }}>
                <TableHeader tableTitle={'Manager List'} />
                <div className="">
                    <Button
                        style={{ marginRight: '3%' }}
                        className="addButton"
                        variant="addbtn"
                        onClick={() => onAddHandler('Add')}
                    >
                        <AddIcon />
                    </Button>

                    <Table key={data.length} columns={COLUMNS} data={data} name={'manager records'} />
                </div>
                <Modal
                    show={show}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                >
                    <Modal.Header closeButton={handleClose}>
                        <Modal.Title>
                            {mode == 'Add' ? 'Add Manager' : 'Update Manager'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="center" style={{ paddingLeft: '10%', paddingRight: '10%' }}>
                            <form className="card-body">
                                <div className="col-">
                                    <Form.Group className="mb-2" as={Row}>
                                        <Form.Label column sm={4}>
                                            Name <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                defaultValue={formData.name}
                                                onChange={handleInputChange}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                              ...formErrors,
                                                              name: 'Required'
                                                          })
                                                        : setFormErrors({ ...formErrors, name: '' })
                                                }
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                maxLength={50}
                                            />
                                            {formErrors.name && (
                                                <p className="error">{formErrors.name}</p>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col- mb-">
                                    <Form.Group className="" as={Row}>
                                        <Form.Label column sm={4}>
                                            Email <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                defaultValue={formData.email}
                                                // type="text"
                                                required
                                                name="email"
                                                onChange={handleInputChange}
                                                onBlur={handleInputChange}
                                                maxLength={50}
                                            />
                                            <p className="error">{formErrors.email}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-">
                                    <Form.Group className="mb-3" as={Row}>
                                        <Form.Label column sm={4}>
                                            Phone Number <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={3}>
                                            <Select
                                                value={countriesOptions.filter(
                                                    (e) =>
                                                        e.value == countryId &&
                                                        e.label == countryIsoCode
                                                )}
                                                size="xs"
                                                placeholder="Country"
                                                options={countriesOptions}
                                                onChange={handleCurrencySelection}
                                            />
                                            <p className="error">{formErrors.countryId}</p>
                                        </Col>
                                        <Col sm={4}>
                                            <Form.Control
                                                defaultValue={formData.phoneNumber}
                                                type="text"
                                                name="phoneNumber"
                                                onChange={handleInputChange}
                                                maxLength={15}
                                                onInput={(e) => {
                                                    // Filter out non-numeric characters
                                                    e.target.value = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        ''
                                                    )
                                                }}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                              ...formErrors,
                                                              phoneNumber: 'Required'
                                                          })
                                                        : setFormErrors({
                                                              ...formErrors,
                                                              phoneNumber: ''
                                                          })
                                                }
                                            />
                                            <p className="error">{formErrors.phoneNumber}</p>
                                        </Col>
                                    </Form.Group>
                                </div>
                            </form>
                        </div>
                    </Modal.Body>

                    <div className="btnCenter mb-3">
                        {mode == 'Add' && (
                            <Button
                                type="button"
                                className="Button"
                                variant="addbtn"
                                onClick={saveObj}
                                style={{ marginRight: '2%' }}
                            >
                                Save
                            </Button>
                        )}
                        {mode == 'update' && (
                            <Button
                                type="submit"
                                className="Button"
                                variant="addbtn"
                                onClick={updateObj}
                                style={{ marginRight: '2%' }}
                            >
                                Update
                            </Button>
                        )}

                        <Button
                            variant="secondary"
                            className="Button"
                            style={{ marginRight: '2%' }}
                            onClick={handleClose}
                        >
                            {cancelButtonName}
                        </Button>
                    </div>
                </Modal>

                <Modal
                    show={deleteShow}
                    onHide={onDeleteCloseHandler}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton={onDeleteCloseHandler}>
                        <Modal.Title>Delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        Are you sure you want to delete this item?
                    </Modal.Body>

                    <div className="delbtn">
                        <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                            Yes
                        </Button>
                        <Button
                            className="Button"
                            variant="secondary"
                            onClick={onDeleteCloseHandler}
                        >
                            No
                        </Button>
                    </div>
                </Modal>
            </div>
        </>
    )
}

export default ClientManagers
