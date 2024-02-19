import { combineReducers } from "redux";
import { userState } from "./user";
import { followingState } from "./following";

const reducer = combineReducers({
	userState,
	followingState,
});

export default reducer;
