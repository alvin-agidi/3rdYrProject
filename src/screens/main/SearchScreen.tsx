import React, { Component, useCallback, useState } from "react";
import {
	StyleSheet,
	View,
	FlatList,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { TextField } from "../../components/TextField";
import { TextSelect } from "../../components/TextSelect";
import globalStyles from "../../globalStyles";
import Profile from "../../components/Profile";
import PostList from "../../components/PostList";
import Comments from "../../components/Comments";
import UserList from "../../components/UserList";
import { PostSummaryList } from "../../components/PostSummaryList";
import { fetchPostExercises, generateThumbnail } from "../../../redux/actions";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { exercises } from "../../config";
import { NoResults } from "../../components/NoResults";
import ChatScreen from "./ChatScreen";
import UserSummary from "../../components/UserSummary";

const Stack = createNativeStackNavigator();

function Search() {
	const navigation = useNavigation();
	const [users, setUsers] = useState<any[]>([]);
	const [posts, setPosts] = useState<any[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
	const [queryString, setQueryString] = useState("");
	const [selected, setSelected] = useState(0);
	const searchOptions = ["Users", "Posts"];
	const searchFunctions = [fetchUsers, fetchPosts];
	const sortOptions = ["Date (asc.)", "Date (desc.)"];
	const [selectedSort, setSelectedSort] = useState(0);
	const sortFunctions = [sortDateAsc, sortDateDesc];
	const [selectedExercises, setSelectedExercises] = useState<any>([]);
	const [isLoading, setIsLoading] = useState(false);

	function fetchUsers(queryString: string): void {
		setUsers([]);
		if (!queryString) return;
		setIsLoading(true);
		firebase
			.firestore()
			.collection("users")
			.where("username", ">=", queryString)
			.where("username", "<=", queryString + "~")
			.get()
			.then((snapshot) => {
				var users = snapshot.docs.map((doc) => {
					const uid = doc.id;
					return { uid, ...doc.data() };
				});
				setUsers(users);
			});
		setIsLoading(false);
	}

	async function fetchPosts(queryString: string): Promise<void> {
		return new Promise(async (resolve) => {
			setPosts([]);
			setFilteredPosts([]);
			if (!queryString && !selectedExercises.length) return resolve();
			setIsLoading(true);

			const users: any[] = await new Promise((resolve) => {
				firebase
					.firestore()
					.collection("users")
					.get()
					.then((snapshot) => {
						resolve(
							snapshot.docs.map((doc) => {
								var data = doc.data();
								data!.id = doc.id;
								return data;
							})
						);
					});
			});

			var posts: any[] = (
				await Promise.all(
					users.map((user) =>
						firebase
							.firestore()
							.collection("users")
							.doc(user.id)
							.collection("posts")
							.where("caption", ">=", queryString)
							.where("caption", "<=", queryString + "~")
							.get()
							.then((snapshot) => {
								return snapshot.docs.map((doc) => {
									var data = doc.data();
									data!.id = doc.id;
									data!.uid = user.id;
									data!.createdAt = data!.createdAt.toDate();
									return data;
								});
							})
					)
				)
			).flat();

			for (const post of posts) {
				await fetchPostExercises(post.uid, post.id).then(
					(exercises) => {
						post.exercises = exercises;
					}
				);
				if (post.isVideo) {
					await generateThumbnail(post.mediaURL).then(
						(thumbnailURI) => {
							post.thumbnailURI = thumbnailURI;
						}
					);
				}
			}

			setPosts(posts);
			setFilteredPosts(filterPosts(posts));
			setIsLoading(false);
			resolve();
		});
	}

	function filterPosts(posts: any) {
		const selectedExercisesStrings: any[] = selectedExercises.map(
			(i: number) => exercises[i]
		);
		return posts.filter((post: any) => {
			const postExercises: any[] = post.exercises.map(
				(exercise: any) => exercise.exercise
			);
			return selectedExercisesStrings.every((exercise: any) =>
				postExercises.includes(exercise)
			);
		});
	}

	function sortDateAsc(a: any, b: any) {
		return b.createdAt - a.createdAt;
	}

	function sortDateDesc(a: any, b: any) {
		return a.createdAt - b.createdAt;
	}

	function sortFilteredPosts() {
		setFilteredPosts((filterPosts) =>
			filteredPosts.sort(sortFunctions[selectedSort])
		);
	}

	const renderItem = useCallback(
		({ item }) => (
			<TouchableOpacity
				onPress={() =>
					navigation.navigate("Profile", {
						uid: item.uid,
					})
				}
				style={styles.result}
			>
				<UserSummary uid={item.uid} />
			</TouchableOpacity>
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
			<TextField
				placeholder={"Search " + searchOptions[selected].toLowerCase()}
				onChangeText={(string: any) => {
					setQueryString(string);
					searchFunctions[selected](string);
				}}
				style={globalStyles.textInput}
				iconName="magnify"
			/>
			<TextSelect
				label="For"
				options={searchOptions}
				selected={selected}
				setSelected={setSelected}
				onPress={() => {
					searchFunctions[selected](queryString);
				}}
			/>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 70}
			>
				{selected == 1 ? (
					<TextSelect
						label="Filter"
						options={exercises}
						selected={selectedExercises}
						setSelected={setSelectedExercises}
						multiSelect={true}
						onPress={async () => {
							if (!posts.length && selectedExercises.length) {
								await fetchPosts(queryString);
							} else if (
								!queryString &&
								!selectedExercises.length
							) {
								setFilteredPosts([]);
							} else if (!selectedExercises.length) {
								setFilteredPosts(posts);
							} else {
								setFilteredPosts(filterPosts(posts));
							}
						}}
					/>
				) : null}
				{selected == 1 ? (
					<TextSelect
						label="Sort"
						options={sortOptions}
						selected={selectedSort}
						setSelected={setSelectedSort}
						onPress={() => {
							sortFilteredPosts();
						}}
					/>
				) : null}
				{selected == 0 ? (
					<FlatList
						horizontal={false}
						numColumns={1}
						data={users}
						style={styles.results}
						contentContainerStyle={{
							gap: 2,
							flexGrow: 1,
						}}
						renderItem={renderItem}
						ListEmptyComponent={ListEmptyComponent}
					/>
				) : (
					<PostSummaryList
						posts={filteredPosts}
						isLoading={isLoading}
					/>
				)}
			</KeyboardAvoidingView>
		</View>
	);
}

export default function SearchScreen() {
	const clients = useSelector((state: any) => state.userState.clients);
	const PTs = useSelector((state: any) => state.userState.PTs);

	return (
		<Stack.Navigator
			initialRouteName="Search"
			screenOptions={{
				headerTintColor: "deepskyblue",
				headerTitleStyle: { color: "black" },
			}}
		>
			<Stack.Screen name="Search" children={(props) => <Search />} />
			<Stack.Screen name="Profile" component={Profile} />
			<Stack.Screen name="Post" component={PostList} />
			<Stack.Screen name="Comments" component={Comments} />
			<Stack.Screen name="Chat" component={ChatScreen} />
			<Stack.Screen
				name="Your Clients"
				component={UserList}
				initialParams={{ users: clients }}
			/>
			<Stack.Screen
				name="Your PTs"
				component={UserList}
				initialParams={{ users: PTs }}
			/>
		</Stack.Navigator>
	);
}

const styles = StyleSheet.create({
	results: {
		flex: 1,
		borderRadius: 10,
		backgroundColor: "lightgrey",
	},
	result: {
		flex: 1,
		gap: 5,
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "white",
		flexDirection: "row",
		padding: 10,
	},
	labelBox: {
		gap: 5,
		flexDirection: "row",
	},
	user: {
		fontSize: 20,
		fontWeight: "bold",
		flex: 1,
	},
	container: {
		flex: 1,
		gap: 10,
		alignItems: "stretch",
	},
});
