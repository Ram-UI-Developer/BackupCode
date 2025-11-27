import { useEffect, useState } from 'react'
import { Button, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { AddIcon, EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { getAllByOrgIdAndEmpId } from '../../Common/Services/CommonService'
import { useLocation } from 'react-router-dom'
import Table from '../../Common/Table/Table'


const ResignationList = () => {
    // Access user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    //  loading state
    const [loading, setLoading] = useState(false)
    // Navigation hook
    const navigate = useNavigate()
    // Local state to store resignation data
    const [data, setData] = useState([])

    // Handler for Add button click
    const onAddHandler = () => {
        navigate('/resignation', {
            state: { id: null, prevLocation: 'resignationList', withdraw: true }
        })
    }

    // Handler for Edit button click
    const handleEdit = (id) => {
        navigate('/resignation', {
            state: { id: id, prevLocation: 'resignationList', withdraw: true }
        })
    }

    // Fetch resignation list on initial render
    const location = useLocation();
    useEffect(() => {
        getResignationList();
    }, [location]);
    // Fetch resignation data from API
    const getResignationList = () => {
        setLoading(true)
        getAllByOrgIdAndEmpId({
            entity: 'resignation',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId
        })
            .then((res) => {
                setData(res.data ? res.data : [])
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Table column configuration
    const COLUMNS = [
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
            Header: 'Resignation Date',
            accessor: 'requestedlastDate',
            Cell: ({ row }) => (
                <>
                    <div>{row.original.requestedlastDate ? row.original.requestedlastDate : "-"}</div>
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
            Header: 'HR remarks',
            accessor: 'hrRemarks',
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.hrRemarks} open>
                        {row.original.hrRemarks}
                    </Tooltip>
                    <div className="remarksLenght">{row.original.hrRemarks}</div>
                </>
            )
        },

        {
            Header: 'Status',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    {/* Display status label if present */}
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
                    <div
                        className="text-wrap text-right "
                        style={{ width: '145px', float: 'right' }}
                    >
                        {/* Edit button */}
                        <Button
                            variant=""
                            className="iconWidth"
                            style={{ paddingRight: '38%' }}
                            onClick={() => handleEdit(row.original.id)}
                            // onClick={() => handleEdit(row.original.id, row.original.status.label)}
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

    return (
        <>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                {/* Page header */}
                                <PageHeader pageTitle="Resignations" />
                                <div>
                                    {/* Add button */}
                                    <div>
                                        <Button
                                            className="addButton"
                                            variant="addbtn"
                                            onClick={onAddHandler}
                                            disabled={
                                                data.some(
                                                    (item) =>
                                                        item.status &&
                                                        (item.status.label === 'Submitted' || item.status.label === 'HR Approved')
                                                )
                                            }
                                        // disabled={!(data[data.length - 1] && (data[data.length - 1].status.label === "Withdraw" || data[data.length - 1].status.label === "Reject"))}
                                        >
                                            <AddIcon />
                                        </Button>
                                    </div>

                                    {/* Loader or table content */}
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

export default ResignationList
