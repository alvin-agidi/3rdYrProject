import {
	CLEAR_DATA,
	FOLLOWING_STATE_CHANGE,
	FOLLOWERS_STATE_CHANGE,
	USER_POSTS_STATE_CHANGE,
	USER_STATE_CHANGE,
	NOTIFICATIONS_STATE_CHANGE,
	CLIENTS_STATE_CHANGE,
	PTS_STATE_CHANGE,
} from "../constants";

const initialState = {
	currentUser: null,
	posts: [],
	following: [],
	followers: [],
	notifications: [],
	PTs: [],
	clients: [],
};

export const userState = (state = initialState, action: any) => {
	switch (action.type) {
		case USER_STATE_CHANGE:
			return {
				...state,
				currentUser: action.currentUser,
			};
		case USER_POSTS_STATE_CHANGE:
			return {
				...state,
				posts: action.posts,
			};
		case FOLLOWING_STATE_CHANGE:
			return {
				...state,
				following: action.following,
			};
		case FOLLOWERS_STATE_CHANGE:
			return {
				...state,
				followers: action.followers,
			};
		case NOTIFICATIONS_STATE_CHANGE:
			return {
				...state,
				notifications: action.notifications,
			};
		case PTS_STATE_CHANGE:
			return {
				...state,
				PTs: action.PTs,
			};
		case CLIENTS_STATE_CHANGE:
			return {
				...state,
				clients: action.clients,
			};
		case CLEAR_DATA:
			return initialState;
		default:
			return state;
	}
};
