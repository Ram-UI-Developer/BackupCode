import Select from 'react-select'
import { useState } from 'react'
import { Button, Col, Form, Modal, Row, Tooltip } from 'react-bootstrap'
import Table from '../../../Common/Table/Table'
import { Tabs } from 'react-bootstrap'
import Tab from 'react-bootstrap/Tab'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import { useEffect } from 'react'
import { getAllByOrgId } from '../../../Common/Services/CommonService'
import { useSelector } from 'react-redux'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { toast } from 'react-toastify'
import {
    handleKeyPress,
} from '../../../Common/CommonComponents/FormControlValidation'

const Family = ({ familyList, setFamilyGet,countries }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Fetching user details from the Redux store using the `useSelector` hook
    // State hooks for managing the form's visibility, data, and country selection
    const [show, setShow] = useState('')
    const [visible, setVisible] = useState(false)
    const [formData, setFormData] = useState('')
    const [countryId, setCountryId] = useState()
    const [countryIsoCode, setCountryIsoCode] = useState()
    const [countryIsdCode, setCountryIsdCode] = useState()
    // Email validation regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Handles input change and performs validation on the fields
    const handleInputChange = (e) => {
        const { name, value } = e.target
        // Update form data state with the new input value
        setFormData({ ...formData, [name]: value })
        // Emergency contact validation
        if (name === 'emergencyContact') {
            if (!value) {
                setFormErrors({ ...formErrors, [name]: 'Required' })
                return
            }
            let value1 = '+' + countryIsdCode + value
            // Validate phone number based on the USA country code
            const phoneNumber = parsePhoneNumberFromString(value1, countryIsoCode)
            if (phoneNumber && phoneNumber.isValid()) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else {
                setFormErrors({ ...formErrors, [name]: 'Invalid phone number' })
            }
        }
        // Contact email validation
        else if (name == 'contactEmail') {
            if (value && !emailRegex.test(value)) {
                setFormErrors({ ...formErrors, [name]: 'Invalid email format' })
            } else {
                setFormErrors({ ...formErrors, [name]: '' })
            }
        }
    }
    const [data, setData] = useState(familyList) // Set initial data for the family list and trigger the function to fetch relations
    // Call the function to fetch the currency data when the component mounts
    useEffect(() => {
        setData(familyList)
        
    }, [familyList])


    const [familyEdit, setFamilyEdit] = useState({}) // State to manage family member data during editing
    const [index, setIndex] = useState(null) // State to store the index of the family member being edited
    // Function to handle showing the modal for adding or editing a family member
    const onShowHandler = (action, row, index) => {
        getAllFamilyRelations()
        // onGetCurrencyHandler()
        setIndex(index)
        if (action == 'create') {
            setVisible('create')
            setCountryId()
            setCountryIsoCode('')
            setShow(true)
            setFormData('')
            setRelation('')
        } else {
            const matchedCountry =
                countries && countries.find((country) => country.countryId === row.countryId)
            setFamilyEdit(row)
            setFormData(row)
            setCountryId(row.countryId)
            if (matchedCountry) {
                setCountryIsoCode(matchedCountry.isoCode + '+' + matchedCountry.isdCode)
                setCountryIsdCode(matchedCountry.isdCode)
            }
            setVisible('update')
            setRelation(row.relationId)
            setRelationName(row.relationName)
            setShow(true)
        }
    }
    // Map the countries data to an array of options for the dropdown/select field
    const countriesOptions = countries
        ? countries.map((option) => ({
            value: option.countryId,
            label: option.isoCode + '+' + option.isdCode,
            isdCode: option.isdCode
        }))
        : []

    console.log(countriesOptions, 'countriesOptions')
    // Function to handle country selection from the dropdown
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

    const [relation, setRelation] = useState() // State hook to manage the selected relation ID
    const [relationType, setRelationType] = useState([]) // State hook to store the available relation types fetched from the API
    // Function to fetch all family relations for the organization
    const getAllFamilyRelations = () => {
        getAllByOrgId({
            entity: 'familyrelations',
            organizationId: userDetails.organizationId
        }).then((res) => {
            if (res.statusCode == 200) {
                setRelationType(res.data)
            }
        })
            .catch((err) => {
                console.log(err, 'error') // Log any errors that occur during the API call
            })
    }
    // Map the fetched relation types to options for a dropdown/select field
    const relationOptions = relationType
        ? relationType.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : []
    const [relationName, setRelationName] = useState('') // State hook to manage the selected relation name
    // Function to handle the selection of a relation type
    const handleRelationSelection = (selection) => {
        setRelation(selection.value)
        setRelationName(selection.label)
    }

    const [formErrors, setFormErrors] = useState({}) // State hook to manage form validation errors
    // Function to validate form values
    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }
        if (values.relationId == '') {
            errors.relationId = 'Required'
        }
        if (!values.branch) {
            errors.branch = 'Required'
        }
        if (!values.occupation) {
            errors.occupation = 'Required'
        }
        if (!values.countryId) {
            errors.countryId = 'Required'
        }
        if (!values.emergencyContact) {
            errors.emergencyContact = 'Required'
        }
        // if (!values.contactEmail) {
        //   errors.contactEmail = "Required";
        // }
        return errors
    }
    // Function to handle adding a new family member
    const family = () => {
        // Create an object with the form data to represent the new family member
        const familyObj = {
            name: formData.name,
            occupation: formData.occupation,
            relationId: relation,
            relationName: relationName,
            emergencyContact: formData.emergencyContact,
            contactEmail: formData.contactEmail,
            countryId: formData.countryId,
            isdCode: countryIsdCode
        }
        let value = '+' + countryIsdCode + familyObj.emergencyContact
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)

        if (!familyObj.name) {
            setFormErrors(validate(familyObj))
        } else if (familyObj.relationId == '') {
            setFormErrors(validate(familyObj))
        } else if (!familyObj.countryId) {
            setFormErrors(validate(familyObj))
        } else if (!familyObj.emergencyContact) {
            setFormErrors(validate(familyObj))
        } else if (familyObj.emergencyContact.length <= 1) {
            toast.error('Invalid phone number')
        } else if (!phoneNumber.isValid()) {
            toast.error('Invalid phone number')
        } else if (familyObj.contactEmail != undefined && !emailRegex.test(formData.contactEmail)) {
            toast.error('Invalid email format')
        } else {
            // If all validations pass, add the new family member to the list
            const family = [...data, familyObj]
            setFamilyGet(family)
            setData(family)
            onCloseHandler()
        }
    }
    // Function to handle updating an existing family member
    const updateFamily = () => {
        // Create an object with the updated form data for the family member
        const updatefamilyObj = {
            id: familyEdit.id,
            city: formData.city ? formData.city : familyEdit.city,
            name: formData.name !== undefined ? formData.name : familyEdit.name,
            occupation: formData.occupation ? formData.occupation : familyEdit.occupation,
            relationId: relation ? relation : familyEdit.relationId,
            email: formData.email ? formData.email : familyEdit.email,
            contactPerson: formData.contactPerson
                ? formData.contactPerson
                : familyEdit.contactPerson,
            emergencyContact: formData.emergencyContact !== undefined
                ? formData.emergencyContact
                : familyEdit.emergencyContact,
            relationName: relationName,
            contactEmail: formData.contactEmail,
            countryId: countryId,
            isdCode: countryIsdCode && countryIsdCode.toString(),
            organizationId: familyEdit.organizationId
        }
        let value = '+' + countryIsdCode + updatefamilyObj.emergencyContact
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        if (!updatefamilyObj.name) {
            setFormErrors(prev => ({ ...prev, name: 'Required' }))
            return
        } else if (updatefamilyObj.relationId == '') {
            setFormErrors(validate(updatefamilyObj))
        } else if (!updatefamilyObj.countryId) {
            setFormErrors(validate(updatefamilyObj))
        } else if (!updatefamilyObj.emergencyContact) {
            setFormErrors(prev => ({ ...prev, emergencyContact: 'Required' }))
            return
        } else if (updatefamilyObj.emergencyContact.length <= 1) {
            toast.error('Invalid phone number')
        } else if (!phoneNumber.isValid()) {
            toast.error('Invalid phone number')
        }
        else if (updatefamilyObj.contactEmail != "" && !emailRegex.test(formData.contactEmail)) {
            toast.error('Invalid email format')
        }
        else {
            // If all validations pass, update the existing family member data
            const familyData = [...familyList]
            familyData[index] = updatefamilyObj
            setFamilyGet(familyData)
            onCloseHandler()
        }
    }

    // coloumns for family table
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
        // {
        //   Header: "Occupation",
        //   accessor: "occupation",
        // },

        {
            Header: 'Relation',
            accessor: 'relationName',
            Cell: ({ row }) => <span>{row.original.relationName}</span>
        },

        {
            Header: 'Contact Number',
            accessor: 'emergencyContact',
            Cell: ({ row }) => (
                <div className="tableData">
                    {'+' + row.original.isdCode + '-' + row.original.emergencyContact}
                </div>
            )
        },
        {
            Header: 'Email',
            accessor: 'contactEmail'
        },

        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            id="ExperienceeditButton"
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            id="ExperiencedeleteButton"
                            variant=""
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

    const [deleteShow, setDeleteShow] = useState(false) // State to control the visibility of the delete confirmation modal
    const [indexs, setIndexS] = useState() // State to hold the index of the family member to be deleted
    // Function to handle the removal of a family member
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndexS(index)
    }
    // Function to proceed with deleting the family member
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...data]
        rows.splice(indexs, 1)
        setFamilyGet(rows)
        setDeleteShow(false)
    }



    // Function to close the modal (either after creating, updating, or deleting)
    const onCloseHandler = () => {
        setFamilyEdit('')
        setShow(false)
        setFormErrors({})
        setDeleteShow(false)
    }
    return (
        <>
            <Tabs>
                <Tab eventKey="family">
                    <div className="card-body" style={{ marginTop: '1%' }}>
                        {/* <TableHeader tableTitle="Family" /> */}
                        <Button
                            id="ExperienceaddButton"
                            className="addButton"
                            variant="addbtn"
                            onClick={() => onShowHandler('create')}
                        >
                            <AddIcon />
                            {/* Displays the AddIcon component inside the button */}
                        </Button>
                        {/* Table component displays the data in a table format */}
                        {data ? (
                            <Table
                                columns={COLUMNS}
                                data={data}
                                serialNumber={true}
                                name={'family records'}
                            />
                        ) : (
                            <p className="emptyDataMessage">No family records added yet!</p>
                        )}
                    </div>
                </Tab>
            </Tabs>
            <Modal className="" show={show} onHide={onCloseHandler} size="xl">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Emergency Contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* input fields for family form */}
                    <div className="">
                        <form className="modalFormBody">
                            <Row>
                                <div className="col-5 mb-2">
                                    <Form.Group as={Row} className="mb-3" controlId="formBasicName">
                                        <Form.Label id="formBasicName" column sm={5}>
                                            Name <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="formBasicName"
                                                onChange={handleInputChange}
                                                // onKeyPress={(e) => handleKeyPress(e)}
                                                required
                                                maxLength={50}
                                                type="text"
                                                size="sm"
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            name: 'Required'
                                                        })
                                                        : setFormErrors({ ...formErrors, name: '' })
                                                }
                                                defaultValue={familyEdit && familyEdit.name}
                                                name="name"
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                            />
                                            {formErrors.name && (
                                                <p className="error">{formErrors.name}</p>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-7">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formBasicOccupation"
                                    >
                                        <Form.Label
                                            id="formBasicOccupation"
                                            column
                                            sm={4}
                                            style={{ paddingLeft: '3rem' }}
                                        >
                                            Occupation
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                id="formBasicOccupation"
                                                required
                                                maxLength={50}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                size="sm"
                                                defaultValue={familyEdit && familyEdit.occupation}
                                                onChange={handleInputChange}
                                                name="occupation"
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-5">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formBasicRelation"
                                    >
                                        <Form.Label id="formBasicRelation" column sm={5}>
                                            Relation <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                classNamePrefix="react-select-sm"
                                                id="formBasicRelation"
                                                placeholder=""
                                                size="sm"
                                                onChange={handleRelationSelection}
                                                options={relationOptions}
                                                required
                                                onBlur={() =>
                                                    !relation
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            relationId: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            relationId: ''
                                                        })
                                                }
                                                value={relationOptions.filter(
                                                    (e) => e.value == relation
                                                )}
                                                name="relationId"
                                            />
                                            <p className="error">{formErrors.relationId}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-7">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formBasicCountry"
                                    >
                                        <Form.Label
                                            id="formBasicCountry"
                                            column
                                            sm={4}
                                            style={{ paddingLeft: '3rem' }}
                                        >
                                            Contact Number <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={3}>
                                            <Select
                                                classNamePrefix="react-select-sm"
                                                id="formBasicCountry"
                                                value={countriesOptions.filter(
                                                    (e) =>
                                                        e.value == countryId &&
                                                        e.label == countryIsoCode
                                                )}
                                                size="sm"
                                                placeholder="Country"
                                                options={countriesOptions}
                                                onChange={handleCurrencySelection}
                                            />
                                            <p className="error">{formErrors.countryId}</p>
                                        </Col>
                                        <Col sm={4}>
                                            <Form.Control
                                                id="formBasicContact"
                                                onChange={handleInputChange}
                                                required
                                                size="sm"
                                                type="text"
                                                defaultValue={
                                                    familyEdit && familyEdit.emergencyContact
                                                }
                                                disabled={!countryId}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            emergencyContact: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            emergencyContact: ''
                                                        })
                                                }
                                                name="emergencyContact"
                                                maxLength={15}
                                                onInput={(e) => {
                                                    // Filter out non-numeric characters
                                                    e.target.value = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        ''
                                                    )
                                                }}
                                            />
                                            <p className="error">{formErrors.emergencyContact}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-5">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formBasicEmail"
                                    >
                                        <Form.Label id="formBasicEmail" column sm={5}>
                                            Contact Email
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="formBasicEmail"
                                                required
                                                size="sm"
                                                maxLength={100}
                                                defaultValue={familyEdit && familyEdit.contactEmail}
                                                name="contactEmail"
                                                type="email"
                                                onChange={handleInputChange}
                                            />
                                            <p className="error">{formErrors.contactEmail}</p>
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Modal.Body>
                {/* save and update buttons */}
                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    {visible == 'create' && (
                        <Button
                            id="experienceAdd"
                            variant="addbtn"
                            className="Button"
                            onClick={family}
                        > Add</Button>
                    )}
                    {visible == 'update' && (
                        <Button
                            id="experienceUpdate"
                            className="Button"
                            variant="addbtn"
                            onClick={updateFamily}
                        >
                            Update
                        </Button>
                    )}

                    <Button
                        id="experienceClose"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        Close
                    </Button>
                </div>
            </Modal>
            {/* delete modal popup */}
            <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        id="experienceDelete"
                        className="Button"
                        variant="addbtn"
                        onClick={proceedDeleteHandler}
                    >
                        Yes
                    </Button>
                    <Button
                        id="experienceNo"
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
export default Family
