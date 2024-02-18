import firebase from "firebase/compat/app";
import {
	CLEAR_DATA,
	FOLLOWERS_STATE_CHANGE,
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
					dispatch(fetchUserData(id));
				}
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
				console.log(followers);
				dispatch({
					type: FOLLOWERS_STATE_CHANGE,
					followers,
				});
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
			.orderBy("createdAt", "desc")
			.get()
			.then((snapshot: any) => {
				const uid = snapshot.docs[0].ref.path.split("/")[1];
				const user = getState().usersState.users.find(
					(u: any) => u !== undefined && u.uid == uid
				);
				var posts = snapshot.docs.map((doc: any) => {
					const id = doc.id;
					const data = doc.data();
					const createdAt = data.createdAt.toDate().toLocaleString();
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
