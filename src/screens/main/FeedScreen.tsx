import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { connect } from "react-redux";
import { useNavigation } from "@react-navigation/core";

function FeedScreen(props: any) {
	const navigation = useNavigation();
	const [posts, setPosts] = useState<any>([]);

	useEffect(() => {
		let posts: any = [];
		if (props.usersLoaded == props.following.length) {
			for (const uid of props.following) {
				const user = props.users.find((u: any) => u.uid == uid);
				if (user != undefined) {
					posts.push(...user.posts);
				}
			}
			posts.sort((x: any, y: any) => {
				return x.createdAt - y.createdAt;
			});
			setPosts(posts);
		}
	}, [props.usersLoaded]);

	return (
		<View style={styles.container}>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={posts}
				renderItem={({ item }) => (
					<View style={styles.post}>
						{item.isVideo ? (
							<Video
								style={styles.media}
								source={{ uri: item.mediaURL }}
								resizeMode={ResizeMode.CONTAIN}
								shouldPlay
								isLooping
							/>
						) : (
							<Image
								style={styles.media}
								source={{ uri: item.mediaURL }}
							/>
						)}
						<View style={styles.postDesc}>
							<TouchableOpacity
								onPress={() => {
									navigation.navigate("Profile", {
										uid: item.user.uid,
									});
								}}
							>
								<Text style={styles.postUser}>
									{item.user.username}
								</Text>
							</TouchableOpacity>
							<Text>{item.likes} likes</Text>
							<Text>{item.caption}</Text>
							<Text>{item.createdAt}</Text>
						</View>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 0,
	},
	post: {
		flex: 1,
		margin: 0,
	},
	postDesc: {
		flex: 1,
		margin: 0,
		padding: 10,
	},
	postUser: {
		fontSize: 20,
	},
	media: {
		flex: 1,
		aspectRatio: 1 / 1,
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	users: store.usersState.users,
	usersLoaded: store.usersState.usersLoaded,
});

export default connect(mapStateToProps, null)(FeedScreen);
