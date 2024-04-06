import React, { Component, useCallback, useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	FlatList,
	TouchableOpacity,
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

const Stack = createNativeStackNavigator();

function Search(props: any) {
	const navigation = useNavigation();
	const [users, setUsers] = useState<any>([]);
	const [posts, setPosts] = useState<any>([]);
	const [queryString, setQueryString] = useState("");
	const [selected, setSelected] = useState(0);
	const searchOptions = ["Users", "Posts"];
	const searchOptionIcons = ["account-off-outline", "image-off-outline"];
	const searchFunctions = [fetchUsers, fetchPosts];

	function fetchUsers(queryString: string): void {
		setUsers([]);
		if (!queryString) return;
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
	}

	// async function fetchPosts(): Promise<void> {
	// 	if (!queryString) return setPosts([]);
	// 	const posts = await new Promise((resolve) => {
	// 		firebase
	// 			.firestore()
	// 			.collection("users")
	// 			.get()
	// 			.then(async (snapshot) => {
	// 				snapshot.docs.map(async (user) => {
	// 					firebase
	// 						.firestore()
	// 						.collection("users")
	// 						.doc(user.id)
	// 						.collection("posts")
	// 						// .where("caption", ">=", queryString)
	// 						// .where("caption", "<=", queryString + "~")
	// 						.get()
	// 						.then(async (snapshot) => {
	// 							var posts = await Promise.all(
	// 								snapshot.docs.map(async (doc) => {
	// 									var post = doc.data();
	// 									// post.uid = user.id;
	// 									// console.log(user.id);
	// 									// // post.exercises =
	// 									// // 	await fetchPostExercises(
	// 									// // 		user.id,
	// 									// // 		post.id
	// 									// // 	);
	// 									// if (
	// 									// 	post.isVideo &&
	// 									// 	!post.thumbnailURI
	// 									// ) {
	// 									// 	post.thumbnailURI =
	// 									// 		await generateThumbnail(
	// 									// 			post.mediaURL
	// 									// 		);
	// 									// }
	// 									return post;
	// 								})
	// 							);
	// 							resolve(posts);
	// 						});
	// 				});
	// 			});
	// 	});
	// 	setPosts(posts);
	// }

	async function fetchPosts(queryString: string): Promise<void> {
		setPosts([]);
		if (!queryString) return;
		firebase
			.firestore()
			.collection("users")
			.get()
			.then((snapshot) => {
				snapshot.docs.map((user) => {
					firebase
						.firestore()
						.collection("users")
						.doc(user.id)
						.collection("posts")
						.where("caption", ">=", queryString)
						.where("caption", "<=", queryString + "~")
						.get()
						.then((snapshot) => {
							const newPosts = snapshot.docs.map((doc) => {
								var data = doc.data();
								data!.id = doc.id;
								data!.createdAt = data!.createdAt.toDate();
								return data;
							});
							setPosts((posts: any) => [...posts, ...newPosts]);
						});
				});
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
		() => (
			<View style={globalStyles.noResults}>
				<Icon
					name={searchOptionIcons[selected]}
					size={80}
					color="white"
				/>
				<Text style={globalStyles.noResultsText}>No results</Text>
			</View>
		),
		[]
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
				<PostSummaryList posts={posts} />
			)}
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
		flexDirection: "column",
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
});

const mapStateToProps = (store: any) => ({
	following: store.userState.following,
	clients: store.userState.clients,
	PTs: store.userState.PTs,
});

export default connect(mapStateToProps, null)(SearchScreen);
