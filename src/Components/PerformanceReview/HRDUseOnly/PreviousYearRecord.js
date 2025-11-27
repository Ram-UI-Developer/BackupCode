import Table from '../../../Common/Table/Table'; // Importing the Table component

const PreviousYearRecord = ({ apprisalForm }) => {
    // Column definitions for the table. This defines the header and accessor for each column
    const COLUMNS = [
        {
            Header: 'Year', // Column title
            accessor: 'year' // Key in the data object that maps to this column
        },
        {
            Header: 'Designation', // Column title for Designation
            accessor: 'designation', // Key for Designation in the data
            Cell: ({ row }) => (
                <div className="">
                    {row.original.designation} {/* Displaying the Designation */}
                </div>
            )
        },
        {
            Header: 'Rating', // Column title for Rating
            accessor: 'rating', // Key for Rating in the data
            Cell: ({ row }) => (
                <div className="">
                    {row.original.rating} {/* Displaying the Rating */}
                </div>
            )
        },
        {
            Header: '%hike', // Column title for % hike
            accessor: 'hike', // Key for % hike in the data
            Cell: ({ row }) => (
                <div className="">
                    {row.original.hike} {/* Displaying the hike percentage */}
                </div>
            )
        },
        {
            Header: 'Previous CTC', // Column title for Previous CTC
            accessor: 'previousCTC', // Key for Previous CTC in the data
            Cell: ({ row }) => (
                <div className="">
                    {row.original.previousCTC} {/* Displaying the previous CTC */}
                </div>
            )
        },
        {
            Header: 'Current CTC', // Column title for Current CTC
            accessor: 'currentCTC', // Key for Current CTC in the data
            Cell: ({ row }) => (
                <div className="">
                    {row.original.currentCTC} {/* Displaying the current CTC */}
                </div>
            )
        }
    ]

    return (
        <div>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* Section header for the table */}
                                <h5 style={{ marginLeft: '1%', marginTop: '1%', color: '#364781' }}>
                                    <label>Previous Years Record</label>
                                </h5>
                                {/* Table container with a margin on top for spacing */}
                                <div style={{ marginTop: '1%' }} className="table">
                                    {/* Rendering the Table component with the columns and data */}
                                    <Table
                                        columns={COLUMNS}
                                        serialNumber={true}
                                        data={
                                            apprisalForm.hrReviewDTO &&
                                            apprisalForm.hrReviewDTO.compensationReviewDTO
                                                ? apprisalForm.hrReviewDTO.compensationReviewDTO
                                                : []
                                        }
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

export default PreviousYearRecord
