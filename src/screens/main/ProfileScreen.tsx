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
	const [isFollowing, setIsFollowing] = useState<any>(false);

	useEffect(() => {
		setPosts([]);
		const isCurrentUser =
			props.route.params.uid === firebase.auth().currentUser!.uid;

		function getUser(): void {
			if (isCurrentUser) {
				setUser(props.currentUser);
			} else {
				if (props.following.includes(props.route.params.uid)) {
					setIsFollowing(true);
				}
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
				.collection("followedBy")
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
				.collection("followedBy")
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
		<View style={styles.container}>
			<View style={styles.infoContainer}>
				<Text>{user.username}</Text>
				<Text>{user.email}</Text>
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
				// extraData={tempPosts}
				contentContainerStyle={{ gap: 2 }}
				columnWrapperStyle={{ gap: 2 }}
				renderItem={({ item }) => (
					<View style={styles.imageContainer}>
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
	container: {
		flex: 1,
		margin: 0,
	},
	infoContainer: {
		margin: 0,
	},
	galleryContainer: {
		margin: 0,
		gap: 10,
	},
	imageContainer: {
		flex: 1 / 3,
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
});

export default connect(mapStateToProps, null)(ProfileScreen);
