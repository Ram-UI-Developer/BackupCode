import React, { useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { IoIosEye, IoIosEyeOff } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError } from '../../Common/CommonComponents/ToastCustomized'
import { changePassword } from '../../Common/Services/OtherServices'
import { ACCESS_TOKEN, cancelButtonName } from '../../Common/Utilities/Constants'
import { NOTIFICATIONS, TITLE, USER_DETAILS } from '../../reducers/constants'
import { logout } from '../../Common/Services/CommonService'

const ChangePassword = () => {
    // Get user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    // State for form data and validation errors
    const [formData, setFormData] = useState('')
    const [formErrors, setFormErrors] = useState({})

    const dispatch = useDispatch()

    // States for password visibility toggling
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // State for loading status
    const [isLoading, setIsLoading] = useState(false)

    // Handle input changes and update form state
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name === 'password') {
            setFormErrors({ ...formErrors, old: '' }) // Reset old password error
        } else if (name === 'newpassword') {
            setFormErrors({ ...formErrors, new: '' }) // Reset new password error
        } else if (name === 'confirmPassword') {
            setFormErrors({ ...formErrors, confirm: '' }) // Reset confirm password error
        }
    }

    // Toggle visibility for passwords
    const togglePasswordVisibility = () => {
        setShowOldPassword((prev) => !prev)
    }
    const toggleNewPassword = () => {
        setShowNewPassword((prev) => !prev)
    }
    const toggleConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev)
    }

    // Logout process after password change
    const logoutProcess = () => {
        logout({id:userDetails.employeeId})
            .then((res) => {
                if (res.status == 'success') {
                    localStorage.removeItem(ACCESS_TOKEN)
                    window.location.href = '/login'
                     localStorage.setItem('changePasswordMessage', "Your Password changed, Please Login")
                    dispatch({
                        type: TITLE,
                        payload: ' '
                    })

                    dispatch({
                        type: NOTIFICATIONS,
                        payload: ' '
                    })
                    dispatch({
                        type: USER_DETAILS,
                        payload: ''
                    })
                }
            })
            .catch((error) => {
                if (error.message == 'Token Expired' || error.message == 'Session expired') {
                    localStorage.removeItem(ACCESS_TOKEN)
                    window.location.href = '/'
                     dispatch({
                        type: TITLE,
                        payload: ' '
                    })

                    dispatch({
                        type: NOTIFICATIONS,
                        payload: ' '
                    })
                    dispatch({
                        type: USER_DETAILS,
                        payload: ''
                    })
                } else {
                    ToastError(error.message)
                    localStorage.removeItem(ACCESS_TOKEN)
                    window.location = '/'
                     dispatch({
                        type: TITLE,
                        payload: ' '
                    })

                    dispatch({
                        type: NOTIFICATIONS,
                        payload: ' '
                    })
                    dispatch({
                        type: USER_DETAILS,
                        payload: ''
                    })
                }

            })
    }

    // Password change handler
    const onChangePassword = (e) => {
        e.preventDefault()

        // Password validation regex (at least 8 chars, 1 uppercase, 1 number, 1 special character)
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/

        // Prepare request object
        const obj = {
            username: userDetails.username,
            password: formData.password,
            newpassword: formData.newpassword
        }

        // Validate inputs
        if (!formData.password || formData.password === undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.newpassword || formData.newpassword === undefined) {
            setFormErrors(validate(formData))
        } else if (formData.password === formData.newpassword) {
            setFormErrors(validate(formData))
        } else if (!formData.confirmPassword || formData.confirmPassword === undefined) {
            setFormErrors(validate(formData))
        } else if (formData.newpassword !== formData.confirmPassword) {
            setFormErrors({ ...formErrors, confirm: 'Password mismatched', new: '' })
        } else if (!regex.test(formData.newpassword)) {
            setFormErrors({
                ...formErrors,
                new: 'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.',
                confirm: ''
            })
        } else {
            setIsLoading(true)
            setFormErrors({ ...formErrors, confirm: '' })

            // API call to change password
            changePassword({ entity: 'users', body: obj })
                .then((res) => {
                    if (res.statusCode === 200) {
                        toast.success('New password saved successfully.')
                        logoutProcess()
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Function to validate form fields
    const validate = (values) => {
        const errors = {}
        if (!values.password || values.password.length < 0) {
            errors.old = 'Required'
        }
        if (!values.newpassword || values.newpassword.length < 0) {
            errors.new = 'Required'
        }
        if (!values.confirmPassword || values.confirmPassword.length < 0) {
            errors.confirm = 'Required'
        }
        if (values.password == values.newpassword) {
            errors.new = 'New password cannot be the same as the old password'
        }

        return errors
    }

    const navigate = useNavigate()

    return (
        <>
            <div>
                {/* Show loader when API call is in progress */}
                {isLoading ? <DetailLoader /> : ''}

                <section className="section detailBackground">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div>
                                    {/* Page Header */}
                                    <PageHeader pageTitle={'Change Password'} />

                                    <center>
                                        <form className="card-body">
                                            {/* Username (Disabled) */}
                                            <div className="col-6">
                                                <Form.Group as={Row} className="mb-3 text-left">
                                                    <Form.Label column sm={4}>
                                                        User Name <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <InputGroup>
                                                            <Form.Control
                                                                disabled
                                                                size="sm"
                                                                type="text"
                                                                value={userDetails.username}
                                                                name="username"
                                                                style={{ paddingLeft: '20px' }}
                                                            />
                                                        </InputGroup>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* Old Password Input */}
                                            <div className="col-6">
                                                <Form.Group as={Row} className="mb-2 text-left">
                                                    <Form.Label column sm={4}>
                                                        Old Password{' '}
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <InputGroup>
                                                            <Form.Control
                                                                onChange={handleInputChange}
                                                                size="sm"
                                                                type={
                                                                    showOldPassword
                                                                        ? 'text'
                                                                        : 'password'
                                                                }
                                                                name="password"
                                                                maxLength={15}
                                                            />
                                                            <InputGroup.Text
                                                                className="showText"
                                                                onClick={togglePasswordVisibility}
                                                            >
                                                                {showOldPassword ? (
                                                                    <IoIosEyeOff size={22} />
                                                                ) : (
                                                                    <IoIosEye size={22} />
                                                                )}
                                                            </InputGroup.Text>
                                                        </InputGroup>
                                                        <p className="error">{formErrors.old}</p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* New Password Input */}
                                            <div className="col-6">
                                                <Form.Group as={Row} className="mb-2 text-left">
                                                    <Form.Label column sm={4}>
                                                        New Password{' '}
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <InputGroup>
                                                            <Form.Control
                                                                onChange={handleInputChange}
                                                                size="sm"
                                                                type={
                                                                    showNewPassword
                                                                        ? 'text'
                                                                        : 'password'
                                                                }
                                                                name="newpassword"
                                                                maxLength={15}
                                                            />
                                                            <InputGroup.Text
                                                                className="showText"
                                                                onClick={toggleNewPassword}
                                                            >
                                                                {showNewPassword ? (
                                                                    <IoIosEyeOff size={22} />
                                                                ) : (
                                                                    <IoIosEye size={22} />
                                                                )}
                                                            </InputGroup.Text>
                                                        </InputGroup>
                                                        <p className="error">{formErrors.new}</p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* Confirm Password Input */}
                                            <div className="col-6 mb-4">
                                                <Form.Group as={Row} className="text-left">
                                                    <Form.Label column sm={4}>
                                                        Confirm Password{' '}
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <InputGroup>
                                                            <Form.Control
                                                                onChange={handleInputChange}
                                                                size="sm"
                                                                type={
                                                                    showConfirmPassword
                                                                        ? 'text'
                                                                        : 'password'
                                                                }
                                                                name="confirmPassword"
                                                                maxLength={15}
                                                            />
                                                            <InputGroup.Text
                                                                className="showText"
                                                                onClick={toggleConfirmPassword}
                                                            >
                                                                {showConfirmPassword ? (
                                                                    <IoIosEyeOff size={22} />
                                                                ) : (
                                                                    <IoIosEye size={22} />
                                                                )}
                                                            </InputGroup.Text>
                                                        </InputGroup>
                                                        <p className="error">
                                                            {formErrors.confirm}
                                                        </p>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {/* Buttons */}
                                            <div className="btnCenter mb-3">
                                                <Button
                                                    className="Button"
                                                    variant="addbtn"
                                                    type="button"
                                                    onClick={onChangePassword}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    className="Button"
                                                    variant="secondary"
                                                    onClick={() => navigate('/')}
                                                >
                                                    {cancelButtonName}
                                                </Button>
                                            </div>
                                        </form>
                                    </center>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
export default ChangePassword
