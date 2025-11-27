import React from 'react'

const LeaveInfoCard = ({ leave }) => {
    return (
        <>
            {/* leave info of individual leavebalance */}
            <div className="card p-02rem w-33">
                <div className="leaveTypeName">{leave.leaveTypeName}</div>
                <div className="">
                    <div className="balance-text">Balance</div>
                    <div className="balance-number">{leave.remaining}</div>
                </div>
                <div style={{ paddingBottom: '0.5rem' }}>
                    <div className="balance-info-row">
                        <div className="balance-info"> Carry Forward </div>{' '}
                        <div className="balance-info-number">{leave.carryForward}</div>
                    </div>
                    <div className="balance-info-row">
                        <div className="balance-info"> Credited </div>{' '}
                        <div className="balance-info-number">{leave.totalCredited}</div>
                    </div>
                    <div className="balance-info-row">
                        <div className="balance-info"> Used </div>{' '}
                        <div className="balance-info-number">{leave.totalUsed}</div>
                    </div>
                    <div className="balance-info-row">
                        <div className="balance-info"> LOP </div>{' '}
                        <div className="balance-info-number">{leave.lop ? leave.lop : '0'}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LeaveInfoCard
