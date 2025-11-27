import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './TempUserLogin.css'
import { ACCESS_TOKEN } from '../../../../Common/Utilities/Constants'
import { USER_DETAILS } from '../../../../reducers/constants'
import ForgotPage from '../Login/ForgotPage'
import { Button, Modal } from 'react-bootstrap'
import { Login } from '../../../../Common/Services/CommonService'
import { IoIosEye, IoIosEyeOff } from 'react-icons/io'
import { ToastError, ToastSuccess } from '../../../../Common/CommonComponents/ToastCustomized'
import { loginResponseSuccess } from '../../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../../Common/CommonComponents/Loaders/DetailLoader'
import { useNavigate } from 'react-router-dom'
import { generateToken } from '../../../../Notifications/fireBase'

const TempUserLogin = () => {
    // State variables for handling form inputs, errors, modal visibility, password visibility, and loading state
    const [emailId, setEmailId] = useState('')
    const [password, setPassword] = useState('')
    const [formErrors, setFormErrors] = useState({})
    const [show, setShow] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const dispatch = useDispatch()

    // Effect to set an initial error message from localStorage if available
    useEffect(() => {
        setFormErrors({ ...formErrors, password: localStorage.getItem('changePasswordMessage') })
    }, [])

    // Function to handle login process
    const loginProcess2 = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const oj = {
            username: emailId,
            password: password
        }

        // Call the login API
        Login({ body: oj, toastSuccessMessage: loginResponseSuccess })
            .then((response) => {
                  generateToken(response.data)
                if (response.status && response.statusCode === 200) {
                    setIsLoading(false)
                    
                    // Dispatch user details to Redux store
                    dispatch({
                        type: USER_DETAILS,
                        payload: {
                            ...response.data
                        }
                    })
                   

                    // Store access token in localStorage
                    localStorage.setItem(ACCESS_TOKEN, response.data.token)
                     // Handle different login scenarios
                    if (response.data.username == null) {
                        ToastError('Invalid Details', { autoClose: 3000 })
                    } else if (response.data && response.data.organizationId === null) {
                        navigate('/subscriberList', { replace: true })
                    } else {
                      
                        navigate('/', { replace: true })

                    }
                } else {
                    setFormErrors({
                        ...formErrors,
                        password: response ? response.errorMessage : ' '
                    })
                }

                ToastSuccess(response.message)
            })
            .catch((err) => {
                setIsLoading(false)
                if(err.message.includes('Your password expired')) {
                    navigate('/reset', { state: { username: emailId, password:password } })
                }else {
                    ToastError(err.message)
                }
            })
    }

    // Prevent space key from being pressed in the input fields
    const handleKeyPress = (event) => {
        if (event.key === ' ') {
            event.preventDefault()
        }
    }

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev)
    }

    return (
        <div>
            {isLoading ? <DetailLoader /> : ''}
            
            <section className="body-sign">
                <div className="center-sign">
                    <a href="/" className="logo pull-left"></a>
                    <div className="panel panel-sign">
                        <div className="">
                            <form onSubmit={loginProcess2} autoComplete='off'>
                                {/* Display error message if exists */}
                                {formErrors.password && (
                                    <p
                                        className="text-wrap"
                                        style={{ color: 'red', fontsize: '13px' }}
                                    >
                                        {formErrors.password}
                                    </p>
                                )}

                                {/* Username input field */}
                                <div className="form-group mb-lg">
                                    <label>Username</label>
                                    <div className="input-group">
                                        <input
                                            required
                                            onKeyPress={handleKeyPress}
                                            type="text"
                                            className="form-control"
                                            name="emailId"
                                            value={emailId}
                                            placeholder=""
                                             autoComplete="off" 
                                            onChange={(e) =>
                                                setEmailId(e.target.value.replace(/\s+/g, ''))
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Password input field with toggle visibility feature */}
                                <div className="form-group mb-3" style={{ position: 'relative' }}>
                                    <label>Password</label>
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder=""
                                        value={password}
                                        autoComplete="new-password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            paddingRight: '30px'
                                        }}
                                    />
                                    {/* Eye icon to toggle password visibility */}
                                    <span
                                        className="showPassword"
                                        onClick={togglePasswordVisibility}
                                        style={{
                                            position: 'absolute',
                                            top: '52%',
                                            right: '5px',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {showPassword ? (
                                            <IoIosEyeOff size={20} />
                                        ) : (
                                            <IoIosEye size={20} />
                                        )}
                                    </span>

                                    {/* Forgot password link */}
                                    <div className="text-right forgotPasswordInLogin">
                                        <a
                                            // href="/"
                                            className="forgotPasswordInLogin"
                                            data-toggle="modal"
                                            data-target="#forgotPassword"
                                            onClick={() => setShow(true)}
                                        >
                                            Forgot Password?
                                        </a>
                                    </div>
                                </div>

                                {/* Login button */}
                                <div className="row">
                                    <div className="col- text-center">
                                        <Button className="loginButton" variant="" type="submit">
                                            Login
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <p className="text-center text-muted mt-md mb-md" style={{ marginTop: '6px' }}>
                        <img
                            className="OrgImgF"
                            src="/dist/Images/Workshine.png"
                            alt="workshine"
                            style={{ marginTop: '-6px' }}
                        />
                        &copy; <b>Infyshine Technologies</b> &ensp;All Rights Reserved.
                    </p>
                </div>
            </section>

            {/* Forgot Password Modal */}
            <Modal show={show} onHide={() => setShow(false)} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <h2 className="title text-uppercase text-bold m-none">
                            <i className="fa fa-user mr-xs"></i> RECOVER PASSWORD
                        </h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ForgotPage resetMessage={setFormErrors} setPassword={setPassword} username={setEmailId} setShow={setShow} />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default TempUserLogin
