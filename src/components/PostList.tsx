import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
	fetchPostLikes,
	fetchFollowingUser,
	fetchPostExercises,
} from "../../redux/actions";
import globalStyles from "../globalStyles";
import { Label } from "./Label";
import { connect } from "react-redux";
import { LoadingIndicator } from "./LoadingIndicator";
import { NoResults } from "./NoResults";

export function PostList(props: any) {
	const navigation = useNavigation();
	const [posts, setPosts] = useState<any>([]);
	const [isLoading, setIsLoading] = useState(true);
	var videoRefs = {};

	function addLikeInfo() {
		setPosts((posts: any) =>
			posts.map((post: any) => {
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
		);
	}

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			if (
				props.route.params &&
				props.route.params.uid &&
				props.route.params.postID
			) {
				await new Promise((resolve) => {
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
							data!.createdAt = data!.createdAt
								.toDate()
								.toISOString();
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
								fetchPostExercises(
									props.route.params.uid,
									props.route.params.postID
								).then((exercises) => {
									data!.exercises = exercises;
								}),
							]).then(() => {
								setPosts(() => [data]);
								addLikeInfo();
								resolve(null);
							});
						});
				});
			} else if (props.followingLoaded === props.following.length) {
				setPosts(() => props.followingPosts);
				addLikeInfo();
				setPosts((posts: any) =>
					posts.sort((x: any, y: any) => {
						return y.createdAt.localeCompare(x.createdAt);
					})
				);
			}
			setIsLoading(false);
		})();
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

	const renderItem = useCallback(
		({ item }) => (
			<View style={styles.post}>
				{item.isVideo ? (
					<Video
						ref={(videoRef) => {
							this.videoRefs[item.id] = videoRef;
						}}
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
							<TouchableOpacity
								onPress={() => {
									navigation.navigate("Profile", {
										uid: item.user.uid,
									});
								}}
								style={styles.postUsername}
							>
								<Text style={globalStyles.bold}>
									{item.user.username}
								</Text>
							</TouchableOpacity>
							{props.clients &&
							props.clients.includes(item.user.uid) ? (
								<Label text="Your client" />
							) : null}
							{props.PTs && props.PTs.includes(item.user.uid) ? (
								<Label text="Your PT" />
							) : null}
							{item.exercisesDetected ? (
								<TouchableOpacity
									style={styles.postIconBox}
									onPress={() => {
										toggleShowRoutine(item.id);
									}}
								>
									<Icon
										name="dumbbell"
										color="black"
										size={30}
									/>
								</TouchableOpacity>
							) : null}
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
						{item.showRoutine && item.exercisesDetected ? (
							<View style={styles.postRoutineBox}>
								<FlatList
									horizontal={false}
									numColumns={1}
									data={item.exercises}
									contentContainerStyle={{
										gap: 5,
										flexGrow: 1,
									}}
									style={globalStyles.labelList}
									renderItem={({ item: exercise }) => (
										<TouchableOpacity
											onPress={async () => {
												await this.videoRefs[
													item.id
												].playFromPositionAsync(
													exercise.start * 1000
												);
											}}
										>
											<Label
												text={
													exercise.exercise +
													" @ " +
													exercise.start +
													"s"
												}
											/>
										</TouchableOpacity>
									)}
								/>
							</View>
						) : null}
					</View>
					<Text>{item.caption}</Text>
					<Text style={globalStyles.date}>
						{new Date(item.createdAt).toLocaleString()}
					</Text>
				</View>
			</View>
		),
		[]
	);

	const ListEmptyComponent = useCallback(
		() =>
			isLoading ? (
				<LoadingIndicator />
			) : (
				<NoResults icon="image-off-outline" text="No posts" />
			),
		[]
	);

	return (
		<View style={styles.postList}>
			<FlatList
				horizontal={false}
				numColumns={1}
				contentContainerStyle={{ gap: 5, flexGrow: 1 }}
				data={posts}
				renderItem={renderItem}
				ListEmptyComponent={ListEmptyComponent}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	postList: {
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
		paddingHorizontal: 5,
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
		padding: 5,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	postUsername: {
		flex: 1,
		fontSize: 15,
		padding: 5,
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
});

const mapStateToProps = (store: any) => ({
	posts: store.userState.posts,
	following: store.userState.following,
	followingLoaded: store.followingState.followingLoaded,
	followingPosts: store.followingState.followingPosts,
	clients: store.userState.clients,
	PTs: store.userState.PTs,
});

export default connect(mapStateToProps, null)(PostList);
