import React, { useEffect, useState } from 'react' // Importing React and useState, useEffect hooks for managing state and side effects
import { ActionIcon } from '../../../Common/CommonIcons/CommonIcons' // Importing ActionIcon component used for button icon
import DataBetweenDates from '../../../Common/CommonComponents/DataBetweenDates' // Importing DataBetweenDates component for the date range selection
import PageHeader from '../../../Common/CommonComponents/PageHeader' // Importing PageHeader component for displaying the page title
import { Button, Col, Form, Row } from 'react-bootstrap' // Importing Bootstrap components for layout and form handling
import Table from '../../../Common/Table/Table' // Importing Table component to display the appraisal data in a table
import Select from 'react-select' // Importing React Select for location selection dropdown

import { useNavigate } from 'react-router-dom' // Importing the useNavigate hook to handle navigation to other pages
import { useSelector } from 'react-redux' // Importing the useSelector hook to access the Redux store and retrieve user details
import {
    getAllAppraisalListByLocation,
    getAllById,
    getAppraisalBetweenDates
} from '../../../Common/Services/OtherServices' // Importing API service functions for fetching data
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader' // Importing a custom loader component to show while data is being fetched

// HRReviewList functional component that displays a list of appraisals with location-based filtering
const HRReviewList = () => {
    const navigate = useNavigate() // Initializing useNavigate hook to navigate between pages
    const userDetails = useSelector((state) => state.user.userDetails) // Retrieving user details from the Redux store

    // useEffect to load employees data on component mount
    useEffect(() => {
        getAllEmployees() // Calling the function to get all employees
    }, [])

    const [loading, setLoading] = useState(true) // State to manage the loading indicator
    const [data, setData] = useState([]) // State to store the appraisal data to be displayed in the table

    const [locations, setLocations] = useState([]) // State to store the available locations
    const [locationId, setLocationId] = useState(userDetails.locationId) // State to track the selected location ID

    // useEffect to fetch the locations based on the user's organization ID
    useEffect(() => {
        getAllLocationById() // Calling the function to fetch locations when the component is mounted
    }, [])

    // Function to fetch the locations available to the user based on organization ID
    const getAllLocationById = () => {
        setLoading(true) // Setting the loading state to true while fetching locations
        getAllById({ entity: 'locations', id: userDetails.organizationId }) // API call to fetch location data
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLoading(false) // Set loading to false once data is fetched
                        // Filtering locations based on the user's access level
                        setLocations(
                            userDetails.accessible == 'Global'
                                ? res.data
                                : res.data.filter((item1) =>
                                      userDetails.allowedLocations.some(
                                          (item2) => item1.id === item2
                                      )
                                  )
                        )
                    }
                },
                (err) => {
                    setLoading(false) // Handle error by setting loading to false
                    console.log(err) // Log the error to the console
                }
            )
            .catch((error) => {
                setLoading(false) // Handle error by setting loading to false
                console.log(error) // Log the error to the console
            })
    }

    // Mapping the location data to format it for the Select dropdown
    const locationOptions = locations
        ? locations.map((option) => ({
              value: option.id,
              label: option.name
          }))
        : []

    // Function to handle the location change in the dropdown
    const handleLocationHandler = (selection) => {
        getAllEmployees(selection.value) // Fetching employees data based on the selected location
        setLocationId(selection.value) // Updating the location ID state
    }

    // Function to fetch all employees based on the selected location
    const getAllEmployees = (id) => {
        setLoading(true) // Setting loading state to true while fetching employees data
        getAllAppraisalListByLocation({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            locationId: id ? id : userDetails.locationId
        }) // API call to fetch appraisal data by location
            .then(
                (res) => {
                    setData(res.data ? res.data : []) // Storing the fetched data in the state
                    setLoading(false) // Setting loading to false once the data is fetched
                },
                (error) => {
                    setLoading(false) // Handle error by setting loading to false
                    console.log(error) // Log the error to the console
                }
            )
            .catch((err) => {
                setLoading(false) // Handle error by setting loading to false
                console.log(err) // Log the error to the console
            })
    }

    // Function to navigate to the HR Rating page with the selected appraisal ID
    const handleNavigateHrd = (id) => {
        navigate('/hrRating', { state: { id: id } }) // Navigate to the HR rating page with the selected appraisal ID as state
    }

    // Defining the columns for the table that displays appraisal data
    const COLUMNS = [
        {
            Header: 'Location',
            accessor: 'locationName' // Accessor for location name
        },
        {
            Header: 'Employee Name',
            accessor: 'employeeName' // Accessor for employee name
        },
        {
            Header: 'Review Period',
            accessor: 'reviewPeriodFrom' // Accessor for review period start date
        },
        {
            Header: 'Review Deadline',
            accessor: 'reviewPeriodTo' // Accessor for review deadline date
        },
        {
            Header: 'Reporting Manager',
            accessor: 'managerName' // Accessor for manager's name
        },
        {
            Header: 'Status',
            accessor: 'status' // Accessor for appraisal status
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>, // Column header for actions
            accessor: 'actions', // Accessor for actions column
            disableSortBy: true, // Disabling sorting for the actions column
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            variant=" "
                            disabled={
                                row.original.status != 'Reviewed' &&
                                row.original.status != 'Completed'
                            } // Disabling the button based on the appraisal status
                            onClick={() => handleNavigateHrd(row.original.id)} // Calling handleNavigateHrd on button click to navigate
                        >
                            <ActionIcon /> {/* Action icon to be displayed in the button */}
                        </Button>
                    </div>
                </>
            )
        }
    ]

    // States to manage the filters for date range and status
    const [status, setStatus] = useState('') // State for managing the status filter
    const [fromDate, setFromDate] = useState('') // State for managing the start date filter
    const [toDate, setToDate] = useState('') // State for managing the end date filter

    // Function to handle data filtering between selected dates and status
    const handleDataBetweenDates = () => {
        setLoading(true) // Setting loading state to true while fetching filtered data
        getAppraisalBetweenDates({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: locationId,
            fromDate: fromDate,
            toDate: toDate,
            status: status
        }) // API call to fetch appraisal data between dates
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLoading(false) // Set loading to false once data is fetched
                        setData(res.data) // Updating the state with the filtered data
                    } else {
                        setData([]) // If no data is found, set the data state to an empty array
                    }
                },
                (err) => {
                    setLoading(false) // Handle error by setting loading to false
                    console.log(err) // Log the error to the console
                }
            )
            .catch((error) => {
                setLoading(false) // Handle error by setting loading to false
                console.log(error) // Log the error to the console
            })
    }

    // Options for status dropdown filter
    const statusOptions = [
        { label: 'Completed', value: 'Completed' },
        { label: 'Saved', value: 'Saved' },
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Reviewed', value: 'Reviewed' },
        { label: 'All', value: null } // Option for selecting all statuses
    ]

    return (
        <div>
            <section className="section">
                {loading ? <DetailLoader /> : ''}{' '}
                {/* Displaying a loader while data is being fetched */}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Appraisal Forms'} />{' '}
                                {/* Displaying the page title */}
                                <div className="card-body">
                                    {/* This div contains the body of the card where the form and table are displayed */}
                                    <form style={{ marginBottom: '2%' }}>
                                        {/* Form element to hold the location selection and date range filters */}
                                        <Row>
                                            <div className="col-7">
                                                {/* Column with width 7 to hold the Location dropdown */}
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    {/* Form group for the location dropdown */}
                                                    <Form.Label column sm={2}>
                                                        Location
                                                    </Form.Label>
                                                    {/* Label for the location selection */}
                                                    <Col sm={6}>
                                                        <Select
                                                            value={locationOptions.filter(
                                                                (e) => e.value == locationId
                                                            )}
                                                            onChange={handleLocationHandler} // Handle the selection change for location
                                                            options={locationOptions} // Pass the options for the location dropdown
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        </Row>
                                        {/* Row to display the location dropdown */}
                                        <div class="" style={{ marginRight: '1%' }}>
                                            {/* Container for the DataBetweenDates component */}
                                            <DataBetweenDates
                                                setFromDate={setFromDate} // Setting the fromDate state from the DataBetweenDates component
                                                setToDate={setToDate} // Setting the toDate state from the DataBetweenDates component
                                                setStatus={setStatus} // Setting the status filter state from the DataBetweenDates component
                                                options={statusOptions} // Passing the available status options for filtering
                                                handleGo={handleDataBetweenDates} // Triggering the data fetch based on the date range and status
                                                defaultValue={{ label: 'All' }} // Default value for the status dropdown
                                            />
                                        </div>
                                    </form>
                                    {/* Form for the location selection and date range filter ends here */}
                                    <div
                                        style={{
                                            marginBottom: '2%', // Adding a margin at the bottom
                                            fontWeight: '500' // Making the font weight 500
                                        }}
                                    >
                                        {/* Display the number of records if there are more than 10 */}
                                        {data.length > 10 ? (
                                            <span>No. of Records : {data.length}</span>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                    <Table
                                        columns={COLUMNS} // Pass the column definitions for the table
                                        serialNumber={true} // Enabling serial number column for the table
                                        data={data} // Pass the data to be displayed in the table
                                        pageSize="10" // Setting the page size for the table (10 records per page)
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default HRReviewList
