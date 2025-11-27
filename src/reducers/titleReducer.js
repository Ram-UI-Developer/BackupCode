import { TITLE } from './constants'
// Initial state for the title slice of the Redux store
const initialState = {
    title: ''
}
// Reducer function to handle actions related to title
export default function titleReducer(state = initialState, action) {
    switch (action.type) {
        case TITLE: {
            return { ...state, title: action.payload }
        }

        default:
            return state
    }
}
