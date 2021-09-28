import {
	SESSIONS_SEARCH,
	SESSIONS_FILTERED_SEARCH,
	ACCOUNTS_SEARCH,
	RESET_SEARCH,
	RIGHT_NOW_SEARCH,
	EXPLORE_SEARCH,
	EXPLORE_SPECIFIC_SPORT_SEARCH,
	RESET_SPECIFIC_SPORT_SEARCH,
	RESET_EXPLORE_SEARCH
} from '../actions/types'

const initialState = {
	sessionsSearch: [],
	accountsSearch: [],
	rightNowSearch: [],
	exploreSearch: null,
	exploreSpecificSportSearch: []
}

export default function (state = initialState, action) {
	switch (action.type) {
		case SESSIONS_SEARCH:
			return {
				...state,
				sessionsSearch: action.payload
			}
		case SESSIONS_FILTERED_SEARCH:
			return {
				...state,
				sessionsFilteredSearch: action.payload
			}
		case ACCOUNTS_SEARCH:
			return {
				...state,
				accountsSearch: action.payload
			}
		case RESET_SEARCH:
			return {
				...state,
				accountsSearch: [],
				sessionsSearch: []
			}
		case RIGHT_NOW_SEARCH:
			return {
				...state,
				rightNowSearch: action.payload
			}
		case EXPLORE_SEARCH:
			return {
				...state,
				exploreSearch: state.exploreSearch === null ? action.payload : [...state.exploreSearch, ...action.payload]
			}
		case RESET_EXPLORE_SEARCH:
			return {
				...state,
				exploreSearch: []
			}
		case EXPLORE_SPECIFIC_SPORT_SEARCH:
			return {
				...state,
				exploreSpecificSportSearch: [
					...state.exploreSpecificSportSearch,
					...action.payload
				]
			}
		case RESET_SPECIFIC_SPORT_SEARCH:
			return {
				...state,
				exploreSpecificSportSearch: []
			}
		default:
			return state
	}
}