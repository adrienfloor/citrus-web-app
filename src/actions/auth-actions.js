import axios from 'axios'

import {
	USER_LOADING,
	USER_LOADED,
	AUTH_ERROR,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT_SUCCESS,
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	UPDATE_USER,
	DELETE_USER,
	RESET_PASSWORD,
	RESET_PASSWORD_FAIL
} from './types'
import { returnErrors } from './errors-actions'

const { REACT_APP_API_URL } = process.env

// CHECK TOKEN AND LOAD USER
export const loadUser = () => async (dispatch, getState) => {
	dispatch({ type: USER_LOADING })
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/auth/user`, tokenConfig(getState))
		return dispatch({ type: USER_LOADED, payload: response.data })
	} catch (err) {
		console.log(err)
		dispatch(returnErrors(err, err))
		return dispatch({ type: AUTH_ERROR })
	}
}

// SIGNUP USER
export const signup = (userName, email, password, language) => async dispatch => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	const agreedTermsAndConditions = true
	// BODY
	const body = JSON.stringify({ userName, email, password, agreedTermsAndConditions, language })
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/users`, body, config)
		return dispatch({ type: REGISTER_SUCCESS, payload: response.data })
	} catch (err) {
		dispatch(returnErrors(err.response.data, err.response.status, 'REGISTER_FAIL'))
		return dispatch({ type: REGISTER_FAIL })
	}
}

// LOGIN USER
export const signin = (email, password) => async dispatch => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	// BODY
	const body = JSON.stringify({ email, password })
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/auth`, body, config)
		return dispatch({ type: LOGIN_SUCCESS, payload: response.data })
	} catch (err) {
		console.log('kirikou', err)
		dispatch(returnErrors(err.response.data, err.response.status, 'LOGIN_FAIL'))
		return dispatch({ type: LOGIN_FAIL })
	}
}

export const logout = () => dispatch => {
	return dispatch({ type: LOGOUT_SUCCESS })
}

// SETUP CONFIG HEADERS AND TOKEN
export const tokenConfig = getState => {
	// GET TOKEN FROM LOCALSTORAGE
	const token = getState().auth.token
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	if (token) {
		config.headers['x-auth-token'] = token
	}
	return config
}

export const updateUser = userInfo => async dispatch => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		}

		const body = JSON.stringify(userInfo)
		const response = await axios.put(`${REACT_APP_API_URL}/users/update_user`, body, config)
		return dispatch({ type: UPDATE_USER, payload: response.data })
	} catch (err) {
		return dispatch(returnErrors(err, err.response.status))
	}
}

export const deleteUser = id => async dispatch => {
	try {
		await axios.delete(`${REACT_APP_API_URL}/auth/delete_user?user_id=${id}`)
		return dispatch({ type: DELETE_USER })
	} catch (err) {
		return dispatch(returnErrors(err, err.response.status))
	}
}

export const resetPassword = (password, token) => async dispatch => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	// BODY
	const body = JSON.stringify({ password, token })
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/users/reset_password`, body, config)
		return dispatch({ type: RESET_PASSWORD })
	} catch (err) {
		console.log('kirikou', err)
		dispatch(returnErrors(err.response.data, err.response.status, 'RESET_PASSWORD'))
		return dispatch({ type: RESET_PASSWORD_FAIL })
	}
}