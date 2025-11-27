import React, { useEffect, useState } from 'react'
import Table from '../../../Common/Table/Table'
import { getEmployeeAttendanceByLocationAndDates } from '../../../Common/Services/OtherServices'
import { useSelector } from 'react-redux'
import Loader from '../../../Common/CommonComponents/Loader'

const LeavesModal = ({ id, locId, fromDate, toDate }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // get user details from redux
    const [data, setData] = useState([]) // State for leaves data
    const [loading, setLoading] = useState(true) // State for Handling Loader

    // Fetch Leaves to component on mount
    useEffect(() => {
        getAttendanceForEmployee()
    }, [])

    const getAttendanceForEmployee = () => {
        getEmployeeAttendanceByLocationAndDates({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            employeeId: id,
            locationId: locId,
            payStartDate: fromDate,
            payEndDate: toDate
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setData(res.data ? res.data : [])
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Columns for table
    const columns = [
        {
            Header: () => <div className="text-center header">From Date</div>,
            accessor: 'fromDate',
            Cell: ({ row }) => <div className="text-center">{row.original.fromDate}</div>
        },
        {
            Header: () => (
                <div className="text-center header" style={{ width: '5rem' }}>
                    To Date
                </div>
            ),
            accessor: 'toDate',
            Cell: ({ row }) => (
                <div className="text-center" style={{ width: '5rem' }}>
                    {row.original.toDate}
                </div>
            )
        },
        {
            Header: () => <div className="text-left header">Leave Type</div>,
            accessor: 'leaveTypeName',
            Cell: ({ row }) => <div>{row.original.leaveTypeName}</div>
        },
        {
            Header: () => <div className="text-center header">Reason</div>,
            accessor: 'reason',
            Cell: ({ row }) => <div className="text-center">{row.original.reason}</div>
        },
        {
            Header: () => <div className="numericColHeading">No.Of days</div>,
            accessor: 'noofdays',
            Cell: ({ row }) => <div className="numericData">{row.original.noofdays}</div>
        }
    ]
    return (
        <>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            ) : (
                <div className="table" style={{ padding: '0% 3% 0% 3%' }}>
                    <Table key={data.length} columns={columns} data={data} serialNumber={true} />
                </div>
            )}
        </>
    )
}
export default LeavesModal
