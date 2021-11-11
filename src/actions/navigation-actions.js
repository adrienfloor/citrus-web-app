import {
	SET_DASHBOARD_FOCUS,
	SET_IS_DASHBOARD,
	SET_IS_REDIRECTING_HOME
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

export const setIsRedirectingHome = bool => {
	return {
		type: SET_IS_REDIRECTING_HOME,
		payload: bool
	}
}