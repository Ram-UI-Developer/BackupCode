import { useEffect, useState } from 'react'
import { Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import ExpandedTable from '../../Common/Table/ExapandedTable'
import { getLeaveBalanceHistory } from '../Services/OtherServices'
import Table from '../Table/Table1'
import Loader from './Loader'

const LeaveTypeHistory = ({ getData, header }) => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])

    useEffect(() => {
        onGetLeaveHistory()
    }, [])

    const onGetLeaveHistory = () => {
        getLeaveBalanceHistory({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: getData && getData.leaveTypeId,
            employeeId: getData && getData.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setData(res.data)
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const COLUMNS = [
        {
            Header: <div className="text-center header"></div>,
            accessor: 'actions',
          
        },
        {
            Header: '',
            accessor: 'date',
            Cell: ({ row }) => (
                <div className="text-left" style={{ width: '2.6rem', textWrap: 'nowrap' }}>
                    {row.original.date}
                </div>
            )
        },

        {
            Header: '',
            accessor: 'remarks',
            Cell: ({ row }) => (
                <div style={{ width: '4.5rem' }}>
                    <Tooltip title={row.original.remarks} open>
                        {row.original.remarks}
                    </Tooltip>
                    <div
                        className="text-left"
                        style={{
                            width: '7rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            paddingLeft: '23%'
                        }}
                    >
                        {row.original.remarks}
                    </div>
                </div>
            )
        },
        {
            Header: '',
            accessor: 'forwarded',
            Cell: ({ row }) => (
                <div
                    className="numericData"
                    style={{ width: '3rem', float: 'right', paddingRight: '13%' }}
                >
                    {row.original.forwarded}
                </div>
            )
        },
        {
            Header: '',
            accessor: 'totalCredited',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '3rem', float: 'right' }}>
                    {row.original.totalCredited}
                </div>
            )
        },
        {
            Header: '',
            accessor: 'totalUsed',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '3rem', float: 'right' }}>
                    {row.original.totalUsed}
                </div>
            )
        },
        {
            Header: '',
            accessor: 'lop',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '3rem', float: 'right' }}>
                    {row.original.lop}
                </div>
            )
        },
        {
            Header: '',
            accessor: 'remaining',
            Cell: ({ row }) => (
                <div className="numericData" style={{ width: '3rem', float: 'right' }}>
                    {row.original.remaining}
                </div>
            )
        }
    ]

    const COLUMNSTable = [
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ row }) => <div className="">{row.original.date}</div>
        },

        {
            Header: 'Remarks',
            accessor: 'remarks',
            Cell: ({ row }) => <div className="">{row.original.remarks}</div>
        },
        {
            Header: <div className="text-right header">Forwarded</div>,
            accessor: 'forwarded',

            Cell: ({ row }) => <div className="text-right">{row.original.forwarded}</div>
        },
        {
            Header: <div className="text-right header">Credited</div>,
            accessor: 'totalCredited',
            Cell: ({ row }) => <div className="text-right">{row.original.totalCredited}</div>
        },
        {
            Header: <div className="text-right header">Used</div>,
            accessor: 'totalUsed',
            Cell: ({ row }) => <div className="text-right">{row.original.totalUsed}</div>
        },
        {
            Header: <div className="text-right header">LOP</div>,
            accessor: 'lop',
            Cell: ({ row }) => <div className="text-right">{row.original.lop}</div>
        },
        {
            Header: <div className="text-right header">Balance</div>,
            accessor: 'remaining',
            Cell: ({ row }) => <div className="text-right">{row.original.remaining}</div>
        }
    ]
    return (
        <div className="">
            {loading ? (
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: '10vh' }}
                >
                    <Loader />
                </div>
            ) : (
                <>
                    {header ? (
                        <Table data={data} columns={COLUMNSTable} />
                    ) : (
                        <ExpandedTable data={data} columns={COLUMNS} header={true} />
                    )}
                </>
            )}
        </div>
    )
}
export default LeaveTypeHistory
