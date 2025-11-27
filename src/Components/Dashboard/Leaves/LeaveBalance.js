import React from 'react'

const LeaveBalance = ({ data }) => {
    return (
        <>
            <div className="card balanceCard">
                <div className="dashboardLeaveType">{data.leaveTypeName}</div>
                <div className="dashboardLeaveData">
                    <div className="totalLeaves">
                        <div className="rotate-90">Total</div>
                        <div className="LeavesNumber">
                            {data.totalCredited.toString().length > 1
                                ? data.totalCredited
                                : '0' + data.totalCredited}
                        </div>
                    </div>
                    <div className="totalLeaves">
                        <div className="LeavesNumber">
                            {data.totalUsed.toString().length > 1
                                ? data.totalUsed
                                : '0' + data.totalUsed}
                        </div>
                        <div className="rotate-90" id="usedLeave">
                            Used
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LeaveBalance
