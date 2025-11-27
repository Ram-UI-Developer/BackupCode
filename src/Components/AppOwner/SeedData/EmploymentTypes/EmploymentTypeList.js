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
const EmploymentTypeList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const [data, setData] = useState([]) //state for setting data
    const [view, setView] = useState(false) //state for showing modal pop ups
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [loading, setLoading] = useState(false) //state for displaying loader
    const [mode, setMode] = useState('') //state for setting mode for viewing
    const [employmentData, setEmploymentData] = useState([])
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

    //api handling for getting all employement types
    const getAllHandler = () => {
        setLoading(true)
        getAllByOrgId({
            entity: 'employmenttypes',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    setData(res.data ? res.data : [])
                    setLoading(false)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
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
            entity: 'employmenttypes',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: id
        })
            .then(
                (res) => {
                    setFormData(res.data ? res.data : {})
                    setEmploymentData(res.data ? res.data : {})
                    setView(true)
                    setLoading(false)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    const validate = (values) => {
        const errors = {}
        if (!values.controllerName) {
            errors.name = 'Required'
        }

        return errors
    }

    //api handling for saving employement type object along with validation
    const onSaveHandler = () => {
        const obj = {
            id: formData.id,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name,
            description: formData.description
        }
        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else {
            save({
                entity: 'employmenttypes',
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Employment type',
                    operationType: 'save'
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
                    console.log(err, 'error')
                    ToastError(err.message)
                    setLoading(false)
                })
        }
    }
    //api handling for updating employement type object along with validation

    const onUpdateHandler = () => {
        setLoading(true)
        const obj = {
            id: formData.id,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name,
            description: formData.description
        }

        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else if (updateValidation(employmentData, formData)) {
            toast.info('No changes made to update')
            setLoading(false)
        } else {
            update({
                entity: 'employmenttypes',
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                id: formData.id,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Employment type',
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
                    console.log(err, 'error')
                    ToastError(err.message)
                    setLoading(false)
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
    //api handling for deleting employement type

    const proceedDeleteHandler = () => {
        setLoading(true)
        deleteById({
            entity: 'employmenttypes',
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
            }
        })
        .catch((err) => {
            setLoading(false)
            toast.error(err.message)
        })
    }

    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name'
        },
        {
            Header: 'Description',
            accessor: 'description',
            Cell: ({ row }) => (
                <>
                    <div className="tableDescriptionData2">{row.original.description}</div>
                </>
            )
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
                                <PageHeader pageTitle="Employment Types" />
                                <div className="">
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
            <Modal show={view} size="lg" onHide={handleClose}>
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>
                        {mode == 'create' ? 'Add Employment Type' : 'Update Employment Type'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? <DetailLoader /> : ''}
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
                                            className="mb-5 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Description
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    onChange={handleInputChange}
                                                    maxLength={255}
                                                    defaultValue={formData.description}
                                                    value={formData.description || ''}
                                                    name="description"
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
                    <Modal.Header className="modalHeader" closeButton>
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
export default EmploymentTypeList
