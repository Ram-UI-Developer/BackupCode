import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NOTIFICATIONS } from '../reducers/constants'
import { API_BASE_URL } from '../Common/Utilities/Constants'

const NotificationsEvent = () => {
    // State to hold incoming messages (not used in this code, but declared)
    //    const [messages, setMessages] = useState([])
    // Track current connection status
    const [, setConnectionStatus] = useState('Connecting.....')
    const dispatch = useDispatch()
    // Ref to store the EventSource instance across renders
    const eventSourceRef = useRef(null)
    // Track whether a retry attempt is currently active
    const isRetryingRef = useRef(false)
    // Counter to limit the number of retries
    const retryCountRef = useRef(0)
    // Get user details and notification messages from Redux
    const userDetails = useSelector((state) => state.user.userDetails)
    console.log("userDetails", userDetails);
    //    const notifications = useSelector((state) => state.notificationMessages.notificationMessages)
    // Constants to configure retry behavior
    const MAX_RETRIES = 10 // Maximum number of retry attempts
    const INITIAL_RETRY_DELAY = 5000 // Initial delay between retries (in ms)
    const MAX_RETRY_DELAY = 60000 // Maximum delay between retries (in ms)

    useEffect(() => {
        // Function to establish SSE connection
        const connect = () => {
            // Stop if retry attempts have reached the maximum limit
            if (retryCountRef.current >= MAX_RETRIES) {
                setConnectionStatus("Failed to reconnect after several attempts.");
                isRetryingRef.current = false;
                // Clean up the EventSource if it exists
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }
                return;
            }

            isRetryingRef.current = true;
            // Create a new EventSource with organization and employee info
            if (userDetails.
                organizationId == null || userDetails.
                    employeeId
                == null) {
                return;
            } else {
                eventSourceRef.current = new EventSource(`${API_BASE_URL}notifications/sse?organizationId=${userDetails.organizationId}&employeeId=${userDetails.employeeId}`);

            }
            // Triggered when connection is successfully established
            eventSourceRef.current.onopen = () => {
                setConnectionStatus("Connected")
                retryCountRef.current = 0; // Reset retry count
                // Optional: Clear previous notifications or reset state
                dispatch({
                    type: NOTIFICATIONS,

                    payload: "",
                })
            }
            // Handle custom server-sent event: "attendanceAction"
            eventSourceRef.current.addEventListener("attendanceAction", (event) => {

                // Dispatch the new notification event to Redux
                dispatch({
                    type: NOTIFICATIONS,

                    payload: event.data,
                    timeStamp: event.timeStamp,
                })
            })
            // Handle errors and auto-reconnect with exponential backoff
            eventSourceRef.current.onerror = () => {
                setConnectionStatus("Reconnecting...");

                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                }

                retryCountRef.current += 1;
                // Calculate retry delay using exponential backoff
                const retryDelay = Math.min(
                    INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current - 1),
                    MAX_RETRY_DELAY
                );

                // Retry the connection after the calculated delay
                setTimeout(() => {
                    if (isRetryingRef.current) {
                        connect();
                    }
                }, retryDelay);
            };

        }
        // Initial connection
        connect()
        // Cleanup function when component is unmounted
        return () => {

            if (eventSourceRef.current) {
                console.log("Disconnected");
                eventSourceRef.current.close();
            }

            isRetryingRef.current = false;
        };

    }, [dispatch]) // Run once on mount and if dispatch ever changes

    return null // This component doesn't render any UI
}
export default NotificationsEvent
