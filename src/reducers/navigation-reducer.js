import {
	SET_DASHBOARD_FOCUS,
	SET_IS_DASHBOARD,
	SET_APP_SCREEN
} from '../actions/types'

const initialState = {
	focus: 'profile',
	appScreen: 1
}

export default function (state = initialState, action) {
	switch (action.type) {
		case SET_DASHBOARD_FOCUS:
			return {
				...state,
				focus: action.payload
			}
		case SET_IS_DASHBOARD:
			return {
				...state,
				isDashboard: action.payload
			}
		case SET_APP_SCREEN:
			return {
				...state,
				appScreen: action.payload
			}
		default:
			return state
	}
}