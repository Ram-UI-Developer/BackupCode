import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import { deleteById, getAllByOrgId } from '../../../Common/Services/CommonService'
import Table1 from '../../../Common/Table/Table1'

const ExpenseList = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    // State to manage loading indicator during API calls
    const [loading, setLoading] = useState(true)
    // State to store the list of expense categories fetched from backend
    const [ExpenseList, setExpenseList] = useState([])
    // State to keep track of the selected expense category ID for deletion
    const [selectedId, setSelectedId] = useState('')
    // state for popups
    const [show, setShow] = useState(false)
    // for redirect
    const navigate = useNavigate()

    // Close Handler
    const onCloseHandler = () => {
        setShow(false)
    }

    useEffect(() => {
        getAllExpensecategory()
    }, [])

    // Function to fetch all expense categories for the logged-in user's organization
    const getAllExpensecategory = () => {
        getAllByOrgId({
            entity: 'expensecategories',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        }).then((res) => {
            setLoading(false)
            if (res.statusCode == 200) {
                // If API call is successful, update the state with fetched data
                setExpenseList(res.data)
            }
        })
    }

    // Edit
    const onEditHandler = (id) => {
        navigate('/Expense', { state: { id } })
    }

    // Delete
    const onDeleteHandler = (id) => {
        setShow(true)
        setSelectedId(id)
    }

    // Function to proceed with deletion of the selected expense category
    const proceedDeleteHandler = () => {
        setLoading(true)
        // Call API to delete the expense category by ID and organization
        deleteById({
            entity: 'expensecategories',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: selectedId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    toast.success('Deleted Successfully.')
                    setLoading(false) // Hide loader
                    getAllExpensecategory() // Refresh the list after deletion
                    onCloseHandler() // Close the confirmation modal
                } else {
                    // If API returns an error response
                    setLoading(false)
                    toast.error(res.errorMessage)
                    onCloseHandler()
                }
            })
            .catch((err) => {
                // Handle network or unexpected errors
                setLoading(false)
                console.log(err, 'error')
            })
    }

    // Move this outside the ExpenseList component
    const ActionsHeader = () => (
        <div style={{ marginRight: '2%' }} className="header text-right holidayActions">
            Actions
        </div>
    )
    const ActionCell = ({ row, onEditHandler, onDeleteHandler }) => (
        <div className="text-wrap text-right" style={{ width: '145px', float: 'right' }}>
            <Button
                type="button"
                variant=""
                className="iconWidth"
                onClick={() => onEditHandler(row.original.id)}
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
    )

    // colums for table
    const COLUMNS = [
        { Header: 'Category', accessor: 'name' },
        {
            Header: ActionsHeader,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: (props) => (
                <ActionCell
                    row={props.row}
                    onEditHandler={onEditHandler}
                    onDeleteHandler={onDeleteHandler}
                />
            )
        }
    ]

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Expense Categories'} />

                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() =>
                                            navigate('/Expense', { state: { id: null } })
                                        }
                                    >
                                        <AddIcon />
                                    </Button>

                                    <>
                                        <Table1
                                            columns={COLUMNS}
                                            data={ExpenseList}
                                            serialNumber={true}
                                            key={ExpenseList.length}
                                            pageSize="10"
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                    {/* <Button variant="secondary" onClick={onCloseHandler}>
            X
          </Button> */}
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {loading ? <DetailLoader /> : ''}
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
export default ExpenseList
