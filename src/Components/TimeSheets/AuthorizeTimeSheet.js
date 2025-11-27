import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { FaEye } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DataBetweenDates from '../../Common/CommonComponents/DataBetweenDates'
import DateFormate from '../../Common/CommonComponents/DateFormate'
import FileViewer from '../../Common/CommonComponents/FileViewer'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { Pdf } from '../../Common/CommonIcons/CommonIcons'
import {
    TimeSheetAuthorizeAll,
    TimeSheetRejectAll,
    getTimesheetsBetweenDatesByMngId
} from '../../Common/Services/CommonService'
import Table from '../../Common/Table/Table'

const AuthorizeTimeSheet = () => {
    // Accessing user details from the Redux store using useSelector
    const userDetails = useSelector((state) => state.user.userDetails)

    // State for loading indicator
    const [loading, setLoading] = useState(true)

    // useNavigate hook to navigate between routes
    const navigate = useNavigate()

    // State for handling form data (initially empty)
    const [formData, setFormData] = useState('')

    // Function to handle navigation to the "reviewTimeSheet" page with the selected row's data
    const handleNavigate = (row) => {
        navigate('/reviewTimeSheet', { state: { row } })
    }

    // useEffect hook for setting initial date range (from 30 days ago to today)
    useEffect(() => {
        const pastdate = moment().subtract(30, 'days').toDate() // Get date 30 days ago
        const presentdate = moment() // Get today's date
        setFromDate(moment(pastdate).format('YYYY-MM-DD'))
        setToDate(moment(presentdate).format('YYYY-MM-DD'))
        setIsDirectSubordinateChecked(true) // Set default state for Direct Subordinate
        setIsIndirectSubordinateChecked(false) // Set default state for Indirect Subordinate
    }, [])

    // State for storing the authorized list data
    const [authList, setAuthList] = useState([])

    // State for character count in form field, used for tracking reason length
    const [charCount, setCharCount] = useState(
        authList && authList.reason ? authList.reason.length : 0
    )

    // Handler for form input changes
    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // Handler for input changes, limiting character count to 250
    const handleInputChange = (event) => {
        const { value } = event.target

        if (value.length <= 250) {
            setCharCount(value.length) // Update character count
            onChangeHandler(event) // Call the onChangeHandler to update form data
        }
    }

    // State to store the status of the button (e.g., "Submitted", "Approved")
    const [statusButton, setStatusButton] = useState('Submitted')

    // States for storing the from and to date
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)

    // States for handling Direct and Indirect subordinate checkbox states
    const [isDirectSubordinateChecked, setIsDirectSubordinateChecked] = useState(null) // Checked by default
    const [isIndirectSubordinateChecked, setIsIndirectSubordinateChecked] = useState(null) // Unchecked by default

    // Handler for Direct Subordinate checkbox change
    const handleDirectSubordinateChange = (event) => {
        setIsDirectSubordinateChecked(event.target.checked)
        setSelectedRows([])
    }

    // useEffect hook to trigger onGoHandler when date or subordinate state changes
    useEffect(() => {
        if (fromDate && toDate) {
            onGoHandler() // Trigger handler to fetch data when dates are selected
        }
    }, [setFromDate, setToDate, isDirectSubordinateChecked, isIndirectSubordinateChecked])

    // Handler for Indirect Subordinate checkbox change
    const handleIndirectSubordinateChange = (event) => {
        setIsIndirectSubordinateChecked(event.target.checked)
        setSelectedRows([])
    }

    // State for tracking the timesheet status filter
    const [timeSheetStatus, setTimeSheetStatus] = useState()

    // Array containing options for timesheet status filter
    const timeSheetOptions = [
        { value: 'All', label: 'All' }, // Option for "All"
        { label: 'Submitted', value: 'Submitted' }, // Option for "Submitted"
        { label: 'Approved', value: 'Approved' }, // Option for "Approved"
        { label: 'Rejected', value: 'Rejected' }, // Option for "Rejected"
        { label: 'Partial', value: 'Partial' } // Option for "Partial"
    ]

    // Function to handle fetching timesheets between a date range
    const onGoHandler = () => {
        setLoading(true) // Set loading state to true when starting the request
        // Calling the API to fetch timesheets data for a given employee
        getTimesheetsBetweenDatesByMngId({
            entity: 'timesheets',
            id: userDetails.employeeId == null ? 0 : userDetails.employeeId, // Use employeeId if available, otherwise fallback to 0
            resourceId: userDetails.employeeId == null ? userDetails.resourceId : 0, // Use resourceId if employeeId is null
            organizationId: userDetails.organizationId,
            fromDate: fromDate, // Date range start
            toDate: toDate, // Date range end
            status: timeSheetStatus, // Timesheet status filter
            direct: isDirectSubordinateChecked, // Direct subordinates filter
            inDirect: isIndirectSubordinateChecked // Indirect subordinates filter
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false) // Set loading state to false on success
                    setAuthList(res.data ? res.data : []) // Set the response data to authList
                    setStatusButton(timeSheetStatus) // Set the status button state
                } else {
                    setAuthList([]) // Clear the authList if the request fails
                }
            })
            .catch((err) => {
                setLoading(false) // Set loading state to false on error
                console.log(err, 'err') // Log any errors
            })
    }

    // States for comparing captured hours vs total hours
    const [compareHours, setCompareHours] = useState([]) // Stores the hours that need comparison
    const [selectedRows, setSelectedRows] = useState([]) // Stores selected rows

    // Extract original row IDs from selected rows
    const originalValues = selectedRows && selectedRows.map((e) => e.id)

    // UseEffect hook to update the compareHours state when selectedRows change
    useEffect(() => {
        setCompareHours(selectedRows && selectedRows.filter((e) => e.totalHours > e.capturedHours)) // Compare totalHours with capturedHours
    }, [selectedRows]) // Dependency on selectedRows

    // States for managing file visibility and handling file data
    const [fileShow, setFileShow] = useState(false) // State to toggle file view
    const [files, setFiles] = useState([]) // State to hold the files

    // Function to handle showing files in a modal or view
    const handleFilesShow = (file) => {
        setFileShow(true) // Show file view
        setFiles(file) // Set the files to be displayed
    }

    // Function to handle closing the file view
    const handleFileViewCloseHandler = () => {
        setFileShow(false) // Close file view
    }

    // State for managing visibility of reason input for rejection or approval
    const [vis, setVis] = useState(false)

    // Columns configuration for the table to display timesheet data
    const COLUMN = [
        {
            Header: 'Week ending on', // Header for the Weekend Date column
            accessor: 'weekendDate', // Field name in the data
            Cell: (row) => (
                <span>{<DateFormate date={row.row.original.weekendDate} />}</span> // Format the date using DateFormate component
            )
        },
        {
            Header: 'Employee Name', // Header for Employee Name
            accessor: 'employeeName' // Field name in the data
        },
        {
            Header: 'Project Name', // Header for Project Name
            accessor: 'projectName', // Field name in the data
            Cell: ({ row }) => <div>{row.original.projectName}</div> // Render project name
        },
        {
            Header: 'Status', // Header for the Status column
            accessor: 'status' // Field name in the data
        },
        {
            Header: 'Attachments', // Header for the Attachments column
            accessor: 'files', // Field name for files
            Cell: ({ row }) => (
                <>
                    {row.original.files == null || row.original.files.length == 0 ? (
                        '' // If there are no files, don't render anything
                    ) : (
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={
                                () => handleFilesShow(row.original.files) // Show files when clicked
                            }
                        >
                            <Pdf /> {/* Render PDF icon */}
                        </Button>
                    )}
                </>
            )
        },
        {
            Header: 'Captured Hours', // Header for Captured Hours
            accessor: 'capturedHours', // Field name for captured hours
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original.capturedHours} {/* Display captured hours */}
                </div>
            )
        },
        {
            Header: 'Total Hours', // Header for Total Hours
            accessor: 'totalHours', // Field name for total hours
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original.totalHours.toFixed(2)}{' '}
                    {/* Display total hours with 2 decimal places */}
                </div>
            )
        },
        ...(isIndirectSubordinateChecked
            ? [
                  {
                      Header: 'Manager Name', // Conditional column for Manager Name
                      accessor: 'managerName' // Field name for manager name
                  }
              ]
            : []), // Add "Manager Name" column only if Indirect Subordinate is checked

        {
            Header: () => <div className="text-right header actions">Actions</div>, // Header for actions column
            accessor: 'actions', // Field name for actions
            disableSortBy: true, // Disable sorting for this column
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => handleNavigate(row.original)} // Navigate to review page when clicked
                        >
                            <FaEye className="themeColor" size={20} />{' '}
                            {/* Eye icon to view details */}
                        </Button>
                    </div>
                </>
            )
        }
    ]

    // Function to handle approving all selected timesheets
    const handleAllApprove = () => {
        setLoading(true) // Set loading state to true
        TimeSheetAuthorizeAll({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            timesheetsids: originalValues, // Send the selected timesheet IDs
            managerId: userDetails.employeeId, // Manager ID
            reason: formData.reason, // Reason for approval
            body: selectedRows // Send the selected rows as body
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false) // Set loading state to false on success
                    setTimeout(() => {
                        setSelectedRows([])
                        toast.success('Timesheet approved successfully.') // Display success toast
                        onGoHandler() // Fetch the updated timesheet list
                        handleApproveCloseShow() // Close the approve modal
                    }, 1000)
                } else {
                    toast.error(res.message) // Display error toast if approval fails
                }
            })
            .catch((error) => {
                setLoading(false) // Set loading state to false on error
                console.log(error) // Log error
            })
    }

    // Function to handle rejecting all selected timesheets
    const handleAllReject = () => {
        setLoading(true) // Set loading state to true
        if (formData.reason == undefined || formData.reason == '') {
            setVis(true) // Show validation message if reason is not provided
        } else {
            TimeSheetRejectAll({
                entity: 'timesheets',
                organizationId: userDetails.organizationId,
                timesheetsids: originalValues, // Send the selected timesheet IDs
                managerId: userDetails.employeeId, // Manager ID
                reason: formData.reason, // Reason for rejection
                body: selectedRows // Send the selected rows as body
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false) // Set loading state to false on success
                        setTimeout(() => {
                            setSelectedRows([])
                            toast.success('Timesheet rejected successfully.') // Display success toast
                            onGoHandler() // Fetch the updated timesheet list
                            handleRejectCloseShow() // Close the reject modal
                        }, 1000)
                    } else {
                        toast.error(res.message) // Display error toast if rejection fails
                    }
                })
                .catch((error) => {
                    setLoading(false) // Set loading state to false on error
                    console.log(error) // Log error
                })
        }
    }

    // States for handling visibility of reject and approve modals
    const [rejectShow, setRejectShow] = useState(false)
    const [approveShow, setApproveShow] = useState(false)

    // Functions to show modals for reject and approve actions
    const handleRejectShow = () => {
        setRejectShow(true)
        console.log(selectedRows, 'chekingSelectedRowsFromList')
    }
    const handleApproveShow = () => {
        setApproveShow(true)
    }

    // Functions to close modals for reject and approve actions
    const handleRejectCloseShow = () => {
        setRejectShow(false)
        setVis(false) // Reset validation state
    }
    const handleApproveCloseShow = () => {
        // setCompareHours([]); // Reset compare hours
        setCharCount(0) // Reset character count
        setApproveShow(false)
    }

    // Columns for capturing hours (for a different table or view)
    const capturedColumns = [
        {
            Header: <div className="text-center header">Week ending on</div>, // Header for weekend date
            accessor: 'weekendDate', // Field name for weekend date
            Cell: ({ row }) => (
                <div className="text-center">{row.original.weekendDate}</div> // Display weekend date
            )
        },
        {
            Header: <div className="text-left header">Employee</div>, // Header for employee name
            accessor: 'employeeName', // Field name for employee name
            Cell: ({ row }) => (
                <div className="text-left">{row.original.employeeName}</div> // Display employee name
            )
        },
        {
            Header: <div className="text-right header">Captured Hours</div>, // Header for captured hours
            accessor: 'capturedHours', // Field name for captured hours
            Cell: ({ row }) => (
                <div className="text-right">{row.original.capturedHours.toFixed(2)}</div> // Display captured hours with 2 decimal places
            )
        },
        {
            Header: <div className="text-right header">Total Hours</div>, // Header for total hours
            accessor: 'totalHours', // Field name for total hours
            Cell: ({ row }) => (
                <div className="text-right">{row.original.totalHours.toFixed(2)}</div> // Display total hours with 2 decimal places
            )
        }
    ]

    return (
        <>
            <section className="section">
                {/* Conditional rendering of a loading indicator (DetailLoader) when 'loading' state is true */}
                {loading ? <DetailLoader /> : ''}
                <div className="" style={{ marginTop: '4rem' }}>
                    <DataBetweenDates
                        setFromDate={setFromDate} // Handler to set the 'from' date
                        setToDate={setToDate} // Handler to set the 'to' date
                        setStatus={setTimeSheetStatus} // Handler to set the timesheet status
                        options={timeSheetOptions} // Options for the timesheet status
                        handleGo={onGoHandler} // Handler to fetch data when the user clicks "Go"
                        defaultValue={{ label: 'Submitted', value: 'Submitted' }} // Default value for timesheet status
                    />
                </div>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* Page header component that displays the page title */}
                                <PageHeader pageTitle="Authorize Timesheets" />

                                <div className="card-body">
                                    {/* DataBetweenDates component to allow the user to select from and to dates, as well as the timesheet status */}

                                    {/* Spacer */}
                                    <div style={{ marginTop: '20px' }}>{''}</div>

                                    {/* Flex container to align checkboxes for direct and indirect reportees */}
                                    <div style={{ display: 'flex', float: 'right' }}>
                                        <label>Include </label>

                                        {/* Checkbox for selecting direct reportees */}
                                        <div style={{ marginRight: '25px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleDirectSubordinateChange} // Handler to toggle direct subordinates
                                                checked={isDirectSubordinateChecked} // Set the checked state based on the value
                                                style={{ marginLeft: '10px' }}
                                            />{' '}
                                            <label>Direct Reportees</label>
                                        </div>

                                        {/* Checkbox for selecting indirect reportees */}
                                        <div>
                                            <input
                                                type="checkbox"
                                                onChange={handleIndirectSubordinateChange} // Handler to toggle indirect subordinates
                                                checked={isIndirectSubordinateChecked} // Set the checked state based on the value
                                                style={{ marginLeft: '10px' }}
                                            />{' '}
                                            <label>Indirect Reportees</label>
                                        </div>
                                    </div>

                                    {/* Display the number of records in the template if more than 10 */}
                                    <div className="noOfRecordsInTemplet">
                                        {authList && authList.length > 10 ? (
                                            <span>
                                                No. of Records : {authList && authList.length}
                                            </span>
                                        ) : (
                                            ''
                                        )}
                                    </div>

                                    {/* Table component that displays the timesheet data with checkboxes, pagination, and selection */}
                                    <>
                                        <Table
                                            columns={COLUMN} // Columns configuration for the table
                                            setSelectedRows={setSelectedRows} // Handler to set selected rows
                                            recordStatus={timeSheetStatus} // Current status of the timesheet
                                            selectedRows={selectedRows} // Selected rows state
                                            checkBoxValue={true} // Enable checkboxes for selection
                                            data={authList} // Timesheet data to display in the table
                                            pageSize="10" // Page size for pagination
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section to show action buttons for approval, rejection, and closing */}
                <div className="btnCenter" style={{ marginTop: '7%' }}>
                    {/* Conditionally render action buttons based on the current status */}
                    {statusButton == 'Rejected' || statusButton == 'Approved' ? (
                        // Do not render action buttons if the status is "Rejected" or "Approved"
                        ''
                    ) : // Render buttons if there are records in the authList
                    authList && authList.length !== 0 ? (
                        <>
                            {/* Approve button, which shows a modal when clicked */}
                            <Button
                                variant="addbtn"
                                className="Button"
                                // onClick={handleAllApprove} // Commented-out onClick handler for approving all records
                                onClick={() => handleApproveShow()} // Show the approval modal when clicked
                                disabled={originalValues.length === 0} // Disable button if no rows are selected
                            >
                                Approve
                            </Button>

                            {/* Reject button, which shows a modal when clicked */}
                            <Button
                                variant="addbtn"
                                className="Button"
                                onClick={() => handleRejectShow()} // Show the rejection modal when clicked
                                disabled={originalValues.length === 0} // Disable button if no rows are selected
                            >
                                Reject
                            </Button>

                            {/* Close button to navigate back to the previous page */}
                            <Button
                                variant="secondary"
                                className="Button"
                                onClick={() => navigate('/')} // Navigate to the home or previous page when clicked
                            >
                                Close
                            </Button>
                        </>
                    ) : (
                        ''
                    )}
                </div>
            </section>
            {/* modal for file preview */}
            <Modal
                show={fileShow}
                onHide={handleFileViewCloseHandler}
                backdrop="static"
                size="lg"
                keyboard={false}
            >
                <Modal.Header closeButton={handleFileViewCloseHandler}>
                    <Modal.Title>Uploaded Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modalBody">
                        <FileViewer documents={files} />
                    </div>
                </Modal.Body>
            </Modal>

            {/* modal for reject all */}
            <Modal
                show={rejectShow}
                onHide={handleRejectCloseShow}
                backdrop="static"
                size=""
                keyboard={false}
            >
                <Modal.Header closeButton={handleRejectCloseShow}>
                    <Modal.Title>Reject Timesheets</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div class="col-12">
                        <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                            <Form.Label column md={4}>
                                Reason
                                <span className="error">*</span>:
                            </Form.Label>
                            <Col md={7}>
                                <Form.Control
                                    as="textarea"
                                    // required
                                    onChange={handleInputChange}
                                    name="reason"
                                    type="text"
                                    maxLength={250}
                                />
                                <div className="d-flex justify-content-end">
                                    <small>{charCount} / 250 </small>
                                </div>
                                <p className="error">{vis && 'Required'}</p>
                            </Col>
                        </Form.Group>
                    </div>
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={handleAllReject}>
                        Reject
                    </Button>
                    <Button className="Button" variant="secondary" onClick={handleRejectCloseShow}>
                        Close
                    </Button>
                </div>
            </Modal>
            {/* modal for approve all */}
            <Modal
                show={approveShow}
                onHide={handleApproveCloseShow}
                backdrop="static"
                size={compareHours.length != 0 ? 'lg' : ''}
                keyboard={false}
            >
                <Modal.Header closeButton={handleApproveCloseShow}>
                    <Modal.Title>Approve Timesheets</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {compareHours.length != 0 ? (
                        <>
                            <div className="error">
                                The submitted hours are more than the captured hours for the below
                                timesheet(s) Click on "Approve" if you still want to approve Or
                                Click on "Close" to stay on this page.
                            </div>
                            <div style={{ marginTop: '10px' }} className="">
                                <Table
                                    data={compareHours}
                                    columns={capturedColumns}
                                    serialNumber={true}
                                />
                            </div>
                        </>
                    ) : (
                        <div class="col-12">
                            <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                <Form.Label column md={4}>
                                    Reason:
                                </Form.Label>
                                <Col md={7}>
                                    <Form.Control
                                        as="textarea"
                                        // required
                                        onChange={handleInputChange}
                                        name="reason"
                                        type="text"
                                    />
                                    <div className="d-flex justify-content-end">
                                        <small>{charCount} / 250 </small>
                                    </div>
                                </Col>
                            </Form.Group>
                        </div>
                    )}
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={handleAllApprove}>
                        Approve
                    </Button>
                    <Button className="Button" variant="secondary" onClick={handleApproveCloseShow}>
                        Close
                    </Button>
                </div>
            </Modal>
        </>
    )
}
export default AuthorizeTimeSheet
