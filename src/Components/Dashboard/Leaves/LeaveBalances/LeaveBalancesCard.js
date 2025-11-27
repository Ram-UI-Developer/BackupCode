import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getLeaveBalance } from '../../../../Common/Services/OtherServices'
import LeaveInfoCard from './LeaveInfoCard'
import Loader from '../../../../Common/CommonComponents/Loader'

const LeaveBalancesCard = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // get userdetails from redux
    const navigate = useNavigate() // decleration of navigation
    const [data, setData] = useState([]) // State for the leavebalance
    const [dataLength, setDataLength] = useState(0) // State for the length of leavebalance
    const [loading, setLoading] = useState(true) // State for handling loader

    // Fetch leavebalnce to component on mount
    useEffect(() => {
        if (userDetails.leavebalance) {
            onGetLeaveBalance()
        } else {
            setLoading(false)
        }
    }, [])

    const onGetLeaveBalance = () => {
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: userDetails.employeeId,
            locationId: userDetails.locationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setDataLength(res.data.length)
                    setData(res.data.slice(0, 3))
                } else {
                    setData([])
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // function for navigaton to leavebalance
    const onSeeMoreHandler = () => {
        navigate('/leaveBalance')
    }

    return (
        <div>
            <div class="card detailBackground" style={{ height: '223px' }}>
                <div class="card-header dashboardHeading">Leave Information</div>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center vh-100">
                        <Loader />
                    </div>
                ) : (
                    <div class="card-body" style={{ padding: '10px 10px ' }}>
                        {dataLength == 0 ? (
                            <div className="text-center textBold">No Leave Balance Found</div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {data.map((leave) => (
                                    // passing individual leave info to leaveinfocard
                                    <LeaveInfoCard key={leave.id} leave={leave} />
                                ))}
                            </div>
                        )}
                        <div className="text-right ">
                            {dataLength >= 3 ? (
                                <a onClick={onSeeMoreHandler} className="themeColor">
                                    {' '}
                                    See More{' '}
                                </a>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeaveBalancesCard
