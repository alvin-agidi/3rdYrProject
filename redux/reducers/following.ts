import { CLEAR_DATA, FOLLOWING_POSTS_STATE_CHANGE } from "../constants";

const initialState = {
	followingPosts: [],
	followingLoaded: 0,
};

export const users = (state = initialState, action: any) => {
	switch (action.type) {
		case FOLLOWING_POSTS_STATE_CHANGE:
			return {
				...state,
				followingLoaded: state.followingLoaded + 1,
				followingPosts: [...state.followingPosts, ...action.posts],
			};
		case CLEAR_DATA:
			return initialState;
		default:
			return state;
	}
};
