import { ROUTE_NAME } from './constants'
// Initial state for the route slice of the Redux store
const initialState = {
    routeReducer: ''
}
// Reducer function to handle actions related to route
export default function routeReducer(state = initialState, action) {
    switch (action.type) {
        case ROUTE_NAME: {
            return { ...state, routeName: action.payload }
        }

        default:
            return state
    }
}
