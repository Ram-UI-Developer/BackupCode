import React from 'react'
import { useSelector } from 'react-redux'

const WelcomeWishes = () => {
    const userDetails = useSelector((state) => state.user.userDetails)

    return (
        <>
            <div className="welcomeWishes">
                {/* <div > */}
                <div className="dashboardUserName">
                    Hi{' '}
                    {userDetails.firstName && (
                        <> {userDetails.firstName + ' ' + userDetails.lastName}...</>
                    )}
                </div>
                <div className="welcomeWishesText">
                    Welcome {userDetails.firstName}. We are glad you are here, inspiring the best
                    work in people enabling them to achieve their goals.
                </div>
                {/* </div> */}
            </div>
        </>
    )
}

export default WelcomeWishes
