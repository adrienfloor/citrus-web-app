import {
	SET_DASHBOARD_FOCUS,
	SET_IS_DASHBOARD,
	SET_APP_SCREEN
} from './types'

export const setDashboardFocus = focus => {
	return {
		type: SET_DASHBOARD_FOCUS,
		payload: focus
	}
}

export const setIsDashboard = bool => {
	return {
		type: SET_IS_DASHBOARD,
		payload: bool
	}
}

export const setAppScreen = screen => {
	return {
		type: SET_APP_SCREEN,
		payload: screen
	}
}