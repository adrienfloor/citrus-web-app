import axios from 'axios'
import {
    CREATE_PROGRAM,
    FETCH_PROGRAMS,
    FETCH_PROGRAM,
    UPDATE_PROGRAM,
    DELETE_PROGRAM
} from './types'
import { returnErrors } from './errors-actions'
const { REACT_APP_API_URL } = process.env

const apiUrl = REACT_APP_API_URL

export const createProgram = program => async dispatch => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		}
		const body = JSON.stringify(program)
		const response = await axios.post(`${apiUrl}/programs/create_program`, body, config)
		return dispatch({ type: CREATE_PROGRAM, payload: response.data })
	} catch (err) {
		return dispatch(returnErrors(err, err.response.status))
	}
}

export const updateProgram = program => async dispatch => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		}
		const body = JSON.stringify(program)
		const response = await axios.put(`${apiUrl}/programs/update_program`, body, config)
		return dispatch({ type: UPDATE_PROGRAM, payload: response.data })
	} catch (err) {
		return dispatch(returnErrors(err, err.response.status))
	}
}

export const deleteProgram = programId => async dispatch => {
	try {
		const response = await axios.delete(`${apiUrl}/programs/delete_program?id=${programId}`)
		return dispatch({ type: DELETE_PROGRAM })
	} catch (err) {
		return dispatch(returnErrors(err, err.response.status))
	}
}

export const fetchAllPrograms = () => async dispatch => {
	try {
		const response = await axios.get(`${apiUrl}/programs/programs`)
		return dispatch({ type: FETCH_PROGRAMS, payload: response.data.programs })
	} catch (err) {
		return dispatch(returnErrors(err.response.data, err.response.status))
	}
}

export const fetchProgram = id => async dispatch => {
	try {
		const response = await axios.get(`${apiUrl}/programs/program?id=${id}`)
		return dispatch({ type: FETCH_PROGRAM, payload: response.data })
	} catch (err) {
		return dispatch(returnErrors(err.response.data, err.response.status))
	}
}

export const fetchPrograms = (id, isMe) => async dispatch => {
	try {
		const response = await axios.get(`${apiUrl}/programs/trainer_program_id=${id}`)
		if (isMe) {
			return dispatch({ type: FETCH_MY_PROGRAMS, payload: response.data.programs })
		}
		return dispatch({ type: FETCH_PROGRAMS, payload: response.data.programs })
	} catch (err) {
		return dispatch(returnErrors(err.response.data, err.response.status))
	}
}
