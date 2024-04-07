import React, { useCallback, useEffect, useState } from "react";
import {
	FlatList,
	View,
	StyleSheet,
	Text,
	Image,
	TouchableOpacity,
} from "react-native";
import globalStyles from "../../globalStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/native";
import { PressableButton } from "../../components/PressableButton";
import { Label } from "../../components/Label";
import { fetchPostExercises, generateThumbnail } from "../../../redux/actions";
import { LoadingIndicator } from "../../components/LoadingIndicator";

export default function UserList(props: any) {
	const navigation = useNavigation();
	const [users, setUsers] = useState<any>([]);
	const [isLoading, setIsLoading] = useState(false);

	function fetchPosts(uid: string) {
		return new Promise((resolve) => {
			return new Promise((resolve) => {
				firebase
					.firestore()
					.collection("users")
					.doc(uid)
					.collection("posts")
					// .orderBy("exercisesDetected", "desc")
					.orderBy("createdAt", "desc")
					.limit(3)
					.get()
					.then((snapshot) => {
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
			}).then((posts: any) => {
				Promise.all(
					posts.map((post: any) =>
						fetchPostExercises(post.user.uid, post.id).then(
							(exercises) => {
								post.exercises = exercises;
							}
						)
					)
				).then(() => {
					Promise.all(
						posts.map((post: any) => {
							if (post.isVideo && !post.thumbnailURI) {
								return generateThumbnail(post.mediaURL).then(
									(thumbnailURI) => {
										post.thumbnailURI = thumbnailURI;
									}
								);
							}
							return post;
						})
					).then(() => resolve(posts));
				});
			});
		});
	}

	function fetchUser(uid: string) {
		return new Promise((resolve) => {
			firebase
				.firestore()
				.collection("users")
				.doc(uid)
				.get()
				.then((doc) => {
					const uid = doc.id;
					fetchPosts(uid).then((posts) =>
						resolve({ uid, ...doc.data(), posts })
					);
				});
		});
	}

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			await Promise.all(
				props.route.params.users.map((uid: string) => fetchUser(uid))
			).then((users) => {
				setUsers(users);
			});
			setIsLoading(false);
		})();
	}, [props.clients, props.PTs]);

	const renderItem = useCallback(
		({ item: user }) => (
			<View style={styles.user}>
				<View style={styles.username}>
					<Text style={{ ...globalStyles.bold, fontSize: 25 }}>
						{user.username}
					</Text>
				</View>
				<FlatList
					horizontal={false}
					numColumns={1}
					data={user.posts}
					contentContainerStyle={{
						gap: 5,
						flexGrow: 1,
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
									<Text style={styles.caption}>
										{post.caption}
									</Text>
									<FlatList
										horizontal={false}
										numColumns={1}
										data={post.exercises}
										contentContainerStyle={{
											gap: 5,
										}}
										style={globalStyles.labelList}
										renderItem={({ item: exercise }) => (
											<Label text={exercise.exercise} />
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
						<View style={globalStyles.noResults}>
							<Icon
								name="camera-off-outline"
								size={80}
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
						navigation.navigate("Profile", {
							uid: user.uid,
						});
					}}
				/>
			</View>
		),
		[]
	);

	const ListEmptyComponent = useCallback(
		() =>
			isLoading ? (
				<LoadingIndicator />
			) : (
				<View style={globalStyles.noResults}>
					<Icon name="account-off-outline" size={80} color="white" />
					<Text style={globalStyles.noResultsText}>No users</Text>
				</View>
			),
		[isLoading]
	);

	return (
		<View style={globalStyles.container}>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={users}
				contentContainerStyle={{
					gap: 5,
					flexGrow: 1,
				}}
				style={styles.users}
				renderItem={renderItem}
				ListEmptyComponent={ListEmptyComponent}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
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
		borderRadius: 5,
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
	caption: {
		flex: 1,
	},
});
