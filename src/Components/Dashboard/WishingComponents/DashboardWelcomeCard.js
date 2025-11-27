import React from 'react'
import { FaLocationDot } from 'react-icons/fa6'
import { useSelector } from 'react-redux'

const DashboardWelcomeCard = () => {
    const userDetails = useSelector((state) => state.user.userDetails)

    return (
        <div>
            <div className="card welcomeWishes d-flex">
                <div className="row">
                    <div style={{ width: '65%' }}>
                        <div className="dashboardUserName">
                            Hi {userDetails.firstName && <> {userDetails.firstName}...</>}
                        </div>
                        <div className="welcomeWishesText">
                            Welcome {userDetails.firstName}. We are glad you are here, inspiring the
                            best work in people enabling them to achieve their goals.
                        </div>
                    </div>
                    <div style={{ width: '35%' }}>
                        <div className="clockInDashBaord"></div>
                        <div>
                            <div className="locationInDashboard">
                                <FaLocationDot /> {userDetails.locationName}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardWelcomeCard
