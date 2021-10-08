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
	UPDATE_USER_CREDENTIALS,
	DELETE_USER,
	RESET_PASSWORD,
	RESET_PASSWORD_FAIL,
	FETCH_USER_REPLAYS,
	FETCH_USER_INFO,
	CREATE_FOLLOWER,
	DELETE_FOLLOWER
} from '../actions/types'

const initialState = {
	token: localStorage.getItem('token'),
	isAuthenticated: null,
	isLoading: false,
	user: null,
	userReplays: []
}

export default function (state = initialState, action) {
	switch (action.type) {
		case USER_LOADING:
			return {
				...state,
				isLoading: true
			}
		case USER_LOADED:
			return {
				...state,
				isAuthenticated: true,
				isLoading: false,
				user: action.payload
			}
		case LOGIN_SUCCESS:
		case REGISTER_SUCCESS:
			localStorage.setItem('token', action.payload.token)
			return {
				...state,
				user: action.payload.user,
				token: action.payload.token,
				isAuthenticated: true,
				isLoading: false
			}
		case REGISTER_FAIL:
		case LOGIN_FAIL:
		case AUTH_ERROR:
		case LOGOUT_SUCCESS:
			localStorage.removeItem('token')
			return {
				...state,
				token: null,
				user: null,
				isAuthenticated: false,
				isLoading: false
			}
		case FETCH_USER_REPLAYS:
			return {
				...state,
				userReplays: action.payload
			}
		case FETCH_USER_INFO:
			return {
				...state,
				userInfo: action.payload
			}
		case UPDATE_USER:
			return {
				...state,
				user: action.payload
			}
		case UPDATE_USER_CREDENTIALS:
		case DELETE_USER:
		case RESET_PASSWORD:
		case RESET_PASSWORD_FAIL:
		case CREATE_FOLLOWER:
		case DELETE_FOLLOWER:
		case UPDATE_USER_CREDENTIALS:
		default:
			return state
	}
}