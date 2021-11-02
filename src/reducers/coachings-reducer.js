import {
	CREATE_SESSION,
	FETCH_COACHING,
	FETCH_COACHINGS,
	REQUEST_TOKEN,
	CREATE_COACHING,
	UPDATE_COACHING,
	DELETE_COACHING,
	FETCH_TRAINER_COACHINGS,
	FETCH_TRAINER_NEXT_COACHING,
	FETCH_TRAINER_PAST_COACHINGS,
	FETCH_TRAINER_FUTURE_COACHINGS,
	FETCH_SPECIFIC_TRAINER_FUTURE_COACHINGS,
	FETCH_TRAINER_REPLAY_COACHINGS,
	SET_CURRENT_LIVE_COACHING,
	ADD_COACHING_TO_MY_SCHEDULE,
	REMOVE_COACHING_FROM_MY_SCHEDULE,
	START_ARCHIVING,
	STOP_ARCHIVING,
	CREATE_MUX_STREAM,
	UPDATE_COACHING_ASSET_PLAYBACK_ID,
	CREATE_MUX_UPLOAD_URL,
	FETCH_MY_COACHINGS,
	LOGOUT_SUCCESS
} from '../actions/types'

const initialState = {
	sessions: '',
	token: '',
	allCoachings: [],
	trainerCoachings: [],
	trainerNextCoaching: [],
	trainerPastCoachings: [],
	trainerFutureCoachings: [],
	trainerReplayCoachings: [],
	currentLiveCoaching: null,
	myCoachings: []
}

export default function (state = initialState, action) {
	switch (action.type) {
		case SET_CURRENT_LIVE_COACHING:
			return {
				...state,
				currentLiveCoaching: action.payload
			}
		case CREATE_SESSION:
			return {
				...state,
				sessions: [...state.sessions, action.payload],
				currentSession: action.payload
			}
		case FETCH_COACHINGS:
			return {
				...state,
				allCoachings: action.payload.coachings
			}
		case REQUEST_TOKEN:
			return {
				...state,
				token: action.payload
			}
		case CREATE_COACHING:
			return {
				...state,
				allCoachings: [...state.allCoachings, action.payload]
			}
		case FETCH_TRAINER_COACHINGS:
			return {
				...state,
				trainerCoachings: action.payload
			}
		case FETCH_TRAINER_NEXT_COACHING:
			return {
				...state,
				trainerNextCoaching: action.payload
			}
		case FETCH_TRAINER_FUTURE_COACHINGS:
			return {
				...state,
				trainerFutureCoachings: action.payload
			}
		case FETCH_TRAINER_REPLAY_COACHINGS:
			return {
				...state,
				trainerReplayCoachings: action.payload
			}
		case FETCH_TRAINER_PAST_COACHINGS:
			return {
				...state,
				trainerPastCoachings: action.payload
			}
		case FETCH_MY_COACHINGS:
			return {
				...state,
				myCoachings: action.payload
			}
		case LOGOUT_SUCCESS:
			return initialState
		case UPDATE_COACHING:
		case DELETE_COACHING:
		case ADD_COACHING_TO_MY_SCHEDULE:
		case REMOVE_COACHING_FROM_MY_SCHEDULE:
		case START_ARCHIVING:
		case STOP_ARCHIVING:
		case CREATE_MUX_STREAM:
		case UPDATE_COACHING_ASSET_PLAYBACK_ID:
		case FETCH_SPECIFIC_TRAINER_FUTURE_COACHINGS:
		case CREATE_MUX_UPLOAD_URL:
		case FETCH_MY_COACHINGS:
		default:
			return state
	}
}