import {
	CLEAR_DATA,
	FOLLOWING_STATE_CHANGE,
	FOLLOWERS_STATE_CHANGE,
	USER_POSTS_STATE_CHANGE,
	USER_STATE_CHANGE,
} from "../constants";

const initialState = {
	currentUser: null,
	posts: [],
	following: [],
	followers: [],
};

export const user = (state = initialState, action: any) => {
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
		case CLEAR_DATA:
			return initialState;
		default:
			return state;
	}
};
