import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useNavigation } from "@react-navigation/core";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { fetchPostLikes, fetchFollowingUser } from "../../../redux/actions";

export default function PostList(props: any) {
	const navigation = useNavigation();
	const [posts, setPosts] = useState<any>([]);

	useEffect(() => {
		function addLikeInfo(posts: any) {
			setPosts(() => posts);
			setPosts((posts: any) =>
				posts
					.map((post: any) => {
						const isLiked = post.likes.includes(
							firebase.auth().currentUser!.uid
						);
						const likeCount = post.likes.length;
						return {
							...post,
							isLiked,
							likeCount,
						};
					})
					.sort((x: any, y: any) => {
						return y.createdAt.localeCompare(x.createdAt);
					})
			);
		}
		if (
			props.route.params &&
			props.route.params.uid &&
			props.route.params.postID
		) {
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("posts")
				.doc(props.route.params.postID)
				.get()
				.then((doc) => {
					var data = doc.data();
					data!.id = doc.id;
					data!.createdAt = data!.createdAt.toDate().toISOString();
					Promise.all([
						fetchPostLikes(
							props.route.params.uid,
							props.route.params.postID
						).then((likes) => {
							data!.likes = likes;
						}),
						fetchFollowingUser(props.route.params.uid).then(
							(user) => {
								data!.user = user;
							}
						),
					]).then(() => addLikeInfo([data]));
				});
		} else if (props.followingLoaded === props.following.length) {
			addLikeInfo(props.followingPosts);
		}
	}, [props.following, props.followingLoaded, props.followingPosts]);

	function toggleLike(userID: string, postID: string, isLiked: boolean) {
		if (isLiked) {
			firebase
				.firestore()
				.collection("users")
				.doc(userID)
				.collection("posts")
				.doc(postID)
				.collection("likes")
				.doc(firebase.auth().currentUser!.uid)
				.delete();
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(userID)
				.collection("posts")
				.doc(postID)
				.collection("likes")
				.doc(firebase.auth().currentUser!.uid)
				.set({});
		}
		setPosts((posts: any[]) =>
			posts.map((post: any) => {
				if (post.id === postID) {
					if (post.isLiked) {
						post.likeCount--;
					} else {
						post.likeCount++;
					}
					post.isLiked = !post.isLiked;
				}
				return post;
			})
		);
	}

	function toggleShowRoutine(postID: string) {
		setPosts((posts: any[]) =>
			posts.map((post: any) => {
				if (post.id === postID) {
					post.showRoutine = !post.showRoutine;
				}
				return post;
			})
		);
	}

	return (
		<View style={styles.feed}>
			<FlatList
				horizontal={false}
				numColumns={1}
				contentContainerStyle={{ gap: 5 }}
				data={posts}
				renderItem={({ item }) => (
					<View style={styles.post}>
						{item.isVideo ? (
							<Video
								style={styles.media}
								source={{ uri: item.mediaURL }}
								resizeMode={ResizeMode.COVER}
								shouldPlay
								isLooping
								isMuted
							/>
						) : (
							<Image
								style={styles.media}
								source={{ uri: item.mediaURL }}
							/>
						)}
						<View style={styles.postDesc}>
							<View style={styles.postHeader}>
								<View style={styles.postBanner}>
									<Text
										style={styles.postUsername}
										onPress={() => {
											navigation.navigate("Profile", {
												uid: item.user.uid,
											});
										}}
									>
										{item.user.username}
									</Text>
									<TouchableOpacity
										style={styles.postIconBox}
										onPress={() => {
											toggleShowRoutine(item.id);
										}}
									>
										{item.isVideo ? (
											<Icon
												name="dumbbell"
												color="black"
												size={30}
											/>
										) : null}
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.postIconBox}
										onPress={() => {
											navigation.navigate("Comments", {
												postID: item.id,
												uid: item.user.uid,
											});
										}}
									>
										<Icon
											name="comment-outline"
											size={30}
											color="black"
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.postIconBox}
										onPress={() => {
											toggleLike(
												item.user.uid,
												item.id,
												item.isLiked
											);
										}}
									>
										<Icon
											name={
												item.isLiked
													? "cards-heart"
													: "heart-outline"
											}
											color="black"
											size={30}
										/>

										<Text style={styles.postIconText}>
											{item.likeCount} like
											{item.likeCount != 1 ? "s" : ""}
										</Text>
									</TouchableOpacity>
								</View>
								{item.showRoutine && item.isVideo ? (
									<TouchableOpacity
										style={styles.postRoutineBox}
									>
										<Text>Routine</Text>
										<FlatList
											horizontal={false}
											numColumns={1}
											contentContainerStyle={{ gap: 5 }}
											data={item.routine}
											renderItem={({ item }) => (
												<View
													style={styles.postExercise}
												>
													<Text>
														{item.exerciseName}
													</Text>
													<Text>
														{item.start} -{" "}
														{item.end}
													</Text>
												</View>
											)}
										/>
									</TouchableOpacity>
								) : null}
							</View>
							<Text>{item.caption}</Text>
							<Text>
								{new Date(item.createdAt).toLocaleString()}
							</Text>
						</View>
					</View>
				)}
				ListEmptyComponent={() => (
					<View style={styles.noResults}>
						<Icon
							name="image-off-outline"
							size={80}
							color="white"
						/>
						<Text style={styles.noResultsText}>No posts</Text>
						{/* <Text style={{ ...styles.noResultsText, fontSize: 20 }}>
							Follow some users
						</Text> */}
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	feed: {
		flex: 1,
		padding: 5,
	},
	post: {
		flex: 1,
		borderRadius: 5,
		backgroundColor: "lightgrey",
	},
	postDesc: {
		flex: 1,
		gap: 5,
		padding: 5,
	},
	postHeader: {
		fontSize: 20,
		borderRadius: 5,
		backgroundColor: "white",
		flexDirection: "column",
	},
	postBanner: {
		borderRadius: 5,
		flex: 1,
		backgroundColor: "whitesmoke",
		alignItems: "center",
		justifyContent: "flex-end",
		flexDirection: "row",
		gap: 5,
	},
	postRoutineBox: {
		flex: 1,
		gap: 5,
		padding: 5,
	},
	postIconBox: {
		gap: 5,
		padding: 10,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	postUsername: {
		flex: 1,
		fontSize: 15,
		padding: 10,
		fontWeight: "bold",
	},
	postIconText: {
		fontSize: 15,
		fontWeight: "bold",
	},

	postExercise: {
		fontSize: 15,
		justifyContent: "space-evenly",
		flexDirection: "row",
	},
	media: {
		flex: 1,
		borderRadius: 5,
		aspectRatio: 1 / 1,
	},
	noResults: {
		flex: 1,
		alignSelf: "stretch",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 250,
	},
	noResultsText: {
		color: "white",
		fontSize: 50,
		fontWeight: "bold",
	},
});
