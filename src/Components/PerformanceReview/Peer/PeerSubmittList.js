import React, { useEffect, useState } from 'react' // Importing React, useState, and useEffect hooks
import { Button, Modal } from 'react-bootstrap' // Importing Button and Modal from react-bootstrap for UI elements
import { useSelector } from 'react-redux' // Importing useSelector hook to access Redux state
import { useNavigate } from 'react-router-dom' // Importing useNavigate hook for navigation
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader' // Importing DetailLoader component to show loading state
import PageHeader from '../../../Common/CommonComponents/PageHeader' // Importing custom PageHeader component
import { AddIcon, EditFile, ViewFile } from '../../../Common/CommonIcons/CommonIcons' // Importing custom icons
import { getById } from '../../../Common/Services/CommonService' // Importing services for API calls
import { getAllEmployeeAppraisalList } from '../../../Common/Services/OtherServices' // Importing service for fetching employee appraisal list
import Table from '../../../Common/Table/Table' // Importing custom Table component
import { cancelButtonName } from '../../../Common/Utilities/Constants' // Importing constant for cancel button name
import IndividualTrainingNeeds from '../IndividualTrainingNeeds/IndividualTrainingNeeds' // Importing IndividualTrainingNeeds component
import EmployeeAndManagerReview from '../ManagerReview/EmployeeAndManagerReview' // Importing EmployeeAndManagerReview component
import SelfReview from '../SelfReview/SelfReview' // Importing SelfReview component

const PeerSubmittList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Accessing user details from Redux store
    const navigate = useNavigate() // Initializing navigation function
    const [loading, setLoading] = useState(true) // State to manage loading state
    const [data, setData] = useState([]) // State to store the data (appraisal forms)
    const [show, setShow] = useState(false) // State to control modal visibility
    const [apprisalForm, setApprisalForm] = useState({}) // State to store the selected appraisal form data

    useEffect(() => {
        getAllAppraisals() // Fetch the list of all appraisals when the component mounts
    }, [])

    // Fetches all employee appraisals
    const getAllAppraisals = () => {
        getAllEmployeeAppraisalList({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: userDetails && userDetails.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false) // Set loading to false when data is fetched
                    setData(res.data) // Store the fetched data in state
                }
            })
            .catch((err) => {
                console.log(err, 'error') // Log any errors
            })
    }

    // Fetches a specific appraisal form by ID
    const onGetApprisalHandlerById = (id) => {
        getById({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setApprisalForm(res.data) // Set the retrieved appraisal form to state
                }
            })
            .catch((err) => {
                console.log(err, 'error') // Log any errors
            })
    }

    // Navigate to self-ratings page for editing an appraisal form
    const handleEdit = (id) => {
        navigate('/selfratings', { state: { id } }) // Navigate to /selfratings page with ID in state
    }

    // Opens the modal to view an appraisal form
    const onViewHandler = (id) => {
        setShow(true) // Show the modal
        onGetApprisalHandlerById(id) // Fetch the selected appraisal form by ID
    }

    // Closes the modal
    const onCloseHandler = () => {
        setShow(false) // Hide the modal
    }

    // Table columns configuration
    const COLUMNS = [
        {
            Header: 'Review Period', // Column header for Review Period
            accessor: 'name' // Key in the data object for review period
        },
        {
            Header: 'Generated Date', // Column header for Generated Date
            accessor: 'generatedDate' // Key in the data object for generated date
        },
        {
            Header: 'Submission Deadline', // Column header for Submission Deadline
            accessor: 'submissionDeadline' // Key in the data object for submission deadline
        },
        {
            Header: 'Reporting Manager', // Column header for Reporting Manager
            accessor: 'managerName' // Key in the data object for manager name
        },
        {
            Header: 'Status', // Column header for Status
            accessor: 'status' // Key in the data object for status
        },
        {
            Header: () => (
                <div className="text-wrap text-right " style={{ marginRight: '10%' }}>
                    Actions
                </div>
            ), // Custom header for Actions column with some styling
            accessor: 'actions', // Key for actions in the data object
            disableSortBy: true, // Disable sorting for this column
            Cell: (
                { row } // Custom cell rendering for actions column
            ) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        {/* Edit button for appraisals that are in "Saved" status */}
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            disabled={'Saved' !== row.original.status}
                            onClick={() => handleEdit(row.original.id)}
                        >
                            <EditFile /> {/* Edit icon */}
                        </Button>{' '}
                        |
                        {/* View button for appraisals that are not in "Saved" or "Submitted" status */}
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            disabled={
                                row.original.status == 'Saved' || row.original.status == 'Submitted'
                            }
                            onClick={() => onViewHandler(row.original.id)}
                        >
                            <ViewFile /> {/* View icon */}
                        </Button>
                    </div>
                </>
            )
        }
    ]

    return (
        <div>
            <section className="section">
                {loading ? <DetailLoader /> : ''} {/* Show loader while data is loading */}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Appraisal Forms'} />{' '}
                                {/* Page header with title */}
                                <div className="table">
                                    {/* Button to add new appraisal form */}
                                    <Button className="addButton" variant="addbtn">
                                        <AddIcon /> {/* Add icon */}
                                    </Button>
                                    {/* Display number of records in the table */}
                                    <div className="noOfRecords">
                                        No. of Records : {data.length}
                                    </div>
                                    {/* Table component to display appraisal data */}
                                    <Table columns={COLUMNS} serialNumber={true} data={data} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal to view detailed appraisal form */}
            <Modal show={show} onHide={onCloseHandler} size="xl">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Appraisal Form</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginTop: '-40px' }}>
                        {/* Components to display different sections of the appraisal form in read-only mode */}
                        <SelfReview apprisalForm={apprisalForm} readOnly={true} />
                        <IndividualTrainingNeeds apprisalForm={apprisalForm} readOnly={true} />
                        <EmployeeAndManagerReview
                            isManager={true}
                            apprisalForm={apprisalForm}
                            readOnly={true}
                        />
                    </div>
                </Modal.Body>
                <div className="btnCenter mb-3">
                    {/* Cancel button to close the modal */}
                    <Button
                        style={{ marginRight: 'auto', marginLeft: 'auto' }}
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        {cancelButtonName} {/* Text for cancel button */}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export default PeerSubmittList
