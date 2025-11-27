import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Loader from '../../../Common/CommonComponents/Loader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { getLeaveBalance } from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'

const LeaveBalance = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //stores user Details
    const [loading, setLoading] = useState(true) //state for loader display
    const [data, setData] = useState([]) //state  for setting data

    useEffect(() => {
        onGetHandler()
    }, [])

    //api handling for get By Id
    const onGetHandler = () => {
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: userDetails.employeeId,
            locationId: userDetails.locationId
        })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setData(res.data)
                } else {
                    setData([])
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    //table colums
    const COLUMNS = [
        {
            Header: 'S.No',
            accessor: '',
            style: { overflowWrap: 'break-word' },
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right" style={{ width: '1.5rem' }}>
                        {row.index + 1}
                    </div>
                </>
            )
        },

        {
            Header: 'Leave Type',
            accessor: 'leaveTypeName'
        },
        {
            Header: () => <div className="header text-right ">Total Created Leaves</div>,
            accessor: 'totalCredited',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '5px' }}>
                    {row.original.totalCredited}
                </div>
            )
        },

        {
            Header: () => <div className="header text-right ">Used Leaves</div>,
            accessor: 'totalUsed',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '5px' }}>
                    {row.original.totalUsed}
                </div>
            )
        },

        {
            Header: () => <div className="header text-right ">Remaining Leaves</div>,
            accessor: 'remaining',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '5px' }}>
                    {row.original.remaining}
                </div>
            )
        }
    ]

    return (
        <>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card-primary">
                                <PageHeader pageTitle={'My Leave Balances'} />

                                <div className="table">
                                    <br />
                                    <br />
                                    {loading ? (
                                        <center>
                                            <Loader />
                                        </center>
                                    ) : (
                                        <Table columns={COLUMNS} data={data} pageSize="10" />
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

export default LeaveBalance
