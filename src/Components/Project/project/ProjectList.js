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
import { AddIcon, EditIcon, DeleteIcon } from '../../../Common/CommonIcons/CommonIcons'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'

const ProjectList = () => {
    const entity = 'projects' // Entity name used in API requests
    const userDetails = useSelector((state) => state.user.userDetails) // Fetch logged-in user details from Redux store
    const [data, setData] = useState([]) // State to store fetched project list
    const [loading, setLoading] = useState(true) // Loading state

    const [selectedId, setSelectedId] = useState('') // Selected project ID for edit/delete
    const [show, setShow] = useState(false) // Modal visibility state

    const handleClose = () => setShow(false) // Closes the delete confirmation modal

    // Delete handler function
    const onDeleteHandler = () => {
        deleteById({
            entity: entity,
            organizationId: userDetails.organizationId,
            id: selectedId,
            toastSuccessMessage: commonCrudSuccess({ screen: 'Project', operationType: 'delete' }),
            screenName: 'Project'
        })
            .then((res) => {
                setShow(false)
                if (res.statusCode == 200) {
                    getProjectList() // Refresh list after successful deletion
                    ToastSuccess(res.message)
                }
            })
            .catch((err) => {
                ToastError(err.message)
            })
    }

    // Fetch project list when component mounts
    useEffect(() => {
        getProjectList()
    }, [])

    // API call to get all projects by org ID
    const getProjectList = () => {
        getAllByOrgId({ entity: entity, organizationId: userDetails.organizationId })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setData(res.data)
                } else {
                    setData([])
                      setLoading(false)
                }
            })
            .catch((err) => {
                console.log(err)
                  setLoading(false)
            })
    }

    // Called when delete icon is clicked
    const proceedDelete = (data) => {
        setShow(true)
        setSelectedId(data.id)
    }

    // Table column definitions
    const COLUMNS = [
        { Header: 'Name', accessor: 'name' },
        {
            Header: 'Technology',
            accessor: 'technology',
            width: 180, // or any width you prefer
            Cell: ({ value }) => (
                <div
                    style={{
                        maxWidth: 160, // slightly less than column width for padding
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    title={value}
                >
                    {value}
                </div>
            )
        },
        { Header: 'Client', accessor: 'projectClientName' },
        {
            Header: 'Actual Start Date',
            accessor: 'actualStartDate',
            Cell: ({ row }) => (
                <div>
                    {row.original.actualStartDate && (
                        <DateFormate date={row.original.actualStartDate} />
                    )}
                </div>
            )
        },
        {
            Header: 'Expected Start Date',
            accessor: 'expectedStartDate',
            Cell: ({ row }) => <div>{<DateFormate date={row.original.expectedStartDate} />}</div>
        },
        { Header: 'Status', accessor: 'projectStatusName' },
        { Header: 'Code', accessor: 'code' },
        {
            Header: () => (
                <div className="header text-right" style={{ marginRight: '10%' }}>
                    Actions
                </div>
            ),
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-wrap text-right actionsWidth">
                    {/* Edit Button */}
                    <Button
                        type="button"
                        className="iconWidth"
                        variant=""
                        onClick={() => handleEdit(row.original, row.id)}
                    >
                        <EditIcon />
                    </Button>
                    |{/* Delete Button */}
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        onClick={() => proceedDelete(row.original, row.id)}
                    >
                        <DeleteIcon />
                    </Button>
                </div>
            )
        }
    ]

    const navigate = useNavigate()

    // Called when Add button is clicked
    const onAddHandler = () => {
        navigate('/project', { state: { id: null } })
    }

    // Called when Edit button is clicked
    const handleEdit = (data) => {
        setSelectedId(data.projectId)
        getById({ entity: entity, organizationId: userDetails.organizationId, id: data.id })
            .then((res) => {
                const data = res.data
                const id = data.id
                navigate('/project', { state: { data, id } })
            })
            .catch((err) => {
                console.log(err)
            })
    }

    return (
        <>
            {/* Main Section */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                <PageHeader pageTitle={'Projects'} />
                                <div>
                                    {/* Add New Project Button */}
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={onAddHandler}
                                    >
                                        <AddIcon />
                                    </Button>

                                    {/* Conditional rendering for loader or table */}
                                    {loading ? (
                                        <DetailLoader />
                                    ) : (
                                        <Table1 key={data.length} columns={COLUMNS} serialNumber={true} data={data} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="delbtn">
                    <Button className="Button" variant="addbtn" onClick={onDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={handleClose}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default ProjectList
