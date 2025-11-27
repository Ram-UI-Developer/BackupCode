import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { EditFile, ViewFile } from '../../../Common/CommonIcons/CommonIcons'
import { getAppraisalsByIdForEmployee } from '../../../Common/Services/CommonService'
import { getAllEmployeeAppraisalList } from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import IndividualTrainingNeeds from '../IndividualTrainingNeeds/IndividualTrainingNeeds'
import SelfReview from '../SelfReview/SelfReview'

const EmployeeReviewList = () => {
    // Use Redux selector to get user details from the store
    const userDetails = useSelector((state) => state.user.userDetails)
    // React router hook to navigate between pages
    const navigate = useNavigate()
    // State variables for loading, data, modal visibility, and appraisal form data
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([]) // To store the fetched appraisal data
    const [show, setShow] = useState(false) // Controls the visibility of the modal
    const [apprisalForm, setApprisalForm] = useState({}) // Stores selected appraisal form data

    // useEffect hook to fetch the appraisal data when the component is mounted
    useEffect(() => {
        getAllAppraisals()
    }, [])

    // Function to fetch all appraisals for the employee
    const getAllAppraisals = () => {
        getAllEmployeeAppraisalList({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: userDetails && userDetails.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setData(res.data) // Update the state with fetched appraisal data
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    // Function to get a specific appraisal by ID for an employee
    const onGetApprisalHandlerById = (id) => {
        getAppraisalsByIdForEmployee({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setApprisalForm(res.data) // Store the selected appraisal form data
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    // Function to handle editing of an appraisal form
    const handleEdit = (id) => {
        navigate('/selfratings', { state: { id } }) // Redirect to the self-rating page with the selected ID
    }

    // Function to view the appraisal form details
    const onViewHandler = (id) => {
        setShow(true) // Display the modal to show details
        onGetApprisalHandlerById(id) // Fetch and set appraisal details
    }

    // Function to close the modal
    const onCloseHandler = () => {
        setShow(false) // Hide the modal
    }

    // Define columns for the appraisal table
    const COLUMNS = [
        {
            Header: 'Review Period',
            accessor: 'name'
        },
        {
            Header: 'Generated Date',
            accessor: 'generatedDate'
        },
        {
            Header: 'Submission Deadline',
            accessor: 'submissionDeadline'
        },
        {
            Header: 'Reporting Manager',
            accessor: 'managerName'
        },
        {
            Header: 'Status',
            accessor: 'status'
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            // Custom cell for rendering action buttons for edit and view
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        {/* Edit button - disabled if status is not "Saved" */}
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            disabled={'Saved' !== row.original.status}
                            onClick={() => handleEdit(row.original.id)}
                        >
                            <EditFile />
                        </Button>
                        |{/* View button - disabled if status is "Saved" or "Submitted" */}
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            disabled={
                                row.original.status == 'Saved' || row.original.status == 'Submitted'
                            }
                            onClick={() => onViewHandler(row.original.id)}
                        >
                            <ViewFile />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    return (
        <div>
            <section className="section">
                {/* Display loader while data is being fetched */}
                {loading ? <DetailLoader /> : ''}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* Page header displaying the title */}
                                <PageHeader pageTitle={'Appraisal Forms'} />
                                <div className="table">
                                    <div> </div>
                                    {/* Display the number of records if there are more than 10 */}
                                    <div className="noOfRecords">
                                        {data.length > 10 ? (
                                            <span>No. of Records : {data.length}</span>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                    {/* Render Table component with the defined columns and data */}
                                    <Table columns={COLUMNS} serialNumber={true} data={data} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal to display the detailed appraisal form */}
            <Modal show={show} onHide={onCloseHandler} size="xl">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Appraisal Form</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginTop: '-40px' }}>
                        {/* Render different sections of the appraisal form */}
                        <SelfReview
                            isCompleted={true}
                            apprisalForm={apprisalForm}
                            employee={true}
                            readOnly={true}
                        />
                        <IndividualTrainingNeeds
                            isCompleted={true}
                            employee={true}
                            apprisalForm={apprisalForm}
                            readOnly={true}
                        />
                        {/* These sections are commented out, but can be enabled if needed */}
                        {/* <EmployeeAndManagerReview isManager={true} apprisalForm={apprisalForm} readOnly={true} /> */}
                        {/* <ManagerAssessment apprisalForm={apprisalForm} readOnly={true} /> */}
                    </div>
                </Modal.Body>

                {/* Button to close the modal */}
                <Button
                    style={{ marginRight: 'auto', marginLeft: 'auto', marginBottom: '2%' }}
                    className="Button"
                    variant="secondary"
                    onClick={onCloseHandler}
                >
                    {cancelButtonName}
                </Button>
            </Modal>
        </div>
    )
}

export default EmployeeReviewList
