
/**
 * Success message after successful login.
 * @returns {string} A warm welcome message for the user.
 */
export const loginResponseSuccess = () => {
    return 'Welcome! Have a nice day.'
}

/**
 * Success message after password reset.
 * @returns {string} Informs the user that password change was successful and to log in again.
 */
export const resetPasswordSuccess = () => {
    return 'Password changed successfully. Please login with your new password.'
}

/**
 * Success message after free enrollment.
 * @returns {string} A thank you message with instruction to check mail for credentials.
 */
export const enrollForFreeSuccess = () => {
    return 'Thanks for enrolling with us. Please check your mail for login credentials.'
}

/**
 * Success message after updating user profile.
 * @returns {string} Confirms successful profile update.
 */
export const profileSuccess = () => {
    return 'Profile updated successfully.'
}

/**
 * Success message after logging out.
 * @returns {string} Confirms successful logout.
 */
export const logOutSuccess = () => {
    return 'Logged out successfully.'
}

/**
 * Generic success message for master data operations like add, edit, delete.
 * @param {Object} params
 * @param {string} params.operationType - Type of operation (e.g., 'add', 'update', 'delete').
 * @returns {string} Message confirming successful operation.
 */
export const masterDataSuccess = ({ operationType }) => {
    return `Data ${operationType}d successfully.`
}

/**
 * Success message for email template status updates.
 * @param {Object} params
 * @param {string} params.status - Status of the email (e.g., 'activate', 'deactivate').
 * @returns {string} Message confirming email template update.
 */
export const emailTemplateSuccess = ({ status }) => {
    return `Email is ${status}d successfully.`
}

/**
 * Success message for punch-in or punch-out action.
 * @param {Object} params
 * @param {boolean} params.punched - True for punch-in, false for punch-out.
 * @returns {string} Message depending on the punch status.
 */
export const punchInSuccess = ({ punched }) => {
    return punched ? 'Punched in successfully!' : 'Punched out successfully!'
}

/**
 * Generic CRUD success message for different screens/modules.
 * @param {Object} params
 * @param {string} params.screen - Name of the module (e.g., 'User', 'Project').
 * @param {string} params.operationType - Operation performed (e.g., 'add', 'edit', 'delete').
 * @returns {string} Contextual success message.
 */
export const commonCrudSuccess = ({ screen, operationType }) => {
    return `${screen} ${operationType}d successfully.`
}

/**
 * Success message specifically for leave-related CRUD actions.
 * @param {Object} params
 * @param {string} params.screen - Leave-related screen (e.g., 'Leave Request').
 * @param {string} params.operationType - CRUD operation performed.
 * @returns {string} Success message for leave module.
 */
export const leaveCrudSuccess = ({ screen, operationType }) => {
    return `${screen} ${operationType} successfully.`
}

/**
 * Success message for assigning items like roles or responsibilities.
 * @param {Object} params
 * @param {string} params.screen - Item or entity being assigned (e.g., 'Manager').
 * @returns {string} Assignment success message.
 */
export const assigningSuccess = ({ screen }) => {
    return `${screen} assigned successfully.`
}

/**
 * Success message for changing an employee's status.
 * @param {Object} params
 * @param {string} params.employeeName - Employee's name.
 * @param {string} params.status - Status change action (e.g., 'activated', 'deactivated').
 * @returns {string} Status update confirmation.
 */
export const employeeStatusSuccess = ({ employeeName, status }) => {
    return `${employeeName} ${status} successfully.`
}

/**
 * Success message for authorizing or rejecting modules/screens for an employee.
 * @param {Object} params
 * @param {string} params.screen - Screen/module name (e.g., 'appraisal', 'leave').
 * @param {string} params.operationType - Action performed (e.g., 'Authorized', 'Rejected').
 * @param {string} params.employeeName - Name of the employee.
 * @returns {string} Message confirming the action on the employee's module.
 */
export const authorizeSuccess = ({ screen, operationType, employeeName }) => {
    return `${operationType} ${screen} of the employee ${employeeName}`
}

/**
 * Success message for generating timesheets.
 * @param {Object} params
 * @param {string} params.monthName - Month for which timesheet was generated.
 * @returns {string} Timesheet generation confirmation.
 */
export const generateTimesheetSuccess = ({ monthName }) => {
    return `Generated timesheet for the month ${monthName}`
}

/**
 * Success message for generating appraisal forms.
 * @param {Object} params
 * @param {string} params.locationName - Location for which appraisal forms are generated.
 * @returns {string} Appraisal form generation confirmation.
 */
export const generateAppraisalFormsSuccess = ({ locationName }) => {
    return `Generated appraisal forms for the location ${locationName}`
}

/**
 * Success message for initiating a pay run.
 * @param {Object} params
 * @param {string} params.locationName - Location where pay run is initiated.
 * @param {string} params.monthName - Month for which pay run is initiated.
 * @returns {string} Confirmation of pay run initiation.
 */
export const initiatePayRunSuccess = ({ locationName, monthName }) => {
    return `The payrun process for the location ${locationName} for the month of ${monthName} has been successfully initiated. `
}

/**
 * Warning message shown before re-initiating a pay run.
 * @returns {string} Message warning about data deletion on re-initiation.
 */
export const reInitiatePayRunSuccess = () => {
    return `Are you sure you want to re-initiate? All associated data will be permanently erased.`
}

/**
 * Success message for support ticket submission.
 * @returns {string} Acknowledgment message for submitted feedback or issue.
 */
export const supportTicketSuccess = () => {
    return `Your feedback has been successfully submitted. Our team will review the issue and follow up with you at the earliest. Thank you for bringing it to our attention!`
}
