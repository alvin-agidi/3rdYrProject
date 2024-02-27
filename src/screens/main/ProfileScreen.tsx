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
import * as VideoThumbnails from "expo-video-thumbnails";
import globalStyles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import CommentsScreen from "./CommentsScreen";
import PostList from "./PostList";

const Stack = createNativeStackNavigator();

export function Profile(props: any) {
	const navigation = useNavigation();
	const [user, setUser] = useState<any>();
	const [posts, setPosts] = useState<any>([]);
	const [following, setFollowing] = useState<any>([]);
	const [followers, setFollowers] = useState<any>([]);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isCurrentUser, setIsCurrentUser] = useState(false);

	useEffect(() => {
		setPosts([]);
		setIsCurrentUser(
			props.route.params.uid === firebase.auth().currentUser!.uid
		);

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

		function getPosts(): Promise<any[]> {
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
			});
		}

		function generateThumbnail(post: any) {
			return VideoThumbnails.getThumbnailAsync(post.mediaURL, {
				time: 100,
			}).then((thumbnail) => {
				post.thumbnailURI = thumbnail.uri;
			});
		}

		getUser();
		getFollowing();
		getFollowers();
		getPosts().then((tempPosts: any[]) => {
			Promise.all(
				tempPosts.map((post: any) => {
					if (post.isVideo && !post.thumbnailURI) {
						return generateThumbnail(post);
					}
					return post;
				})
			).then(() => {
				setPosts(tempPosts);
			});
		});
	}, [props.route.params.uid]);

	useEffect(() => {
		if (followers.includes(firebase.auth().currentUser!.uid)) {
			setIsFollowing(true);
		}
	}, [followers]);

	useEffect(() => {
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

		getFollowing();
		getFollowers();
	}, [isFollowing, props.following, props.followers]);

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

	function signOut() {
		firebase.auth().signOut();
	}

	if (user === undefined) return <View />;
	return (
		<View style={styles.profile}>
			<View style={styles.infoBox}>
				<Text style={styles.username}>{user.username}</Text>
				<Text style={styles.info}>{following.length} following</Text>
				<Text style={styles.info}>{followers.length} followers</Text>
				{props.route.params.uid !== firebase.auth().currentUser!.uid ? (
					<PressableButton
						onPress={toggleFollow}
						text={isFollowing ? "Following" : "Follow"}
					/>
				) : (
					<PressableButton onPress={signOut} text="Sign out" />
				)}
			</View>
			<View style={styles.gallery}>
				<FlatList
					horizontal={false}
					numColumns={3}
					data={posts}
					contentContainerStyle={{ gap: 2 }}
					columnWrapperStyle={{ gap: 2 }}
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
							<Text style={styles.noResultsText}>No posts</Text>
						</View>
					)}
				/>
			</View>
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
	infoBox: { gap: 5 },
	gallery: {
		borderRadius: 10,
		flex: 1,
		overflow: "hidden",
		backgroundColor: "lightgrey",
	},
	imageBox: {
		flex: 1 / 3,
	},
	username: {
		fontSize: 30,
		fontWeight: "bold",
	},
	info: {
		fontSize: 20,
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
		marginTop: 200,
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

export default connect(mapStateToProps, null)(ProfileScreen);
