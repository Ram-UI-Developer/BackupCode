import React, { useEffect, useState } from 'react' // Importing necessary hooks and libraries
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons' // Importing common icons (Add, Delete, Edit)
import PageHeader from '../../../Common/CommonComponents/PageHeader' // Importing a header component for the page
import { Button, Modal } from 'react-bootstrap' // Importing Button and Modal components from react-bootstrap
import { useNavigate } from 'react-router-dom' // Importing the hook for navigation
import { getAll, PackageDeleteById } from '../../../Common/Services/CommonService' // Importing API functions for fetching and deleting data
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized' // Importing customized Toast notifications
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages' // Importing custom success message for CRUD operations
import DragableTable from '../../../Common/Table/DragableTable' // Importing the drag-and-drop table component
import { listOrder } from '../../../Common/Services/OtherServices' // Importing function for saving list order
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader' // Importing detailed loader component
import { toast } from 'react-toastify'

const PackagesList = () => {
    const [loading, setLoading] = useState(true) // State to track loading status
    const [show, setShow] = useState(false) // State to control modal visibility
    const [selectedId, setSelectedId] = useState() // State to store selected item ID for deletion
    const [data, setData] = useState([]) // State to store the list of packages data

    useEffect(() => {
        handleGetAllPackages() // Fetch packages data when the component is mounted
    }, []) // Empty dependency array ensures this runs only once when the component is mounted

    // Function to handle the order of the list (drag-and-drop reordering)
    const onListOrderHandler = () => {
        listOrder({ entity: 'packages', body: data.map((e) => e.id) }) // Call listOrder API with package IDs
            .then((res) => {
                if (res.statusCode == 200) {
                    toast.success('Packages order updated successfully!') // Show success message if successful
                }
            })
            .catch((err) => {
                ToastError(err.message) // Show error message if there was an error
            })
    }

    // Function to fetch all packages data
    const handleGetAllPackages = () => {
        getAll({ entity: 'packages' }) // Fetch all packages from the API
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false) // Set loading to false when data is successfully fetched
                    setData(res.data) // Store the fetched data in state
                } else {
                    setData([]) // If the response isn't successful, set an empty data array
                }
            })
            .catch((err) => {
                console.log(err, 'error') // Log the error to the console
            })
    }

    const navigate = useNavigate() // Initialize the navigate function for navigation

    // Function to handle the Add button click
    const onAddHandler = (id) => {
        navigate('/packageSubscription', { state: { id } }) // Navigate to the package subscription page with the selected ID
    }

    // Function to handle the Delete button click (opens modal)
    const onDeleteHandler = (id) => {
        setShow(true) // Show the confirmation modal
        setSelectedId(id) // Set the selected ID for deletion
    }

    const onCloseHandler = () => {
        setShow(false) // Close the confirmation modal
    }

    // Function to proceed with deleting the selected package
    const proceedDeleteHandler = () => {
        PackageDeleteById({
            entity: 'packages',
            id: selectedId, // Pass entity and selected ID
            toastSuccessMessage: commonCrudSuccess({ screen: 'packages', operationType: 'delete' }), // Show success message after deletion
            screenName: 'packages' // The screen name where the operation was performed
        })
            .then((res) => {
                setShow(false) // Close the modal
                if (res.statusCode == 200) {
                    handleGetAllPackages() // Refresh the package list after deletion
                    ToastSuccess(res.message) // Show success message
                    onCloseHandler() // Close the modal
                }
            })
            .catch((err) => {
                ToastError(err.message) // Show error message if deletion fails
            })
    }

    // Function to format numbers (e.g., currency formatting)
    const formatNumber = (number) => {
        if (number == null) return '' // Return empty string if number is null
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2, // Ensure at least two decimal places
            maximumFractionDigits: 2 // Limit to two decimal places
        }).format(number)
    }

    // Define columns for the table
    const COLUMNS = [
        {
            Header: 'Name', // Column header
            accessor: 'name' // Accessor to retrieve the 'name' property from data
        },
        {
            Header: <div className="numericColHeading">Base Users Slabs</div>, // Column header
            accessor: 'n0ofusers', // Accessor for the number of users
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original && row.original.slabs[0].fromRange} -{' '}
                    {row.original && row.original.slabs[0].toRange}
                </div>
            ) // Display user slab range
        },
        {
            Header: <div className="numericColHeading">Actual Price</div>, // Column header
            accessor: 'actualPrice', // Accessor for the actual price
            Cell: ({ row }) => (
                <div className="numericData">
                    {/* // Display price with currency symbol and formatting */}
                    &#8377; {formatNumber(row.original.total)}
                </div>
            )
        },
        {
            Header: <div className="numericColHeading">Discount</div>, // Column header
            accessor: 'discount', // Accessor for the discount
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original && row.original.slabs[0].discounts[0].percentage ? (
                        ''
                    ) : (
                        <> &#8377;</>
                    )}{' '}
                    {row.original &&
                        formatNumber(
                            row.original.slabs[0].discounts[0].value
                                ? row.original.slabs[0].discounts[0].value
                                : 0
                        )}{' '}
                    {row.original.slabs[0].discounts[0].percentage ? '%' : ''}
                </div>
            )
        },
        {
            Header: <div className="numericColHeading">Price After Discount</div>, // Column header
            accessor: 'priceAfterDiscount', // Accessor for price after discount
            Cell: ({ row }) => (
                <div className="numericData">
                    &#8377; {row.original && formatNumber(row.original.slabs[0].afterDiscount)}
                </div>
            )
        },
        {
            Header: <div className="numericColHeading">No Of Subscribers</div>, // Column header
            accessor: 'subscriberscount', // Accessor for subscriber count
            Cell: ({ row }) => (
                <div className="numericData">
                    {/* // Display subscriber count */}
                    {row.original.subscriberscount}
                </div>
            )
        },
        {
            Header: <div className="text-left header">Status</div>, // Column header
            accessor: 'active', // Accessor for status (active or inactive)
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.active ? 'Active' : <span className="error">Inactive</span>}
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>, // Column header for actions
            accessor: 'actions', // Accessor for actions column
            disableSortBy: true, // Disable sorting for the actions column
            Cell: ({ row }) => (
                <>
                    <div className="text-right actionsWidth">
                        {/* Edit Button */}
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            onClick={() => onAddHandler(row.original.id)} // Navigate to add or edit page
                        >
                            <EditIcon />
                        </Button>
                        |{/* Delete Button */}
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            onClick={() => onDeleteHandler(row.original.id)} // Trigger delete action
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
            <section className="section">
                {loading ? <DetailLoader /> : ''} {/* Show a loader when data is loading */}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Subscription Packages'} />{' '}
                                {/* Page header */}
                                <div className="table">
                                    {/* Add button to add new package */}
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => onAddHandler(null)}
                                    >
                                        <AddIcon />
                                    </Button>{' '}
                                    <div
                                        style={{
                                            marginTop: '2%',
                                            position: 'absolute',
                                            fontWeight: '500',
                                            marginLeft: '0.2%'
                                        }}
                                    ></div>
                                    {/* Draggable table for package list */}
                                    <DragableTable
                                        columns={COLUMNS}
                                        data={data}
                                        setData={setData}
                                        draggableKey={'name'}
                                        serialNumber={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Button to save list order */}
                {data.length == 0 ? (
                    ''
                ) : (
                    <div style={{ marginLeft: '45%', marginTop: '2%',marginBottom:'2%'  }}>
                        <Button
                            className="Button"
                            variant="addbtn"
                            onClick={onListOrderHandler} // Save the order of packages
                        >
                            Save
                        </Button>
                    </div>
                )}
            </section>
            {/* Modal for confirming deletion */}
            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={() => onCloseHandler()}>
                    <Modal.Title>Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    {/* Yes and No buttons */}
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={proceedDeleteHandler} // Proceed with deletion
                    >
                        Yes
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler} // Close the modal
                    >
                        No
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default PackagesList // Export the PackagesList component
