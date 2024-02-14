import firebase from "firebase/compat/app";
import {
	CLEAR_DATA,
	FOLLOWING_STATE_CHANGE,
	USERS_DATA_STATE_CHANGE,
	USERS_POSTS_STATE_CHANGE,
	USER_POSTS_STATE_CHANGE,
	USER_STATE_CHANGE,
} from "../constants/index";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";

export function clearData() {
	return (dispatch: any) => {
		dispatch({ type: CLEAR_DATA });
	};
}

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
					console.log("User does not exist1");
				}
			});
	};
}

export function fetchUserPosts() {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("posts")
			.orderBy("createdAt", "asc")
			.get()
			.then((snapshot) => {
				let posts = snapshot.docs.map((doc) => {
					const id = doc.id;
					const data = doc.data();
					const createdAt = data.createdAt.toDate().toISOString();
					return { id, ...data, createdAt };
				});
				dispatch({
					type: USER_POSTS_STATE_CHANGE,
					posts,
				});
			});
	};
}

export function fetchFollowing() {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("following")
			.onSnapshot((snapshot) => {
				let following = snapshot.docs.map((doc) => {
					return doc.id;
				});
				dispatch({
					type: FOLLOWING_STATE_CHANGE,
					following,
				});
				for (const uid of following) {
					dispatch(fetchUserData(uid));
				}
			});
	};
}

export function fetchUserData(uid: string) {
	return (dispatch: any, getState: any) => {
		const found = getState().usersState.users.some(
			(u: any) => u !== undefined && u.uid === uid
		);
		if (!found) {
			firebase
				.firestore()
				.collection("users")
				.doc(uid)
				.get()
				.then((snapshot) => {
					if (snapshot.exists) {
						dispatch({
							type: USERS_DATA_STATE_CHANGE,
							user: { ...snapshot.data(), uid, posts: [] },
						});
						dispatch(fetchFollowingPosts(uid));
					}
				});
		}
	};
}

export function fetchFollowingPosts(uid: string) {
	return (dispatch: any, getState: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("posts")
			.orderBy("createdAt", "asc")
			.get()
			.then((snapshot: any) => {
				const uid = snapshot.docs[0].ref.path.split("/")[1];
				const user = getState().usersState.users.find(
					(u: any) => u !== undefined && u.uid == uid
				);
				let posts = snapshot.docs.map((doc: any) => {
					const id = doc.id;
					const data = doc.data();
					const createdAt = data.createdAt.toDate().toISOString();
					return { id, ...data, createdAt, user };
				});
				dispatch({
					type: USERS_POSTS_STATE_CHANGE,
					posts,
					uid,
				});
			});
	};
}
