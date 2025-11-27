import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const ConformationPage = () => {
    const navigate = useNavigate() // Hook to programmatically navigate between routes

    // Handler for "Ok" button - navigates to home and reloads page
    const onCancelHandler = () => {
        navigate('/')
        window.location.reload() // Ensures the app resets on navigation
    }

    // Scroll to top of page when component mounts
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <>
            <div className="thankyouBody">
                <section>
                    <div className="row card" style={{ backgroundColor: '#F0F0F0' }}>
                        {/* Confirmation Header with Logo and Image */}
                        <div className="conformation col-">
                            <div>
                                {/* Company Logo */}
                                <img
                                    className="thankyouWorkshine"
                                    src="/wp-content/uploads/2024/02/Blue-Modern-Business-Corporate-Logo-1.png"
                                    alt="Company Logo"
                                />
                            </div>

                            <div className="text-center">
                                {/* Shakehand Image */}
                                <img
                                    className="shakehand"
                                    src="dist/OceanImages/shakehand.png"
                                    alt="Handshake"
                                />
                            </div>
                        </div>

                        {/* Thank You Message */}
                        <div className="thankyouText">
                            <h1 className="conformationHeading">Thank You !</h1>
                            <div className="enrollText">We are glad to have you with us!</div>
                            <p className="enrollData">
                                You will receive an activation link via email shortly. Please click
                                the link to activate your account
                            </p>

                            {/* Ok Button */}
                            <div className="thankyouBtns">
                                <Button variant="conformationbtn" onClick={onCancelHandler}>
                                    Ok
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <div className="footer-bottom py-3">
                    <div className="container">
                        <div className="row align-items-center justify-content-between">
                            <div className="col-md-5 col-lg-5">
                                <p className="copyright-text pb-0 mb-0 text-center">
                                    <img
                                        src="/dist/Images/Workshine.png"
                                        alt="workshine"
                                        height="14px"
                                        style={{ marginTop: '-6px' }}
                                    />
                                    &copy; <b>Infyshine Technologies</b>
                                    &ensp;All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConformationPage
