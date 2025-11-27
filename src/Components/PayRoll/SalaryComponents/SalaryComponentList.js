import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import Loader from '../../../Common/CommonComponents/Loader'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    deleteById,
    getAll,
    getAllByOrgId,
    getById,
    getByIdwithOutOrg,
    save,
    update
} from '../../../Common/Services/CommonService'
import Table1 from '../../../Common/Table/Table1'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { updateValidation } from '../../../Common/CommonComponents/FormControlValidation'

const SalaryComponentList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // get userdetails from redux
    const entity = 'salarycomponents' // Assign entity name
    const [data, setData] = useState([]) // State for all salary components
    const [view, setView] = useState(false) // State for form modal
    const [formErrors, setFormErrors] = useState({}) // State for handling errors
    const [loading, setLoading] = useState(false) // State for handling loader
    const [mode, setMode] = useState('') // State for mode (add or edit)
    const [selectedRadio, setSelectedRadio] = useState({
        label: 'CTC',
        value: 1
    }) // State for radio option
    const [headList, setHeadList] = useState([]) // State for heads
    const [head, setHead] = useState({}) // State for selected head
    const [headId, setHeadId] = useState('') // State for selected head id
    const [isLoading, setIsLoading] = useState(true) // State for handling loader
    const [component, setComponent] = useState({}) // State for selected component

    // function for set mode and show modal
    const handleAdd = (mode, e) => {
        setFormErrors('')
        if (mode == 'create') {
            setIsLoading(false)
            setView(true)
            setFormData('')
        } else {
            onGetByIdHandler(e.id)
        }
        setMode(mode)
        getAllHeads()
    }

    // Close Modal
    const handleClose = () => {
        setView(false)
        setFormData({})
        setHeadId('')
        setSelectedRadio({ label: 'CTC', value: 1 })
        setHead({})
    }

    // Fetch heads and componets to component on mount
    useEffect(() => {
        getAllHandler()
    }, [])

    const getAllHandler = () => {
        getAllByOrgId({
            entity: entity,
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                setData(res.data ? res.data : [])
                setIsLoading(false)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const getAllHeads = () => {
        getAll({ entity: 'heads' })
            .then((res) => {
                setHeadList(res.data ? res.data : [])
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // convetd head into options
    const headOptions = headList.map((option) => ({
        value: option.id,
        label: option.name
    }))

    const [formData, setFormData] = useState('') //State for handling the formdata
    // handling onchange for inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    // handling onchange for dropdown
    const handleHeadChange = (option) => {
        setHeadId(option.value)
        getHeadById(option.value)
        setSelectedRadio({ label: 'CTC', value: 1 })
        setFormErrors({ ...formErrors, head: '' })
    }

    //Fetch Head get by id
    const getHeadById = (id) => {
        getByIdwithOutOrg({ entity: 'heads', id: id })
            .then((res) => {
                setHead(res.data ? res.data : {})
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Radio state update
    const handleRadioChange = (option) => {
        setSelectedRadio(option)
    }

    //Fetch Salary components get by id
    const onGetByIdHandler = (id) => {
        setIsLoading(true)
        getById({
            entity: entity,
            organizationId: userDetails.organizationId,
            id: id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setView(true)
                    setIsLoading(false)
                    setFormData(res.data ? res.data : {})
                    setComponent(res.data ? res.data : {})
                    setHeadId(res.data.headId)
                    setSelectedRadio(res.data.dependsOn)
                    getHeadById(res.data.headId)
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // key ristriction
    const handleKey = (event) => {
        const regex = /^[0-9.]$/
        const key = String.fromCharCode(event.charCode)
        if (!regex.test(key)) {
            event.preventDefault()
        }
    }

    // validation for First character must be an alphabet
    const handleKeyPress = (event, setFormErrors) => {
        const { name, value } = event.target
        if (event.type === 'keypress') {
            const key = event.key
            // Prevent first character from being a number
            if (value.length === 0 && !/^[a-zA-Z]$/.test(key)) {
                event.preventDefault()
                setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: 'First character must be an alphabet'
                }))
            }
        }
    }

    // Basic form validation
    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.headId || values.headId.length <= 0) {
            errors.head = 'Required'
        }
        if (!values.value) {
            errors.value = 'Required'
        }
        if (values.dependsOn.label == 'CTC' && values.value > 100) {
            errors.value = 'Please enter below 100'
        }
        return errors
    }

    // Save Component with Api
    const onSaveHandler = () => {
        const obj = {
            name: formData.name,
            headId: headId,
            dependsOn: selectedRadio,
            value: formData.value,
            organizationId: userDetails.organizationId,
            createdBy: userDetails.employeeId
        }

        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(obj))
        } else if (!headId || obj.headId.length <= 0) {
            setFormErrors(validate(obj))
        } else if (!formData.value || formData.value == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.dependsOn.label == 'CTC' && obj.value > 100) {
            setFormErrors(validate(obj))
        } else {
            setIsLoading(true)
            save({
                entity: entity,
                organizationId: userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Salary component',
                    operationType: 'save'
                }),
                screenName: 'Salary component'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setIsLoading(false)
                        ToastSuccess(res.message)
                        getAllHandler()
                        handleClose()
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Update component with Api
    const onUpdateHandler = () => {
        const obj = {
            id: formData.id,
            name: formData.name,
            headId: headId,
            dependsOn: selectedRadio,
            value: formData.value,
            organizationId: userDetails.organizationId,
            createdBy: formData.createdBy
        }
        if (
            updateValidation(component, formData) &&
            component.headId == headId &&
            component.dependsOn.label == selectedRadio.label
        ) {
            toast.info('No changes made to update.')
        } else if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else if (!headId || obj.headId.length <= 0) {
            setFormErrors(validate(obj))
        } else if (!formData.value || formData.value == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.dependsOn.label == 'CTC' && obj.value > 100) {
            setFormErrors(validate(obj))
        } else {
            setIsLoading(true)
            let updatedObj = { ...obj, modifiedBy: userDetails.employeeId }
            update({
                entity: entity,
                organizationId: userDetails.organizationId,
                body: updatedObj,
                id: formData.id,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Salary Component',
                    operationType: 'update'
                }),
                screenName: 'Salary Component'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setIsLoading(false)
                        ToastSuccess(res.message)
                        getAllHandler()
                        handleClose()
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    const [show, setShow] = useState(false) // State for Delete Modal
    const [selectedId, setSelectedId] = useState('') // State for Selected id

    // Show Delete Modal
    const handleDelete = (e) => {
        setShow(true)
        setSelectedId(e)
    }

    // Close Modal
    const onCloseHandler = () => {
        setShow(false)
        setView(false)
    }

    // confirmation for Detele
    const proceedDeleteHandler = () => {
        setIsLoading(true)
        deleteById({
            entity: entity,
            organizationId: userDetails.organizationId,
            id: selectedId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    toast.success('Record deleted Successfully.')
                    getAllHandler()
                    onCloseHandler()
                } else {
                    toast.error(res.message)
                }
            })
            .catch((err) => {
                 toast.error(err.message)
                setIsLoading(false)
            })
    }

    // number formate
    const formatNumber = (number) => {
        return new Intl.NumberFormat().format(number)
    }

    // Columns for table
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => <div style={{ width: '250px' }}>{row.original.name}</div>
        },

        {
            Header: 'Type',
            accessor: 'type.label',
            Cell: ({ row }) => (
                <>
                    <div style={{ width: '90px' }}>{row.original.type.label}</div>
                </>
            )
        },
        {
            Header: 'Head Name',
            accessor: 'headName',
            Cell: ({ row }) => <div style={{ width: '200px' }}>{row.original.headName}</div>
        },

        {
            Header: 'Depends On',
            accessor: 'dependsOn.label',
            Cell: ({ row }) => (
                <>
                    <div style={{ width: '100px', whiteSpace: 'nowrap' }}>
                        {row.original.dependsOn.label}
                    </div>
                </>
            )
        },
        {
            Header: 'Value',
            accessor: 'value',
            headerAlign: 'right',
            Cell: ({ row }) => (
                <>
                    <div className="numericData">
                      {row.original.dependsOn.label == 'Fixed' ? <>&#8377;</> : ''} {formatNumber(row.original.value)}
                        {row.original.dependsOn.label != 'Fixed' ? '%' : ''}
                    </div>
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
            {isLoading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="  ">
                                <PageHeader pageTitle="Salary Components" />
                                <div className="table">
                                    {loading ? (
                                        <center>
                                            {' '}
                                            <Loader />{' '}
                                        </center>
                                    ) : (
                                        <>
                                            <Button
                                                className="addButton"
                                                variant="addbtn"
                                                onClick={() => handleAdd('create')}
                                            >
                                                <AddIcon />
                                            </Button>
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
            {/* Modal for Form */}
            <Modal show={view} size="lg" onHide={handleClose} dialogClassName="modalpopup">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {mode == 'create' ? 'Add Salary Component' : 'Update Salary Component'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoading ? <DetailLoader /> : ''}
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
                                            <Col md={8}>
                                                <Form.Control
                                                    onKeyPress={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    onPaste={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    onInput={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    defaultValue={formData.name}
                                                    name="name"
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputChange}
                                                    maxLength={50}
                                                />
                                                <p className="error">{formErrors.name}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-1 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Head <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={8}>
                                                <Select
                                                    options={headOptions}
                                                    value={headOptions.filter(
                                                        (option) => option.value == headId
                                                    )}
                                                    onChange={handleHeadChange}
                                                />
                                                <p className="error">{formErrors.head}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    {head.type && (
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3 justify-content-center"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={3}>
                                                    Type <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={8} style={{ paddingTop: '1%' }}>
                                                    <span className="">
                                                        {' '}
                                                        {head.type.label} (
                                                        {head.type.label == 'Earning'
                                                            ? head.taxable
                                                                ? 'Taxable'
                                                                : 'nontaxable'
                                                            : head.deductionType.label}
                                                        ){' '}
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    )}

                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-4 justify-content-center"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label column sm={3}>
                                                Depends On <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={8}>
                                                <div className="radioAlign">
                                                    <input
                                                        type="radio"
                                                        value={{ label: 'CTC', value: 1 }}
                                                        checked={selectedRadio.label === 'CTC'}
                                                        onChange={() =>
                                                            handleRadioChange({
                                                                label: 'CTC',
                                                                value: 1
                                                            })
                                                        }
                                                    />
                                                    &ensp;
                                                    <span>CTC</span>&emsp;&ensp;
                                                    {!head.basic && (
                                                        <>
                                                            {' '}
                                                            <input
                                                                type="radio"
                                                                value={{ label: 'Basic', value: 2 }}
                                                                disabled={head.basic}
                                                                checked={
                                                                    selectedRadio.label === 'Basic'
                                                                }
                                                                onChange={() =>
                                                                    handleRadioChange({
                                                                        label: 'Basic',
                                                                        value: 2
                                                                    })
                                                                }
                                                            />
                                                            &ensp;
                                                            <span>Basic</span>&emsp;&ensp;{' '}
                                                        </>
                                                    )}
                                                    {!head.basic && !head.da && (
                                                        <>
                                                            {' '}
                                                            <input
                                                                type="radio"
                                                                value={{
                                                                    label: 'BasicDA',
                                                                    value: 5
                                                                }}
                                                                disabled={head.basic}
                                                                checked={
                                                                    selectedRadio.label ===
                                                                    'BasicDA'
                                                                }
                                                                onChange={() =>
                                                                    handleRadioChange({
                                                                        label: 'BasicDA',
                                                                        value: 5
                                                                    })
                                                                }
                                                            />
                                                            &ensp;
                                                            <span>Basic + DA</span>&emsp;&ensp;{' '}
                                                        </>
                                                    )}
                                                    <input
                                                        type="radio"
                                                        value={{ label: 'Fixed', value: 3 }}
                                                        checked={selectedRadio.label === 'Fixed'}
                                                        onChange={() =>
                                                            handleRadioChange({
                                                                label: 'Fixed',
                                                                value: 3
                                                            })
                                                        }
                                                    />
                                                    &ensp;
                                                    <span>Fixed</span>&emsp;&ensp;{' '}
                                                    {head.type && head.type.label != 'Earning' && (
                                                        <>
                                                            {' '}
                                                            <input
                                                                type="radio"
                                                                value={{
                                                                    label: 'MonthlyGross',
                                                                    value: 4
                                                                }}
                                                                checked={
                                                                    selectedRadio.label ===
                                                                    'MonthlyGross'
                                                                }
                                                                onChange={() =>
                                                                    handleRadioChange({
                                                                        label: 'MonthlyGross',
                                                                        value: 4
                                                                    })
                                                                }
                                                            />
                                                            &ensp;
                                                            <span>Monthly Gross</span>
                                                        </>
                                                    )}
                                                </div>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {selectedRadio.label === 'Fixed' ? (
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3 justify-content-center"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={3}>
                                                    Value <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={8}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        defaultValue={formData.value}
                                                        name="value"
                                                        type="number"
                                                        onKeyPress={handleKey}
                                                        min={1}
                                                        maxLength={10}
                                                    />
                                                    <p className="error">{formErrors.value}</p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    ) : (
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3 justify-content-center"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={3}>
                                                    In % <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={8}>
                                                    <Form.Control
                                                        defaultValue={formData.value}
                                                        name="value"
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputChange}
                                                        type="number"
                                                        onKeyPress={handleKey}
                                                        max={100}
                                                        min={1}
                                                    />
                                                    <p className="error">{formErrors.value}</p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    )}
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
                {/* Delete modal section */}
                <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                    <Modal.Header className="modalHeader" closeButton>
                        <Modal.Title>Delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        {isLoading ? <DetailLoader /> : ''}
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
export default SalaryComponentList
