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
	CHATS_STATE_CHANGE,
} from "../constants";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import * as VideoThumbnails from "expo-video-thumbnails";

export function clearData() {
	return (dispatch: any) => {
		dispatch({ type: CLEAR_DATA });
	};
}

export async function fetchUser(uid: string) {
	return new Promise((resolve) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.get()
			.then((doc) => resolve({ uid, ...doc.data() }));
	});
}

export async function fetchAllUids(): Promise<string[]> {
	return new Promise((resolve) => {
		firebase
			.firestore()
			.collection("users")
			.get()
			.then((snapshot) => resolve(snapshot.docs.map((doc) => doc.id)));
	});
}

export function fetchFollowing(
	uid: string,
	setFollowing?: Function
): Promise<string[]> {
	return new Promise((resolve) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("following")
			.onSnapshot((snapshot) => {
				const following = snapshot.docs.map((doc) => doc.id);
				if (setFollowing) setFollowing(following);
				resolve(following);
			});
	});
}

export function fetchFollowers(
	uid: string,
	setFollowers?: Function
): Promise<string[]> {
	return new Promise((resolve) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("followers")
			.onSnapshot((snapshot) => {
				const followers = snapshot.docs.map((doc) => doc.id);
				if (setFollowers) setFollowers(followers);
				resolve(followers);
			});
	});
}

export function fetchComments(
	uid: string,
	postID: string,
	setComments: Function
) {
	firebase
		.firestore()
		.collection("users")
		.doc(uid)
		.collection("posts")
		.doc(postID)
		.collection("comments")
		.orderBy("createdAt", "desc")
		.onSnapshot((snapshot) => {
			const comments: any[] = snapshot.docs.map((doc) => {
				const data = doc.data();
				data.id = doc.id;
				data.createdAt = dateToAge(
					(
						data.createdAt ?? firebase.firestore.Timestamp.now()
					).toDate()
				);
				return data;
			});
			Promise.all(
				comments.map((comment: any) =>
					fetchUser(comment.createdBy).then((creator) => {
						comment.creator = creator;
					})
				)
			).then(() => {
				setComments(comments);
			});
		});
}

async function createChat(users: string[], isGroupChat: boolean) {
	return new Promise(async (resolve) => {
		const doc = firebase.firestore().collection("chats").doc();
		doc.set({
			users,
			isGroupChat,
			lastActiveAt: firebase.firestore.FieldValue.serverTimestamp(),
		});
		resolve(doc.id);
	});
}

export async function fetchChat(
	uid1: string,
	uid2: string,
	setChatID: Function
) {
	var doc = await firebase
		.firestore()
		.collection("users")
		.doc(uid1)
		.collection("chats")
		.doc(uid2)
		.get();
	if (doc.exists) {
		setChatID(doc.data()?.chatID);
	} else {
		const chatID = await createChat([uid1, uid2], false);
		await firebase
			.firestore()
			.collection("users")
			.doc(uid1)
			.collection("chats")
			.doc(uid2)
			.set({ chatID, lastReadAt: firebase.firestore.Timestamp.now() });
		await firebase
			.firestore()
			.collection("users")
			.doc(uid2)
			.collection("chats")
			.doc(uid1)
			.set({ chatID, lastReadAt: firebase.firestore.Timestamp.now() });
		setChatID(chatID);
	}
}

export async function fetchMessages(
	chatID: string,
	limit: number,
	order: string,
	setMessages: Function
) {
	var query = firebase
		.firestore()
		.collection("chats")
		.doc(chatID)
		.collection("messages")
		.orderBy("createdAt", order);

	if (limit) {
		query = query.limit(limit);
	}

	query.onSnapshot((snapshot) => {
		const messages = snapshot.docs.map((doc) => {
			var data = doc.data();
			data.id = doc.id;
			data.createdAt = dateToAge(
				(data.createdAt ?? firebase.firestore.Timestamp.now()).toDate()
			);
			return data;
		});
		setMessages(messages);
	});
}

function addLikeInfo(post: any) {
	post.isLiked = post.likes.includes(firebase.auth().currentUser!.uid);
	post.likeCount = post.likes.length;
}

export function sortDateAsc(a: any, b: any) {
	return b.createdAt - a.createdAt;
}

export function sortDateDesc(a: any, b: any) {
	return a.createdAt - b.createdAt;
}

export function fetchPost(uid: string, postID: string, setPosts: Function) {
	firebase
		.firestore()
		.collection("users")
		.doc(uid)
		.collection("posts")
		.doc(postID)
		.onSnapshot((doc) => {
			var post: any = doc.data();
			post!.id = doc.id;
			post!.createdAt = dateToAge(post!.createdAt.toDate());
			Promise.all([
				fetchPostLikes(uid, postID).then((likes) => {
					post!.likes = likes;
				}),
				fetchUser(uid).then((user) => {
					post!.user = user;
				}),
				fetchPostExercises(uid, postID).then((exercises) => {
					post!.exercises = exercises;
				}),
			]).then(() => {
				addLikeInfo(post);
				setPosts([post]);
			});
		});
}

export async function fetchPosts(uid: string): Promise<any[]> {
	return new Promise((resolve) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("posts")
			.orderBy("createdAt", "desc")
			.get()
			.then((snapshot) => {
				return resolve(
					snapshot.docs.map((doc) => {
						const data = doc.data();
						data.id = doc.id;
						data.thumbnailURI = "";
						data.createdAt = dateToAge(
							(
								data.createdAt ??
								firebase.firestore.Timestamp.now()
							).toDate()
						);
						return data;
					})
				);
			});
	});
}

export function dispatchUser(uid: string) {
	return async (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.onSnapshot((doc) =>
				dispatch({
					type: USER_STATE_CHANGE,
					currentUser: { uid, ...doc.data() },
				})
			);
	};
}

export function dispatchUserPosts(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("posts")
			.orderBy("createdAt", "desc")
			.onSnapshot((snapshot) => {
				var posts = snapshot.docs.map((doc) => {
					const post = doc.data();
					post.id = doc.id;
					post.createdAt = dateToAge(
						(
							post.createdAt ?? firebase.firestore.Timestamp.now()
						).toDate()
					);
					return post;
				});
				dispatch({
					type: USER_POSTS_STATE_CHANGE,
					posts,
				});
			});
	};
}

export function dispatchFollowers(uid: string) {
	return async (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("followers")
			.onSnapshot((snapshot) => {
				dispatch({
					type: FOLLOWERS_STATE_CHANGE,
					followers: snapshot.docs.map((doc) => doc.id),
				});
			});
	};
}

export function dispatchFollowing(uid: string) {
	return async (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("following")
			.onSnapshot((snapshot) => {
				const following = snapshot.docs.map((doc) => doc.id);
				dispatch({
					type: FOLLOWING_STATE_CHANGE,
					following: following,
				});
				dispatch(dispatchFollowingPosts(following));
			});
	};
}

export function dispatchFollowingPosts(uids: string[]) {
	return async (dispatch: any) => {
		const posts: any[] = (
			await Promise.all(
				uids.map(async (uid) => {
					const user = await fetchUser(uid);
					return await firebase
						.firestore()
						.collection("users")
						.doc(uid)
						.collection("posts")
						.get()
						.then((snapshot) => {
							return snapshot.docs.map((doc) => {
								var data = doc.data();
								data!.id = doc.id;
								data!.uid = uid;
								data!.user = user;
								data!.createdAt = (
									data.createdAt ??
									firebase.firestore.Timestamp.now()
								).toDate();
								return data;
							});
						});
				})
			)
		).flat();
		posts.sort(sortDateAsc);
		for (const post of posts) {
			post.likes = await fetchPostLikes(post.uid, post.id);
			post.exercises = await fetchPostExercises(post.uid, post.id);
			post.createdAt = dateToAge(post.createdAt);
			addLikeInfo(post);
		}
		dispatch({
			type: FOLLOWING_POSTS_STATE_CHANGE,
			posts,
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
			.get()
			.then((snapshot) => {
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
			.orderBy("start", "asc")
			.get()
			.then((snapshot) => {
				return resolve(snapshot.docs.map((doc) => doc.data()));
			});
	});
}

export function dispatchNotifications(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("notifications")
			.orderBy("createdAt", "desc")
			.onSnapshot((snapshot) => {
				const notifications = snapshot.docs.map((doc) => {
					var data = doc.data();
					data.id = doc.id;
					data.createdAt = dateToAge(
						(
							data.createdAt ?? firebase.firestore.Timestamp.now()
						).toDate()
					);
					return data;
				});
				dispatch({
					type: NOTIFICATIONS_STATE_CHANGE,
					notifications,
				});
			});
	};
}

export function dispatchClients(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("clients")
			.onSnapshot((snapshot) => {
				dispatch({
					type: CLIENTS_STATE_CHANGE,
					clients: snapshot.docs.map((doc) => doc.id),
				});
			});
	};
}

export function dispatchPTs(uid: string) {
	return (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("PTs")
			.onSnapshot((snapshot) => {
				dispatch({
					type: PTS_STATE_CHANGE,
					PTs: snapshot.docs.map((doc) => doc.id),
				});
			});
	};
}

export function dispatchChats(uid: string) {
	return async (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("chats")
			.onSnapshot(async (snapshot) => {
				const chats = await Promise.all(
					snapshot.docs.map(async (doc) => {
						var chatDoc = await firebase
							.firestore()
							.collection("chats")
							.doc(doc.data().chatID)
							.get();
						var chat = chatDoc.data();
						chat!.uid = doc.id;
						chat!.lastActiveAt =
							chat!.lastActiveAt ??
							firebase.firestore.Timestamp.now();
						chat!.chatID = chatDoc.id;
						return chat;
					})
				);
				dispatch({
					type: CHATS_STATE_CHANGE,
					chats,
				});
			});
	};
}

export function dispatchChat(uid: string) {
	return async (dispatch: any) => {
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.collection("chats")
			.get()
			.then((snapshot) => {
				snapshot.docs.forEach((doc) => {
					firebase
						.firestore()
						.collection("chats")
						.doc(doc.data().chatID)
						.onSnapshot(dispatch(dispatchChats(uid)));
				});
			});
	};
}

export function generateThumbnail(mediaURL: any) {
	return new Promise((resolve) => {
		return VideoThumbnails.getThumbnailAsync(mediaURL, {
			time: 100,
			quality: 0.5,
		}).then((thumbnail) => resolve(thumbnail.uri));
	});
}

export function dateToAge(date: Date): string {
	const now = new Date();
	const age = Math.abs(now.getTime() - date.getTime()) / 1000;
	var output = "";

	if (Math.floor(age) == 0) {
		return "now";
	} else if (age < 60) {
		output = Math.round(age) + " second";
	} else if (age < 60 * 60) {
		output = Math.round(age / 60) + " minute";
	} else if (age < 60 * 60 * 24) {
		output = Math.round(age / (60 * 60)) + " hour";
	} else if (age < 60 * 60 * 24 * 7) {
		output = Math.round(age / (60 * 60 * 24)) + " day";
	} else if (age < 60 * 60 * 24 * 7 * 4) {
		output = Math.round(age / (60 * 60 * 24 * 7)) + " week";
	} else if (age < 60 * 60 * 24 * 30 * 12) {
		output = Math.round(age / (60 * 60 * 24 * 30)) + " month";
	} else {
		output = Math.round(age / (60 * 60 * 24 * 365)) + " year";
	}

	return output + (output.substring(0, 2) == "1 " ? "" : "s") + " ago";
}
