import { ACCESS_TOKEN } from '../../Common/Utilities/Constants'
// import { resolve } from 'q' // Although imported, `resolve` is not used in this file
/**
 * getAccessToken - Retrieves the user's access token.
 * First checks sessionStorage; if not found, falls back to localStorage.
 *
 * @returns {String|null} The access token if available, otherwise null.
 */
export const getAccessToken = () => {
    if (sessionStorage.getItem(ACCESS_TOKEN)) {
        return sessionStorage.getItem(ACCESS_TOKEN)
    } else {
        return localStorage.getItem(ACCESS_TOKEN)
    }
}

const createHeaders = () => {
    const headers = new Headers({ 'Content-Type': 'application/json' })
    const token = localStorage.getItem(ACCESS_TOKEN) || sessionStorage.getItem(ACCESS_TOKEN)
    if (token) {
        headers.append('Authorization', 'Bearer ' + getAccessToken())
    }
    return headers
}

const parseErrorMessage = (data, options) => {
    return data && (data.errorMessage || data.message)
        ? data.errorMessage || data.message
        : (options.props && options.props.toastErrorMessage) ||
        'There seems to be an error. Please try after sometime.'
}

const generateSuccessMessage = (options) => {
    if (options && options.props && options.props.toastSuccessMessage)
        return options.props.toastSuccessMessage

    if (options.operationType && options.operationType !== 'get') {
        const entity =
            options.props && options.props.screenName
                ? options.props.screenName
                : options.props.entity || 'Data'
        return `${entity} ${options.operationType}d successfully.`
    }
    return null
}

/**
 * request - Makes a fetch request with standardized headers and error handling.
 *
 * @param {Object} options - Contains all request configuration, including:
 *   - url: Endpoint to call
 *   - method: HTTP method (GET, POST, etc.)
 *   - body: Request body (stringified)
 *   - operationType: (optional) Used to generate success message for non-GET requests
 *   - props: (optional) Extra config like toastSuccessMessage, toastErrorMessage, screenName, entity
 * @returns {Promise} Resolves to response data or rejects with an error object
 */
export const request = (options) => {
    // Set up default headers
    const headers = createHeaders()

    // Set default request config
    const defaults = { headers }
    // Merge custom options (like method, body, url) with defaults
    options = Object.assign({}, defaults, options)

    // Make the API call
    return fetch(options.url, options)
        .then(async (response) => {
            // Attempt to parse the response body as JSON
            const data = await response.json().catch(() => null)
            // Handle failed response
            if (!response.ok) {
                // Create custom error object with status
                const error = new Error(parseErrorMessage(data, options))
                error.status = response.status
                throw error
            }
            // Generate success message (if not explicitly provided)

            // Attach message to response data
            data.message = generateSuccessMessage(options)
            // Return the processed data
            return data
        })
        .catch((error) => {

            const status = error.status;
            const message = (error.message || '').trim().toLowerCase();
            if (message === 'token expired' || message == 'session expired') {
                localStorage.removeItem(ACCESS_TOKEN);
                window.location.href = '/login';
            } else {
                return Promise.reject({
                    status: status || 500,
                    message: error.message || 'There seems to be an error. Please try after sometime.'
                });
            }
        });
}

/**
 * request8 - A flexible and robust API request function
 * This version:
 *   - Adds authorization if a token exists
 *   - Handles success and error messages conditionally
 *   - Parses and returns JSON response
 *   - Gracefully handles fetch and JSON parsing errors
 *
 * @param {Object} options - Configuration for the fetch request
 *   - Required: options.url
 *   - Optional: options.method, options.body, options.props, options.operationType
 * @returns {Promise<Object>} Resolves with response data, or rejects with error object
 */
export const request8 = (options) => {
    // Step 1: Create headers object (can be customized per request)
    const headers = new Headers({})
    // Step 2: If access token exists in sessionStorage or localStorage, add Authorization header
    if (localStorage.getItem(ACCESS_TOKEN) || sessionStorage.getItem(ACCESS_TOKEN)) {
        headers.append('Authorization', 'Bearer ' + getAccessToken())
    }
    // Step 3: Define default options, including headers
    const defaults = {
        headers: headers
    }
    // Step 4: Merge provided options with default options
    options = Object.assign({}, defaults, options)
    // Step 5: Make the fetch request
    return fetch(options.url, options)
        .then(async (response) => {
            // Step 6: Attempt to parse JSON response. If fails, return null.
            const data = await response.json().catch(() => null)
            // Step 7: Check if HTTP response is not OK (status not in 200–299 range)
            if (!response.ok) {
                // Step 9: Create an error object with status and throw it
                const error = new Error(parseErrorMessage(data, options))
                error.status = response.status
                throw error
            }

            // Step 12: Attach message to response data
            data.message = generateSuccessMessage(options)
            // Step 13: Return the successful response data
            return data
        })
        .catch((error) => {

            const status = error.status;
            const message = (error.message || '').trim().toLowerCase();
            if (message === 'token expired' || message == 'session expired') {
                localStorage.removeItem(ACCESS_TOKEN);
                window.location.href = '/login';
            } else {
                return Promise.reject({
                    status: status || 500,
                    message: error.message || 'There seems to be an error. Please try after sometime.'
                });
            }
        });

}

export const requestUpload = (options) => {
    // Step 2: Set headers (Authorization only; no Content-Type)
    const headers = new Headers();
    const token = localStorage.getItem(ACCESS_TOKEN) || sessionStorage.getItem(ACCESS_TOKEN);
    if (token) {
        headers.append('Authorization', 'Bearer ' + getAccessToken());
    }

    // Step 3: Make the fetch call
    return fetch(options.url, options)
        .then(async (response) => {
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json().catch(() => null);
            } else {
                const text = await response.text();
                data = { message: text };
            }
            if (!response.ok) {
                const error = new Error(parseErrorMessage(data));
                error.status = response.status;
                throw error;
            }
            return data; // <-- Return the data so you get it in .then()
        })
        .catch((error) => {
            const status = error.status;
            const message = (error.message || '').trim().toLowerCase();

            if (message === 'token expired' || message == 'session expired') {
                localStorage.removeItem(ACCESS_TOKEN);
                window.location.href = '/login';
            } else {
                return Promise.reject({
                    status: status || 500,
                    message: error.message || 'There was an upload error. Please try again.'
                });
            }
        });
};


/**
 * requestWithoutToken - Makes a fetch request **without requiring an access token**.
 * Used for unauthenticated API calls (e.g., login, registration, public data access).
 *
 * Features:
 * - Adds standard headers (CORS, JSON type)
 * - Gracefully handles response and error messaging
 * - Provides support for toast messages and status codes
 *
 * @param {Object} options - Fetch options (must include `url`, can include method, body, props, etc.)
 * @returns {Promise<Object>} - Resolves with response data or rejects with error info
 */
export const requestWithoutToken = (options) => {
    // Step 1: Set up default headers
    const headers = new Headers({
        'Content-Type': 'application/json' // Expect JSON payload
    })
    // Step 2: Merge headers into default fetch options
    const defaults = {
        headers: headers
    }
    // Step 3: Merge user-provided options with defaults
    options = Object.assign({}, defaults, options)
    // Step 4: Perform the fetch request
    return fetch(options.url, options)
        .then(async (response) => {
            // Step 5: Attempt to parse the JSON body of the response
            const data = await response.json().catch(() => null) // If parsing fails, return null
            // Step 6: If response is not OK (status not 200-299), handle the error
            if (!response.ok) {
                // Create a new Error object with status and throw it
                const error = new Error(parseErrorMessage(data, options))
                error.status = response.status
                throw error
            }
            // Step 8: Attach the message to the response data
            data.message = generateSuccessMessage(options)
            return data
        })
        .catch((error) => {
            // Step 9: Catch any error and return a rejected promise with status and message
            if (error.message === 'Token Expired' || error.message == 'Session expired') {

                localStorage.removeItem(ACCESS_TOKEN)
                window.location = '/'
            }
            return Promise.reject({
                status: error.status || 500,
                message: error.message || 'There seems to be an error. Please try after sometime.'
            })
        })
}
