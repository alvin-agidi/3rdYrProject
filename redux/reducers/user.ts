import {
	CLEAR_DATA,
	FOLLOWING_STATE_CHANGE,
	USER_POSTS_STATE_CHANGE,
	USER_STATE_CHANGE,
} from "../constants";

const initialState = {
	currentUser: null,
	posts: [],
	following: [],
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
		case CLEAR_DATA:
			return initialState;
		default:
			return state;
	}
};
