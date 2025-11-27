import React from 'react' // Importing React library
import { Button, Modal } from 'react-bootstrap' // Importing Bootstrap components (Button and Modal)
import { useEffect, useState } from 'react' // Importing useState hook to manage local state
import { MdLockReset } from 'react-icons/md' // Importing reset lock icon from react-icons
import { useSelector } from 'react-redux' // Importing useSelector hook to access Redux store
import { useNavigate } from 'react-router-dom' // Importing hooks for routing (useLocation, useNavigate)
import { toast} from 'react-toastify' // Importing toast notifications for user feedback
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader' // Importing a detailed loader component
import PageHeader from '../../Common/CommonComponents/PageHeader' // Importing PageHeader component
import { AddIcon, EditIcon, UnLock } from '../../Common/CommonIcons/CommonIcons' // Importing custom icons for actions
import { deleteById, getAllByOrgId } from '../../Common/Services/CommonService' // Importing common service functions
import { getAllUsersByPackage, reset, unlockUser } from '../../Common/Services/OtherServices' // Importing other service functions
import Table1 from '../../Common/Table/Table1' // Importing the custom Table1 component
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
const UsersList = () => {
    // Defining UsersList functional component
    const userDetails = useSelector((state) => state.user.userDetails) // Accessing user details from the Redux store
    const selectId = [] // Defining state to store selected IDs
    const [loading, setLoading] = useState(true) // Defining loading state to manage loading indicator

    const [usersList, setUsersList] = useState([]) // Defining state to store the list of users
    const [remainder, setRemainder] = useState() // Defining state to store the remainder for user limit
    const [range, setRange] = useState({}) // Defining state for package range

    useEffect(() => {
        // Using useEffect hook to fetch data on component mount
        getUsersList() // Fetch users list
        getPackageRange() // Fetch package range details
    }, []) // Empty dependency array ensures the effect runs only once on mount

    const getPackageRange = () => {
        // Function to fetch the package range
        getAllUsersByPackage({
            entity: 'subscriptions',
            organizationId: userDetails.organizationId
        }).then((res) => {
            // Handling promise resolution
            setRemainder((res.data.toRange / 100) * 10) // Calculating the remainder
            setRange(res.data) // Setting the range data
        })
    }

    const getUsersList = () => {
        // Function to fetch the list of users
        getAllByOrgId({ entity: 'users', organizationId: userDetails.organizationId })
            .then((res) => {
                // Handling promise resolution
                setLoading(false) // Setting loading state to false after data is fetched
                setUsersList(res.data ? res.data : []) // Setting users list from the response
            })
            .catch((err) => {
                // Handling promise rejection
                console.log(err) // Logging any errors
                setLoading(false)
            })
    }

    const [show, setShow] = useState() // State for controlling the delete modal

    const onCloseHandler = () => {
        // Function to close the delete modal
        setShow(false) // Hides the modal
    }

    const proceedDeleteHandler = () => {
        // Function to handle user deletion
        deleteById({
            entity: 'users',
            organizationId: userDetails.organizationId,
            id: selectId
        }).then((res) => {
            // Handling promise resolution
            if (res.statusCode == 200) {
                // Checking if deletion was successful
                toast.success('Record deleted successfully.') // Showing success message
                onCloseHandler() // Closing the modal
                getUsersList() // Refreshing the users list
            } else {
                toast.error(res.message) // Showing error message if deletion fails
            }
        })
    }

    const onLockHandler = (row) => {
        // Function to handle user lock/unlock
        unlockUser({ entity: 'users', id: row.original.id })
            .then((res) => {
                // Handling promise resolution
                if (res.statusCode == 200) {
                    // Checking if unlocking was successful
                    toast.success('UnLock successfully.') // Showing success message
                    getUsersList() // Refreshing the users list
                } else {
                    toast.error(res.errorMessage) // Showing error message if unlocking fails
                }
            })
            .catch((err) => {
                // Handling promise rejection
                console.log(err, 'error') // Logging any errors
            })
    }

    const [resetShow, setResetShow] = useState() // State for controlling the reset modal
    const [userName, setUserName] = useState('') // State to store the username for resetting password

    const handleResetShow = (e) => {
        // Function to show the reset modal
        setResetShow(true) // Showing the modal
        setUserName(e) // Setting the username for resetting password
    }

    const handleResetClose = () => {
        // Function to close the reset modal
        setResetShow(false) // Hiding the modal
    }

    const handleReset = () => {
        // Function to handle password reset
        reset({ entity: 'users', username: userName,toastSuccessMessage: commonCrudSuccess({ screen: 'User', operationType: 'reset' }) })
            .then((res) => {
                // Handling promise resolution
                if (res.statusCode == 200) {
                    // Checking if reset was successful
                    ToastSuccess(res.data) // Showing success message
                    handleResetClose() // Closing the modal
                    getUsersList() // Refreshing the users list
                    setResetShow(false)
                } 
            })
            .catch((err) => {
                // Handling promise rejection
                console.log(err, 'error') // Logging any errors
                ToastError(err.message)
                setResetShow(false) // Hiding the modal on error
            })
    }

    const COLUMNS = [
        // Defining table columns
        {
            Header: 'Employee', // Column header for employee name
            accessor: 'employeeName', // Mapping the column to employee name
            Cell: (
                { row } // Custom cell rendering
            ) => (
                <div>{row.original ? row.original.employeeName : '-'}</div> // Displaying employee name or "-" if not available
            )
        },
        {
            Header: 'Username', // Column header for username
            accessor: 'email' // Mapping the column to email (username)
        },
        {
            Header: 'Role', // Column header for role name
            accessor: 'roleName', // Mapping the column to role name
            Cell: (
                { row } // Custom cell rendering
            ) => (
                <div>{row.original ? row.original.roleName : '-'}</div> // Displaying role name or "-" if not available
            )
        },
        {
            Header: 'Status', // Column header for user status
            accessor: 'deleted', // Mapping the column to deleted status
            Cell: (
                { row } // Custom cell rendering
            ) => (
                // Displaying "Inactive" if deleted, otherwise "Active"
                <div className="text-left">{row.original.deleted ? 'Inactive' : 'Active'}</div>
            )
        },
        {
            Header: 'Reset', // Column header for reset action
            accessor: '', // Empty accessor (no data mapping)
            disableSortBy: true, // Disabling sorting for this column
            Cell: (
                { row } // Custom cell rendering for reset button
            ) => (
                // Reset icon
                <div className="text-left">
                    <Button
                        disabled={row.original.locked == true}
                        variant=""
                        className="iconWidth"
                        onClick={() => handleResetShow(row.original.email)}
                    >
                        <MdLockReset className="themeColor" size={20} />
                    </Button>
                </div>
            )
        },
        {
            Header: <div className="text-wrap text-right  actions">Actions</div>, // Column header for actions
            accessor: 'actions', // Mapping the column to actions
            disableSortBy: true, // Disabling sorting for this column
            Cell: (
                { row } // Custom cell rendering for action buttons
            ) => (
                <div className="text-wrap text-right" style={{ width: '145px', float: 'right' }}>
                    {row.original.locked ? (
                        // Unlock button
                        <Button variant="" className="iconWidth" onClick={() => onLockHandler(row)}>
                            <UnLock />
                        </Button>
                    ) : ""}
                    {/* // Edit button */}
                    <Button
                        variant=""
                        className="iconWidth"
                        style={{ paddingRight: '38%' }}
                        onClick={() => handleEdit(row.original.id, row.original)}
                    >
                        <EditIcon />
                    </Button>
                </div>
            )
        }
    ]

    const navigate = useNavigate() // Hook for navigation

    const handleEdit = (id, data) => {
        // Function to handle editing
        navigate('/user', { state: { usersList, id, data, key: 'Add' } }) // Navigating to the user edit page
    }

    const [warningShow, setWarnongShow] = useState(false) // State for controlling the warning modal
    const existingEmploeeIds = usersList.map(u => u.employeeId)
    const handleAdd = () => {
        // Function to handle adding a new user
        if (usersList.length >= range.toRange) {
            // Checking if the user limit is reached
            setWarnongShow(true) // Showing the warning modal
        } else {
            navigate('/user', { state: { existingEmploeeIds, id: null, key: 'Add' } }) // Navigating to the user add page
        }
    }

    const onWarningCloseHandler = () => {
        // Function to close the warning modal
        setWarnongShow(false) // Hiding the modal
    }

    return (
        <>
            <section className="section">
                {/* Show the loader if data is still being fetched */}
                {loading ? <DetailLoader /> : ''}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* // Page header */}
                                <PageHeader pageTitle="Users" />
                                <div className="">
                                    {/* // Add button */}
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => handleAdd()}
                                    >
                                        <AddIcon />
                                    </Button>
                                    {/* // Table component with user data */}
                                    <Table1
                                        columns={COLUMNS}
                                        planUpgrade={
                                            range.toRange - usersList.length <= remainder
                                                ? true
                                                : false
                                        }
                                        remainder={range.toRange - usersList.length}
                                        serialNumber={true}
                                        data={usersList}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modals for delete, reset, and warning actions */}
            <Modal show={resetShow} onHide={handleResetClose}>
                <Modal.Header closeButton={handleResetClose}>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure. Do you Want to reset password ?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={handleReset}>
                        Proceed
                    </Button>
                    <Button className="Button" variant="secondary" onClick={handleResetClose}>
                        Close
                    </Button>
                </div>
            </Modal>

            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="modalHeader" closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item ?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>

            <Modal
                show={warningShow}
                onHide={onWarningCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header className="modalHeader" closeButton={onWarningCloseHandler}>
                    <img src="/dist/Images/alert-emergency-light_svgrepo.com.png" height="30px" />
                    <Modal.Title style={{ marginLeft: '-8rem', marginBottom: '-0.5rem' }}>
                        User Limit Reached
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    You have reached the maximum users allowed in your basic plan. To add more users
                    and expand your capabilities
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        className="Button"
                        style={{ borderRadius: '20px', color: 'white', backgroundColor: '#004aad' }}
                        variant=""
                        onClick={() => navigate('/packages')}
                    >
                        Upgrade Now
                    </Button>
                    <Button
                        className="Button"
                        style={{ borderRadius: '20px', color: 'white', backgroundColor: '#004aad' }}
                        variant=""
                        onClick={onWarningCloseHandler}
                    >
                        Upgrade Later
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default UsersList // Exporting the UsersList component
