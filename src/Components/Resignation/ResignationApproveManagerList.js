import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { getAllExpensesByManagerId } from '../../Common/Services/CommonService'
import Table from '../../Common/Table/Table'

const ResignationApproveManagerList = () => {
    // Get logged-in user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    // State for loader visibility
    const [loading, setLoading] = useState(false)
    // Hook to navigate programmatically
    const navigate = useNavigate()
    // State to store resignation list data
    const [data, setData] = useState([])

    // Table columns configuration
    const COLUMNS = [
        {
            Header: 'Employee Name',
            accessor: 'employeeName' // maps to data key
        },
        {
            Header: 'Code',
            accessor: 'code'
        },
        {
            Header: 'Reason',
            accessor: 'subject'
        },
        {
            Header: 'Last Working Date',
            accessor: 'lastWorkingDate',
            Cell: ({ row }) => {
                const date = row.original.lastWorkingDate ? row.original.lastWorkingDate : row.original.actualLastDate
                return (
                    <>
                        <div>{date}</div>
                    </>
                )
            }
        },
        {
            Header: 'Status',
            disableSortBy: true, // disable sorting on this column
            Cell: ({ row }) => (
                <>
                    {/* Display status label if available */}
                    {row.original.status ? row.original.status.label : null}
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-right  actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    {/* Edit button */}
                    <div
                        className="text-wrap text-right "
                        style={{ width: '145px', float: 'right' }}
                    >
                        <Button
                            variant=""
                            className="iconWidth"
                            style={{ paddingRight: '38%' }}
                            onClick={() => handleEdit(row.original.id)}
                            disabled={
                                !(
                                    row.original.status.label === 'Approve' ||
                                    row.original.status.label === 'Submitted'
                                )
                            }
                        >
                            <EditIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    // Handler to navigate to the edit page for a resignation
    const handleEdit = (id) => {
        navigate('/resignation', { state: { id: id, prevLocation: 'resignationManagerList' } })
    }

    // Fetch resignation list on component mount
    useEffect(() => {
        getResignationList()
    }, [])

    // API call to fetch resignations submitted to the manager
    const getResignationList = () => {
        setLoading(true)
        getAllExpensesByManagerId({
            entity: 'resignation',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId
        })
            .then((res) => {
                // Store response data in state
                setData(res.data ? res.data : [])
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    return (
        <>
            {/* Main section for authorized users */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                {/* Page header */}
                                <PageHeader pageTitle="Resignations" />

                                <div>
                                    {/* Show loader or table based on loading state */}
                                    {loading ? (
                                        <DetailLoader />
                                    ) : (
                                        <>
                                            <Table
                                                key={data.length}
                                                columns={COLUMNS}
                                                serialNumber={true}
                                                data={data}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ResignationApproveManagerList
