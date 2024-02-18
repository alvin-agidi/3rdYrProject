import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import * as VideoThumbnails from "expo-video-thumbnails";

function ProfileScreen(props: any) {
	const [user, setUser] = useState<any>();
	const [posts, setPosts] = useState<any>([]);
	const [following, setFollowing] = useState<any>([]);
	const [followers, setFollowers] = useState<any>([]);
	const [isFollowing, setIsFollowing] = useState<any>(false);

	useEffect(() => {
		setPosts([]);
		const isCurrentUser =
			props.route.params.uid === firebase.auth().currentUser!.uid;

		function getUser(): void {
			if (isCurrentUser) {
				setUser(props.currentUser);
			} else {
				firebase
					.firestore()
					.collection("users")
					.doc(props.route.params.uid)
					.get()
					.then((snapshot) => {
						if (snapshot.exists) {
							setUser(snapshot.data());
						} else {
							console.log("User does not exist");
						}
					});
			}
		}

		function getFollowing(): void {
			if (isCurrentUser) {
				setFollowing(props.following);
			} else {
				firebase
					.firestore()
					.collection("users")
					.doc(props.route.params.uid)
					.collection("following")
					.get()
					.then((snapshot) => {
						setFollowing(snapshot.docs.map((doc) => doc.id));
					});
			}
		}

		function getFollowers(): void {
			if (isCurrentUser) {
				setFollowers(props.followers);
			} else {
				firebase
					.firestore()
					.collection("users")
					.doc(props.route.params.uid)
					.collection("followers")
					.get()
					.then((snapshot) => {
						setFollowers(snapshot.docs.map((doc) => doc.id));
					});
			}
		}

		function getPosts(): Promise<any[]> {
			return new Promise((resolve) => {
				if (isCurrentUser) {
					return resolve(props.posts);
				} else {
					firebase
						.firestore()
						.collection("users")
						.doc(props.route.params.uid)
						.collection("posts")
						.orderBy("createdAt", "desc")
						.get()
						.then((snapshot) => {
							return resolve(
								snapshot.docs.map((doc) => {
									const id = doc.id;
									const data = doc.data();
									const createdAt = data.createdAt
										.toDate()
										.toISOString();
									return {
										id,
										...data,
										createdAt,
										thumbnailURI: "",
									};
								})
							);
						});
				}
			});
		}

		function generateThumbnail(post: any) {
			return VideoThumbnails.getThumbnailAsync(post.mediaURL, {
				time: 100,
			}).then((thumbnail) => {
				post.thumbnailURI = thumbnail.uri;
			});
		}

		getUser();
		getFollowing();
		getFollowers();
		getPosts().then((tempPosts: any[]) => {
			Promise.all(
				tempPosts.map((post: any) => {
					if (post.isVideo && !post.thumbnailURI) {
						return generateThumbnail(post);
					}
					return post;
				})
			).then(() => {
				setPosts(tempPosts);
			});
		});
	}, [props.route.params.uid]);

	useEffect(() => {
		if (followers.includes(firebase.auth().currentUser!.uid)) {
			setIsFollowing(true);
		}
	}, [followers]);

	useEffect(() => {
		const isCurrentUser =
			props.route.params.uid === firebase.auth().currentUser!.uid;

		function getFollowing(): void {
			if (isCurrentUser) {
				setFollowing(props.following);
			} else {
				firebase
					.firestore()
					.collection("users")
					.doc(props.route.params.uid)
					.collection("following")
					.get()
					.then((snapshot) => {
						setFollowing(snapshot.docs.map((doc) => doc.id));
					});
			}
		}

		function getFollowers(): void {
			if (isCurrentUser) {
				setFollowers(props.followers);
			} else {
				firebase
					.firestore()
					.collection("users")
					.doc(props.route.params.uid)
					.collection("followers")
					.get()
					.then((snapshot) => {
						setFollowers(snapshot.docs.map((doc) => doc.id));
					});
			}
		}

		getFollowing();
		getFollowers();
	}, [isFollowing, props.following, props.followers]);

	function toggleFollow() {
		if (isFollowing) {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("following")
				.doc(props.route.params.uid)
				.delete();
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("followers")
				.doc(firebase.auth().currentUser!.uid)
				.delete();
			setIsFollowing(false);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("following")
				.doc(props.route.params.uid)
				.set({});
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("followers")
				.doc(firebase.auth().currentUser!.uid)
				.set({});
			setIsFollowing(true);
		}
	}

	function signOut() {
		firebase.auth().signOut();
	}

	if (user === undefined) return <View />;
	return (
		<View style={styles.profile}>
			<View style={styles.infoBox}>
				<Text style={styles.username}>{user.username}</Text>
				<Text style={styles.info}>{following.length} Following</Text>
				<Text style={styles.info}>{followers.length} Followers</Text>
				{props.route.params.uid !== firebase.auth().currentUser!.uid ? (
					<Button
						onPress={toggleFollow}
						title={isFollowing ? "Following" : "Follow"}
					/>
				) : (
					<Button onPress={signOut} title="Sign out" />
				)}
			</View>
			<FlatList
				horizontal={false}
				numColumns={3}
				data={posts}
				contentContainerStyle={{ gap: 2 }}
				columnWrapperStyle={{ gap: 2 }}
				renderItem={({ item }) => (
					<View style={styles.imageBox}>
						<Image
							source={{
								uri: item.isVideo
									? item.thumbnailURI
									: item.mediaURL,
							}}
							style={styles.image}
						/>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	profile: {
		flex: 1,
		gap: 10,
	},
	infoBox: {
		padding: 10,
	},
	gallery: {},
	imageBox: {
		flex: 1 / 3,
	},
	username: {
		fontSize: 30,
	},
	info: {
		fontSize: 20,
	},
	image: {
		flex: 1,
		aspectRatio: 1 / 1,
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	posts: store.userState.posts,
	following: store.userState.following,
	followers: store.userState.followers,
});

export default connect(mapStateToProps, null)(ProfileScreen);
