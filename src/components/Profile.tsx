import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { PressableButton } from "./PressableButton";
import { useNavigation } from "@react-navigation/native";
import {
	generateThumbnail,
	fetchFollowers,
	fetchFollowing,
	fetchPosts,
	fetchChat,
} from "../../redux/actions";
import { useSelector } from "react-redux";
import { LoadingIndicator } from "./LoadingIndicator";
import { NoResults } from "./NoResults";
import UserSummary from "./UserSummary";
import globalStyles from "../globalStyles";

export default function Profile(props: any) {
	const navigation = useNavigation<any>();
	const [posts, setPosts] = useState<any>([]);
	const [following, setFollowing] = useState<any>([]);
	const [followers, setFollowers] = useState<any>([]);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isMyPT, setIsMyPT] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const [isCurrentUser, setIsCurrentUser] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [chatID, setChatID] = useState<string>();
	const currentUser = useSelector(
		(state: any) => state.userState.currentUser
	);
	const currentUserPosts = useSelector((state: any) => state.userState.posts);
	const currentUserFollowing = useSelector(
		(state: any) => state.userState.following
	);
	const currentUserFollowers = useSelector(
		(state: any) => state.userState.followers
	);
	const currentUserClients = useSelector(
		(state: any) => state.userState.clients
	);
	const currentUserPTs = useSelector((state: any) => state.userState.PTs);

	async function getPosts() {
		const posts = isCurrentUser
			? currentUserPosts
			: await fetchPosts(props.route.params.uid);
		Promise.all(
			posts.map((post: any) => {
				if (post.isVideo && !post.thumbnailURI) {
					return new Promise((resolve) => {
						generateThumbnail(post.mediaURL).then(
							(thumbnailURI) => {
								return resolve({
									...post,
									thumbnailURI,
								});
							}
						);
					});
				}
				return post;
			})
		).then((posts) => {
			setPosts(posts);
		});
	}
	function fetchFollows() {
		if (isCurrentUser) {
			setFollowing(currentUserFollowing);
			setFollowers(currentUserFollowers);
		} else {
			fetchFollowing(props.route.params.uid, setFollowing);
			fetchFollowers(props.route.params.uid, setFollowers);
		}
	}

	useEffect(() => {
		setIsCurrentUser(
			props.route.params.uid === firebase.auth().currentUser!.uid
		);
		fetchFollows();
		setIsMyPT(currentUserPTs.includes(props.route.params.uid));
		setIsClient(currentUserClients.includes(props.route.params.uid));
		setIsFollowing(currentUserFollowing.includes(props.route.params.uid));
		if (props.route.params.uid !== firebase.auth().currentUser!.uid)
			fetchChat(
				firebase.auth().currentUser!.uid,
				props.route.params.uid,
				setChatID
			);
	}, [props.route.params.uid]);

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			await getPosts();
			setIsLoading(false);
		})();
	}, [currentUserPosts]);

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

	const renderItem = useCallback(
		({ item }) => (
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
						uri: item.isVideo ? item.thumbnailURI : item.mediaURL,
					}}
					style={styles.image}
				/>
			</TouchableOpacity>
		),
		[]
	);

	const ListEmptyComponent = useCallback(
		() =>
			isLoading ? (
				<LoadingIndicator />
			) : (
				<NoResults icon="image-off-outline" text="No posts" />
			),
		[isLoading]
	);

	return (
		<View style={globalStyles.container}>
			<UserSummary uid={props.route.params.uid} showLabels />
			<View style={styles.infoBox}>
				<Text style={styles.info}>
					{followers.length} follower
					{followers.length !== 1 && "s"}
				</Text>
				<Text style={styles.info}>{following.length} following</Text>
				{isCurrentUser && (
					<Text style={styles.info}>
						{currentUserPTs.length} PT
						{currentUserPTs.length !== 1 && "s"}
					</Text>
				)}
				{isCurrentUser && currentUser && currentUser.isPT && (
					<Text style={styles.info}>
						{currentUserClients.length} client
						{currentUserClients.length !== 1 && "s"}
					</Text>
				)}
				<Text style={styles.info}>
					{posts.length} post
					{posts.length !== 1 && "s"}
				</Text>
			</View>
			{isCurrentUser &&
				currentUser &&
				currentUser.isPT &&
				currentUserClients.length && (
					<PressableButton
						onPress={() => navigation.navigate("Your Clients")}
						text="View your clients"
					/>
				)}
			{isCurrentUser && currentUserPTs.length ? (
				<PressableButton
					onPress={() => navigation.navigate("Your PTs")}
					text="View your personal trainers"
				/>
			) : null}
			{!isCurrentUser && (
				<PressableButton
					onPress={toggleFollow}
					backgroundColor={isFollowing ? "lightgrey" : "deepskyblue"}
					text={isFollowing ? "Unfollow" : "Follow"}
				/>
			)}
			{!isCurrentUser && currentUser && currentUser.isPT && (
				<PressableButton
					onPress={toggleIsClient}
					backgroundColor={isClient ? "lightgrey" : "deepskyblue"}
					text={isClient ? "Remove as client" : "Add as client"}
				/>
			)}
			{isMyPT && (
				<PressableButton
					onPress={toggleIsMyPT}
					backgroundColor={isMyPT ? "lightgrey" : "deepskyblue"}
					text="Remove as my PT"
				/>
			)}
			{!isCurrentUser && (
				<PressableButton
					onPress={() =>
						navigation.navigate("Messages", {
							uid: props.route.params.uid,
							chatID,
						})
					}
					text="Message"
				/>
			)}
			<FlatList
				horizontal={false}
				numColumns={3}
				data={posts}
				contentContainerStyle={{ gap: 2, flexGrow: 1 }}
				columnWrapperStyle={{ gap: 2 }}
				style={styles.gallery}
				renderItem={renderItem}
				ListEmptyComponent={ListEmptyComponent}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	infoBox: {
		gap: 2,
		flexDirection: "row",
		justifyContent: "space-around",
		backgroundColor: "none",
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
		fontWeight: "bold",
	},
	image: {
		flex: 1,
		aspectRatio: 1 / 1,
		borderRadius: 5,
	},
});
