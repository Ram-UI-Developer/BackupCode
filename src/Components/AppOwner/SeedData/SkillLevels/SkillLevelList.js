import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    handleKeyPress,
    updateValidation
} from '../../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../../../Common/CommonIcons/CommonIcons'
import {
    deleteById,
    getAllByOrgId,
    getById,
    save,
    update
} from '../../../../Common/Services/CommonService'
import Table1 from '../../../../Common/Table/Table1'
import { cancelButtonName } from '../../../../Common/Utilities/Constants'

const SkillLevelList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const [data, setData] = useState([]) //state for setting data
    const [view, setView] = useState(false) //state for showing modal pop ups
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [loading, setLoading] = useState(false) //state for displaying loader
    const [mode, setMode] = useState('') //state for setting mode for viewing s
    const [skillData, setSkillData] = useState([])
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

    //api handling for get All
    const getAllHandler = () => {
        setLoading(true)
        getAllByOrgId({
            entity: 'skilllevels',
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
                setLoading(false)
                console.log(err)
            })
    }

    const [formData, setFormData] = useState('')
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    //api handling  for getById
    const onGetByIdHandler = (id) => {
        setLoading(true)
        getById({
            entity: 'skilllevels',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: id
        })
            .then(
                (res) => {
                    setView(true)
                    setLoading(false)
                    setFormData(res.data ? res.data : {})
                    setSkillData(res.data ? res.data : {})
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    //validate object
    const validate = (values) => {
        const errors = {}
        if (!values.controllerName) {
            errors.name = 'Required'
        }

        return errors
    }

    //api handling  for saving skill level  object with validation
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
                entity: 'skilllevels',
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Skill level',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        getAllHandler()
                        setView(false)
                        setFormData({})
                        ToastSuccess(res.message)
                        setLoading(false)
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    console.log(err, 'error')
                    ToastError(err.message)
                })
        }
    }
    //api handling  for updating skill level  object with validation

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
        } else if (updateValidation(skillData, formData)) {
            toast.info('No changes made to update')
            setLoading(false)
        } else {
            update({
                entity: 'skilllevels',
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                id: formData.id,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Skill level',
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
                    console.log(err, 'error')
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

    //api handling for delete api
    const proceedDeleteHandler = () => {
        setLoading(true)
        deleteById({
            entity: 'skilllevels',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: selectedId
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                toast.success('Record deleted successfully.')
                getAllHandler()
                onCloseHandler()
            } else {
                setLoading(false)
                toast.error(res.errorMessage)
            }
        })
          .catch((err) => {
        toast.error(err.message)
    })
    }

    //table columns
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
                            id="skillLevelEditButton"
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
                                id="skillLevelDeleteButton"
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
                                <PageHeader pageTitle="Skill Levels" />
                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => handleAdd('create')}
                                        id="skillLevelAddButton"
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
                        {mode == 'create' ? 'Add Skill Level' : 'Update Skill Level'}
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
                                            controlId="formGroupSkilllevelName"
                                        >
                                            <Form.Label column sm={3} id="skillLevelNameLabel">
                                                Name <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    defaultValue={formData.name}
                                                    id="skillLevelName"
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
                                                    <p className="error" id="skilllevelNameError">
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
                                            controlId="formGroupSkilllevelDescription"
                                        >
                                            <Form.Label
                                                column
                                                sm={3}
                                                id="skillLevelDescriptionLabel"
                                            >
                                                Description
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    id="skillLevelDescription"
                                                    onChange={handleInputChange}
                                                    defaultValue={formData.description}
                                                    value={formData.description || ''}
                                                    maxLength={255}
                                                    name="description"
                                                />
                                                {formErrors.description && (
                                                    <p
                                                        className="error"
                                                        id="skilllevelDescriptionError"
                                                    >
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
                        <Button
                            className="Button"
                            variant="addbtn"
                            onClick={onSaveHandler}
                            id="skillLevelSaveButton"
                        >
                            Save
                        </Button>
                    ) : (
                        <Button
                            className="Button"
                            variant="addbtn"
                            onClick={onUpdateHandler}
                            id="skillLevelUpdateButton"
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        className="Button"
                        variant="secondary"
                        id="skilllevelCancelButton"
                        onClick={handleClose}
                    >
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
                        <Button
                            className="Button"
                            variant="addbtn"
                            onClick={proceedDeleteHandler}
                            id="skillLevelProceedDeleteButton"
                        >
                            Yes
                        </Button>
                        <Button
                            className="Button"
                            variant="secondary"
                            onClick={onCloseHandler}
                            id="skillLevelCancelDeleteButton"
                        >
                            No
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
export default SkillLevelList
