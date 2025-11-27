import moment from 'moment'
import React from 'react'

const LeaveCard = ({ data, leaveType }) => {
    let Today = new Date() // today date

    // function for declering leave type
    const onLeaveClassName = (dates) => {
        if (dates.type == 'Full Day') {
            if (moment(dates.date).format('YYYY-MM-DD') <= moment(Today).format('YYYY-MM-DD')) {
                return 'onLeaveDays'
            } else {
                return 'onLeaveDaysFuture'
            }
        } else if (dates.type == 'Second Session') {
            if (moment(dates.date).format('YYYY-MM-DD') <= moment(Today).format('YYYY-MM-DD')) {
                return 'onLeaveDaySecondHalf'
            } else {
                return 'onLeaveFutureHalfDay'
            }
        } else {
            if (moment(dates.date).format('YYYY-MM-DD') <= moment(Today).format('YYYY-MM-DD')) {
                return 'onLeaveDayFirstHalf'
            } else {
                return 'onLeaveFutureHalfDay'
            }
        }
    }

    return (
        <>
            <div className="onLeaveCard">
                <div className="row">
                    <div className="col-sm-2">
                        <div>
                            {data.photo ? (
                                <img
                                    src={`data:image/jpeg;base64,${data.photo}`}
                                    style={{
                                        height: '43px',
                                        width: '43px'
                                    }}
                                    className="onLeaveImage"
                                    alt="image"
                                />
                            ) : (
                                <div className="card onLeaveNameCard">{data.employeeName[0]}</div>
                            )}
                        </div>
                    </div>
                    <div className="col-sm-10">
                        <div className="celebrationEmployeeData">
                            <div className="onLeaveEmpName">{data.employeeName}</div>
                            <div className="d-flex justify-content-between">
                                <div className="onLeaveEmpRole">
                                    <img src="dist/Images/jobRole.png" height={'10px'} />{' '}
                                    {data.jobRole}
                                </div>
                                <div className="onLeaveEmpLocation">
                                    <img src="dist/Images/pinIcon.png" height={'10px'} />{' '}
                                    {data.locationName}
                                </div>
                            </div>
                            {leaveType == 'current' ? (
                                <div>
                                    <div className="card-deck">
                                        {data.dateDetail.map((dates) => (
                                            <>
                                                <div
                                                    key={dates.date}
                                                    className={`card ${onLeaveClassName(dates)}`}
                                                    type="button"
                                                    data-bs-toggle="tooltip"
                                                    data-bs-placement="top"
                                                    title={
                                                        dates.date ==
                                                        moment(Today).format('YYYY-MM-DD')
                                                            ? `Today\n ${data && data.reason}`
                                                            : dates.date ==
                                                                moment(Today)
                                                                    .subtract(1, 'days')
                                                                    .format('YYYY-MM-DD')
                                                              ? `Yesterday\n ${data && data.reason}`
                                                              : dates.date ==
                                                                  moment(Today)
                                                                      .add(1, 'days')
                                                                      .format('YYYY-MM-DD')
                                                                ? `Tomorrow\n ${data && data.reason}`
                                                                : `${moment(dates.date).format('DD/MM')}\n ${data && data.reason}`
                                                    }
                                                ></div>
                                            </>
                                        ))}
                                    </div>
                                    <div className="card-deck">
                                        {data.dateDetail.length < 6 &&
                                            data.dateDetail.map((dates) => (
                                                <>
                                                    <div className="card onLeaveDates ">
                                                        {dates.date ==
                                                        moment(Today).format('YYYY-MM-DD')
                                                            ? 'Today'
                                                            : dates.date ==
                                                                moment(Today)
                                                                    .subtract(1, 'days')
                                                                    .format('YYYY-MM-DD')
                                                              ? 'Yesterday'
                                                              : dates.date ==
                                                                  moment(Today)
                                                                      .add(1, 'days')
                                                                      .format('YYYY-MM-DD')
                                                                ? 'Tomorrow'
                                                                : moment(dates.date).format(
                                                                      'DD/MM'
                                                                  )}
                                                    </div>
                                                </>
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="onLeaveEmpRole">
                                    {data.dateDetail.length > 1 ? (
                                        <>
                                            Leave From {moment(data.fromDate).format('DD/MM/YY')}{' '}
                                            for {data.numberofDays} day(s)
                                        </>
                                    ) : (
                                        <> Leave on {moment(data.fromDate).format('DD/MM/YY')} </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LeaveCard
