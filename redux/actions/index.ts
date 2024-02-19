import firebase from "firebase/compat/app";
import {
	CLEAR_DATA,
	FOLLOWERS_STATE_CHANGE,
	FOLLOWING_STATE_CHANGE,
	FOLLOWING_POSTS_STATE_CHANGE,
	USER_POSTS_STATE_CHANGE,
	USER_STATE_CHANGE,
} from "../constants";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";

export function clearData() {
	return (dispatch: any) => {
		dispatch({ type: CLEAR_DATA });
	};
}

export function fetchUser(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.get()
			.then((snapshot) => {
				if (snapshot.exists) {
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

export function fetchUserPosts(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("posts")
			.orderBy("createdAt", "desc")
			.get()
			.then((snapshot) => {
				var posts = snapshot.docs.map((doc) => {
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

export function fetchFollowers(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("followers")
			.onSnapshot((snapshot) => {
				var followers = snapshot.docs.map((doc) => doc.id);
				dispatch({
					type: FOLLOWERS_STATE_CHANGE,
					followers,
				});
			});
	};
}

export function fetchFollowing(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("following")
			.onSnapshot((snapshot) => {
				var following = snapshot.docs.map((doc) => doc.id);
				dispatch({
					type: FOLLOWING_STATE_CHANGE,
					following,
				});
				for (const id of following) {
					dispatch(fetchFollowingUserPosts(id));
				}
			});
	};
}

async function fetchFollowingUser(uid: string) {
	const snapshot = await firebase
		.firestore()
		.collection("users")
		.doc(uid)
		.get();
	return { uid, ...snapshot.data() };
}

export function fetchFollowingUserPosts(uid: string) {
	return (dispatch: any, getState: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("posts")
			.get()
			.then(async (snapshot: any) => {
				const uid = snapshot.docs[0].ref.path.split("/")[1];
				fetchFollowingUser(uid).then((user) => {
					var posts = snapshot.docs.map((doc: any) => {
						const data = doc.data();
						const id = doc.id;
						const createdAt = data.createdAt
							.toDate()
							.toLocaleString();
						return { ...data, id, createdAt, user };
					});
					// console.log(posts);
					dispatch({
						type: FOLLOWING_POSTS_STATE_CHANGE,
						posts,
					});
				});
			});
	};
}
