import { useEffect, useState } from 'react'
import { Button, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { getAllByHRId } from '../../Common/Services/CommonService'
import Table from '../../Common/Table/Table'

const ResignationApproveHRList = () => {
    // Get user details from redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    // State variables
    const [loading, setLoading] = useState(false) // Loader state
    const navigate = useNavigate() // Navigation hook from react-router

    // Table columns definition
    const COLUMNS = [
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Code',
            accessor: 'code'
        },
        {
            Header: 'Reason',
            accessor: 'subject',
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.subject} open>
                        {row.original.subject}
                    </Tooltip>
                    <div className="remarksLenght">{row.original.subject}</div>
                </>
            )
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
            disableSortBy: true,
            Cell: ({ row }) => <>{row.original.status ? row.original.status.label : null}</>
        },

        {
            Header: () => <div className="text-wrap text-right  actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div
                        className="text-wrap text-right "
                        style={{ width: '145px', float: 'right' }}
                    >
                        {/* Edit button for navigating to resignation approval page */}
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

    const [data, setData] = useState([])

    // Fetch data when component mounts
    useEffect(() => {
        setLoading(true)
        getResignationList()
    }, [])

    // Fetch resignation data for HR by HR ID
    const getResignationList = () => {
        getAllByHRId({
            entity: 'resignation',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId
        })
            .then((res) => {
                // Update data state and stop loader
                setData(res.data ? res.data : [])
                setLoading(false)
            })
            .catch(() => {
                // Stop loader on error
                setLoading(false)
            })
    }

    // Handle edit action by navigating to resignation page
    const handleEdit = (id) => {
        navigate('/resignation', {
            state: { id: id, prevLocation: 'resignationHRList', canApprove: true }
        })
    }

    return (
        <>
            {/* If user has access, display resignation list */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                {/* Page title header */}
                                <PageHeader pageTitle="Resignations" />
                                <div>
                                    {/* Loader or Table display */}
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

export default ResignationApproveHRList
