import axios from 'axios'
import {
	SESSIONS_SEARCH,
	SESSIONS_FILTERED_SEARCH,
	ACCOUNTS_SEARCH,
	RESET_SEARCH,
	RIGHT_NOW_SEARCH,
	EXPLORE_SEARCH,
	RESET_EXPLORE_SEARCH,
	EXPLORE_SPECIFIC_SPORT_SEARCH,
	RESET_SPECIFIC_SPORT_SEARCH
} from './types'
import { returnErrors } from './errors-actions'

const { REACT_APP_API_URL } = process.env

export const executeSearch = (query, type, userId) => async dispatch => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/searches/basic_search?query=${query}&type=${type}&user_id=${userId}`)
		if (type === 'sessions') {
			return dispatch({ type: SESSIONS_SEARCH, payload: response.data })
		} else {
			return dispatch({ type: ACCOUNTS_SEARCH, payload: response.data })
		}
	} catch (err) {
		return dispatch(returnErrors(err, err))
	}
}

export const resetSearch = () => dispatch => {
	return dispatch({ type: RESET_SEARCH })
}

export const resetExploreSearch = () => dispatch => {
	return dispatch({ type: RESET_EXPLORE_SEARCH })
}

export const executeRightNowSearch = (sport, userId, type) => async dispatch => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/searches/right_now_search?sport=${sport}&user_id=${userId}&type=${type}`)
		return dispatch({ type: RIGHT_NOW_SEARCH, payload: response.data })
	} catch (err) {
		return dispatch(returnErrors(err, err))
	}
}

export const executeExploreSearch = (sport, userId, skipValue) => async dispatch => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/searches/explore_search?sport=${sport}&user_id=${userId}&skip=${skipValue}`)
		if (sport !== 'all') {
			return dispatch({ type: EXPLORE_SPECIFIC_SPORT_SEARCH, payload: response.data })
		} else {
			return dispatch({ type: EXPLORE_SEARCH, payload: response.data })
		}
	} catch (err) {
		return dispatch(returnErrors(err, err))
	}
}

export const resetSpecificSportSearch = () => async dispatch => {
	return dispatch({ type: RESET_SPECIFIC_SPORT_SEARCH })
}

export const executeFilteredSearch = (queryObject, userId) => async dispatch => {

	const queryArray = Object.keys(queryObject).map(key => (
		{
			[key]: queryObject[key]
		}
	))

	let query = ''
	queryArray.map(obj => {
		query = `${query}&${Object.keys(obj)[0]}=${obj[Object.keys(obj)[0]]}`
	})

	const finalQuery = `?${query.substring(1)}`

	try {
		const response = await axios.get(`${REACT_APP_API_URL}/searches/filtered_search${finalQuery}&user_id=${userId}`)
		return dispatch({ type: SESSIONS_FILTERED_SEARCH, payload: response.data })
	} catch (err) {
		return dispatch(returnErrors(err, err))
	}
}