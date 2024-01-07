import { combineReducers } from "redux";
import { user } from "./user";

const reducer = combineReducers({ userState: user });

export default reducer;
