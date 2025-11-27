import React, { useEffect, useState } from 'react' // Importing React, useEffect, useState hooks
import { Button } from 'react-bootstrap' // Importing Button from react-bootstrap for UI controls
import { useSelector } from 'react-redux' // Importing the useSelector hook to access Redux state
import { useNavigate } from 'react-router-dom' // Importing useNavigate hook to handle navigation
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader' // Importing the DetailLoader component to show loading state
import PageHeader from '../../../Common/CommonComponents/PageHeader' // Importing custom PageHeader component
import { EditFile } from '../../../Common/CommonIcons/CommonIcons' // Importing custom icons
import { peerGetList } from '../../../Common/Services/OtherServices' // Importing the API call function to get the peer review list
import Table from '../../../Common/Table/Table' // Importing custom Table component

const PeerReviewList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Fetching user details from Redux store

    useEffect(() => {
        getAllPeerReviewList() // Fetch the list of peer reviews when the component mounts
    }, [])

    const [data, setData] = useState([]) // State to hold the data (peer reviews)
    const [loading, setLoading] = useState(true) // State to handle loading spinner

    const getAllPeerReviewList = () => {
        setLoading(true) // Set loading state to true before fetching data
        peerGetList({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: userDetails.employeeId
        }) // API call to fetch the peer review list
            .then((res) => {
                if (res.statusCode == 200) {
                    // Check if the API response is successful
                    setData(res.data) // Set the fetched data to the state
                    setLoading(false) // Set loading state to false after data is fetched
                }
            })
    }

    const navigate = useNavigate() // Initialize the navigation function
    const handleEdit = (id) => {
        navigate('/peerReview', { state: { id } }) // Navigate to the peerReview page with the peer review ID
    }

    const columns = [
        {
            Header: 'Employee Name', // Column header for Employee Name
            accessor: 'employeeName' // Key in the data object to access employee name
        },
        {
            Header: 'Review Period', // Column header for Review Period
            accessor: 'name' // Key in the data object to access review period name
        },
        {
            Header: 'Generated Date', // Column header for Generated Date
            accessor: 'generatedDate' // Key in the data object to access generated date
        },
        {
            Header: 'Submission Deadline', // Column header for Submission Deadline
            accessor: 'peerSubmissionDeadline' // Key in the data object to access submission deadline
        },
        {
            Header: 'Reporting Manager', // Column header for Reporting Manager
            accessor: 'managerName' // Key in the data object to access reporting manager's name
        },
        {
            Header: 'Status', // Column header for Status
            accessor: 'status' // Key in the data object to access the status
        },
        {
            Header: () => (
                <div className="text-wrap text-right header" style={{ marginRight: '10%' }}>
                    Actions
                </div>
            ), // Header for Actions column with some styling
            accessor: 'actions', // Key in the data object for actions
            disableSortBy: true, // Disable sorting on this column
            Cell: (
                { row } // Custom rendering for the actions cell
            ) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            disabled={'PeerReviewed' == row.original.status} // Disable button if the status is "PeerReviewed"
                            // Handle click event to edit the review
                            onClick={() => handleEdit(row.original.id)}
                        >
                            <EditFile /> {/* Edit Icon */}
                        </Button>
                    </div>
                </>
            )
        }
    ]

    return (
        <div>
            <section className="section">
                {loading ? <DetailLoader /> : ''} {/* Show loader if data is loading */}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className=" card-primary">
                                <PageHeader pageTitle={'Appraisal Forms'} />{' '}
                                {/* Display page title */}
                                <div className="noOfRecords">
                                    {data.length > 10 ? (
                                        <span>No. of Records : {data.length}</span>
                                    ) : (
                                        ''
                                    )}{' '}
                                    {/* Show the number of records if more than 10 */}
                                </div>
                                <Table columns={columns} serialNumber={true} data={data} />{' '}
                                {/* Render the Table component with data */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PeerReviewList
