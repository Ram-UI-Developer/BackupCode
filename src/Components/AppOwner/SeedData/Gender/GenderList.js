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

const GenderList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const entity = 'gender'
    const [data, setData] = useState([]) //state for setting data
    const [view, setView] = useState(false) //state for showing modal pop ups
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [loading, setLoading] = useState(false) //state for displaying loader
    const [mode, setMode] = useState('') //state for setting mode for viewing
    const [genderData, setGenderData] = useState([])
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

    //api handling for get all api
    const getAllHandler = () => {
        setLoading(true)
        getAllByOrgId({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    setLoading(false)
                    setData(res.data ? res.data : [])
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

    //api handling for get by id
    const onGetByIdHandler = (id) => {
        setLoading(true)
        getById({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: id
        })
            .then(
                (res) => {
                    setView(true)
                    setLoading(false)
                    setFormData(res.data ? res.data : {})
                    setGenderData(res.data ? res.data : {})
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
        if (values.locationId == undefined || values.locationId == null) {
            errors.location = 'Required'
        }
        if (!values.name) {
            errors.name = 'Required'
        }

        return errors
    }

    //api handling for saving the gender object with validation
    const onSaveHandler = () => {
        const obj = {
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name
        }

        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(obj))
        } else {
            setLoading(true)
            save({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                locationId: userDetails.locationId == null ? 0 : userDetails.locationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Gender',
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
    //api handling for updating the gender object with validation

    const onUpdateHandler = () => {
        const obj = {
            id: formData.id,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name
        }

        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else if (updateValidation(genderData, formData)) {
            toast.info('No changes made to update')
            setLoading(false)
        } else {
            setLoading(true)
            update({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                id: formData.id,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Gender',
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

    //api handling for delete api
    const proceedDeleteHandler = () => {
        setLoading(true)
        deleteById({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: selectedId
        }).then((res) => {
            if (res.statusCode == 200) {
                toast.success('Record deleted Successfully.')
                getAllHandler()
                onCloseHandler()
                setLoading(false)
            } else {
                setLoading(false)
                toast.error(res.errorMessage)
            }
        })
        .catch((err) => {
            setLoading(false)
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
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="  ">
                                <PageHeader pageTitle="Genders" />
                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => handleAdd('create')}
                                    >
                                        <AddIcon />
                                    </Button>
                                    {loading ? (
                                        <center>
                                            {' '}
                                            <DetailLoader />{' '}
                                        </center>
                                    ) : (
                                        <>
                                            <Table1
                                                key={data.length}
                                                columns={COLUMNS}
                                                data={data}
                                                serialNumber={true}
                                                pageSize="10"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Modal show={view && !loading} size="lg" onHide={handleClose}>
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>{mode == 'create' ? 'Add Gender' : 'Update Gender'}</Modal.Title>
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
                                            className="mb-5 justify-content-center"
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
export default GenderList
