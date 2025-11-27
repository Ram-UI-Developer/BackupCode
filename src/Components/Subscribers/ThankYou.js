import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { AutoActivateAccount } from '../../Common/Services/OtherServices'

const ThankYou = () => {
    const navigate = useNavigate() // React Router hook for navigation
    const getState = useLocation().state // Accessing route state
    const [pageView, setPageView] = useState(false) // Flag to determine whether to show thank you content
    const [show, setShow] = useState(false) // Modal visibility state
    const [errorMessage, setErrorMessage] = useState('') // Error message for modal
    const url = new URL(window.location.href)
    const email = url.search.substring(1) // Extract email (or query string) from the URL after '?'

    // Handler for 'Ok' button
    const onCancelHandler = () => {
        navigate('/')
        window.location.reload() // Full reload to refresh the state
    }

    // On component mount
    useEffect(() => {
        if (email) {
            // Auto-activate the account if email is found in URL
            onActivateAccount()
        } else if (getState === 'paid') {
            // If route state is 'paid', show the success page
            setPageView(true)
        } else {
            // If no email or payment state, show error modal
            setShow(true)
            setErrorMessage('Please Subscribe To Proceed')
        }

        // Scroll to top on load
        window.scrollTo(0, 0)
    }, [])

    // Function to call backend API to auto-activate account
    const onActivateAccount = () => {
        AutoActivateAccount({ entity: 'organizations', email: email })
            .then((res) => {
                if (res.statusCode === 200) {
                    setPageView(true)
                    setShow(false)
                } else {
                    setShow(true)
                    setErrorMessage('Something went wrong. Please approach admin.')
                }
            })
            .catch(() => {
                setShow(true)
                setErrorMessage('Something went wrong. Please approach admin.')
            })
    }

    return (
        <>
            {/* Main content if account is successfully activated or user is paid */}
            {pageView ? (
                <div className="thankyouBody">
                    <section>
                        <div className="row card" style={{ backgroundColor: '#ECECEB' }}>
                            <div className="thankyou col-">
                                {/* Company Logo */}
                                <div>
                                    <img
                                        className="thankyouWorkshine"
                                        src="/wp-content/uploads/2024/02/Blue-Modern-Business-Corporate-Logo-1.png"
                                        alt="Logo"
                                    />
                                </div>
                                {/* Thumbs Up Image */}
                                <div className="text-center">
                                    <img
                                        className="likeImage"
                                        src="dist/OceanImages/likeicon.png"
                                        alt="Like Icon"
                                    />
                                </div>
                            </div>

                            {/* Success Text Block */}
                            <div className="thankyouText">
                                <h1 className="text">Congratulations !</h1>
                                <div className="enrollText">Enrolled successfully</div>
                                <p className="enrollData">
                                    Welcome to Workshine! We are delighted to have your organization
                                    as part of our community. Within 24 hrs. your credentials will
                                    be delivered to your mail and we look forward to supporting your
                                    HR needs.
                                </p>

                                {/* Navigation Buttons */}
                                <div className="thankyouBtns">
                                    <Button variant="Thankubtn" onClick={onCancelHandler}>
                                        Ok
                                    </Button>
                                    &emsp;
                                    <Button variant="ThankSucss" onClick={() => navigate('/login')}>
                                        Login
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="footer-bottom gray-light-bg py-3">
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
                                        &copy; <b>Infyshine Technologies</b> &ensp;All rights
                                        reserved.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <> </>
            )}

            {/* Alert Modal shown for errors or missing subscription */}
            <Modal show={show} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Alert</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <h6>{errorMessage}</h6>
                </Modal.Body>
                <div className="text-center mb-2">
                    <Button
                        variant="addbtn"
                        className="Button"
                        onClick={() => window.location.replace('/')}
                    >
                        Ok
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default ThankYou
