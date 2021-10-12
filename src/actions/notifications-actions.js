import axios from 'axios'
import {
	SET_NOTIFICATION,
	CLEAN_NOTIFICATION,
	CREATE_NOTIFICATION,
	DELETE_NOTIFICATION
} from './types'
import { returnErrors } from './errors-actions'
const { REACT_APP_API_URL } = process.env

export const setNotification = notification => {
	return {
		type: SET_NOTIFICATION,
		payload: notification
	}
}

export const cleanNotification = () => {
	return { type: CLEAN_NOTIFICATION }
}

export const createNotification = notification => async dispatch => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		}

		const body = JSON.stringify(notification)

		const response = await axios.post(`${REACT_APP_API_URL}/notifications`, body, config)
		return dispatch({ type: CREATE_NOTIFICATION, payload: response.data })
	} catch (err) {
		return dispatch(returnErrors(err, err.response.status))
	}
}


export const deleteNotification = (userId, id) => async dispatch => {
	try {
		const response = await axios.delete(`${REACT_APP_API_URL}/notifications?user_id=${userId}&id=${id}`)
		return dispatch({ type: DELETE_NOTIFICATION, payload: response.data })
	} catch (err) {
		return dispatch(returnErrors(err.response.data, err.response.status))
	}
}
