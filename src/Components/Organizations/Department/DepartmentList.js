import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import {
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    deleteById,
    getAllByOrgId,
    getById,
    save,
    update
} from '../../../Common/Services/CommonService'
import Table1 from '../../../Common/Table/Table1'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'

const DepartmentList = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const entity = 'departments'
    // State for storing fetched data
    const [data, setData] = useState([])
    // Loading indicator for API operations
    const [isloading, setIsLoading] = useState(false)
    // Holds the current form values (can be object or string based on your use case)
    const [formData, setFormData] = useState('')
    // Tracks form validation errors
    const [formErrors, setFormErrors] = useState({})
    // Toggle for view-only mode
    const [view, setView] = useState(false)
    // Mode indicator: e.g., "add", "edit"
    const [mode, setMode] = useState('')
    // List of available locations
    const [locationList, setLocationList] = useState([])
    // Currently selected location ID
    const [locationId, setLocationId] = useState('')
    // Controls whether to show parent department dropdown or field
    const [showParentDepartment, setShowParentDepartment] = useState(false)
    // ID of the selected department (for edit/view)
    const [, setDepartmentId] = useState()
    // All department options
    const [departmentList, setDepartmentList] = useState([])
    // Name of the selected department
    const [departmentName, setDepartmentName] = useState('')
    // Show/hide modal or drawer
    const [show, setShow] = useState(false)
    // ID of the selected item (for edit/view)
    const [selectedId, setSelectedId] = useState('')
    // Used internally to indicate whether new data has been added
    const [, setDataAdded] = useState(false)
    const [departmentData, setDepartmentData] = useState({})

    /**
     * Handles the addition of a new item or the editing of an existing item based on the mode.
     * @param {string} mode - The mode of operation, either "create" or "edit".
     * @param {object} e - The event object or the item being edited.
     * @returns None
     */
    const handleAdd = (mode, e) => {
        setFormErrors({})
        setMode(mode)
        onGetLocationsHandler()
        if (mode === 'create') {
            setView(true)
            setFormData({})
            setDataAdded(false)
            setDepartmentId(null)
            setDepartmentName('')
            setShowParentDepartment(true)
        } else {
            setIsLoading(true) // Move setIsLoading(true) here before fetching
            setView(true) // Ensure modal is set first
            onGetByIdHandler(e.id)
            setDataAdded(true)
            const isFirstRecord = data.findIndex((item) => item.id === e.id) === 0
            setShowParentDepartment(!isFirstRecord)
        }
    }

    const handleClose = () => {
        setView(false)
        setFormData({})
        setLocationId('')
        setDataAdded(false)
    }

    useEffect(() => {
        getAllHandler()

        // onDepartmentsHandler();
    }, [])

    /**
     * Fetches all data for a given organization ID and updates the state accordingly.
     * @returns None
     */
    const getAllHandler = () => {
        setIsLoading(true)
        getAllByOrgId({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then((res) => {
                setIsLoading(false)
                setData(res.data ? res.data : [])
                setDepartmentList(res.data ? res.data : [])
                if (res.data && res.data.length > 0) {
                    setShowParentDepartment(false) // Set to false if there are records
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    /**
     * Fetches all locations by organization ID and sets the location list with the response data.
     * @returns None
     */
    const onGetLocationsHandler = () => {
        getAllByOrgId({
            entity: 'locations',
            organizationId: userDetails.organizationId
        }).then((res) => {
            if (res.statusCode == 200) {
                setLocationList(
                    res.data.map((option) => ({
                        value: option.id,
                        label: option.name
                    }))
                )
            }
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    const onLocationChangeHandler = (option) => {
        setLocationId(option.value)
    }

    /**
     * Handles the logic for fetching data by ID asynchronously.
     * @param {number} id - The ID of the entity to fetch.
     * @returns None
     * @throws {Error} If there is an error while fetching the data.
     */
    const onGetByIdHandler = async (id) => {
        setIsLoading(true)
        try {
            const res = await getById({
                entity: entity,
                organizationId: userDetails.organizationId || 0,
                id: id
            })
            setFormData(res.data || {})
            setDepartmentData(res.data || {})
            setLocationId(res.data && res.data.locationId ? res.data.locationId : '')
            setDepartmentName(res.data && res.data.parentDepartment)
        } catch (error) {
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    }

    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!locationId) {
            errors.location = 'Required'
        }
        return errors
    }

    /**
     * Handles the logic for fetching and setting the department list based on the organization ID.
     * It sets the loading state to true before making the API call and updates the state accordingly
     * based on the response received.
     * @returns None
     */
    // const onDepartmentsHandler = () => {
    //   setIsLoading(true);
    //   getAllById({
    //     entity: "departments",
    //     organizationId: userDetails.organizationId,
    //   })
    //     .then(
    //       (res) => {
    //         if (res.statusCode == 200) {
    //           setIsLoading(false);
    //           setDepartmentList(res.data);
    //         }
    //       }
    //     )
    //     .catch((err) => {
    //       setIsLoading(false);
    //     });
    // };

    const departmentOptions = departmentList.map((option) => ({
        value: option.id,
        label: option.name
    }))

    const handleDepartMentSelect = (select) => {
        setDepartmentId(select.value)
        setDepartmentName(select.label)
    }

    /**
     * Handles the saving of form data by sending a request to the server with the provided data.
     * If the form data is valid, it saves the data and performs necessary actions upon successful save.
     * @returns None
     */
    const onSaveHandler = () => {
        const obj = {
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name,
            locationId: locationId,
            parentDepartment: departmentName || null
        }

        if (!formData.name) {
            setFormErrors(validate(formData))
            /* resolved bug 1744*/
        } else if (!locationId) {
            setFormErrors(validate(formData))
        } else {
            setIsLoading(true)
            save({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        toast.success('Saved successfully')
                        setIsLoading(false)
                        getAllHandler()
                        // onDepartmentsHandler();
                        setView(false)
                        setFormData({})
                        setLocationId('')
                        setDataAdded(false)
                    }
                })
                .catch((err) => {
                    setIsLoading(false) // #1767 added to ensure loading state is reset and added toast error
                    ToastError(err.message)
                })
        }
    }

    /**
     * Handles the update operation for a given entity with the provided form data.
     * @returns None
     */
    const onUpdateHandler = () => {
        const obj = {
            id: formData.id,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name,
            locationId: locationId,
            parentDepartment: departmentName
        }
        if (
            updateValidation(departmentData, formData) &&
            departmentData.parentDepartment == departmentName &&
            departmentData.locationId == locationId
        ) {
            // validation included for update
            toast.info('No changes made to update.')
            setIsLoading(false)
        } else if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else {
            setIsLoading(true)
            update({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                id: formData.id
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        toast.success('Updated successfully.')
                        setIsLoading(false)
                        getAllHandler()
                        setView(false)
                        setFormData({})
                        setLocationId('')
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    const handleDelete = (e) => {
        setShow(true)
        setSelectedId(e)
        // onDepartmentsHandler();
        // getAllHandler();
    }

    const onCloseHandler = () => {
        setShow(false)
        setView(false)
    }

    /**
     * Handles the deletion of a record by making an API call to delete the record with the specified ID.
     * Sets isLoading state to true during the deletion process.
     * If the deletion is successful (status code 200), displays a success message using toast.
     * Calls getAllHandler, onDepartmentsHandler, and onCloseHandler functions.
     * If the deletion is unsuccessful, displays an error message using toast.
     * Sets isLoading state to false after the deletion process.
     */
    const proceedDeleteHandler = () => {
        setIsLoading(true)
        deleteById({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: selectedId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    toast.success('Record deleted successfully.')
                    getAllHandler()
                    // onDepartmentsHandler();
                    onCloseHandler()
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                setIsLoading(false)
                ToastError(err.message)
            })
    }

    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name'
        },
        {
            Header: 'Location',
            accessor: 'locationName'
        },
        {
            Header: 'Parent Department',
            accessor: 'parentDepartment'
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
                                <PageHeader pageTitle="Departments" />
                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => handleAdd('create')}
                                    >
                                        <AddIcon />
                                    </Button>
                                    {isloading ? (
                                        <center>
                                            {' '}
                                            <DetailLoader />{' '}
                                        </center>
                                    ) : (
                                        <>
                                            <Table1
                                                columns={COLUMNS}
                                                data={data}
                                                key={data.length}
                                                serialNumber={true}
                                                name={'departments'}
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
            <Modal show={view && !isloading} size="lg" onHide={handleClose}>
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>
                        {mode == 'create' ? 'Add Department' : 'Update Department'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isloading && mode != 'create' ? <DetailLoader /> : ''}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="" style={{ paddingLeft: '15%' }}>
                                <form>
                                    <div class="col-">
                                        <Form.Group
                                            as={Row}
                                            className="justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label className="fieldLabel" column md={3}>
                                                Location <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Select
                                                    className="dropdown"
                                                    placeholder=""
                                                    options={locationList}
                                                    value={locationList.filter(
                                                        (e) => e.value == locationId
                                                    )}
                                                    onChange={(e) => onLocationChangeHandler(e)}
                                                    onBlur={() =>
                                                        locationId == null
                                                            ? setFormErrors({
                                                                ...formErrors,
                                                                location: 'Required'
                                                            })
                                                            : setFormErrors({
                                                                ...formErrors,
                                                                location: ''
                                                            })
                                                    }
                                                />
                                                <p className="error">{formErrors.location}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    {showParentDepartment && departmentList.length > 0 && (
                                        <div class="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3 justify-content-center"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={3}>
                                                    Parent Department
                                                </Form.Label>
                                                <Col md={7}>
                                                    <Select
                                                        required
                                                        disabled={mode == 'pro' ? true : false}
                                                        size="sm"
                                                        value={departmentOptions.filter(
                                                            (e) => e.label == departmentName
                                                        )}
                                                        options={departmentOptions.filter(
                                                            (item) => item.label !== formData.name
                                                        )}
                                                        // onBlur={() =>
                                                        //   !locationId
                                                        //     ? setFormErrors({
                                                        //         ...formErrors,
                                                        //         departmentId: "Required",
                                                        //       })
                                                        //     : setFormErrors({
                                                        //         ...formErrors,
                                                        //         departmentId: "",
                                                        //       })
                                                        // } // #1766: no need to validate departmentId
                                                        onChange={handleDepartMentSelect}
                                                        name="department"
                                                    />
                                                    {/* <p className="error">{formErrors.departmentId}</p> */}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    )}
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label
                                                column
                                                sm={3}
                                                style={{ paddingRight: '-25px' }}
                                            >
                                                Name <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                <Form.Control
                                                    defaultValue={formData.name}
                                                    name="name"
                                                    maxLength={100}
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
                    <Modal.Header className="modalHeader" closeButton={handleClose}>
                        <Modal.Title>Delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        {isloading ? <DetailLoader /> : ''}
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
export default DepartmentList
