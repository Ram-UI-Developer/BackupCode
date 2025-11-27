import { NOTIFICATIONS } from './constants'
// Initial state for the notifications slice of the Redux store
const initialState = {
    notificationMessages: []
}

// Reducer function to handle actions related to notifications
export default function notificationsReducer(state = initialState, action) {
    switch (action.type) {
        case NOTIFICATIONS: {
            return { ...state, notificationMessages: action.payload, lastUpdated: action.timeStamp }
        }

        default:
            return state
    }
}
