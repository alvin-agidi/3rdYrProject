import { combineReducers } from "redux";
import { user } from "./user";
import { users } from "./users";

const reducer = combineReducers({ userState: user, usersState: users });

export default reducer;
