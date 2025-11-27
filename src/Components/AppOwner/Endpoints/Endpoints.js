import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    appownerDeleteById,
    getAll,
    getByIdwithOutOrg,
    saveWithoutOrg,
    updateWithoutOrg
} from '../../../Common/Services/CommonService'
import Table1 from '../../../Common/Table/Table1'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const Endpoints = () => {
    const [data, setData] = useState([]) // store all end points
    const [view, setView] = useState(false) // Toggle form modal
    const [formErrors, setFormErrors] = useState({}) // Form validatin errors
    const [loading, setLoading] = useState(true) // Page or modal loading state
    const [mode, setMode] = useState('') // create or update
    const [formData, setFormData] = useState('') // Data bound to form fields
    const [show, setShow] = useState(false) // Toggle delete confirmation modal
    const [selectedId, setSelectedId] = useState('') // ID to delete
    const [endPoint, setEndPoint] = useState({}) // Store getById data for update

    // Open modal in create or update mode
    const handleAdd = (m, e) => {
        setFormErrors('')
        if (m == 'create') {
            setView(true)
            setFormData('')
        } else {
            setLoading(true)
            getByIdEndpoints(e.id)
        }
        setMode(m)
    }
    // Close modal and reset form
    const handleClose = () => {
        setView(false)
        setFormData('')
    }

    // Called on component mount to fetch all endpoints
    useEffect(() => {
        getAllEndpoints()
    }, [])
    // Fetch all endpoint data
    const getAllEndpoints = () => {
        getAll({ entity: 'endpoints' }).then((res) => {
            setData(res.data ? res.data : [])
            setLoading(false)
        })
        .catch(() => {
            setLoading(false)
        })
    }

    // Input field change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // Fetch a single endpoint by ID for editing
    const getByIdEndpoints = (id) => {
        setLoading(true)
        getByIdwithOutOrg({ entity: 'endpoints', id: id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setView(true)
                    setLoading(false)
                    setFormData(res.data ? res.data : {})
                    setEndPoint(res.data ? res.data : {})
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Basic form validation
    const validate = (values) => {
        const errors = {}
        if (!values.controllerName) {
            errors.controllerName = 'Required'
        }
        if (!values.methodName) {
            errors.methodName = 'Required'
        }
        if (!values.url) {
            errors.url = 'Required'
        }
        return errors
    }

    const getPayload = () => ({
        id: formData.id,
        controllerName: formData.controllerName,
        methodName: formData.methodName,
        url: formData.url,
        description: formData.description
    })
    // Save new endpoint
    const onSaveHandler = () => {
        const obj = getPayload()
        if (!formData.controllerName || formData.controllerName == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.methodName || formData.methodName == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.url || formData.url == undefined) {
            setFormErrors(validate(formData))
        } else {
            setLoading(true)
            saveWithoutOrg({ entity: 'endpoints', body: obj })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        getAllEndpoints()
                        setView(false)
                        setFormData({})
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Update existing endpoint
    const onUpdateHandler = () => {
        const obj = getPayload()
        // Check if the form data has changed
        if (updateValidation(endPoint, formData)) {
            toast.info('No changes made to update.')
        } else if (!formData.controllerName || formData.controllerName == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.methodName || formData.methodName == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.url || formData.url == undefined) {
            setFormErrors(validate(formData))
        } else {
            setLoading(true)
            updateWithoutOrg({ entity: 'endpoints', body: obj, id: formData.id })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        getAllEndpoints()
                        setView(false)
                        setFormData({})
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Open confirmation modal for deletion
    const handleDelete = (e) => {
        setShow(true)
        setSelectedId(e)
    }

    // Close confirmation modal
    const onCloseHandler = () => {
        setShow(false)
    }

    // Confirm delete action
    const proceedDeleteHandler = () => {
        setLoading(true)
        appownerDeleteById({ entity: 'endpoints', id: selectedId })
            .then((res) => {
                if (res.statusCode == 200) {
                    ToastSuccess(res.message)
                    getAllEndpoints()
                    onCloseHandler()
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                ToastError(err.message)
            })
    }

    // Table column definitions
    const COLUMNS = [
        {
            Header: 'Controller',
            accessor: 'controllerName'
        },
        {
            Header: 'Method Name',
            accessor: 'methodName'
        },
        {
            Header: 'Url',
            accessor: 'url'
        },
        {
            Header: 'Description',
            accessor: 'description'
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
                            onClick={() => handleAdd('update', row.original)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        {
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                onClick={() => handleDelete(row.original.id)}
                            >
                                <DeleteIcon />
                            </Button>
                        }
                    </div>
                </>
            )
        }
    ]

    const LoadingIndicator = loading ? <DetailLoader /> : null

    return (
        <div>
            {/* Loader while data is being fetched */}
            {LoadingIndicator}
            {/* Page Content */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="  ">
                                <PageHeader pageTitle="Endpoints" />
                                <div className="table">
                                    <Button
                                        className="addButton "
                                        variant="addbtn"
                                        onClick={() => handleAdd('create')}
                                    >
                                        <AddIcon />
                                    </Button>

                                    <Table1 key={data.length} data={data} columns={COLUMNS} serialNumber={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Add / Edit Modal */}
            <Modal show={view} size="lg" onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {mode == 'create' ? 'Add Endpoint' : 'Update Endpoint'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {LoadingIndicator}
                    <div className="container-fluid">
                        <div className="row ">
                            <div className="">
                                <form>
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-4 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Controller <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    defaultValue={formData.controllerName}
                                                    name="controllerName"
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputChange}
                                                    onKeyPress={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    onPaste={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    onInput={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    maxLength={50}
                                                />
                                                {formErrors.controllerName && (
                                                    <p className="error">
                                                        {formErrors.controllerName}
                                                    </p>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-2 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Method Name <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    onKeyPress={(e) => handleKeyPress(e)}
                                                    onChange={handleInputChange}
                                                    defaultValue={formData.methodName}
                                                    name="methodName"
                                                    onBlur={handleInputChange}
                                                    maxLength={50}
                                                />
                                                <p className="error">{formErrors.methodName}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-2 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Url <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    onChange={handleInputChange}
                                                    defaultValue={formData.url}
                                                    name="url"
                                                    onBlur={handleInputChange}
                                                    maxLength={250}
                                                />
                                                <p className="error">{formErrors.url}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-4 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Description
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    onChange={handleInputChange}
                                                    defaultValue={formData.description}
                                                    name="description"
                                                    maxLength={250}
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
                                                {formErrors.description && (
                                                    <p className="error">
                                                        {formErrors.description}
                                                    </p>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <div className="btnCenter mb-3">
                    {mode == 'create' ? (
                        <Button className="Button" variant="addbtn" onClick={onSaveHandler}>
                            Save
                        </Button>
                    ) : (
                        <Button className="Button" variant="addbtn" onClick={onUpdateHandler}>
                            Update
                        </Button>
                    )}
                    <Button className="Button" variant="secondary" onClick={handleClose}>
                        {cancelButtonName}
                    </Button>
                </div>
            </Modal>
            <div>
                {/* Delete Confirmation Modal */}
                <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                    <Modal.Header className="modalHeader" closeButton>
                        <Modal.Title>Delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        {LoadingIndicator}
                        Are you sure you want to delete this item?
                    </Modal.Body>
                    <div className="delbtn">
                        <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                            Yes
                        </Button>
                        <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                            No
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
export default Endpoints
