import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import LeaveTypeHistory from '../../../Common/CommonComponents/LeaveTypeHistory'
import Loader from '../../../Common/CommonComponents/Loader'
import { getLeaveBalance } from '../../../Common/Services/OtherServices'
import ExpandedTable from '../../../Common/Table/ExapandedTable'

const LopModal = ({ id, locId }) => {
    const currentYear = new Date().getFullYear() // Current year
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetails from redux
    const [data, setData] = useState([]) // State for levave balance
    const [expandedRow, setExpandedRow] = useState(null) // State for toggle expandtable
    const [getData, setGetData] = useState({}) // State for complete leave info
    const [loading, setLoading] = useState(true) // State for handling loader

    // Fetch leavebalance to component on mount
    useEffect(() => {
        fetchLeaveBalance()
    }, [])

    const fetchLeaveBalance = () => {
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id,
            locationId: locId,
            year: currentYear
        })
            .then((res) => {
                if (res.statusCode === 200) {
                    setLoading(false)
                    setData(res.data || [])
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const handleRowClick = (rowIndex, row) => {
        setExpandedRow(expandedRow === rowIndex ? null : rowIndex)
        setGetData(expandedRow === rowIndex ? {} : row)
    }

    // tabel for leavetype history
    const renderLeaveTypeHistory = (rowData) => (
        <tr>
            <td colSpan={COLUMNS.length}>
                <LeaveTypeHistory rowData={rowData} getData={getData} />
            </td>
        </tr>
    )

    // Columns for table
    const COLUMNS = [
        {
            Header: <div className="text-center header">Actions</div>,
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="text-center">
                    <Button
                        variant={expandedRow === row.index ? 'danger' : 'success'}
                        onClick={() => handleRowClick(row.index, row.original)}
                    >
                        {expandedRow === row.index ? '-' : '+'}
                    </Button>
                </div>
            )
        },
        {
            Header: <div className="text-left header">Type</div>,
            accessor: 'leaveTypeName',
            Cell: ({ row }) => <div className="text-left">{row.original.leaveTypeName}</div>
        },
        {
            Header: <div className="text-center header">Remarks</div>,
            accessor: 'remarks',
            Cell: ({ row }) => <div className="text-left">{row.original.remarks}</div>
        },
        {
            Header: <div className="numericColHeading">Forwarded</div>,
            accessor: 'carryForward',
            Cell: ({ row }) => <div className="numericData">{row.original.carryForward}</div>
        },
        {
            Header: <div className="numericColHeading">Credited</div>,
            accessor: 'totalCredited',
            Cell: ({ row }) => <div className="numericData">{row.original.totalCredited}</div>
        },
        {
            Header: <div className="numericColHeading">Used</div>,
            accessor: 'totalUsed',
            Cell: ({ row }) => <div className="numericData">{row.original.totalUsed}</div>
        },
        {
            Header: <div className="numericColHeading">LOP</div>,
            accessor: 'lop',
            Cell: ({ row }) => <div className="numericData">{row.original.lop}</div>
        },
        {
            Header: <div className="text-right header">Balance</div>,
            accessor: 'remaining',
            Cell: ({ row }) => <div className="text-right">{row.original.remaining}</div>
        }
    ]

    return (
        <>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            ) : (
                <ExpandedTable
                key={data.length}
                    columns={COLUMNS}
                    serialNumber={true}
                    data={data}
                    expandedRow={expandedRow}
                    renderLeaveTypeHistory={renderLeaveTypeHistory}
                />
            )}
        </>
    )
}

export default LopModal
