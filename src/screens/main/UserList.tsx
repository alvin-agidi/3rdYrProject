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
import { PostSummaryList } from "./PostSummaryList";
import { NoResults } from "../../components/NoResults";

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
								data.uid = uid;
								const createdAt = (
									data.createdAt ??
									firebase.firestore.Timestamp.now()
								).toDate();
								// .toLocaleString();
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
				<PostSummaryList posts={user.posts} />
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
				<NoResults icon="account-off-outline" text="No users" />
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
});
