import React, { Component, useEffect, useState } from "react";
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
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "./ProfileScreen";

const Stack = createNativeStackNavigator();

function Feed(props: any) {
	const navigation = useNavigation();
	const [posts, setPosts] = useState<any>([]);

	useEffect(() => {
		if (props.followingLoaded === props.following.length) {
			props.followingPosts.sort((x: any, y: any) => {
				return x.createdAt - y.createdAt;
			});
			setPosts(props.followingPosts);
		}
	}, [props.followingLoaded]);

	return (
		<View style={styles.feed}>
			<FlatList
				horizontal={false}
				numColumns={1}
				contentContainerStyle={{ gap: 5 }}
				data={posts}
				renderItem={({ item }) => (
					<View style={styles.post}>
						{item.isVideo ? (
							<Video
								style={styles.media}
								source={{ uri: item.mediaURL }}
								resizeMode={ResizeMode.COVER}
								shouldPlay
								isMuted
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
								style={styles.postIconBox}
							>
								<Text style={styles.postUsername}>
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

export class FeedScreen extends Component {
	render() {
		return (
			<Stack.Navigator initialRouteName="Feed">
				<Stack.Screen
					name="Feed"
					children={(props) => <Feed {...props} {...this.props} />}
				/>
				<Stack.Screen name="Profile" component={ProfileScreen} />
			</Stack.Navigator>
		);
	}
}

const styles = StyleSheet.create({
	feed: {
		flex: 1,
	},
	post: {
		flex: 1,
		borderRadius: 20,
		backgroundColor: "lightgrey",
	},
	postDesc: {
		flex: 1,
		gap: 5,
		padding: 10,
	},
	postIconBox: {
		fontSize: 20,
		borderRadius: 5,
		backgroundColor: "white",
		padding: 15,
	},
	postInfo: {
		paddingLeft: 15,
		paddingRight: 15,
	},
	postUsername: {
		fontSize: 15,
		fontWeight: "bold",
	},
	media: {
		flex: 1,
		borderRadius: 5,
		aspectRatio: 1 / 1,
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	followers: store.userState.followers,
	users: store.usersState.users,
	followingLoaded: store.usersState.followingLoaded,
	followingPosts: store.usersState.followingPosts,
});

export default connect(mapStateToProps, null)(FeedScreen);
