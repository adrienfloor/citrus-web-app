import { combineReducers } from 'redux'
import AuthReducer from './auth-reducer'
import NavigationReducer from './navigation-reducer'
import NotificationsReducer from './notifications-reducer'

const rootReducer = combineReducers({
	auth: AuthReducer,
	navigation: NavigationReducer,
	notifications: NotificationsReducer
})

export default rootReducer
