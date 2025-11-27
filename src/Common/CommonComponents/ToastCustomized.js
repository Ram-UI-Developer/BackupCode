import { toast } from 'react-toastify'
/**
 * ToastSuccess - Shows a success toast notification using react-toastify.
 *
 * @param {String} message - The message to display in the toast.
 * @param {Object} options - (Optional) Additional configuration options for the toast.
 */
export const ToastSuccess = (message, options = {}) => {
    // Display the success toast with default and user-provided options
    toast.success(message, {
        autoClose: false, // Prevents the toast from auto-closing
        closeOnClick: false, // Prevents the toast from closing when clicked
        draggable: true, // Allows the toast to be dragged
        closeButton: true, // Displays the close (X) button
        pauseOnHover: true, // Pauses the auto-close timer when hovered (not needed here since autoClose is false)
        ...options // Merge in any custom options passed in
    })
    // Function to dismiss the toast when user clicks anywhere on the document
    const closeToastOnClick = () => {
        toast.dismiss() // Dismiss the specific toast
        document.removeEventListener('click', closeToastOnClick) // Clean up event listener
    }
    // Attach the event listener to the document for click events
    document.addEventListener('click', closeToastOnClick)
}
/**
 * ToastError - Shows an error toast notification using react-toastify.
 *
 * @param {String} message - The error message to display.
 * @param {Object} options - (Optional) Additional configuration options for the toast.
 */
export const ToastError = (message, options = {}) => {
    // Display the error toast with default and user-provided options
    toast.error(message, {
        autoClose: false, // Prevents the toast from auto-closing
        closeOnClick: false, // Prevents the toast from closing when clicked
        draggable: true, // Allows the toast to be dragged
        closeButton: true, // Displays the close (X) button
        pauseOnHover: true, // Pauses the auto-close timer when hovered
        ...options // Merge in any custom options passed in
    })
    // Function to dismiss the toast when user clicks anywhere on the document
    const closeToastOnClick = () => {
        toast.dismiss() // Dismiss the specific toast
        document.removeEventListener('click', closeToastOnClick) // Clean up event listener
    }
    // Attach the event listener to the document
    document.addEventListener('click', closeToastOnClick)
}
