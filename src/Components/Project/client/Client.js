import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import validator from 'validator'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    compareArrayOfObjects,
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { save, update } from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import ClientManagers from './ClientManagers'

// Main functional component for adding/updating a client
const Client = () => {
    const entity = 'projectclients'

    const navigate = useNavigate()
    const location = useLocation()

    // Initial form values
    const initialValues = {
        id: '',
        name: '',
        email: '',
        locationName: '',
        organizationId: '',
        deleted: false
    }

    // Fetch user details from Redux
    const userDetails = useSelector((state) => state.user.userDetails)

    // State hooks
    const [loading, setLoading] = useState(false) // Loading state for API calls
    const [formData, setFormData] = useState(initialValues) // Form data state
    const [formErrors, setFormErrors] = useState({}) // Form validation errors state
    const [mode, setMode] = useState('') // Mode (create/edit)
    const [selectedId, setSelectedId] = useState('') // Selected client ID
    const [managerList, setManagerList] = useState(
        location.state.id != null ? location.state.resourceList : []
    ) // List of managers associated with the client
    const [client, setClient] = useState(location.state.data ? location.state.data : null) // Client data for editing
    const [change, setChange] = useState(true) // State to trigger re-rendering

    // Save new client
    const saveClient = (e) => {
        e.preventDefault() // Prevent default form submission
        const obj = {
            name: formData.name,
            email: formData.email,
            locationName: formData.locationName,
            organizationId: userDetails.organizationId,
            deleted: false,
            resourceDTOs: managerList
        }
        // Validation
        if (!obj.name) {
            setFormErrors(validateForm(formData))
        } else if (!obj.email) {
            setFormErrors(validateForm(formData))
        } else if (!validator.isEmail(obj.email)) {
            setFormErrors(validateForm(formData))
        } else if (!obj.locationName) {
            setFormErrors(validateForm(formData))
        } else {
            setLoading(true)
            save({
                entity: entity,
                organizationId: userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({ screen: 'Client', operationType: 'save' }),
                screenName: 'Client'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        setLoading(false)
                        navigate('/clientList')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Update existing client
    const updateClient = () => {
        const obj = {
            id: selectedId,
            name: formData.name,
            email: formData.email,
            locationName: formData.locationName,
            organizationId: userDetails.organizationId,
            deleted: false,
            resourceDTOs: managerList
        }

        if (
            updateValidation(client, formData) &&
            change &&
            compareArrayOfObjects(formData.resourceDTOs, managerList)
        ) {
            toast.info('No changes made to update')
        } else if (!obj.name) {
            setFormErrors(validateForm(formData))
        } else if (!obj.email) {
            setFormErrors(validateForm(formData))
        } else if (!validator.isEmail(obj.email)) {
            setFormErrors(validateForm(formData))
        } else if (!obj.locationName) {
            setFormErrors(validateForm(formData))
        } else {
            setLoading(true)
            update({
                entity: entity,
                organizationId: userDetails.organizationId,
                id: selectedId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Client',
                    operationType: 'update'
                }),
                screenName: 'Client'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        setLoading(false)
                        navigate('/clientList')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Load existing data if in edit mode
    useEffect(() => {
        if (location.state && location.state.id == null) {
            setMode('create')
        } else {
            setMode('edit')
            setSelectedId(location.state && location.state.data.id)
            setFormData(location.state && location.state.data)
            setClient(location.state && location.state.data)
        }
    }, [])

    // Handle form field changes
    const onInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value.trimStart().replace(/\s+/g, ' ')
        })

        // Real-time validation
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    // Basic form validation logic
    const validateForm = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.email) {
            errors.email = 'Required'
        } else if (!validator.isEmail(values.email)) {
            errors.email = 'Enter Valid Email'
        }
        if (!values.locationName) {
            errors.locationName = 'Required'
        }
        return errors
    }

    // validate email format
    const validateEmail = (e) => {
        const email = e.target.value
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

        if (!email) {
            setFormErrors((prev) => ({ ...prev, email: 'Required' }))
        } else if (!emailRegex.test(email)) {
            setFormErrors((prev) => ({ ...prev, email: 'Invalid email format' }))
        } else {
            setFormErrors((prev) => ({ ...prev, email: '' }))
        }
    }

    return (
        <>
            {location.state ? (
                <div>
                    <section className="section detailBackground">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="">
                                        <PageHeader
                                            pageTitle={
                                                mode == 'create' ? 'Add Client' : 'Update Client'
                                            }
                                        />
                                        {loading ? <DetailLoader /> : ''}
                                        <div
                                            className="center"
                                            style={{ paddingLeft: '10%', paddingRight: '10%' }}
                                        >
                                            <form
                                                className="card-body"
                                                onSubmit={(e) => saveClient(e)}
                                            >
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Name{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                               
                                                                type="text"
                                                                name="name"
                                                                maxLength={50}
                                                                defaultValue={
                                                                    location.state.data
                                                                        ? location.state.data.name
                                                                        : ''
                                                                }
                                                                onChange={onInputChange}
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              name: 'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              name: ''
                                                                          })
                                                                }
                                                                value={formData.name}
                                                                onKeyPress={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onPaste={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onInput={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                            />
                                                            {formErrors.name && (
                                                                <p className="error">
                                                                    {formErrors.name}
                                                                </p>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Email{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                
                                                                type="email"
                                                                name="email"
                                                                maxLength={50}
                                                                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                                                defaultValue={
                                                                    location.state.data
                                                                        ? location.state.data.email
                                                                        : ''
                                                                }
                                                                onChange={onInputChange}
                                                                onBlur={validateEmail}
                                                                value={formData.email}
                                                            />
                                                            {formErrors && formErrors.email ? (
                                                                <p className="error">
                                                                    {formErrors.email}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Location Name{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                
                                                                type="text"
                                                                maxLength={50}
                                                                // onKeyPress={(e) => handleKeyPress(e)}
                                                                name="locationName"
                                                                defaultValue={
                                                                    location.state.data
                                                                        ? location.state.data
                                                                              .locationName
                                                                        : ''
                                                                }
                                                                onChange={onInputChange}
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              locationName:
                                                                                  'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              locationName: ''
                                                                          })
                                                                }
                                                                value={formData.locationName}
                                                                onKeyPress={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onPaste={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onInput={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                            />
                                                            {formErrors.locationName && (
                                                                <p className="error">
                                                                    {formErrors.locationName}
                                                                </p>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="mb-4">
                                                    <ClientManagers
                                                        clientId={selectedId}
                                                        managerList={managerList}
                                                        setManagerList={setManagerList}
                                                        setChange={setChange}
                                                    />
                                                </div>
                                                <div className="btnCenter mb-3">
                                                    {/* <div style={{ marginLeft: "40%", display: "flex" }}> */}
                                                    {mode == 'create' && (
                                                        <Button
                                                            type="submit"
                                                            variant="addbtn"
                                                            className="Button"
                                                            style={{ marginRight: '2%' }}
                                                        >
                                                            Save
                                                        </Button>
                                                    )}
                                                    {mode == 'edit' && (
                                                        <Button
                                                            type="button"
                                                            variant="addbtn"
                                                            className="Button"
                                                            onClick={() => updateClient()}
                                                            style={{ marginRight: '2%' }}
                                                        >
                                                            Update
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="secondary"
                                                        type="button"
                                                        className="Button"
                                                        onClick={() => navigate('/clientList')}
                                                        style={{ marginRight: '2%' }}
                                                    >
                                                        {cancelButtonName}
                                                    </Button>
                                                    {/* </div> */}
                                                </div>
                                            </form>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <section className="section">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className=" card-primary">
                                    <div style={{ marginTop: '25%' }}>
                                        <center>
                                            <h3>{'You are not Authorized to access this Page'}</h3>
                                        </center>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}

export default Client
