import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { deleteById, getAllByOrgId, getById } from '../../Common/Services/CommonService'
import Table1 from '../../Common/Table/Table1'

const RoleList = () => {
    // State to store fetched roles
    const [data, setData] = useState([])
    // Accessing logged-in user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    // Loader state for showing/hiding loading indicators
    const [loading, setLoading] = useState(true)
    // ID of the role selected for deletion
    const [selectedId, setSelectedId] = useState('')

    // Modal visibility state
    const [show, setShow] = useState(false)
    // Function to close the modal
    const handleClose = () => setShow(false)
    // Entity name for CRUD operations
    const entity = 'roles'

    // Load data on initial component mount
    useEffect(() => {
        getRoleList()
    }, [])

    // Handle role deletion
    const onDeleteHandler = () => {
        setLoading(true)
        deleteById({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: selectedId,
            toastSuccessMessage: commonCrudSuccess({ screen: 'Role', operationType: 'delete' }),
            screenName: 'Role'
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setShow(false) // Close modal on success
                    getRoleList() // Refresh list
                    ToastSuccess(res.message) // Show success toast
                }
            })
            .catch((err) => {
                ToastError(err.message) // Show error toast
                setLoading(false)
            })
    }

    // Opens delete confirmation modal and sets selected ID
    const proceedDelete = (data) => {
        setShow(true)
        setSelectedId(data.id)
    }

    // Fetch list of roles based on organization ID
    const getRoleList = () => {
        setLoading(true)
        getAllByOrgId({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: userDetails.organizationId
        })
            .then((res) => {
                setLoading(false)
                if (res.data.length >= 1) {
                    setData(res.data) // Set fetched data
                }
            })
            .catch(() => {
                setLoading(false) // Hide loader on error
            })
    }

    // Table column configuration
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => (
                <>
                    <div className="tableData">{row.original.name}</div>
                </>
            )
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
                            onClick={() => handleEdit(row.original, row.id)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            onClick={() => proceedDelete(row.original, row.id)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    // Navigation hook
    const navigate = useNavigate()

    // Navigate to add new role form
    const onAddHandler = () => {
        navigate('/role', { state: { id: null } })
    }

    // Fetch role by ID and navigate to edit screen with pre-filled data
    const handleEdit = (data) => {
        setSelectedId(data.id)
        getById({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: data.id
        })
            .then((res) => {
                const data = res.data
                const id = data.id
                navigate('/role', { state: { data, id } })
            })
            .catch((err) => {
                ToastError(err.message) // Show error toast
                setLoading(false) // Hide loader on error
            })
    }

    return (
        <>
            {/* Main section layout */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* Page Title */}
                                <PageHeader pageTitle="Roles" />

                                <div className="">
                                    {/* Add Role Button */}
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={onAddHandler}
                                    >
                                        <AddIcon />
                                    </Button>
                                    {/* Show loader or table based on loading state */}
                                    {loading ? (
                                        <DetailLoader />
                                    ) : (
                                        <>
                                            <Table1
                                                key={data.length}
                                                columns={COLUMNS}
                                                data={data}
                                                serialNumber={true}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Delete ?</Modal.Title>
                    <Button variant="secondary" onClick={handleClose}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {/* Loader inside modal if needed */}
                    {loading ? <DetailLoader /> : ''}
                    Are you sure you want to delete this item?
                    <div className="delbtn">
                        {/* Yes and No buttons */}
                        <Button variant="addbtn" className="Button" onClick={onDeleteHandler}>
                            Yes
                        </Button>
                        <Button variant="secondary" className="Button" onClick={handleClose}>
                            No
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default RoleList
