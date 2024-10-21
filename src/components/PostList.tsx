import React, { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useNavigation } from "@react-navigation/core";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { fetchPost } from "../../redux/actions";
import globalStyles from "../globalStyles";
import { Label } from "./Label";
import { useSelector } from "react-redux";
import { LoadingIndicator } from "./LoadingIndicator";
import { NoResults } from "./NoResults";
import UserSummary from "./UserSummary";

export default function PostList(props: any) {
	const navigation = useNavigation<any>();
	const [posts, setPosts] = useState<any>([]);
	const [isLoading, setIsLoading] = useState(false);
	var videoRefs: any = {};
	const following = useSelector((state: any) => state.userState.following);
	const followingPosts = useSelector(
		(state: any) => state.userState.followingPosts
	);

	useEffect(() => {
		videoRefs = {};
		if (
			props.route.params &&
			props.route.params.uid &&
			props.route.params.postID
		) {
			(async () => {
				setIsLoading(true);
				await fetchPost(
					props.route.params.uid,
					props.route.params.postID,
					setPosts
				);
				setIsLoading(false);
			})();
		} else {
			setPosts(followingPosts);
		}
	}, [following, followingPosts]);

	function toggleLike(userID: string, postID: string, isLiked: boolean) {
		if (isLiked) {
			firebase
				.firestore()
				.collection("users")
				.doc(userID)
				.collection("posts")
				.doc(postID)
				.collection("likes")
				.doc(firebase.auth().currentUser!.uid)
				.delete();
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(userID)
				.collection("posts")
				.doc(postID)
				.collection("likes")
				.doc(firebase.auth().currentUser!.uid)
				.set({});
		}
		setPosts((posts: any[]) =>
			posts.map((post: any) => {
				if (post.id === postID) {
					if (post.isLiked) {
						post.likeCount--;
					} else {
						post.likeCount++;
					}
					post.isLiked = !post.isLiked;
				}
				return post;
			})
		);
	}

	function toggleShowRoutine(postID: string) {
		setPosts((posts: any[]) =>
			posts.map((post: any) => {
				if (post.id === postID) {
					post.showRoutine = !post.showRoutine;
				}
				return post;
			})
		);
	}

	const renderItem = useCallback(
		({ item }) => (
			<View style={styles.post}>
				{item.isVideo ? (
					<Video
						ref={(videoRef) => (videoRefs[item.id] = videoRef)}
						style={styles.media}
						source={{ uri: item.mediaURL }}
						resizeMode={ResizeMode.COVER}
						shouldPlay
						isLooping
						isMuted
					/>
				) : (
					<Image
						style={styles.media}
						source={{ uri: item.mediaURL }}
					/>
				)}
				<View style={styles.postDesc}>
					<View style={styles.postHeader}>
						<View style={styles.postBanner}>
							<TouchableOpacity
								onPress={() => {
									navigation.navigate("Profile", {
										uid: item.user.uid,
									});
								}}
								style={styles.postUser}
							>
								<UserSummary uid={item.user.uid} />
							</TouchableOpacity>
							{item.exercisesDetected ? (
								<TouchableOpacity
									style={styles.postIconBox}
									onPress={() => {
										toggleShowRoutine(item.id);
									}}
								>
									<Icon
										name="dumbbell"
										color="black"
										size={30}
									/>
								</TouchableOpacity>
							) : null}
							<TouchableOpacity
								style={styles.postIconBox}
								onPress={() => {
									navigation.navigate("Comments", {
										postID: item.id,
										uid: item.user.uid,
									});
								}}
							>
								<Icon
									name="comment-outline"
									size={30}
									color="black"
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.postIconBox}
								onPress={() => {
									toggleLike(
										item.user.uid,
										item.id,
										item.isLiked
									);
								}}
							>
								<Icon
									name={
										item.isLiked
											? "cards-heart"
											: "heart-outline"
									}
									color="black"
									size={30}
								/>

								<Text style={globalStyles.bold}>
									{item.likeCount} like
									{item.likeCount != 1 ? "s" : ""}
								</Text>
							</TouchableOpacity>
						</View>
						{item.showRoutine && item.exercisesDetected ? (
							<View style={styles.postRoutineBox}>
								<FlatList
									horizontal={false}
									numColumns={1}
									data={item.exercises}
									contentContainerStyle={{
										gap: 5,
										flexGrow: 1,
									}}
									style={globalStyles.labelList}
									renderItem={({ item: exercise }) => (
										<TouchableOpacity
											onPress={async () => {
												await videoRefs[
													item.id
												].playFromPositionAsync(
													exercise.start * 1000
												);
											}}
										>
											<Label
												text={
													exercise.exercise +
													" @ " +
													exercise.start +
													"s"
												}
											/>
										</TouchableOpacity>
									)}
								/>
							</View>
						) : null}
					</View>
					<Text>{item.caption}</Text>
					<Text style={globalStyles.date}>{item.createdAt}</Text>
				</View>
			</View>
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
			<FlatList
				horizontal={false}
				numColumns={1}
				contentContainerStyle={{
					gap: 5,
					flexGrow: 1,
					paddingBottom: 10,
				}}
				data={posts}
				renderItem={renderItem}
				style={styles.postList}
				ListEmptyComponent={ListEmptyComponent}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	postList: {
		padding: 5,
		backgroundColor: "lightgrey",
		borderRadius: 10,
	},
	post: {
		flex: 1,
		borderRadius: 5,
		backgroundColor: "white",
	},
	postDesc: {
		flex: 1,
		gap: 5,
		padding: 5,
	},
	postHeader: {
		fontSize: 20,
		borderRadius: 5,
		backgroundColor: "white",
		flexDirection: "column",
	},
	postBanner: {
		borderRadius: 5,
		paddingHorizontal: 5,
		backgroundColor: "whitesmoke",
		alignItems: "center",
		justifyContent: "flex-end",
		flexDirection: "row",
		gap: 5,
	},
	postRoutineBox: {
		gap: 5,
		padding: 5,
	},
	postIconBox: {
		gap: 5,
		padding: 5,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	postUser: {
		flex: 1,
	},
	media: {
		flex: 1,
		borderRadius: 5,
		aspectRatio: 1,
	},
});
