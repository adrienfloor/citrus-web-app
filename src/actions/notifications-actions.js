import {
	SET_NOTIFICATION,
	CLEAN_NOTIFICATION
} from './types'

export const setNotification = notification => {
	return {
		type: SET_NOTIFICATION,
		payload: notification
	}
}

export const cleanNotification = () => {
	return { type: CLEAN_NOTIFICATION }
}