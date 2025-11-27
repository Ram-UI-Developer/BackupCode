import React, { useEffect, useState } from 'react'
import LeaveCard from './LeaveCard'
import { useSelector } from 'react-redux'
import {
    currentLeavesByLocationId,
    upcommingLeavesByLocationId
} from '../../../Common/Services/CommonService'
import moment from 'moment'
import Loader from '../../../Common/CommonComponents/Loader'

const CurrentLeaves = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // get user details from redux
    const [data, setData] = useState([]) // State for current and upcoming leaves
    const [currentLength, setCurrentLength] = useState(0) // State for current leaves length
    const [upcomingLength, setUpcomingLength] = useState(0) // State for upcoming leaves length
    const [underLine, setUnderLine] = useState('current') // State for heading decoration
    const [loading, setLoading] = useState(true) // State for handling loeader

    let today = new Date() // today date
    let endDate = today.setDate(today.getDate() + 30) // upcoming 30th day

    // Fetch leaves to component on mount
    useEffect(() => {
        onGetCurrentLeavesHandler()
        onGetFutureLeavesCountHandler()
    }, [])

    const onGetCurrentLeavesHandler = () => {
        setLoading(true)
        currentLeavesByLocationId({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            locationId: [userDetails.locationId],
            empId: userDetails.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setCurrentLength(res.data.length)
                    setData(res.data)
                } else {
                    setData([])
                }
                setUnderLine('current')
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const onGetFutureLeavesHandler = () => {
        setLoading(true)
        upcommingLeavesByLocationId({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            locationId: [userDetails.locationId],
            empId: userDetails.employeeId,
            startDate: null,
            endDate: moment(endDate).format('YYYY-MM-DD')
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setData(res.data)
                } else {
                    setData([])
                }
                setUnderLine('upcomming')
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const onGetFutureLeavesCountHandler = () => {
        setLoading(true)
        upcommingLeavesByLocationId({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            locationId: [userDetails.locationId],
            empId: userDetails.employeeId,
            startDate: null,
            endDate: moment(endDate).format('YYYY-MM-DD')
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setUpcomingLength(res.data.length)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    return (
        <>
            <div className="onLeaveMainCard">
                <div className="row">
                    {/* heading for card */}
                    <div className="d-flex justify-content-between">
                        <div
                            type="button"
                            className="dashboardHeadings underline"
                            onClick={() => onGetCurrentLeavesHandler()}
                        >
                            <div className="dashboardLeavesHeadings">
                                On Leave{currentLength > 0 && '(' + currentLength + ')'}
                            </div>
                            {underLine == 'current' ? <hr className="LeaveHrline1" /> : ''}
                        </div>
                        {userDetails.upcomingLeaves && (
                            <div
                                type="button"
                                className="dashboardHeadings underline"
                                onClick={() => onGetFutureLeavesHandler()}
                            >
                                <div className="dashboardLeavesHeadings">
                                    Expected Leave{upcomingLength > 0 && '(' + upcomingLength + ')'}
                                </div>
                                {underLine == 'upcomming' ? <hr className="LeaveHrline2" /> : ''}
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ height: '30vh' }}
                        >
                            <Loader />
                        </div>
                    ) : (
                        <div>
                            {data && data.length > 0 ? (
                                <>
                                    <div className="leaveCardsHeight">
                                        {data.map((leave) => (
                                            // passing leave info
                                            <LeaveCard
                                                key={leave.id}
                                                data={leave}
                                                leaveType={underLine}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {underLine == 'current' ? (
                                        <div className="card padding-1rem noLeavesCard align-items-center justify-content-center textBold">
                                            No one is on leave today
                                        </div>
                                    ) : (
                                        <div className="card padding-1rem noLeavesCard align-items-center justify-content-center textBold">
                                            No leaves in the next 30 days
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default CurrentLeaves
