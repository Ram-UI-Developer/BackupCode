import React, { useEffect, useState } from 'react'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import {
    AddIcon,
    ApproveIcon,
    Cancelation,
    DeleteIcon,
    EditIcon,
    RejectIcon
} from '../../Common/CommonIcons/CommonIcons'
import Table1 from '../../Common/Table/Table1'
import { useNavigate } from 'react-router-dom'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import { Button, Col, Form, Modal, Row, Tooltip } from 'react-bootstrap'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { deleteById, update } from '../../Common/Services/CommonService'
import { ToastError } from '../../Common/CommonComponents/ToastCustomized'
import { getAllByDelegateManager } from '../../Common/Services/OtherServices'
import { toast } from 'react-toastify'

const DelegateList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // getting user details from redux store
    const navigate = useNavigate() // for redirect
    const loading = false // state for page loader
    const [delegateList, setDelegateList] = useState([
        // {
        //     id: 1,
        //     delegateTo: 29,
        //     delegate: 'To John Doe',
        //     modules: ['Module1', 'Module2'],
        //     startDate: '2025-08-20',
        //     endDate: '2025-08-22',
        //     status: 'Accepted',
        //     description: 'Delegate for John Doe'
        // },
        // {
        //     id: 2,
        //     delegateTo: 28,
        //     delegate: 'From Jane Smith',
        //     modules: ['Module3'],
        //     startDate: '2025-02-25',
        //     endDate: '2025-11-26',
        //     status: 'Pending',
        //     description: 'Delegate for Jane Smith'
        // }
    ]) // state for delegate list
    const [show, setShow] = useState(false) // state for popup
    const [deleteShow, setDeleteShow] = useState(false) // state for popup
    const [selectedRow, setSelectedRow] = useState({}) // state for selected delegate ID to delete
    const [rowStatus, setRowStatus] = useState('')
    const [formErrors, setFormErrors] = useState({})
    const [formData, setFormData] = useState({
        remarks: ''
    }) // state for form data

    useEffect(() => {
        onGetAllHandler()
    }, [])

    const onGetAllHandler = () => {
        getAllByDelegateManager({ entity: "managerdelegate", id: userDetails.employeeId, organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode === 200) {
                    // Assuming res.data is the array of delegates
                    setDelegateList(res.data)
                }
            })
            .catch((err) => {
                console.error('Error fetching delegates:', err)
                // Handle error appropriately, e.g., show a toast notification
                // ToastError(err.message)
            })
    }

    const onCloseHandler = () => {
        // handling close handler for delete popUp
        setShow(false)
        setDeleteShow(false)
        setFormErrors({})
    }

    const onActionHandler = (row, status) => {
        setShow(true)
        setRowStatus(status)
        setSelectedRow({ ...row, status: status, remarks: '' }) // setting selected row data to state
    }

    const onChangeHandler = (e) => {
        // handling change in input field
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setSelectedRow({ ...selectedRow, [e.target.name]: e.target.value })
        setFormErrors({ ...formErrors, [e.target.name]: '' }) // Resetting error for the field
    }

    const onDeleteHandler = (row) => {
        setSelectedRow(row)
        setDeleteShow(true)
    }

    // Columns for table
    const COLUMNS = [
        {
            Header: 'Delegate',
            accessor: 'delegate',
            Cell: ({ row }) => (
                <>
                    {row.original.delegateManagerId === userDetails.employeeId ?
                        <>
                            From {row.original.primaryManagerName}
                        </> :
                        <>
                            To {row.original.delegateManagerName}
                        </>
                    }

                </>
            )
        },
        {
            Header: 'Modules',
            accessor: 'modules',
        },
        {
            Header: 'Start Date',
            accessor: 'startDate',
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.startDate
                        ? moment(row.original.startDate).format('DD-MMM-YYYY')
                        : 'N/A'}
                </div>
            )
        },
        {
            Header: 'End Date',
            accessor: 'endDate',
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.endDate
                        ? moment(row.original.endDate).format('DD-MMM-YYYY')
                        : 'N/A'}
                </div>
            )
        },
        {
            Header: 'Status',
            accessor: 'status'
        },
        {
            Header: 'Description',
            accessor: 'description',
            Cell: ({ value }) => (
                <div className="wrap-cell">{value}</div>
            )
        },
        {
            Header: 'Remarks',
            accessor: 'remarks',
            Cell: ({ value }) => (
                <div className="wrap-cell">{value}</div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right" >
                        {row.original.delegateManagerId === userDetails.employeeId ? (
                            <>
                                <Button
                                    type="button"
                                    className="iconWidth"
                                    variant=""
                                    disabled={row.original.status != 'PENDING'}
                                    onClick={() => onActionHandler(row.original, "REJECTED")}
                                >
                                    <Tooltip title="Reject">
                                        <RejectIcon />
                                    </Tooltip>
                                    <RejectIcon />
                                </Button>
                                |
                                <Button
                                    type="button"
                                    variant=""
                                    className="iconWidth"
                                    disabled={row.original.status != 'PENDING'}
                                    onClick={() => onActionHandler(row.original, "APPROVED")}

                                >
                                    <Tooltip title="Approve">
                                        <ApproveIcon />
                                    </Tooltip>
                                    <ApproveIcon />
                                </Button>
                            </>
                        ) : (
                            <div style={{textWrap:"nowrap"}} >
                                <Button
                                    type="button"
                                    className="iconWidth"
                                    variant=""
                                    disabled={row.original.status == 'CANCELLED' || row.original.status == 'REJECTED'}
                                    onClick={() => onActionHandler(row.original, "CANCELLED")}
                                >
                                    <Tooltip title="Cancel">
                                        <Cancelation />
                                    </Tooltip>
                                    <Cancelation />
                                </Button>
                                |
                                <Button
                                    type="button"
                                    className="iconWidth"
                                    variant=""
                                    disabled={row.original.status === "APPROVED"}
                                    onClick={() =>
                                        navigate('/delegate', { state: { id: row.original.id } })
                                    }
                                >
                                    <EditIcon />
                                </Button>
                                |
                                <Button
                                    type="button"
                                    variant=""
                                    className="iconWidth"
                                    disabled={row.original.status === "APPROVED"}
                                    onClick={() => onDeleteHandler(row.original)}
                                >
                                    <DeleteIcon />
                                </Button>
                            </div>

                        )}
                    </div>
                </>
            )
        }
    ]

    const proceedDeleteHandler = () => {
        deleteById({ entity: "managerdelegate", organizationId: userDetails.organizationId, id: selectedRow.id })
            .then((res) => {
                if (res.statusCode == 200) {
                    // ToastSuccess(res.message)
                    toast.success('Manager delegate deleted successfully.')
                    onGetAllHandler()
                    onCloseHandler()
                }
            })
            .catch((err) => {
                ToastError(err.message)
            })
    }

    const onApproveRejectHandler = () => {
        const status = rowStatus.toLowerCase()
         
        if (rowStatus == "REJECTED" && !formData.remarks) {
            setFormErrors({ ...formErrors, remarks: 'Required' })
            return
        }
        update({ entity: "managerdelegate", organizationId: userDetails.organizationId, id: selectedRow.id, body: selectedRow })
            .then((response) => {
                if (response.statusCode === 200) {
                    // ToastSuccess(response.message)
                    toast.success(`Manager delegate ${status} successfully.`)
                    onCloseHandler()
                    onGetAllHandler()
                } else {
                    // Handle error response
                    console.error('Error saving delegate:', response.data)
                }
            })
            .catch((err) => {
                ToastError(err.message)
            })
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle="Delegates" />

                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() =>
                                            navigate('/delegate', { state: { id: null } })
                                        }
                                    >
                                        <AddIcon />
                                    </Button>
                                    {
                                        <>
                                            <Table1
                                                columns={COLUMNS}
                                                data={delegateList}
                                                serialNumber={true}
                                                pageSize="10"
                                            />
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                    <Modal.Header
                        className="modalHeader"
                        closeButton={onCloseHandler}
                        style={{ borderBottom: 'none', padding: '10px 20px' }}
                    >
                        <Modal.Title></Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '0px 10% 5% 10%' }}>
                        <Row className="mb-1">
                            <Form.Group as={Col} controlId="formGridReject">
                                <Form.Label>
                                    Remarks {rowStatus == 'REJECTED' && <span className="error"> *</span>}
                                </Form.Label>
                                <Form.Control type="text" as={'textarea'} maxLength={250} placeholder="Type here" name='remarks' onChange={onChangeHandler} />
                                {formErrors.remarks && (
                                    <span className="error">{formErrors.remarks}</span>
                                )}
                            </Form.Group>
                        </Row>
                    </Modal.Body>
                    <div className="btnCenter mb-3">
                        <Button className="Button" variant="addbtn" onClick={onApproveRejectHandler}>
                            Proceed
                        </Button>
                        <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                            Close
                        </Button>
                    </div>
                </Modal>
                <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton={onCloseHandler}>
                        <Modal.Title>Delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        Are you sure you want to delete this item?
                    </Modal.Body>
                    <div className="delbtn">
                        <Button variant="addbtn" className="Button" onClick={proceedDeleteHandler}>
                            Yes
                        </Button>
                        <Button variant="secondary" onClick={onCloseHandler} className="Button">
                            No
                        </Button>
                    </div>
                </Modal>
            </section>
        </>
    )
}

export default DelegateList
