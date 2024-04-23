import React, { useCallback, useEffect, useState } from "react";
import {
	FlatList,
	View,
	StyleSheet,
	Text,
	Image,
	TouchableOpacity,
} from "react-native";
import globalStyles from "../globalStyles";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/native";
import { PressableButton } from "./PressableButton";
import {
	fetchPostExercises,
	generateThumbnail,
	getPosts,
	getUser,
} from "../../redux/actions";
import { LoadingIndicator } from "./LoadingIndicator";
import { PostSummaryList } from "./PostSummaryList";
import { NoResults } from "./NoResults";

export default function UserList(props: any) {
	const navigation = useNavigation();
	const [users, setUsers] = useState<any>([]);
	const [isLoading, setIsLoading] = useState(false);

	async function fetchPosts(uid: string) {
		return new Promise(async (resolve) => {
			const posts: any[] = (await getPosts(uid)).slice(0, 3);
			Promise.all([
				...posts.map((post: any) =>
					fetchPostExercises(uid, post.id).then((exercises) => {
						post.exercises = exercises;
					})
				),
				...posts.map((post: any) => {
					if (post.isVideo && !post.thumbnailURI) {
						return generateThumbnail(post.mediaURL).then(
							(thumbnailURI) => {
								post.thumbnailURI = thumbnailURI;
							}
						);
					}
				}),
			]).then(() => resolve(posts));
		});
	}

	async function fetchUser(uid: string) {
		const user: any = await getUser(uid);
		user.posts = await fetchPosts(uid);
		return user;
	}

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setUsers(
				await Promise.all(
					props.route.params.users.map((uid: string) =>
						fetchUser(uid)
					)
				)
			);
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
