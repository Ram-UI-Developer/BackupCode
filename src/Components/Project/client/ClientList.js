import React, { useState, useEffect } from 'react'
import Table1 from '../../../Common/Table/Table1'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import {
    deleteById,
    getAllByOrgId,
    getById
} from '../../../Common/Services/CommonService'
import Modal from 'react-bootstrap/Modal'
import { useSelector } from 'react-redux'
// import { AddIcon,EditIcon,DeleteIcon } from '../../Common/CommonIcons/CommonIcons'
import { AddIcon, EditIcon, DeleteIcon } from '../../../Common/CommonIcons/CommonIcons'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'

const ClientList = () => {
    const entity = 'projectclients' // API entity type
    const [data, setData] = useState([]) // State to store list of clients
    const userDetails = useSelector((state) => state.user.userDetails) // Get logged-in user details from Redux
    const [selectedId, setSelectedId] = useState('') // Store selected client ID for deletion/edit
    const [show, setShow] = useState(false) // Control modal visibility
    const [loading, setLoading] = useState(true) // Control loader
    const navigate = useNavigate() // Navigation hook

    // Function to close modal
    const handleClose = () => {
        setShow(false)
    }

    // Function to delete client
    const onDeleteHandler = () => {
        deleteById({
            entity: entity,
            organizationId: userDetails.organizationId,
            id: selectedId,
            screenName: 'Client',
            toastSuccessMessage: commonCrudSuccess({ screen: 'Client', operationType: 'delete' })
        })
            .then((res) => {
                setShow(false) // Close modal on success
                if (res.statusCode == 200) {
                    getClientList() // Refresh list
                    ToastSuccess(res.message) // Show success toast
                }
            })
            .catch((err) => {
                ToastError(err.message) // Show error toast
            })
    }

    // Trigger delete modal
    const proceedDelete = (data) => {
        setShow(true) // Open modal
        setSelectedId(data.id) // Set selected client ID
    }

    // Fetch client list on component mount
    useEffect(() => {
        getClientList()
    }, [])

    // API call to fetch clients
    const getClientList = () => {
        getAllByOrgId({ entity: entity, organizationId: userDetails.organizationId })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setData(res.data) // Populate data
                } else {
                    setData([]) // Fallback to empty array
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Table column definitions
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name'
        },

        {
            Header: 'Location Name',
            accessor: 'locationName'
        },
        {
            Header: 'Email',
            accessor: 'email'
        },

        {
            Header: () => (
                <div className="text-right header " style={{ marginRight: '10%' }}>
                    Actions
                </div>
            ),
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

    // Handle add new client
    const onAddHandler = () => {
        navigate('/client', { state: { id: null } }) // Navigate to client form with null ID
    }

    // Handle edit existing client
    const handleEdit = (data) => {
        setSelectedId(data.id) // Set selected client ID
        getById({ entity: entity, organizationId: userDetails.organizationId, id: data.id })
            .then((res) => {
                const data = res.data
                const resourceList = res.data.resourceDTOs ? res.data.resourceDTOs : []
                const id = data.id
                navigate('/client', { state: { data, resourceList, id } })
            })
            .catch(() => {})
    }

    return (
        <>
            {/* Main section if authorized */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Clients'} />
                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={onAddHandler}
                                    >
                                        <AddIcon />
                                    </Button>
                                    {/* Show loader or table */}
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

            {/* Modal for delete confirmation */}
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center' }}>
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="delbtn">
                    <Button variant="addbtn" className="Button" onClick={onDeleteHandler}>
                        Yes
                    </Button>
                    <Button variant="secondary" className="Button" onClick={handleClose}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default ClientList
