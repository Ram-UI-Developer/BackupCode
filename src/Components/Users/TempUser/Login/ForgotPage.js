import React, { useState } from 'react'
import { forgotPass } from '../../../../Common/Services/OtherServices'
import { ToastError } from '../../../../Common/CommonComponents/ToastCustomized'
import DetailLoader from '../../../../Common/CommonComponents/Loaders/DetailLoader'

const ForgotPage = ({resetMessage,setPassword, username, setShow}) => {
    // State for managing form data, errors, and loading state
    const [formData, setFormData] = useState('')
    const [formErrors, setFormErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    // Handle input changes and update state
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    // Handle forgot password form submission
    const onForgotPassword = (e) => {
        e.preventDefault()
       
        // Create request object
        const obj = {
            email: formData.email,
            phoneNumber: formData.phoneNumber
        }

        // Validation checks
        if (!formData.email || formData.email === undefined) {
            setFormErrors(validate(formData))
        } else {
            setIsLoading(true)

            // API call for password reset
            forgotPass({ entity: 'users', body: obj })
                .then((res) => {
                    if (res.statusCode === 200) {
                        setIsLoading(false)
                        resetMessage((prev) => ({ ...prev, password: "Your new password has been sent to your email. If you don’t see it in your inbox, please check your spam or junk folder." })) // Reset error message
                        setShow(false) // Close the modal
                        setPassword('') // Clear the password state
                        username(formData.email) // Clear the username state
                        // window.location.reload() // Refresh the page after success
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Form validation function
    const validate = (values) => {
        const errors = {}
        if (!values.email) {
            errors.email = 'Required'
        }
        if (!values.phoneNumber) {
            errors.phoneNumber = 'Required'
        }
        return errors
    }

    return (
        <>
            {/* Show loader when the request is in progress */}
            {isLoading ? <DetailLoader /> : ''}

            <section className="body-sign" style={{ paddingTop: '0px' }}>
                <div className="center-sign" style={{ paddingTop: '0px' }}>
                    <div className="panel panel-sign" style={{ paddingTop: '0px' }}>
                        <div className="panel-body">
                            <form onSubmit={onForgotPassword}>
                                <p className="error">{formErrors.error}</p>
                                <div className="form-group mb-none">
                                    <div className="input-group">
                                        {/* Email Input */}
                                        <div className="input-container">
                                            <label>
                                                Email <span className="error">*</span>
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className="form-control input-lg"
                                                style={{ marginRight: '200px' }}
                                                onChange={handleInputChange}
                                                onBlur={handleInputChange}
                                                required
                                                maxLength={100}
                                            />
                                            <p className="error">{formErrors.email}</p>
                                        </div>

                                        {/* Phone Number Input */}
                                        <div
                                            className="input-container"
                                            style={{ marginTop: '20px' }}
                                        >
                                            <label htmlFor="phoneNumber">
                                                Phone Number <span className="error">*</span>
                                            </label>
                                            <input
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                type="text"
                                                style={{ marginRight: '200px' }}
                                                className="form-control input-lg"
                                                onChange={handleInputChange}
                                                onBlur={handleInputChange}
                                                maxLength={15}
                                                required
                                                onInput={(e) => {
                                                    e.target.value = e.target.value.replace(
                                                        /[^0-9]/g,
                                                        ''
                                                    ) // Restrict input to numbers only
                                                }}
                                            />
                                            <p className="error">{formErrors.phoneNumber}</p>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="input-container btnCenter">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg"
                                            style={{ marginTop: '40px' }}
                                        >
                                            Reset!
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
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
        </>
    )
}

export default ForgotPage
