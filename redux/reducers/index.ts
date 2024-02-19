import { combineReducers } from "redux";
import { user } from "./user";
import { users } from "./following";

const reducer = combineReducers({ userState: user, usersState: users });

export default reducer;
