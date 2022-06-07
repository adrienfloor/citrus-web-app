import {
    CREATE_PROGRAM,
    FETCH_PROGRAMS,
    FETCH_PROGRAM,
    UPDATE_PROGRAM,
    DELETE_PROGRAM
} from '../actions/types'

const initialState = {
	allPrograms: [],
	myPrograms: [],
    program: null
}

export default function (state = initialState, action) {
	switch (action.type) {
        case CREATE_PROGRAM:
			return {
				...state,
				allPrograms: [
                    ...state.allPrograms,
                    action.payload.programs
                ]
			}
		case FETCH_PROGRAMS:
			return {
				...state,
				allPrograms: action.payload.programs
			}
		case FETCH_PROGRAM:
			return {
				...state,
				program: action.payload
			}
		case FETCH_MY_PROGRAMS:
			return {
				...state,
				myPrograms: action.payload
			}
		case UPDATE_PROGRAM:
		case DELETE_PROGRAM:
		default:
			return state
	}
}