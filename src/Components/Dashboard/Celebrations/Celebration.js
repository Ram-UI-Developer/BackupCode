import moment from 'moment'
import React from 'react'

const Celebration = ({ data, mode, styleName }) => {
    // rendor party popers by conditionally
    const partyPhotohandler =
        data && data.celebrationType == 'Marriage Anniversary'
            ? '/dist/OceanImages/anniversary.png'
            : data && data.celebrationType == 'Work Anniversary'
              ? '/dist/OceanImages/partyPopper.png'
              : data && data.celebrationType === 'Birthday'
                ? '/dist/OceanImages/birthdayCake.png'
                : '/dist/OceanImages/partyPopper.png'

    return (
        <>
            <div className={`card celebrationCard ${styleName}`}>
                <div className="card-body">
                    <div className="d-flex align-items-center">
                        <div>
                            {data && data.photo ? (
                                <img
                                    src={`data:image/jpeg;base64,${data.photo}`}
                                    style={{
                                        height: '61px',
                                        width: '61px'
                                    }}
                                    className="celebrationImage"
                                    alt="image"
                                />
                            ) : (
                                <div className="card celebratedNameCard">
                                    {data && data.firstName[0] + data.lastName[0]}
                                </div>
                            )}
                        </div>
                        <div className="celebrationEmployeeData">
                            <div className="celebEmpName">{data && data.firstName}</div>
                            <div className="celebEmpRole">{data && data.role}</div>
                            <div className="celebEmpLocation">{data && data.locationName}</div>
                        </div>
                    </div>
                    {/* Content for current celebrations */}
                    {mode == 'current' ? (
                        <div className="d-flex align-items-center">
                            {data && data.celebrationType == 'Birthday' ? (
                                <div className="celebContent">
                                    Celebrating {data && data.firstName}{' '}
                                    {data && data.celebrationType}, hope {data && data.firstName}{' '}
                                    will get all the luck and joy this year.
                                </div>
                            ) : data.celebrationType == 'Marriage Anniversary' ? (
                                <div className="celebContent">
                                    Celebrating {data && data.firstName}{' '}
                                    {data && data.celebrationType}
                                </div>
                            ) : (
                                <div className="celebContent">
                                    Celebrating {data && data.firstName}{' '}
                                    {data && data.celebrationType}, hope this will continue to long
                                    way.
                                </div>
                            )}
                            <div>
                                <img src={partyPhotohandler} height={'49px'} alt="img" />
                            </div>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            {/* Content for Upcoming celebrations */}
                            {data && data.celebrationType == 'Birthday' ? (
                                <div className="celebContent">
                                    Celebrating {data && data.firstName}{' '}
                                    {data && data.celebrationType} on{' '}
                                    {moment(data && data.date).format('DD/MM')}, hope{' '}
                                    {data && data.firstName} will get all the luck and joy this
                                    year.
                                </div>
                            ) : data.celebrationType == 'Marriage Anniversary' ? (
                                <div className="celebContent">
                                    Celebrating {data && data.firstName}{' '}
                                    {data && data.celebrationType} on{' '}
                                    {moment(data && data.date).format('DD/MM')}.
                                </div>
                            ) : (
                                <div className="celebContent">
                                    Celebrating {data && data.firstName}{' '}
                                    {data && data.celebrationType} on{' '}
                                    {moment(data && data.date).format('DD/MM')}, hope this will
                                    continue to long way.
                                </div>
                            )}
                            <div>
                                <img src={partyPhotohandler} height={'49px'} alt="img" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Celebration
