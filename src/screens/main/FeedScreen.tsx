import React, { Component, useEffect, useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { connect } from "react-redux";
import { useNavigation } from "@react-navigation/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileScreen from "./ProfileScreen";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import CommentsScreen from "./CommentsScreen";

const Stack = createNativeStackNavigator();

function Feed(props: any) {
	const navigation = useNavigation();
	const [posts, setPosts] = useState<any>([]);

	useEffect(() => {
		if (
			props.following.length &&
			props.followingLoaded === props.following.length
		) {
			setPosts(() => props.followingPosts);
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
	}, [props.followingLoaded, props.following]);

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
			// posts.find((post: any) => post.id == postID).isLiked = false;
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
						<Text style={{ ...styles.noResultsText, fontSize: 20 }}>
							Follow some users
						</Text>
					</View>
				)}
			/>
		</View>
	);
}

export class FeedScreen extends Component {
	render() {
		return (
			<Stack.Navigator
				initialRouteName="Feed"
				screenOptions={{
					headerTintColor: "deepskyblue",
					headerTitleStyle: { color: "black" },
				}}
			>
				<Stack.Screen
					name="Feed"
					children={(props) => <Feed {...props} {...this.props} />}
				/>
				<Stack.Screen name="Comments" component={CommentsScreen} />
				<Stack.Screen name="Profile" component={ProfileScreen} />
			</Stack.Navigator>
		);
	}
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

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	followers: store.userState.followers,
	followingLoaded: store.followingState.followingLoaded,
	followingPosts: store.followingState.followingPosts,
});

export default connect(mapStateToProps, null)(FeedScreen);
