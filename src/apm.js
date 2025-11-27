// src/apm.js
import { init as initApm } from '@elastic/apm-rum'

// Initialize the Elastic APM RUM agent
const apm = initApm({
    // The name of your application or service
    serviceName: process.env.REACT_APP_SERVICE_NAME,

    // The URL of your Elastic APM server
    serverUrl: process.env.REACT_APP_RUM_URL,

    // Optional: The version of your application
    // serviceVersion: process.env.REACT_APP_SERVICE_VERSION,

    // Optional: The environment in which your application is running (e.g., 'production', 'development')
    environment: process.env.REACT_APP_API_ENV,

    // Optional: Capture page load transactions (set to false if you want to disable it)
    pageLoadTrace: true,

    // Optional: Capture user interactions (set to true to enable)
    captureInteractions: true,

    // Optional: Log level ('trace', 'debug', 'info', 'warn', 'error')
    logLevel: 'info'
})

// Export the initialized APM instance
export default apm
