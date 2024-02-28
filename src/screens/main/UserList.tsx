import React, { useEffect, useState } from "react";
import {
	FlatList,
	View,
	StyleSheet,
	Text,
	Image,
	TouchableOpacity,
} from "react-native";
import firebase from "firebase/compat/app";
import globalStyles from "../../globalStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/native";
import { PressableButton } from "../../components/PressableButton";
import { Label } from "../../components/Label";

export default function UserList(props: any) {
	const navigation = useNavigation();
	const [users, setUsers] = useState<any>([]);

	function fetchExercises(uid: string, postID: string) {
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

	function fetchPosts(uid: string) {
		return new Promise((resolve) => {
			firebase
				.firestore()
				.collection("users")
				.doc(uid)
				.collection("posts")
				// .orderBy("exercisesDetected", "desc")
				.orderBy("createdAt", "desc")
				.limit(3)
				.onSnapshot((snapshot) => {
					return resolve(
						snapshot.docs.map((doc) => {
							const id = doc.id;
							const data = doc.data();
							const createdAt = (
								data.createdAt ??
								firebase.firestore.Timestamp.now()
							)
								.toDate()
								.toLocaleString();
							return {
								id,
								...data,
								user: { uid },
								createdAt,
							};
						})
					);
				});
		});
	}

	function fetchUser(uid: string) {
		return new Promise((resolve) => {
			firebase
				.firestore()
				.collection("users")
				.doc(uid)
				.onSnapshot((doc) => {
					const uid = doc.id;
					fetchPosts(uid).then((posts: any) => {
						Promise.all(
							posts.map((post: any) =>
								fetchExercises(post.user.uid, post.id).then(
									(exercises) => {
										post.exercises = exercises;
									}
								)
							)
						).then(() => {
							return resolve({ uid, ...doc.data(), posts });
						});
					});
				});
		});
	}

	useEffect(() => {
		Promise.all(
			props.route.params.users.map((uid: string) => fetchUser(uid))
		).then((users) => {
			setUsers(users);
		});
	}, [props.clients, props.PTs]);

	return (
		<View style={globalStyles.container}>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={users}
				contentContainerStyle={{
					gap: 5,
				}}
				style={styles.users}
				renderItem={({ item: user }) => (
					<View style={styles.user}>
						<View style={styles.username}>
							<Text
								style={{ ...globalStyles.bold, fontSize: 25 }}
							>
								{user.username}
							</Text>
						</View>
						<FlatList
							horizontal={false}
							numColumns={1}
							data={user.posts}
							contentContainerStyle={{
								gap: 5,
							}}
							style={styles.highlightPosts}
							renderItem={({ item: post }) => (
								<TouchableOpacity
									onPress={() => {
										navigation.navigate("Post", {
											uid: user.uid,
											postID: post.id,
										});
									}}
								>
									<View style={styles.highlightPost}>
										<Image
											source={{
												uri: post.isVideo
													? post.thumbnailURI
													: post.mediaURL,
											}}
											style={styles.image}
										/>
										<View style={styles.highlightPostDesc}>
											<Text>{post.caption}</Text>
											<FlatList
												horizontal={false}
												numColumns={1}
												data={post.exercises}
												contentContainerStyle={{
													gap: 5,
												}}
												style={globalStyles.labelList}
												renderItem={({
													item: exercise,
												}) => (
													<Label
														text={exercise.exercise}
													/>
												)}
											/>
											<Text style={globalStyles.date}>
												{post.createdAt}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
							)}
							ListEmptyComponent={() => (
								<View style={styles.noResults}>
									<Icon
										name="camera-off-outline"
										size={40}
										color="white"
									/>
									<Text style={globalStyles.noResultsText}>
										No posts
									</Text>
								</View>
							)}
						/>
						<PressableButton
							text="View profile"
							onPress={() => {
								navigation.navigate("Profile1", {
									uid: user.uid,
								});
							}}
						/>
					</View>
				)}
				ListEmptyComponent={() => (
					<View style={styles.noResults}>
						<Icon
							name="account-off-outline"
							size={80}
							color="white"
						/>
						<Text style={globalStyles.noResultsText}>No users</Text>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	noResults: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 250,
	},
	users: {
		flex: 1,
		padding: 5,
		backgroundColor: "lightgrey",
		borderRadius: 10,
		alignSelf: "stretch",
	},
	user: {
		padding: 5,
		borderRadius: 5,
		gap: 5,
		backgroundColor: "white",
	},
	username: {
		paddingHorizontal: 5,
	},
	image: {
		aspectRatio: 1 / 1,
		borderRadius: 5,
		width: 100,
	},
	highlightPosts: {
		gap: 2,
		backgroundColor: "lightgrey",
		alignSelf: "stretch",
	},
	highlightPost: {
		paddingTop: 5,
		paddingBottom: 5,
		gap: 5,
		flexDirection: "row",
		backgroundColor: "white",
	},
	highlightPostDesc: {
		flex: 1,
		gap: 5,
		justifyContent: "space-between",
	},
});
