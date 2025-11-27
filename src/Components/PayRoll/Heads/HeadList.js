import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
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
import { updateValidation } from '../../../Common/CommonComponents/FormControlValidation'
import { toast } from 'react-toastify'

const HeadList = () => {
    const entity = 'heads' // Assign entity name
    const [data, setData] = useState([]) // State for All heads
    const [view, setView] = useState(false) // State for toggle form modal
    const [formData, setFormData] = useState({
        name: '',
        type: null,
        basic: false,
        da: false,
        taxable: false,
        deductionType: null
    }) // State for input fields in the modal
    const [show, setShow] = useState(false) // State for toggle delete modal
    const [selectedId, setSelectedId] = useState('') // State for selected id for delete
    const [isLoading, setIsLoading] = useState(true) // State for handling loader
    const [head, setHead] = useState({}) // State for selected head
    const [formErrors, setFormErrors] = useState({}) // State for form error

    // Option decleration for type of head
    const typeOptions = [
        { label: 'Earning', value: 1 },
        { label: 'Deduction', value: 2 }
    ]

    // Option decleration for type of deduction
    const deductionOptions = [
        { label: 'Obligatory', value: 1 },
        { label: 'Statutory', value: 2 },
        { label: 'Mandatory', value: 3 }
    ]

    // Fetch Heads to component on mount
    useEffect(() => {
        getAllHandler()
    }, [])

    const getAllHandler = () => {
        getAll({ entity: entity })
            .then((res) => {
                setIsLoading(false)
                setData(res.data ? res.data : [])
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
        if (name === 'name' && value === '') {
            setFormErrors({ ...formErrors, [name]: 'Required' })
        } else {
            setFormErrors({ ...formErrors, [name]: '' })
        }
    }

    const onChangeTypeHandler = (name, e) => {
        setFormData({
            ...formData,
            type: e,
            taxable: e.label == 'Deduction' ? false : formData.taxable,
            deductionType: e.label == 'Deduction' ? formData.deductionType : null
        })
        setFormErrors({ ...formErrors, [name]: '' }) // Reset form error for select
    }

    const onDeductionTypeHandler = (name, e) => {
        setFormData({ ...formData, deductionType: e })
        setFormErrors({ ...formErrors, [name]: '' }) // Reset form error for select
    }

    const onChangeDaHandler = (e) => {
        setFormData({
            ...formData,
            da: !formData.da,
            type: e.target.checked ? { label: 'Earning', value: 1 } : formData.type,
            taxable: e.target.checked,
            basic: false, // Reset basic if DA is checked
            deductionType: null // Reset deduction type if DA is checked
        })
        setFormErrors({ ...formErrors, type: '' }) // Reset form error for DA
    }

    const onChangeBasicHandler = (e) => {
        setFormData({
            ...formData,
            basic: !formData.basic,
            type: e.target.checked ? { label: 'Earning', value: 1 } : formData.type,
            taxable: e.target.checked,
            da: false, // Reset DA if Basic is checked
            deductionType: null // Reset deduction type if Basic is checked
        })
        setFormErrors({ ...formErrors, type: '' }) // Reset form error for Basic
    }

    // Show form modal
    const onAddHandler = () => {
        setView(true)
    }

    // Show form modal with data get by id
    const onViewHandler = (id) => {
        setIsLoading(true)
        setSelectedId(id)
        getByIdwithOutOrg({ entity: entity, id: id })
            .then((res) => {
                setView(true)
                setIsLoading(false)
                setFormData(res.data ? res.data : {})
                setHead(res.data ? res.data : {})
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // Save head with Api
    const onSaveHandler = () => {
        
        if (!formData.name || formData.name == '') {
            setFormErrors(validate(formData))
        } else if (!formData.type || !formData.type.label) {
            setFormErrors(validate(formData))
        } else if (
            formData.type &&
            formData.type.label === 'Deduction' &&
            !formData.deductionType
        ) {
            setFormErrors(validate(formData))
        } else {
            setIsLoading(true)
            saveWithoutOrg({
                entity: entity,
                body: formData,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Salary Head',
                    operationType: 'save'
                }),
                screenName: 'Salary Head'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setIsLoading(false)
                        ToastSuccess(res.message)
                        onCloseHandler()
                        getAllHandler()
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Update Head with Api
    const onUpdateHandler = () => {
        if (updateValidation(formData, head)) {
            toast.info('No changes made to update.')
        } else if (!formData.name) {
            setFormErrors({ ...formErrors, name: 'Required' })
        } else {
            setIsLoading(true)
            updateWithoutOrg({
                entity: entity,
                body: formData,
                id: selectedId,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Salary Head',
                    operationType: 'update'
                }),
                screenName: 'Salary Head'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setIsLoading(false)
                        ToastSuccess(res.message)
                        onCloseHandler()
                        getAllHandler()
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    const validate = (data) => {
        
        let errors = {}
        if (!data.name || data.name.trim() === '') {
            errors.name = 'Required'
        }
        if (!data.type || !data.type.label) {
            errors.type = 'Required'
        }
        if (data.type && data.type.label === 'Deduction' && !data.deductionType) {
            errors.deductionType = 'Required'
        }
        return errors
    }

    // Show Delete modal
    const onDeleteHandler = (id) => {
        setShow(true)
        setSelectedId(id)
    }

    // Confirm delete head
    const proceedDeleteHandler = () => {
        setIsLoading(true)
        appownerDeleteById({
            entity: entity,
            id: selectedId,
            toastSuccessMessage: commonCrudSuccess({
                screen: 'Salary Head',
                operationType: 'delete'
            }),
            screenName: 'Salary Head'
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    ToastSuccess(res.message)
                    onCloseHandler()
                    getAllHandler()
                }
            })
            .catch((err) => {
                setIsLoading(false)
                ToastError(err.message)
            })
    }

    // Close modal
    const onCloseHandler = () => {
        setView(false)
        setShow(false)
        setFormData({})
        setFormErrors('')
    }

    // Columns for Table
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => <div style={{ width: '250px' }}>{row.original.name}</div>
        },
        {
            Header: 'Basic',
            accessor: 'basic',
            Cell: ({ row }) => (
                <>
                    <div style={{ width: '100px', whiteSpace: 'nowrap' }}>
                        {row.original && row.original.basic === true ? 'Yes' : 'No'}
                    </div>
                </>
            )
        },
        {
            Header: 'Category',
            accessor: 'type.label',
            Cell: ({ row }) => (
                <>
                    <div style={{ width: '200px', whiteSpace: 'nowrap' }}>
                        {row.original && row.original.type && row.original.type.label}
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
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            onClick={() => onViewHandler(row.original.id)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            onClick={() => onDeleteHandler(row.original.id)}
                        >
                            <DeleteIcon />
                        </Button>
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
                                <PageHeader pageTitle="Heads" />
                                <div className="table">
                                    <>
                                        <Button
                                            className="addButton"
                                            variant="addbtn"
                                            onClick={() => onAddHandler()}
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Modal for form */}
            <Modal show={view} size="lg" onHide={onCloseHandler}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Head</Modal.Title>
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
                                            <Col md={7}>
                                                <Form.Control
                                                    defaultValue={formData.name}
                                                    name="name"
                                                    onChange={onChangeHandler}
                                                    maxLength={50}
                                                />
                                                <p className="error">
                                                    {formErrors.name ? formErrors.name : ''}
                                                </p>
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
                                                Is Basic?
                                            </Form.Label>
                                            <Col md={7}>
                                                <input
                                                    className="radioAlign"
                                                    type="checkbox"
                                                    name={'isBasic'}
                                                    checked={formData.basic}
                                                    disabled={formData.id}
                                                    onChange={(e) => onChangeBasicHandler(e)}
                                                />
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
                                                Is DA?
                                            </Form.Label>
                                            <Col md={7}>
                                                <input
                                                    className="radioAlign"
                                                    type="checkbox"
                                                    name={'da'}
                                                    checked={formData.da}
                                                    onChange={(e) => onChangeDaHandler(e)}
                                                    disabled={formData.basic || formData.id}
                                                />
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
                                                Type <span className="error">*</span>
                                            </Form.Label>
                                            <Col md={7}>
                                                {formData.id ? (
                                                    <div className="radioAlign">
                                                        {formData && formData.type.label}
                                                    </div>
                                                ) : (
                                                    <Select
                                                        options={typeOptions}
                                                        value={formData && formData.type}
                                                        // onChange={(e) => setFormData({ ...formData, "type": e, "taxable": e.label == "Deduction" ? false : formData.taxable })}
                                                        onChange={(e) =>
                                                            onChangeTypeHandler('type', e)
                                                        }
                                                        isDisabled={
                                                            formData.basic ||
                                                            formData.da ||
                                                            formData.id
                                                        }
                                                    />
                                                )}
                                                <p className="error">
                                                    {formErrors.type ? formErrors.type : ''}
                                                </p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    {formData && formData.type ? (
                                        formData.type.label == 'Earning' ? (
                                            <div className="col-">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3 justify-content-center"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column sm={3}>
                                                        Is Taxable?
                                                    </Form.Label>
                                                    <Col md={7}>
                                                        <input
                                                            className="radioAlign"
                                                            type="checkbox"
                                                            name={'taxable'}
                                                            checked={formData.taxable}
                                                            onChange={() =>
                                                                setFormData({
                                                                    ...formData,
                                                                    taxable: !formData.taxable
                                                                })
                                                            }
                                                            disabled={
                                                                formData.basic ||
                                                                formData.da ||
                                                                formData.id
                                                            }
                                                        />
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
                                                        Deduction Type{' '}
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col md={7}>
                                                        {formData.id ? (
                                                            <div className="radioAlign">
                                                                {formData &&
                                                                    formData.deductionType.label}
                                                            </div>
                                                        ) : (
                                                            <Select
                                                                options={deductionOptions}
                                                                value={formData.deductionType}
                                                                // onChange={(e) => setFormData({ ...formData, "deductionType": e })}
                                                                onChange={(e) =>
                                                                    onDeductionTypeHandler(
                                                                        'deductionType',
                                                                        e
                                                                    )
                                                                }
                                                                isDisabled={formData.id}
                                                            />
                                                        )}
                                                        <p className="error">
                                                            {formErrors.deductionType
                                                                ? formErrors.deductionType
                                                                : ''}
                                                        </p>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        )
                                    ) : (
                                        ''
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <div className="btnCenter mb-3">
                    {formData.id ? (
                        <Button className="Button" variant="addbtn" onClick={onUpdateHandler}>
                            Update
                        </Button>
                    ) : (
                        <Button className="Button" variant="addbtn" onClick={onSaveHandler}>
                            Save
                        </Button>
                    )}
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        {cancelButtonName}
                    </Button>
                </div>
            </Modal>
            {/* Modal for delete */}
            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="modalHeader" closeButton>
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
        </div>
    )
}
export default HeadList
