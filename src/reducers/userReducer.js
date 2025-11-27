import { USER_DETAILS } from './constants'
// Initial state for the user slice of the Redux store
const initialState = {
    userDetails: null
}
// Reducer function to handle actions related to user
export default function userReducer(state = initialState, action) {
    switch (action.type) {
        case USER_DETAILS: {
            return { ...state, userDetails: action.payload }
        }

        default:
            return state
    }
}
