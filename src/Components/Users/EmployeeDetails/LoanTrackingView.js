import React, { useEffect, useState } from 'react' // Importing React, useState and useEffect hooks from React
import Table from '../../../Common/Table/Table' // Importing the custom Table component
import { getAllListCompByLocation } from '../../../Common/Services/OtherServices' // Importing the API service to get loan records by location
import { useSelector } from 'react-redux' // Importing useSelector to access the redux store

// LoanTrackingView Component
const LoanTrackingView = ({ locId, id }) => {
    // Getting the user details (like organizationId) from the redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    // State to store loan data fetched from the API
    const [data, setData] = useState([])

    // useEffect hook to call the API when locId or id changes
    useEffect(() => {
        if (locId && id) {
            getAllRecordsByLocation() // Fetch loan records when locId and id are available
        } else {
            console.log('locId or id is undefined') // Log error if locId or id is undefined
        }
    }, [locId, id]) // Dependency array ensures the effect runs when locId or id changes

    // Function to call the API and fetch loan records based on locationId and employeeId
    const getAllRecordsByLocation = () => {
        getAllListCompByLocation({
            entity: 'loans',
            organizationId: userDetails.organizationId, // Pass the organizationId from user details
            locationId: locId, // Pass locationId
            employeeId: id // Pass employeeId
        })
            .then(
                (res) => {
                    // If the API call is successful
                    console.log(res, 'checkingCompResponse') // Log the API response for debugging
                    if (res.statusCode == 200) {
                        // If the response status is 200 (success)
                        setData(res.data ? res.data : []) // Update state with loan data (or empty array if no data)
                    }
                },
            )
            .catch((error) => {
                // Catch any unforeseen errors
                console.log(error) // Log the error
            })
    }

    // Column definitions for the loan records table
    const COLUMNS = [
        {
            Header: 'Issued Date', // Column header for issued date
            accessor: 'issuedDate' // Data key for issued date
        },
        {
            Header: 'Amount', // Column header for loan amount
            accessor: 'amount', // Data key for amount
            Cell: (
                { row } // Custom cell rendering to format the amount with commas
            ) => <div>{row.original.amount.toLocaleString()}</div>
        },
        {
            Header: 'No Of Instalments', // Column header for number of installments
            accessor: 'installments', // Data key for installments
            Cell: (
                { row } // Custom cell rendering to center the installments value
            ) => (
                <div style={{ marginLeft: '-50%' }} className="text-center">
                    {row.original.installments}
                </div>
            )
        },
        {
            Header: 'Pending Installments', // Column header for pending installments
            accessor: 'pendingInstallments', // Data key for pending installments
            Cell: (
                { row } // Custom cell rendering to center the pending installments value
            ) => (
                <div style={{ marginLeft: '-15%' }} className="text-center">
                    {row.original.pendingInstallments}
                </div>
            )
        },
        {
            Header: 'Pending Amount', // Column header for pending amount
            accessor: 'pendingAmount', // Data key for pending amount
            Cell: (
                { row } // Custom cell rendering to format pending amount with commas
            ) => (
                <div style={{ marginLeft: '-15%' }} className="text-center">
                    {row.original.pendingAmount.toLocaleString()}
                </div>
            )
        }
    ]

    return (
        <div>
            {' '}
            {/* Wrapper div for the component */}
            <div>
                {' '}
                {/* Inner div for the section */}
                <section className="section">
                    {' '}
                    {/* Section tag for semantic grouping */}
                    <div className="container-fluid">
                        {' '}
                        {/* Container for the content */}
                        <div className="row">
                            {' '}
                            {/* Row for layout */}
                            <div className="col-md-12">
                                {' '}
                                {/* Full-width column for the table */}
                                <div className=" ">
                                    {' '}
                                    {/* Placeholder div for styling */}
                                    <h6>
                                        <label>Salary Advance History</label>
                                    </h6>{' '}
                                    {/* Label for the section */}
                                    <div className="table">
                                        {' '}
                                        {/* Wrapper for the table */}
                                        {/* Table component to display loan data */}
                                        <Table columns={COLUMNS} data={data} serialNumber={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default LoanTrackingView // Exporting the LoanTrackingView component
