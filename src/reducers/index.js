import { combineReducers } from 'redux'
import AuthReducer from './auth-reducer'
import NavigationReducer from './navigation-reducer'
import NotificationsReducer from './notifications-reducer'
import CoachingsReducer from './coachings-reducer'
import SearchReducer from './search-reducer'

const rootReducer = combineReducers({
	auth: AuthReducer,
	navigation: NavigationReducer,
	notifications: NotificationsReducer,
	coachings: CoachingsReducer,
	searches: SearchReducer
})

export default rootReducer