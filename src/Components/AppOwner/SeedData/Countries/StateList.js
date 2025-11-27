import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { handleKeyPress } from '../../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../../Common/CommonComponents/Loaders/DetailLoader'
import TableHeader from '../../../../Common/CommonComponents/TableHeader'
import { AddIcon, DeleteIcon, EditIcon } from '../../../../Common/CommonIcons/CommonIcons'
import { stateDeleteById } from '../../../../Common/Services/CommonService'
import Table from '../../../../Common/Table/Table'
import { cancelButtonName } from '../../../../Common/Utilities/Constants'

const StateList = ({ states, setStates }) => {
    const [data, setData] = useState(states) //state for setting data
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const [loading, setLoading] = useState(false) //state for displaying loader
    const [show, setShow] = useState(false) //state for showing modal pop ups
    const [deleteShow, setDeleteShow] = useState(false) //state for showing delete pop ups
    const [selectedId, setSelectedId] = useState('') //state for storing the selected id
    const [index, setIndex] = useState('')
    const [formData, setFormData] = useState({}) //state for form data
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [mode, setMode] = useState('') //state for setting mode for viewing

    useEffect(() => {
        setData(states)
    }, [states])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const onAddHandler = () => {
        setShow(true)
        setSelectedId(null)
        setMode('create')
    }
    //save handler object
    const onSaveHandler = () => {
        const obj = {
            id: '',
            name: formData.name,
            description: formData.description
        }
        if (!obj.name || obj.name == undefined) {
            setFormErrors({ ...formErrors, name: 'Required' })
        } else {
            const statesData = [...data, obj]
            setData(statesData)
            setStates(statesData)
            handleClose()
        }
    }

    const handleClose = () => {
        setShow(false)
        setDeleteShow(false)
        setFormData({})
        setMode('')
        setIndex('')
    }
    //update handler object
    const onUpdateHandler = () => {
        const obj = {
            id: formData.id,
            name: formData.name,
            description: formData.description
        }
        if (!obj.name || obj.name == undefined) {
            setFormErrors({ ...formErrors, name: 'Required' })
            setLoading(false)
        } else {
            data[index] = obj
            setStates(data)
            handleClose()
            setLoading(false)
        }
    }

    const proceedDelete = (row, index) => {
        setIndex(index)
        setSelectedId(row.id)
        setDeleteShow(true)
    }
    //api handling for delete the data
    const proceedDeleteHandler = () => {
        setLoading(true)
        // Call the delete API
        stateDeleteById({
            entity: 'countries',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: selectedId
        })
            .then((res) => {
                if (res.statusCode === 200) {
                    toast.success('Record deleted successfully.')
                    setLoading(false)
                    // Remove the deleted item from the data and update state
                    const updatedData = data.filter((item) => item.id !== selectedId)
                    setData(updatedData) // Update the component state
                    setStates(updatedData) // Update the parent state if necessary
                    handleClose() // Close the delete modal
                } else {
                    toast.error(res.errorMessage) // Display error if the API call fails
                }
            })
            .catch(() => {
                toast.error('An error occurred while deleting the record')
            })
    }

    const handleEdit = (row, index) => {
        // console.log(row)
        setShow(true)
        setIndex(index)
        setFormData(row)
        setMode('update')
    }

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
                            onClick={() => handleEdit(row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            onClick={() => proceedDelete(row.original, row.index)}
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
            {loading ? <DetailLoader /> : ''}
            <TableHeader tableTitle={'States/Provinces'} />
            <div className="">
                <Button className="addButton" variant="addbtn" onClick={onAddHandler}>
                    <AddIcon />
                </Button>

                <Table 
                 key={data.length}
                columns={COLUMNS} data={data} />
            </div>

            <Modal show={show} size="lg" onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>{selectedId == null ? 'Add State' : 'Update State'}</Modal.Title>
                    {/* <Button variant="secondary" onClick={handleClose}>
            X
          </Button> */}
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
                                                    defaultValue={formData.description}
                                                    name="description"
                                                    maxLength={255}
                                                    // onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                    // onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                    // onInput={(e) => handleKeyPress(e, setFormErrors)}
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
                            Add
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

            <Modal
                show={deleteShow}
                onHide={() => setDeleteShow(false)}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete</Modal.Title>
                    {/* <Button variant="secondary" onClick={() => setDeleteShow(false)}>
            X
          </Button> */}
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {loading ? <DetailLoader /> : ''}
                    Are you sure, Do you want to delete?
                </Modal.Body>
                <div className="btnCenter mb-4">
                    <Button variant="addbtn" className="Button" onClick={proceedDeleteHandler}>
                        YES
                    </Button>
                    <Button
                        variant="secondary"
                        className="Button"
                        onClick={() => setDeleteShow(false)}
                    >
                        NO
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default StateList
