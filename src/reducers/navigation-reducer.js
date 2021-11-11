import {
	SET_DASHBOARD_FOCUS,
	SET_IS_DASHBOARD,
	SET_IS_REDIRECTING_HOME
} from '../actions/types'

const initialState = {
	focus: 'profile'
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
		case SET_IS_REDIRECTING_HOME:
			return {
				...state,
				isRedirectingHome: action.payload
			}
		default:
			return state
	}
}