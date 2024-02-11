import firebase from "firebase/compat/app";
import { USER_POSTS_STATE_CHANGE, USER_STATE_CHANGE } from "../constants/index";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";

export function fetchUser() {
	return (dispatch: any) => {
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

export function fetchUserPosts() {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("posts")
			.doc(firebase.auth().currentUser!.uid)
			.collection("userPosts")
			.orderBy("createdAt", "asc")
			.get()
			.then((snapshot) => {
				let posts = snapshot.docs.map((doc) => {
					const id = doc.id;
					const data = doc.data();
					const createdAt = data.createdAt.toDate().toISOString();
					return { id, ...data, createdAt };
				});
				console.log(posts);
				dispatch({
					type: USER_POSTS_STATE_CHANGE,
					posts,
				});
			});
	};
}
