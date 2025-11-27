import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row, Tabs, Tooltip } from 'react-bootstrap'
import Tab from 'react-bootstrap/Tab'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { handleKeyPress } from '../../../Common/CommonComponents/FormControlValidation'
import ValidateZipCode from '../../../Common/CommonComponents/ValidateZipCode'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import { getAllByOrgId, getById } from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'
const Address = ({ setAddressGet, addressList }) => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [show, setShow] = useState(false)
    const [visible, setVisible] = useState(false)
    const [formData, setFormData] = useState({})

    // Columns for Address Table
    const COLUMNS = [
        {
            Header: 'Address Type',
            accessor: 'addressType'
        },
        {
            Header: 'Address',
            accessor: 'address1',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.address1} open>
                            {row.original.address1}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.address1}</div>
                </>
            )
            // Cell: ({ row }) => (
            //   <div className="tableData">{row.original.address1}</div>
            // ),
        },
        {
            Header: 'City',
            accessor: 'city',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.city} open>
                            {row.original.city}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.city}</div>
                </>
            )
        },
        {
            Header: 'State',
            accessor: 'stateName'
            // Cell: ({ row }) => (
            //   <span>{row.original.stateName ? row.original.stateName : stateN}</span>
            // ),
        },
        {
            Header: 'Country',
            accessor: 'countryName'
            // Cell: ({ row }) => (
            //   <span>
            //     {row.original.countryName ? row.original.countryName : countryN}
            //   </span>
            // ),
        },
        {
            Header: 'Zipcode',
            accessor: 'zipCode'
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
                            variant=""
                            id="editAddress"
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            variant=""
                            id="deleteAddress"
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

    // delete modal  state
    const [deleteShow, setDeleteShow] = useState(false)
    // using this state get index of row
    const [indexs, setIndexS] = useState()

    // handleShow function
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndexS(index)
    }

    // delete functionality for row
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...data]
        rows.splice(indexs, 1)
        setAddressGet(rows)
        setDeleteShow(false)
    }

    // onInputHandler
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name == 'zipCode') {
            const validationResult = ValidateZipCode(countries, countryId, value)
            if (validationResult.isValid) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else {
                setFormErrors({ ...formErrors, [name]: validationResult.error })
            }
        }
    }

    // useEffect for data rendering
    useEffect(() => {
        setData(addressList)
    }, [addressList])

    // countries get
    const [countries, setCountries] = useState([])
    const onGetCountriesHandler = () => {
        getAllByOrgId({
            entity: 'organizationCountry',
            organizationId: userDetails.organizationId
        }).then((res) => {
            if (res.statusCode == 200) {
                const filteredCountries = res.data.filter((country) => !country.deleted)
                setCountries(filteredCountries)
            }
        })
            .catch((error) => {
                console.log(error)
            })
    }

    // countries options and separate the value and label
    const countriesOptions = countries
        ? countries.map((option) => ({
            value: option.countryId,
            label: option.name + '(' + option.isoCode + ')'
        }))
        : []

    // country changehandler
    const [countryId, setCountryId] = useState('')
    const [countryName, setCountryName] = useState('')
    const onCountryChangeHandler = (option) => {
        setCountryId(option.value)
        setCountryName(option.label)
        onGetStateHandler(option.value)
    }

    // get states by countryId id
    const [stateId, setStateId] = useState('')
    const [stateName, setStateName] = useState('')
    const [states, setStates] = useState([])
    const onGetStateHandler = (countryId) => {
        getById({ entity: 'countries', organizationId: 0, id: countryId }).then((res) => {
            if (res.statusCode == 200) {
                setStates(res.data.stateDTOs)
            }
        })
            .catch((error) => {
                console.log(error)
            })
    }

    // state options
    const stateOptions =
        states && states.length !== 0
            ? states.map((option) => ({
                value: option.id,
                label: option.name
            }))
            : []

    // state selection handler
    const handleStateSelection = (option) => {
        setStateId(option.value)
        setStateName(option.label)
    }

    // state using for data for table
    const [data, setData] = useState(addressList)

    // validation errors for objcet mandatory feilds
    const [formErrors, setFormErrors] = useState({})
    const validate = (values) => {
        const errors = {}

        if (!values.address1) {
            errors.address1 = 'Required'
        }
        if (values.addressType == '') {
            errors.addressType = 'Required'
        }
        if (!values.city) {
            errors.city = 'Required'
        }
        if (!values.stateId) {
            errors.state = 'Required'
        }
        if (!values.countryId) {
            errors.country = 'Required'
        }
        if (!values.zipCode) {
            errors.zipCode = 'Required'
        }
        return errors
    }

    // add object to list with out using api
    const address = () => {
        const addressObj = {
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            zipCode: formData.zipCode,
            stateId: stateId,
            stateName: stateName,
            countryId: countryId,
            countryName: countryName,
            addressType: addressType
        }
        const validationResult = ValidateZipCode(countries, countryId, addressObj.zipCode)
        if (!addressObj.addressType == '') {
            setFormErrors(validate(addressObj))
        }
        if (!addressObj.address1) {
            setFormErrors(validate(addressObj))
        } else if (!addressObj.city) {
            setFormErrors(validate(addressObj))
        } else if (!addressObj.stateId) {
            setFormErrors(validate(addressObj))
        } else if (!addressObj.countryId) {
            setFormErrors(validate(addressObj))
        } else if (!addressObj.zipCode) {
            setFormErrors(validate(addressObj))
        } else if (!validationResult.isValid) {
            setFormErrors({ ...formErrors, ['zipCode']: validationResult.error })
            toast.error(validationResult.error)
        } else {
            const addressData = [...data, addressObj]
            setAddressGet(addressData)
            setData(addressData)
            onCloseHandler()
        }
    }

    // update or add object to list with out using api
    const updateAddress = () => {
        const updateAddressObj = {
            id: formData.id,
            email: formData.email ? formData.email : formData.email,
            address1: formData.address1,
            address2: formData.address2 ? formData.address2 : formData.address2,
            city: formData.city ? formData.city : formData.city,
            stateId: stateId ? stateId : formData.stateId,
            stateName: stateName ? stateName : formData.stateName,
            countryId: countryId ? countryId : formData.countryId,
            countryName: countryName ? countryName : formData.countryName,
            addressType: addressType ? addressType : formData.addressType,
            zipCode: formData.zipCode ? formData.zipCode : formData.zipCode,
            name: formData.name ? formData.name : formData.name,
            organizationId: formData.organizationId
                ? formData.organizationId
                : userDetails.organizationId
        }
        console.log(updateAddressObj, 'updateAddressObj')
        const validationResult = ValidateZipCode(countries, countryId, updateAddressObj.zipCode)
        if (!updateAddressObj.addressType == '') {
            setFormErrors(validate(updateAddressObj))
        }
        if (!updateAddressObj.address1) {
            setFormErrors({ ...formErrors, address1: 'Required' })
            return
        }
        if (!updateAddressObj.city) {
            setFormErrors(validate(updateAddressObj))
        } else if (!updateAddressObj.stateId) {
            setFormErrors(validate(updateAddressObj))
        } else if (!updateAddressObj.countryId) {
            setFormErrors(validate(updateAddressObj))
        } else if (!updateAddressObj.zipCode) {
            setFormErrors(validate(updateAddressObj))
        } else if (!validationResult.isValid) {
            setFormErrors({ ...formErrors, ['zipCode']: validationResult.error })
            toast.error(validationResult.error)
        } else {
            const addressData = [...addressList]
            addressData[index] = updateAddressObj
            setAddressGet(addressData)
            onCloseHandler()
        }
    }

    // state using for address type
    const [addressType, setAddresType] = useState('')
    // using this state get row index from row
    const [index, setIndex] = useState(null)
    // address type selection handler
    const handleTypeSelection = (selection) => {
        setAddresType(selection.value)
    }

    // address type options
    const addressSelection = [
        { label: 'Permanent', value: 'Permanent' },
        { label: 'Present', value: 'Present' }
    ]

    // this state using for store edit data
    // show modal popup functionality
    const onShowHandler = (action, row, index) => {
        onGetCountriesHandler()
        setIndex(index)
        if (action == 'create') {
            setVisible('create')
            setShow(true)
            setFormData('')
            setAddresType('')
            setCountryId('')
            setStateId('')
            setStates([])
            setCountryName('')
            setStateName('')
        } else {
            setFormData(row)
            setCountryId(row.countryId)
            setCountryName(row.countryName)
            setStateId(row.stateId)
            setStateName(row.stateName)
            onGetStateHandler(row.countryId)
            setVisible('update')
            setAddresType(row.addressType)
            setShow(true)
        }
    }

    // modal closeing functionality
    const onCloseHandler = () => {
        setShow(false)
        setFormData({})
        setFormErrors('')
        setDeleteShow(false)
    }

    console.log(formData, 'chekingAllTYpes')
    const addressTypes = addressList.map((e) => e.addressType)
    const isDisabled = addressTypes.includes('Permanent') && addressTypes.includes('Present')
    return (
        <>
            {/* Table for address  */}
            <Tabs>
                <Tab eventKey="address">
                    <div className="card-body" style={{ marginTop: '1%' }}>
                        <div>
                            {/* <TableHeader tableTitle="Address" /> */}
                            {isDisabled ? (
                                ''
                            ) : (
                                <Button
                                    id="AddAddress"
                                    className="addButton"
                                    variant="addbtn"
                                    onClick={() => onShowHandler('create')}
                                >
                                    <AddIcon />
                                </Button>
                            )}
                            {data ? (
                                <Table
                                    columns={COLUMNS}
                                    data={data}
                                    serialNumber={true}
                                    name={'address records'}
                                />
                            ) : (
                                <p className="emptyDataMessage">No address records added yet!</p>
                            )}
                        </div>
                    </div>
                </Tab>
            </Tabs>
            {/* modal popup for all input feilds */}
            <Modal className="" show={show} onHide={onCloseHandler} size="lg">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Address</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <form className="modalFormBody">
                            <Row>
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-2" controlId="addressType">
                                        <Form.Label id="addressType" column sm={4}>
                                            Type <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Select
                                                id="addressType"

                                                size="sm"
                                                placeholder=""
                                                value={addressSelection.filter(
                                                    (e) => e.value == addressType
                                                )}
                                                onChange={handleTypeSelection}
                                                onBlur={() =>
                                                    !addressType
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            addressType: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            addressType: ''
                                                        })
                                                }
                                                options={addressSelection}
                                            />
                                            <p className="error">{formErrors.addressType}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-2" controlId="country">
                                        <Form.Label id="country" column sm={4}>
                                            Country <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Select
                                                id="country"
                                                placeholder=""
                                                size="sm"
                                                // name='country'
                                                onBlur={() =>
                                                    !countryId
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            country: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            country: ''
                                                        })
                                                }
                                                value={countriesOptions.filter(
                                                    (option) => option.value == countryId
                                                )}
                                                onChange={onCountryChangeHandler}
                                                options={countriesOptions}
                                            />
                                            <p className="error">{formErrors.country}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-" controlId="address1">
                                        <Form.Label id="address1" column sm={4}>
                                            Line 1 <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                id="address1"
                                                onChange={handleInputChange}
                                                type="text"
                                                as='textarea'
                                                size="sm"
                                                maxLength={150}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            address1: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            address1: ''
                                                        })
                                                }
                                                defaultValue={formData && formData.address1}
                                                name="address1"
                                            />
                                            <p className="error">{formErrors.address1}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-" controlId="address2">
                                        <Form.Label id="address2" column sm={4}>
                                            Line 2
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                id="address2"
                                                onChange={handleInputChange}
                                                as="textArea"
                                                type="text"
                                                size="sm"
                                                maxLength={150}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            address2: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            address2: ''
                                                        })
                                                }
                                                defaultValue={formData && formData.address2}
                                                name="address2"
                                            />
                                            <p className="error"></p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-2" controlId="city">
                                        <Form.Label id="city" column sm={4}>
                                            City <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                id="city"
                                                onChange={handleInputChange}

                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                size="sm"
                                                type="text"
                                                maxLength={50}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            city: 'Required'
                                                        })
                                                        : setFormErrors({ ...formErrors, city: '' })
                                                }
                                                defaultValue={formData && formData.city}
                                                name="city"
                                            />
                                            <p className="error">{formErrors.city}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-2" controlId="state">
                                        <Form.Label id="state" column sm={4}>
                                            State <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Select
                                                id="state"
                                                placeholder=""
                                                options={stateOptions}
                                                onChange={handleStateSelection}
                                                value={stateOptions.filter(
                                                    (option) => option.value == stateId
                                                )}

                                                size="sm"
                                                onBlur={() =>
                                                    !stateId
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            state: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            state: ''
                                                        })
                                                }
                                            // defaultValue={formData && formData.state}
                                            // name="state"
                                            />
                                            <p className="error">{formErrors.state}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-2" id="zipCode">
                                        <Form.Label id="zipCode" column sm={4}>
                                            Zipcode <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                id="zipCode"

                                                size="sm"
                                                name="zipCode"
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            zipCode: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            zipCode: ''
                                                        })
                                                }
                                                defaultValue={formData && formData.zipCode}
                                                onChange={handleInputChange}
                                                maxLength={10}
                                            />
                                            <p className="error">{formErrors.zipCode}</p>
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Modal.Body>
                {/* <Modal.Footer> */}
                <div className="btnCenter mb-3">
                    {visible == 'create' && (
                        <Button
                            variant="addbtn"
                            id="addAddress"
                            className="Button"
                            onClick={address}
                        >
                            Add
                        </Button>
                    )}
                    {visible == 'update' && (
                        <Button
                            variant="addbtn"
                            id="updateAddress"
                            className="Button"
                            onClick={updateAddress}
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                        id="closeAddress"
                    >
                        Close
                    </Button>
                </div>
                {/* </Modal.Footer> */}
            </Modal>
            {/* delete Modal popup */}
            <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>

                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    <Button
                        id="proceedDelete"
                        className="Button"
                        variant="addbtn"
                        onClick={proceedDeleteHandler}
                    >
                        Yes
                    </Button>
                    <Button
                        id="cancelDelete"
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
export default Address
