import React, { Component, useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, FlatList } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { connect } from "react-redux";
import { useNavigation } from "@react-navigation/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileScreen from "./ProfileScreen";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const Stack = createNativeStackNavigator();

function Feed(props: any) {
	const navigation = useNavigation();
	const [posts, setPosts] = useState<any>([]);

	useEffect(() => {
		if (props.followingLoaded === props.following.length) {
			props.followingPosts.sort((x: any, y: any) => {
				return y.createdAt.localeCompare(x.createdAt);
			});
			props.followingPosts.forEach((post: any) => {
				post.showRoutine = true;
			});
			setPosts(props.followingPosts);
		}
	}, [props.followingLoaded]);

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
	}

	function toggleShowRoutine(postID: string) {
		setPosts(() => {
			// const post = posts.find((post: any) => post.id === postID);
			// post.showRoutine = !post.showRoutine;
			return [...posts];
		});
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
									<View style={styles.postIconBox}>
										{item.isVideo ? (
											<Icon
												name="dumbbell"
												color="black"
												size={30}
												onPress={() => {
													toggleShowRoutine(item.id);
												}}
											/>
										) : null}
									</View>
									<View style={styles.postIconBox}>
										<Icon
											name={
												item.isLiked
													? "cards-heart"
													: "heart-outline"
											}
											color="black"
											size={30}
											onPress={() => {
												toggleLike(
													item.user.uid,
													item.id,
													item.isLiked
												);
											}}
										/>
										<Text style={styles.postIconText}>
											{item.likes.length} like
											{item.likes.length != 1 ? "s" : ""}
										</Text>
									</View>
								</View>
								{item.showRoutine && item.isVideo ? (
									<View style={styles.postRoutineBox}>
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
									</View>
								) : null}
							</View>
							<Text>{item.caption}</Text>
							<Text>
								{new Date(item.createdAt).toLocaleDateString()}
							</Text>
						</View>
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
		borderRadius: 10,
		backgroundColor: "lightgrey",
	},
	postDesc: {
		flex: 1,
		gap: 5,
		padding: 10,
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
		justifyContent: "space-between",
		flexDirection: "row",
		gap: 5,
	},
	postRoutineBox: {
		flex: 1,
		gap: 5,
		padding: 10,
	},
	postIconBox: {
		gap: 5,
		padding: 10,
		alignItems: "center",
		justifyContent: "space-evenly",
		flexDirection: "row",
	},
	postUsername: {
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
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	followers: store.userState.followers,
	followingLoaded: store.followingState.followingLoaded,
	followingPosts: store.followingState.followingPosts,
});

export default connect(mapStateToProps, null)(FeedScreen);
