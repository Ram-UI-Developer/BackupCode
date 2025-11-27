
/**
 * Error message for password reset failure.
 * @returns {string} A default message indicating password reset cannot be done now.
 */
export const resetPasswordError = () => {
    return 'Cannot reset password now. Please try after sometime.'
}

/**
 * Error message when location access fails (used in punch-in functionality).
 * @returns {string} A message prompting the user to check location permissions.
 */
export const punchInLocationError = () => {
    return 'Failed to retrieve location. Please check location permissions.'
}

/**
 * Generic error message for master data CRUD operations (Create, Update, Delete).
 * @param {Object} params
 * @param {string} params.operationType - The type of operation attempted (e.g., 'create', 'update', 'delete').
 * @returns {string} An error message specifying the operation type.
 */
export const masterDataError = ({ operationType }) => {
    return `Cannot ${operationType} the data. Please try after sometime.`
}

/**
 * Generic error message for screen-specific CRUD operations.
 * @param {Object} params
 * @param {string} params.screen - The name of the screen or module (e.g., "User", "Project").
 * @param {string} params.operationType - The type of operation attempted (e.g., 'add', 'edit', 'delete').
 * @returns {string} A contextual error message for the specified screen and operation.
 */
export const commonCrudError = ({ screen, operationType }) => {
    return `${screen} cannot be ${operationType}d. Please try after sometime`
}

/**
 * Error message when profile update fails.
 * @returns {string} A message indicating that profile update could not be completed.
 */
export const profileError = () => {
    return 'Cannot update the profile. Please try after sometime.'
}

/**
 * Error message when updating employee status fails.
 * @param {Object} params
 * @param {string} params.status - The action attempted (e.g., 'activate', 'deactivate').
 * @param {string} params.employeeName - The name of the employee affected.
 * @returns {string} A message stating the failure to update the employee status.
 */
export const employeeStatusError = ({ status, employeeName }) => {
    return `Cannot ${status} ${employeeName}. Please try after sometime.`
}

/**
 * Error message for timesheet generation failure.
 * @returns {string} A message indicating that timesheet generation failed.
 */
export const generateTimesheetError = () => {
    return `Cannot generate timesheet. Please try after sometime.`
}

/**
 * Error message for appraisal form generation failure based on location.
 * @param {Object} params
 * @param {string} params.locationName - The name of the location.
 * @returns {string} A location-specific error message for appraisal form generation.
 */
export const generateAppraisalFormsError = ({ locationName }) => {
    return `Cannot geneate appraisal forms for the location ${locationName}. Please try after sometime.`
}

/**
 * Error message for initiating pay run failure.
 * @param {Object} params
 * @param {string} params.locationName - The location where the pay run is attempted.
 * @param {string} params.monthName - The month for which pay run is attempted.
 * @returns {string} A message indicating failure to initiate the pay run process.
 */
export const initiatePayRunError = ({ locationName, monthName }) => {
    return `Payrun process for the location ${locationName} for the month of ${monthName} cannot be initiated. Please try after sometime.`
}

/**
 * Error message for re-initiating pay run failure.
 * @returns {string} A message indicating that re-initiating pay run is not possible.
 */
export const reInitiatePayRunError = () => {
    return `Cannot re-initiate payrun process. Please try after sometime.`
}

/**
 * Error message for support ticket submission failure.
 * @returns {string} A detailed message suggesting user to retry or contact support.
 */
export const supportTicketError = () => {
    return `We encountered an issue while processing your feedback. Please try again later. If the problem persists, contact support for assistance.`
}

/**
 * Error message for invalid file type or size during file upload.
 * @param {Object} params
 * @param {string} params.fileType - Allowed file type(s) (e.g., 'PDF', 'JPG').
 * @param {string} params.size - Maximum allowed file size (e.g., '2MB').
 * @returns {string} A message indicating the allowed file format and size.
 */
export const fileTypeAndSize = ({ fileType, size }) => {
    return `Please upload the files of type ${fileType} below ${size}.`
}
