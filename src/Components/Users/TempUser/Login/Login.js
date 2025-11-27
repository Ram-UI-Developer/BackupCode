import React from 'react'
import TempUserLogin from './TempUserLogin'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate()
      const onHomeHandler = () => {
        navigate('/')
        window.location.reload()
    }
    return (
        <>
            <div className="loginpage">
                {' '}
                {/* Main container for the login page */}
                {/* Left Section: Contains the background design and text */}

                <div className="loginImage" style={{ position: 'relative', height: '100vh', width: '55%' }}>
                    <div
                        className=""
                        style={{ marginTop: '2%', marginLeft: '5%',textDecoration:'underline',cursor:'pointer', }}
                    >
                        <div className="elementor-widget-container">
                            <div
                                className=""
                            onClick={onHomeHandler}
                            >
                                Home
                            </div>
                        </div>
                    </div>
                    {/* Text content on the left section */}
                    <div className="contentstyle" style={{marginTop:"1%", marginLeft: '5%' }}>
                        Where Employee Engagement Meets <br />
                        <span className="contentstyle1">Operational Excellence.</span>
                    </div>
                    {/* Decorative Images */}
                    <img
                        style={{
                            position: 'absolute',
                            height: '40%',
                            top: 0,
                            right: 0
                        }}
                        src="dist/Images/Ellipse1.png"
                    />
                    <img
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0
                        }}
                        src="dist/Images/Ellipse2.png"
                    />
                    <img
                        style={{
                            position: 'absolute',
                            height: '80%',
                            left: '10%'
                        }}
                        src="dist/Images/3DCenterImage.png"
                    />
                </div>
                {/* Right Section: Login Card */}
                <div className="loginCard">
                    {/* Logo */}
                    <div>
                        <img className="loginLogo" src="dist/Images/Workshine.png" alt="logo" />
                    </div>
                    {/* Login Heading */}
                    <div className="loginHeading">
                        <span className="loginHeading"> Login to </span>
                        <span className="loginHeading1">Workshine</span>
                    </div>
                    {/* User Login Component */}
                    <TempUserLogin />
                </div>
            </div>
        </>
    )
}

export default Login
