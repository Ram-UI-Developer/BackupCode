import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import PageHeader from '../../../../Common/CommonComponents/PageHeader'
import { AddIcon, DeleteIcon, EditIcon } from '../../../../Common/CommonIcons/CommonIcons'
import Table1 from '../../../../Common/Table/Table1'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    handleKeyPress,
    updateValidation
} from '../../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../../Common/CommonComponents/Loaders/DetailLoader'
import { ToastError, ToastSuccess } from '../../../../Common/CommonComponents/ToastCustomized'
import {
    deleteById,
    getAllByOrgId,
    getById,
    save,
    update
} from '../../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../../Common/Utilities/Constants'

const CurrencyList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const [data, setData] = useState([]) //state for setting data
    const [view, setView] = useState(false) //state for showing modal pop ups
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [loading, setLoading] = useState(false) //state for displaying loader
    const [mode, setMode] = useState('') //state for setting mode for viewing
    const [currencyData, setCurrencyData] = useState([])
    const handleAdd = (mode, e) => {
        setFormErrors('')
        if (mode == 'create') {
            setView(true)
            setFormData('')
        } else {
            setLoading(true)

            onGetByIdHandler(e.id)
        }
        setMode(mode)
    }

    const handleClose = () => {
        setView(false)
        setFormData('')
    }

    useEffect(() => {
        getAllHandler()
    }, [])

    //api handling for getAll api
    const getAllHandler = () => {
        setLoading(true)
        getAllByOrgId({
            entity: 'currencies',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    setData(res.data ? res.data : [])
                    setLoading(false)
                },
                () => {}
            )
            .catch(() => {})
    }

    const [formData, setFormData] = useState('')
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    //api handling for get by id
    const onGetByIdHandler = (id) => {
        setLoading(true)
        getById({
            entity: 'currencies',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: id
        })
            .then(
                (res) => {
                    setView(true)
                    setLoading(false)
                    setFormData(res.data ? res.data : [])
                    setCurrencyData(res.data ? res.data : [])
                },
                () => {}
            )
            .catch(() => {})
    }

    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.currencyCode) {
            errors.currencyCode = 'Required'
        }
        if (!values.currencySymbol) {
            errors.currencySymbol = 'Required'
        }

        return errors
    }

    //api handling for currency save object along with validation
    const onSaveHandler = () => {
        const obj = {
            id: formData.id,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name,
            currencyCode: formData.currencyCode,
            currencySymbol: formData.currencySymbol,
            description: formData.description
        }

        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.currencyCode || formData.currencyCode == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.currencySymbol || formData.currencySymbol == undefined) {
            setFormErrors(validate(formData))
        } else {
            setLoading(true)
            save({
                entity: 'currencies',
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Currency',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        setFormData({})
                        getAllHandler()
                        setView(false)
                        setFormData({})
                        ToastSuccess(res.message)
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    //api handling for currency save object along with validation
    const onUpdateHandler = () => {
        const obj = {
            id: formData.id,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name,
            currencyCode: formData.currencyCode,
            currencySymbol: formData.currencySymbol,
            description: formData.description
        }

        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.currencyCode || formData.currencyCode == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.currencySymbol || formData.currencySymbol == undefined) {
            setFormErrors(validate(formData))
        } else if (updateValidation(currencyData, formData)) {
            toast.info('No changes made to update')
            setLoading(false)
        } else {
            setLoading(true)
            update({
                entity: 'currencies',
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                id: formData.id,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Currency',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        getAllHandler()
                        setView(false)
                        setFormData({})
                        ToastSuccess(res.message)
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    const [show, setShow] = useState(false)
    const [selectedId, setSelectedId] = useState('')

    const handleDelete = (e) => {
        setShow(true)
        setSelectedId(e)
    }

    const onCloseHandler = () => {
        setShow(false)
        setView(false)
    }

    //api handling for deleting handling object
    const proceedDeleteHandler = () => {
        setLoading(true)
        deleteById({
            entity: 'currencies',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: selectedId
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                toast.success('Record deleted successfully.')
                getAllHandler()
                onCloseHandler()
            } else {
                toast.error(res.errorMessage)
                 setLoading(false)
            }
        })
         .catch((err) => {
        toast.error(err.message)
        setLoading(false)
    })
    }

    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name'
        },
        {
            Header: 'Currency Code',
            accessor: 'currencyCode'
        },
        {
            Header: 'Currency Symbol',
            accessor: 'currencySymbol'
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

    return (
        <div>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="  ">
                                <PageHeader pageTitle="Currencies" />
                                <div className="table">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => handleAdd('create')}
                                    >
                                        <AddIcon />
                                    </Button>

                                    <>
                                        <Table1
                                            key={data.length}
                                            columns={COLUMNS}
                                            data={data}
                                            serialNumber={true}
                                            pageSize="10"
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Modal show={view && !loading} size="lg" onHide={handleClose}>
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>
                        {mode == 'create' ? 'Add Currency' : 'Update Currency'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading && mode != 'create' ? <DetailLoader /> : ''}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="">
                                <form>
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Name <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    defaultValue={formData.name}
                                                    name="name"
                                                    maxLength={50}
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
                                        <Form.Group
                                            as={Row}
                                            className="mb-3 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Currency Code <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    defaultValue={formData.currencyCode}
                                                    name="currencyCode"
                                                    maxLength={50}
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
                                                />
                                                {formErrors.currencyCode && (
                                                    <p className="error">
                                                        {formErrors.currencyCode}
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
                                                Currency Symbol <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    defaultValue={formData.currencySymbol}
                                                    name="currencySymbol"
                                                    maxLength={50}
                                                    onChange={(e) => {
                                                        handleInputChange(e)
                                                        if (e.target.value) {
                                                            setFormErrors({
                                                                ...formErrors,
                                                                currencySymbol: ''
                                                            })
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        handleInputChange(e)
                                                        if (!e.target.value) {
                                                            setFormErrors({
                                                                ...formErrors,
                                                                currencySymbol: 'Required'
                                                            })
                                                        } else {
                                                            setFormErrors({
                                                                ...formErrors,
                                                                currencySymbol: ''
                                                            })
                                                        }
                                                    }}
                                                />
                                                <p className="error">{formErrors.currencySymbol}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-5 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Description
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    defaultValue={formData.description}
                                                    name="description"
                                                    maxLength={255}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputChange}
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

                <div className="btnCenter mb-4">
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
                <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                    <Modal.Header className="modalHeader" closeButton={onCloseHandler}>
                        <Modal.Title>Delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        {loading ? <DetailLoader /> : ''}
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
export default CurrencyList
