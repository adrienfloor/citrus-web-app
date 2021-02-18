import {
	SET_NOTIFICATION,
	CLEAN_NOTIFICATION
} from '../actions/types'

const initialState = {
	notification: {}
}

export default function (state = initialState, action) {
	switch (action.type) {
		case SET_NOTIFICATION:
			return {
				...state,
				notification: action.payload
			}
		case CLEAN_NOTIFICATION:
			return {
				...state,
				notification: null
			}
		default:
			return state
	}
}