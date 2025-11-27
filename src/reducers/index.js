import { combineReducers } from 'redux'
import userReducer from './userReducer'
import titleReducer from './titleReducer'
import routeReducer from './routeReducer'
import notificationsReducer from './notificationsReducer'

const rootReducer = combineReducers({
    user: userReducer, // state.user will be handled by userReducer
    title: titleReducer, // state.title will be handled by titleReducer
    routeName: routeReducer, // state.routeName will be handled by routeReducer
    notificationMessages: notificationsReducer // state.notificationMessages handled by notificationsReducer
})

export default rootReducer
