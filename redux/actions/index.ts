import firebase from "firebase/compat/app";
import { USER_STATE_CHANGE } from "../constants/index";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";

export function fetchUser() {
	return (dispatch: any) => {
		console.log(firebase.auth().currentUser!.uid);
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.get()
			.then((snapshot) => {
				if (snapshot.exists) {
					console.log("Success3 = " + snapshot.data());
					dispatch({
						type: USER_STATE_CHANGE,
						currentUser: snapshot.data(),
					});
				} else {
					console.log("User does not exist");
				}
			});
	};
}
