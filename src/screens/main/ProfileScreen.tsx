import React, { Component, useEffect, useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import globalStyles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import CommentsScreen from "./CommentsScreen";
import PostList from "./PostList";
import { Label } from "../../components/Label";
import UserList from "./UserList";
import { generateThumbnail } from "../../globalFunctions";

const Stack = createNativeStackNavigator();

export function Profile(props: any) {
	const navigation = useNavigation();
	const [user, setUser] = useState<any>();
	const [posts, setPosts] = useState<any>([]);
	const [following, setFollowing] = useState<any>([]);
	const [followers, setFollowers] = useState<any>([]);
	const [clients, setClients] = useState<any>([]);
	const [PTs, setPTs] = useState<any>([]);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isMyPT, setIsMyPT] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const [isCurrentUser, setIsCurrentUser] = useState(false);

	function getUser(): void {
		if (isCurrentUser) {
			setUser(props.currentUser);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.onSnapshot((snapshot) => {
					if (snapshot.exists) {
						setUser(snapshot.data());
					} else {
						console.log("User does not exist");
					}
				});
		}
	}

	function getPosts() {
		return new Promise((resolve) => {
			if (isCurrentUser) {
				return resolve(props.posts);
			} else {
				firebase
					.firestore()
					.collection("users")
					.doc(props.route.params.uid)
					.collection("posts")
					.orderBy("createdAt", "desc")
					.onSnapshot((snapshot) => {
						return resolve(
							snapshot.docs.map((doc) => {
								const id = doc.id;
								const data = doc.data();
								var createdAt = (
									data.createdAt ??
									firebase.firestore.Timestamp.now()
								)
									.toDate()
									.toISOString();
								return {
									id,
									...data,
									createdAt,
									thumbnailURI: "",
								};
							})
						);
					});
			}
		}).then((tempPosts: any) => {
			Promise.all(
				tempPosts.map((post: any) => {
					if (post.isVideo && !post.thumbnailURI) {
						return new Promise((resolve) => {
							generateThumbnail(post.mediaURL).then(
								(thumbnailURI) => {
									return resolve({ ...post, thumbnailURI });
								}
							);
						});
					}
					return post;
				})
			).then((posts) => {
				setPosts(posts);
			});
		});
	}

	function getFollowing(): void {
		if (isCurrentUser) {
			setFollowing(props.following);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("following")
				.onSnapshot((snapshot) => {
					setFollowing(snapshot.docs.map((doc) => doc.id));
				});
		}
	}

	function getFollowers(): void {
		if (isCurrentUser) {
			setFollowers(props.followers);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("followers")
				.onSnapshot((snapshot) => {
					setFollowers(snapshot.docs.map((doc) => doc.id));
				});
		}
	}

	function getClients(): void {
		setClients(props.clients);
	}

	function getPTs(): void {
		setPTs(props.PTs);
	}

	useEffect(() => {
		// setPosts([]);
		setIsCurrentUser(
			props.route.params.uid === firebase.auth().currentUser!.uid
		);
		getUser();
		getFollowing();
		getFollowers();
		getClients();
		getPTs();
		getPosts();
	}, [props.route.params.uid]);

	useEffect(() => {
		getPosts();
	}, [props.posts]);

	useEffect(() => {
		getFollowing();
		getFollowers();
		if (isCurrentUser) {
			getClients();
			getPTs();
		}
		setIsMyPT(props.PTs.includes(props.route.params.uid));
		setIsClient(props.clients.includes(props.route.params.uid));
		setIsFollowing(props.following.includes(props.route.params.uid));
	}, [props.following, props.followers, props.clients, props.PTs]);

	function toggleFollow() {
		if (isFollowing) {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("following")
				.doc(props.route.params.uid)
				.delete();
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("followers")
				.doc(firebase.auth().currentUser!.uid)
				.delete();
			setIsFollowing(false);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("following")
				.doc(props.route.params.uid)
				.set({});
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("followers")
				.doc(firebase.auth().currentUser!.uid)
				.set({});
			setIsFollowing(true);
		}
	}

	function toggleIsClient() {
		if (isClient) {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("clients")
				.doc(props.route.params.uid)
				.delete();
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("PTs")
				.doc(firebase.auth().currentUser!.uid)
				.delete();
			setIsClient(false);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("clients")
				.doc(props.route.params.uid)
				.set({});
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("PTs")
				.doc(firebase.auth().currentUser!.uid)
				.set({});
			setIsClient(true);
		}
	}

	function toggleIsMyPT() {
		if (isMyPT) {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("PTs")
				.doc(props.route.params.uid)
				.delete();
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("clients")
				.doc(firebase.auth().currentUser!.uid)
				.delete();
			setIsMyPT(false);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("PTs")
				.doc(props.route.params.uid)
				.set({});
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("clients")
				.doc(firebase.auth().currentUser!.uid)
				.set({});
			setIsMyPT(true);
		}
	}

	function signOut() {
		firebase.auth().signOut();
	}

	if (user === undefined) return <View />;
	return (
		<View style={styles.profile}>
			<View style={styles.usernameBox}>
				<Text style={styles.username}>{user.username}</Text>
				{isCurrentUser ? <Label text="You" /> : null}
				{user.isPT ? <Label text="PT" /> : null}
			</View>
			<View style={styles.infoBox}>
				<Text style={styles.info}>
					{followers.length} follower
					{followers.length !== 1 ? "s" : ""}
				</Text>
				<Text style={styles.info}>{following.length} following</Text>
				{isCurrentUser ? (
					<Text style={styles.info}>
						{PTs.length} PT{PTs.length !== 1 ? "s" : ""}
					</Text>
				) : null}
				{isCurrentUser && props.currentUser.isPT ? (
					<Text style={styles.info}>
						{clients.length} client
						{clients.length !== 1 ? "s" : ""}
					</Text>
				) : null}
			</View>
			{isCurrentUser && props.currentUser.isPT ? (
				<PressableButton
					onPress={() => navigation.navigate("Your Clients")}
					text="View your clients"
				/>
			) : null}
			{isCurrentUser ? (
				<PressableButton
					onPress={() => navigation.navigate("Your PTs")}
					text="View your personal trainers"
				/>
			) : (
				<PressableButton
					onPress={toggleFollow}
					text={isFollowing ? "Following" : "Follow"}
				/>
			)}
			{props.currentUser.isPT && !isCurrentUser ? (
				<PressableButton
					onPress={toggleIsClient}
					text={isClient ? "Remove as client" : "Add as client"}
				/>
			) : null}
			{isMyPT ? (
				<PressableButton
					onPress={toggleIsMyPT}
					text="Remove as my PT"
				/>
			) : null}
			<FlatList
				horizontal={false}
				numColumns={3}
				data={posts}
				contentContainerStyle={{ gap: 2 }}
				columnWrapperStyle={{ gap: 2 }}
				style={styles.gallery}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.imageBox}
						onPress={() => {
							navigation.navigate("Post", {
								uid: props.route.params.uid,
								postID: item.id,
							});
						}}
					>
						<Image
							source={{
								uri: item.isVideo
									? item.thumbnailURI
									: item.mediaURL,
							}}
							style={styles.image}
						/>
					</TouchableOpacity>
				)}
				ListEmptyComponent={() => (
					<View style={styles.noResults}>
						<Icon
							name="image-off-outline"
							size={80}
							color="white"
						/>
						<Text style={globalStyles.noResultsText}>No posts</Text>
					</View>
				)}
			/>
			{isCurrentUser ? (
				<PressableButton onPress={signOut} text="Sign out" />
			) : null}
		</View>
	);
}

class ProfileScreen extends Component {
	render() {
		return (
			<Stack.Navigator
				initialRouteName="Profile"
				screenOptions={{
					headerTintColor: "deepskyblue",
					headerTitleStyle: { color: "black" },
				}}
			>
				<Stack.Screen
					name="Profile"
					children={(props) => <Profile {...props} {...this.props} />}
				/>
				<Stack.Screen name="Post" component={PostList} />
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
				<Stack.Screen
					name="Profile1"
					children={(props) => <Profile {...props} {...this.props} />}
					options={{ title: "Profile" }}
				/>
				{/* <Stack.Screen name="Profile1" component={Profile} /> */}
				<Stack.Screen name="Comments" component={CommentsScreen} />
			</Stack.Navigator>
		);
	}
}

const styles = StyleSheet.create({
	profile: {
		flex: 1,
		gap: 10,
		padding: 10,
	},
	infoBox: {
		gap: 2,
		flexDirection: "row",
		justifyContent: "space-around",
		backgroundColor: "none",
		// borderColor: "deepskyblue",
		// borderWidth: 2,
		borderRadius: 5,
		overflow: "hidden",
		flexWrap: "wrap",
	},
	gallery: {
		borderRadius: 10,
		flex: 1,
		overflow: "hidden",
		backgroundColor: "lightgrey",
	},
	imageBox: {
		flex: 1 / 3,
	},
	usernameBox: {
		gap: 5,
		flexDirection: "row",
	},
	username: {
		flex: 1,
		fontSize: 30,
		fontWeight: "bold",
	},
	info: {
		fontSize: 20,
		padding: 5,
		minWidth: "49%",
		flexShrink: 0,
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white",
		textAlign: "center",
	},
	image: {
		flex: 1,
		aspectRatio: 1 / 1,
		borderRadius: 5,
	},
	noResults: {
		flex: 1,
		alignSelf: "stretch",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 120,
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	posts: store.userState.posts,
	following: store.userState.following,
	followers: store.userState.followers,
	followingLoaded: store.followingState.followingLoaded,
	followingPosts: store.followingState.followingPosts,
	clients: store.userState.clients,
	PTs: store.userState.PTs,
});

export default connect(mapStateToProps, null)(ProfileScreen);
