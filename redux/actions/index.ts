import firebase from "firebase/compat/app";
import {
	CLEAR_DATA,
	FOLLOWERS_STATE_CHANGE,
	FOLLOWING_STATE_CHANGE,
	FOLLOWING_POSTS_STATE_CHANGE,
	USER_POSTS_STATE_CHANGE,
	USER_STATE_CHANGE,
	NOTIFICATIONS_STATE_CHANGE,
	CLIENTS_STATE_CHANGE,
	PTS_STATE_CHANGE,
} from "../constants";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import * as VideoThumbnails from "expo-video-thumbnails";

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
			.onSnapshot((snapshot) => {
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
			.onSnapshot((snapshot) => {
				var posts = snapshot.docs.map((doc) => {
					const id = doc.id;
					const data = doc.data();
					var createdAt = (
						data.createdAt ?? firebase.firestore.Timestamp.now()
					)
						.toDate()
						.toISOString();
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

export function fetchFollowingUser(uid: string) {
	return new Promise((resolve) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.get()
			.then((doc) => {
				const uid = doc.id;
				return resolve({ uid, ...doc.data() });
			});
	});
}

export function fetchFollowingUserPosts(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("posts")
			.onSnapshot((snapshot: any) => {
				if (snapshot.docs && snapshot.docs.length) {
					uid =
						snapshot.docs[0]._delegate._document.key.path
							.segments[6];
					// uid = snapshot.docs[0].ref.path.split("/")[1];
					fetchFollowingUser(uid).then((user: any) => {
						var posts = snapshot.docs.map((doc: any) => {
							const data = doc.data();
							const id = doc.id;
							const createdAt = (
								data.createdAt ??
								firebase.firestore.Timestamp.now()
							)
								.toDate()
								.toISOString();
							return {
								...data,
								id,
								createdAt,
								user,
							};
						});
						Promise.all([
							...posts.map((post: any) =>
								fetchPostLikes(post.user.uid, post.id).then(
									(likes) => {
										post.likes = likes;
									}
								)
							),
							...posts.map((post: any) => {
								if (post.exercisesDetected) {
									return fetchPostExercises(
										post.user.uid,
										post.id
									).then((exercises) => {
										post.exercises = exercises;
									});
								}
							}),
						]).then(() => {
							dispatch({
								type: FOLLOWING_POSTS_STATE_CHANGE,
								posts,
							});
						});
					});
				} else {
					dispatch({
						type: FOLLOWING_POSTS_STATE_CHANGE,
						posts: [],
					});
				}
			});
	};
}

export function fetchPostLikes(uid: string, postID: string): Promise<string[]> {
	return new Promise((resolve) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("posts")
			.doc(postID)
			.collection("likes")
			.onSnapshot((snapshot) => {
				return resolve(snapshot.docs.map((doc) => doc.id));
			});
	});
}

export function fetchPostExercises(uid: string, postID: string) {
	return new Promise((resolve) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("posts")
			.doc(postID)
			.collection("exercises")
			.onSnapshot((snapshot) => {
				return resolve(snapshot.docs.map((doc) => doc.data()));
			});
	});
}

export function fetchNotifications(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("notifications")
			.orderBy("createdAt", "desc")
			.onSnapshot((snapshot) => {
				const notifications = snapshot.docs.map((doc) => {
					const data = doc.data();
					const createdAt = (
						data.createdAt ?? firebase.firestore.Timestamp.now()
					)
						.toDate()
						.toLocaleString();
					return { ...data, createdAt };
				});
				dispatch({
					type: NOTIFICATIONS_STATE_CHANGE,
					notifications,
				});
			});
	};
}

export function fetchClients(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("clients")
			.onSnapshot((snapshot) => {
				var clients = snapshot.docs.map((doc) => doc.id);
				dispatch({
					type: CLIENTS_STATE_CHANGE,
					clients,
				});
			});
	};
}

export function fetchPTs(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("PTs")
			.onSnapshot((snapshot) => {
				var PTs = snapshot.docs.map((doc) => doc.id);
				dispatch({
					type: PTS_STATE_CHANGE,
					PTs,
				});
			});
	};
}

export function generateThumbnail(mediaURL: any) {
	return new Promise((resolve) => {
		return VideoThumbnails.getThumbnailAsync(mediaURL, {
			time: 100,
		}).then((thumbnail) => resolve(thumbnail.uri));
	});
}
