import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import Loader from '../../../Common/CommonComponents/Loader'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import { getById, save, update } from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { toast } from 'react-toastify'

const Expenses = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    // State to store the list of expense types added by the user
    const [data, setData] = useState([])

    // State to manage loading status for API calls or screen rendering
    const [loading] = useState(false)

    // Get expense category ID from the navigation state (used for edit functionality)
    const expenseId = useLocation().state

    // State to hold the currently selected expense type input value
    const [expensetype, setExpenseType] = useState('')

    // State to store the currently selected or fetched expense category object
    const [expense, setExpense] = useState('')

    // State to hold the ID of the expense category selected for delete/edit
    const [, setselectId] = useState()

    // Object to manage validation error messages for the form
    const [formErrors, setFormErrors] = useState({ expenseTypesName: '' })

    // Controls visibility of the form modal (for add/edit expense category)
    const [show, setShow] = useState(false)

    // Controls visibility of the delete confirmation modal
    const [deleteshow, setDeleteShow] = useState(false)

    // State to manage loading spinner inside buttons or modals (for save/update)
    const [isLoading, setIsLoading] = useState(true)

    // State to manage input fields in the form (name, expenseTypesName, etc.)
    const [formData, setFormData] = useState('')

    // State to track selected index
    const [index, setIndex] = useState(null)

    // State to store selected ID and set that ID
    const [, setId] = useState(null)

    const handleShow = () => {
        setShow(true)
        setFormErrors({ ...formErrors, expenseTypesName: '' })
    }

    // Close
    const onCloseHandler = () => {
        setDeleteShow(false)
        setShow(false)
        setselectId()
        setExpenseType(null)
        setIndex(null)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value.trimStart().replace(/\s+/g, ' ')
        })
    }

    // Handler for saving a new expense category
    const onSaveHandler = (e) => {
        e.preventDefault()
        const itemObj = {
            id: expenseId && expenseId.id,
            name: formData.name ? formData.name : expense.name,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            typeDTOs: data
        }
        if (!itemObj.name) {
            setFormErrors(validate(itemObj))
        } else {
            setIsLoading(true)
            save({
                entity: 'expensecategories',
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: itemObj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Expense Category',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setShow(false)
                        navigate('/expenses')
                        ToastSuccess(res.message)
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    console.log(err, 'error')
                    ToastError(err.message)
                })
        }
    }
    const isTypeListSame = (arr1 = [], arr2 = []) => {
        if (arr1.length !== arr2.length) return false
        const names1 = arr1.map((e) => e.name).sort()
        const names2 = arr2.map((e) => e.name).sort()
        return names1.every((name, i) => name === names2[i])
    }

    // Handler for updating an existing expense category
    const onUpdateHandler = (e) => {
        e.preventDefault()
        setIsLoading(true)
        const itemObj = {
            id: expenseId && expenseId.id,
            name: formData.name ? formData.name : expense.name,
            organizationId: userDetails.organizationId,
            typeDTOs: data
        }
        if (updateValidation(expense, formData) && isTypeListSame(data, expense.typeDTOs)) {
            toast.info('No changes made to update.')
            setIsLoading(false)
        } else if (!itemObj.name) {
            setFormErrors(validate(itemObj))
        } else {
            update({
                entity: 'expensecategories',
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                id: expenseId && expenseId.id,
                body: itemObj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Expense Category',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setShow(false)
                        navigate('/expenses')
                        ToastSuccess(res.message)
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    console.log(err, 'error')
                    ToastError(err.message)
                })
        }
    }

    // Handler for adding a new expense type to the list
    const onAddExpenseTypeHandler = () => {
        setFormData({ ...formData, expenseTypesName: '' })
        setFormErrors({ ...formErrors, expenseTypesName: '' })
        const typeName = formData.expenseTypesName ? formData.expenseTypesName.trim() : ''
        if (!typeName) {
            setFormErrors({
                ...formErrors,
                expenseTypesName: 'Type is empty.'
            })
        } else if (data.some((e) => e.name === typeName)) {
            setFormErrors({
                ...formErrors,
                expenseTypesName: 'Type Already Exists...'
            })
        } else if (data.some((e) => e.name.toLowerCase() === typeName.toLowerCase())) {
            setFormErrors({
                ...formErrors,
                expenseTypesName: 'Type Already Exists...'
            })
        } else {
            const obj = {
                name: typeName
            }
            setData([...data, obj])
            onCloseHandler()
        }
    }

    // Navigate
    const navigate = useNavigate()
    useEffect(() => {
        if (expenseId && expenseId.id) {
            onGetExpenseHandler()
        } else {
            setIsLoading(false)
        }
    }, [])

    // getById
    const onGetExpenseHandler = () => {
        getById({
            entity: 'expensecategories',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: expenseId && expenseId.id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    if (res.data) {
                        const getList =
                            res.data.typeDTOs &&
                            res.data.typeDTOs.filter((e) => {
                                if (e.deleted != 1) {
                                    return e
                                }
                            })
                        setData(getList ? getList : [])
                        setFormData(res.data)
                        setExpense(res.data)
                    }
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // Delete
    const onDeleteHandler = (id, index) => {
        setDeleteShow(true)
        setIndex(index)
        setId(id)
    }
    const proceedDeleteHandler = (e) => {
        setIsLoading(false)
        e.preventDefault()
        const rows = [...data]
        rows.splice(index, 1)
        // onTypeDeleteHandler(id);
        setData(rows)
        setIndex(null)
        setDeleteShow(false)
    }

    // Update
    const onUpdateExpenseHandler = (e) => {
        e.preventDefault()
        const obj = {
            id: expensetype ? expensetype.id : null, // Avoid optional chaining
            name: formData.expenseTypesName ? formData.expenseTypesName : expensetype.name // Update only type name
        }

        const updatedData = [...data]
        updatedData[index] = obj // Update the specific row in the table data
        setData(updatedData) // Update table data

        onCloseHandler() // Close the modal
        setExpenseType(null) // Reset the expense type state
    }

    //    Edit
    const onEditTypeHandler = (id, index, data) => {
        setFormErrors({ ...formErrors, expenseTypesName: '' })
        setExpenseType(data)
        setselectId(id)
        // onTypeHandler(id);
        setIndex(index)
        setShow(true)
    }

    //Type getById
    // const onTypeHandler = (id) => {
    //   getById({ entity: "expenseTypes", id: id }).then((res) => {
    //     if (res.statusCode == 200) {
    //       setExpenseType(res.data);
    //       setFormData(res.data);
    //     }
    //   });
    // };

    // Validations
    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }
        return errors
    }

    //   ColumnsAdd
    const COLUMNSADD = [
        {
            Header: 'S.No',
            accessor: '',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right tableDataSerialNumber">
                        {row.index + 1}
                    </div>
                </>
            )
        },
        {
            Header: 'Type',
            accessor: 'name'
        },
        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <div className="text-wrap text-right actionsWidth">
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        onClick={() => onEditTypeHandler(row.original.id, row.index, row.original)}
                    >
                        <EditIcon />
                    </Button>
                    |
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        onClick={() => onDeleteHandler(row.original.id, row.index)}
                    >
                        <DeleteIcon />
                    </Button>
                </div>
            )
        }
    ]

    //   ColumnsEdit
    const COLUMNSEDIT = [
        {
            Header: 'S.No',
            accessor: '',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right tableDataSerialNumber">
                        {row.index + 1}
                    </div>
                </>
            )
        },
        {
            Header: 'Type',
            accessor: 'name'
        },
        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <div className="text-wrap text-right actionsWidth">
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        onClick={() => onEditTypeHandler(row.original.id, row.index, row.original)}
                    >
                        <EditIcon />
                    </Button>
                    |
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        onClick={() => onDeleteHandler(row.original.id, row.index)}
                    >
                        <DeleteIcon />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <>
            {isLoading ? <DetailLoader /> : ''}
            <section className="section detailBackground">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-13">
                            <div className="">
                                <PageHeader
                                    pageTitle={
                                        (expenseId.id == null ? 'Add' : 'Update') +
                                        ' ' +
                                        'Expense Category'
                                    }
                                />
                                <br />
                                <div className="col-7">
                                    <Form.Group as={Row}>
                                        <Form.Label column sm={3}>
                                            Category <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={5}>
                                            <Form.Control
                                                name="name"
                                                className="category"
                                                maxLength={50}
                                                autoFocus
                                                value={formData.name || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                            />
                                            {formErrors.name && (
                                                <p className="category error" >
                                                    {formErrors.name}
                                                </p>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>
                                <br />
                                <br />
                                <div className="table">
                                    <br />
                                    {loading ? (
                                        <center>
                                            <Loader />
                                        </center>
                                    ) : expenseId.id == null ? (
                                        <Table columns={COLUMNSADD} data={data} key={data.length} pageSize="10" />
                                    ) : (
                                        <Table columns={COLUMNSEDIT} data={data} key={data.length} pageSize="10" />
                                    )}
                                </div>
                                <Button
                                    className="addMoreBtn"
                                    variant=""
                                    disabled={!formData.name}
                                    onClick={handleShow}
                                >
                                    Add Expense
                                </Button>
                                <div className="btnCenter mb-6">
                                    {expenseId.id == null ? (
                                        <>
                                            <Button
                                                className="Button"
                                                variant="addbtn"
                                                type="button"
                                                onClick={onSaveHandler}
                                                disabled={!formData.name || !formData.name.trim()}
                                            >
                                                Save
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                className="Button"
                                                variant="addbtn"
                                                type="button"
                                                onClick={onUpdateHandler}
                                                disabled={
                                                    !formData.name ||
                                                    !formData.name.trim() ||
                                                    (data.length === 0 && (!expense.name || expense.name === formData.name))
                                                }                                            >
                                                Update{' '}
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        className="Button"
                                        variant="secondary"
                                        type="button"
                                        onClick={() => navigate('/Expenses')}
                                    >
                                        {cancelButtonName}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false} size="">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>{index == null ? 'Add' : 'Update'} Expense Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-">
                        <Form.Group
                            as={Row}
                            className="mb-3 justify-content-center"
                            controlId="formGroupBranch"
                        >
                            <Form.Label column sm={3}>
                                Type
                            </Form.Label>
                            <Col sm={7}>
                                <Form.Control
                                    required
                                    autoFocus
                                    defaultValue={expensetype == null ? '' : expensetype.name}
                                    type="text"
                                    maxLength={50}
                                    onChange={handleInputChange}
                                    name="expenseTypesName"
                                    onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                    onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                    onInput={(e) => handleKeyPress(e, setFormErrors)}
                                />
                                {formErrors.expenseTypesName && (
                                    <p className="error">{formErrors.expenseTypesName}</p>
                                )}
                            </Col>
                        </Form.Group>
                    </div>
                </Modal.Body>
                <div className="delbtn">
                    {index == null ? (
                        <Button
                            variant="addbtn"
                            className="Button"
                            onClick={onAddExpenseTypeHandler}
                        >
                            Add
                        </Button>
                    ) : (
                        <Button
                            className="Button"
                            variant="addbtn"
                            type="button"
                            onClick={onUpdateExpenseHandler}
                        >
                            Update
                        </Button>
                    )}
                    <Button variant="secondary" className="Button" onClick={onCloseHandler}>
                        {cancelButtonName}
                    </Button>
                </div>
            </Modal>

            <Modal show={deleteshow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {isLoading ? <DetailLoader /> : ''}
                    Are you sure you want to delete this item ?
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
        </>
    )
}
export default Expenses
