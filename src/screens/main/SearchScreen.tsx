import React, { Component, useCallback, useState } from "react";
import {
	StyleSheet,
	View,
	Text,
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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { connect } from "react-redux";
import { TextField } from "../../components/TextField";
import { TextToggle } from "../../components/TextToggle";
import globalStyles from "../../globalStyles";
import { Label } from "../../components/Label";
import Profile from "./Profile";
import PostList from "./PostList";
import Comments from "./Comments";
import UserList from "./UserList";
import { PostSummaryList } from "./PostSummaryList";
import { fetchPostExercises, generateThumbnail } from "../../../redux/actions";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { exercises } from "../../config";
import { TextMultiSelect } from "../../components/TextMultiSelect";
import { escapeLeadingUnderscores, resolveModuleName } from "typescript";

const Stack = createNativeStackNavigator();

function Search(props: any) {
	const navigation = useNavigation();
	const [users, setUsers] = useState<any[]>([]);
	const [posts, setPosts] = useState<any[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
	const [queryString, setQueryString] = useState("");
	const [selected, setSelected] = useState(0);
	const searchOptions = ["Users", "Posts"];
	const searchOptionIcons = ["account-off-outline", "image-off-outline"];
	const searchFunctions = [fetchUsers, fetchPosts];
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
			// console.log(queryString);
			// console.log(selectedExercises);
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

			// console.log("fetching new posts");

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
				<Text style={styles.user}>{item.username}</Text>
				<View style={globalStyles.labelList}>
					{firebase.auth().currentUser!.uid === item.uid ? (
						<Label text="You" />
					) : null}
					{props.clients.includes(item.uid) ? (
						<Label text="Your client" />
					) : null}
					{props.PTs.includes(item.uid) ? (
						<Label text="Your PT" />
					) : null}
					{props.following.includes(item.uid) ? (
						<Label text="Following" />
					) : null}
				</View>
			</TouchableOpacity>
		),
		[]
	);

	const ListEmptyComponent = useCallback(
		() =>
			isLoading ? (
				<LoadingIndicator />
			) : (
				<View style={globalStyles.noResults}>
					<Icon
						name={searchOptionIcons[selected]}
						size={80}
						color="white"
					/>
					<Text style={globalStyles.noResultsText}>No results</Text>
				</View>
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
			<TextToggle
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
					<TextMultiSelect
						options={exercises}
						selected={selectedExercises}
						setSelected={setSelectedExercises}
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

export class SearchScreen extends Component {
	render() {
		return (
			<Stack.Navigator
				initialRouteName="Search"
				screenOptions={{
					headerTintColor: "deepskyblue",
					headerTitleStyle: { color: "black" },
				}}
			>
				<Stack.Screen
					name="Search"
					children={(props) => <Search {...props} {...this.props} />}
				/>
				<Stack.Screen name="Profile" component={Profile} />
				<Stack.Screen name="Post" component={PostList} />
				<Stack.Screen name="Comments" component={Comments} />
				<Stack.Screen
					name="Your Clients"
					component={UserList}
					initialParams={{ users: this.props.clients }}
				/>
				<Stack.Screen
					name="Your PTs"
					component={UserList}
					initialParams={{ users: this.props.PTs }}
				/>
			</Stack.Navigator>
		);
	}
}

const styles = StyleSheet.create({
	results: {
		flex: 1,
		alignSelf: "stretch",
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
		flex: 1,
	},
	container: {
		flex: 1,
		gap: 10,
		alignSelf: "stretch",
		alignItems: "center",
	},
});

const mapStateToProps = (store: any) => ({
	following: store.userState.following,
	clients: store.userState.clients,
	PTs: store.userState.PTs,
});

export default connect(mapStateToProps, null)(SearchScreen);
