import React, { useEffect, useState } from 'react'
import LeaveBalance from './LeaveBalance'
import { useSelector } from 'react-redux'
import { getLeaveBalance } from '../../../Common/Services/OtherServices'
import { useNavigate } from 'react-router-dom'

const LeaveBalances = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const navigate = useNavigate()
    const [data, setData] = useState([])

    useEffect(() => {
        onGetLeaveBalance()
    }, [])
    const currentYear = new Date().getFullYear()
    const onGetLeaveBalance = () => {
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: userDetails.employeeId,
            year: currentYear
        }).then((res) => {
            if (res.statusCode == 200) {
                setData(res.data)
            } else {
                setData([])
            }
        })
        .catch(() => {
            setData([]) // Handle error by setting an empty list
        })
    }

    const leaveBalances = () => {
        navigate('/leaveBalance')
    }

    return (
        <>
            <div className="">
                <div className="row">
                    <div className="col-sm-6">
                        <div className="card balanceHeadingCard">Leave Management</div>
                    </div>
                    {data.map((balance) => (
                        <div key={balance.id} className="col-sm-6">
                            <LeaveBalance data={balance} />
                        </div>
                    ))}
                </div>
                {data.length > 3 ? (
                    <div
                        className="text-right"
                        style={{ marginTop: '-15px' }}
                        onClick={leaveBalances}
                        type="button"
                    >
                        click me
                    </div>
                ) : (
                    ''
                )}
            </div>
        </>
    )
}

export default LeaveBalances
