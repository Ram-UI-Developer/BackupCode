import { useState } from 'react'; // Importing React and useState hook
import { Modal } from 'react-bootstrap'; // Importing Bootstrap components for layout and modal
import { useSelector } from 'react-redux'; // Importing useSelector hook to access the Redux store
import DateFormate from '../../../Common/CommonComponents/DateFormate'; // Importing custom DateFormat component
import { getEmpProjectDetails } from '../../../Common/Services/OtherServices'; // Importing the function to get project details
import TableWith5Rows from '../../../Common/Table/TableWith5Rows'; // Importing custom Table component with 5 rows per page

const EmployeeProjectDetails = ({ employeeData }) => {
    // Retrieving user details from the Redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    // Setting up state variables for holding project data and modal visibility
    const [data, setData] = useState([]) // State to hold project details
    const [show, setShow] = useState(false) // State to control modal visibility

    // Function to fetch project details using an API call
    const getProjectDetails = () => {
        getEmpProjectDetails({
            entity: 'projects',
            organizationId: userDetails.organizationId,
            id: employeeData.id || employeeData // Fetching the project details based on employee ID
        })
            .then((res) => {
                // Logging the response data to the console for debugging
                console.log(res, 'chekcingDatafromData')
                if (res.statusCode == 200) {
                    setData(res.data) // Storing the fetched project details in state
                }
            })
            .catch((err) => {
                console.log(err, 'error') // Logging any errors
            })
    }

    // Function to open the modal when the user clicks the "Project Details" link
    const handleShow = () => {
        getProjectDetails() // Fetching the project details
        setShow(true) // Setting the modal visibility to true
    }

    // Function to close the modal when the user clicks the close button or outside the modal
    const onCloseHandler = () => {
        setShow(false) // Setting the modal visibility to false
    }

    // Columns for the project details table
    const COLUMNS = [
        {
            Header: 'Project Name', // Column header
            accessor: 'projectName', // Field name to access the data for this column
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.projectName}
                    {/* // Displaying the project name */}
                </div>
            )
        },
        {
            Header: 'Start Date', // Column header
            accessor: 'startDate', // Field name to access the data for this column
            Cell: ({ row }) => (
                <div className="text-left">
                    <DateFormate date={row.original.startDate} />
                    {/* // Formatting and displaying the start date using the DateFormate component */}
                </div>
            )
        },
        {
            Header: 'End Date', // Column header
            accessor: 'endDate', // Field name to access the data for this column
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.endDate ? <DateFormate date={row.original.endDate} /> : ''}
                    {/* // Formatting and displaying the end date, if available */}
                </div>
            )
        },
        {
            Header: 'Manager', // Column header
            accessor: 'projectManagerName', // Field name to access the data for this column
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.projectManagerName}
                    {/* // Displaying the project manager name */}
                </div>
            )
        },
        {
            Header: 'Status', // Column header
            accessor: 'projectStatus', // Field name to access the data for this column
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.projectStatusName}
                    {/* // Displaying the project status name */}
                </div>
            )
        }
    ]

    return (
        <div>
            {/* Project details link that triggers the modal */}
            <div>
                &ensp;
                <span>
                    <a className="" id="viewProjectDetails" onClick={handleShow}>
                        <u style={{ fontSize: '14px' }}>Project Details</u>
                    </a>
                </span>
            </div>

            {/* Modal component that displays project details */}
            <Modal
                show={show} // Modal visibility controlled by the 'show' state
                size="lg" // Setting modal size to large
                onHide={onCloseHandler} // Function to close the modal
                backdrop="static" // Prevents closing the modal by clicking outside
                keyboard={false} // Disables closing the modal with the keyboard escape key
            >
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Project Details</Modal.Title> {/* Title of the modal */}
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {/* Table component that displays the project details with a maximum of 5 rows */}
                    <TableWith5Rows columns={COLUMNS} serialNumber={true} data={data} />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default EmployeeProjectDetails
