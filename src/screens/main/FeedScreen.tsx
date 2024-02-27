import React, { Component } from "react";
import { Platform } from "react-native";
import { connect } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "./ProfileScreen";
import CommentsScreen from "./CommentsScreen";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import PostList from "./PostList";
import * as Notifications from "expo-notifications";
import { isDevice } from "expo-device";
const appConfig = require("../../../app.json");

const Stack = createNativeStackNavigator();

export class FeedScreen extends Component {
	async componentDidMount() {
		var token;

		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#FF231F7C",
			});
		}
		if (isDevice) {
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync();
			if (existingStatus !== "granted") {
				const { status } =
					await Notifications.requestPermissionsAsync();
				if (status !== "granted") {
					console.log(
						"Failed to get push token for push notification!"
					);
					return;
				}
			}
			const token = (
				await Notifications.getExpoPushTokenAsync({
					projectId: appConfig?.expo?.extra?.eas?.projectId,
				})
			).data;
			// console.log(token);
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("notificationTokens")
				.doc(token)
				.set({});
		} else {
			console.log("Must use physical device for Push Notifications");
		}
	}

	render() {
		return (
			<Stack.Navigator
				initialRouteName="Feed"
				screenOptions={{
					headerTintColor: "deepskyblue",
					headerTitleStyle: { color: "black" },
				}}
			>
				<Stack.Screen
					name="Feed"
					children={(props) => (
						<PostList {...props} {...this.props} />
					)}
				/>
				<Stack.Screen name="Comments" component={CommentsScreen} />
				<Stack.Screen
					name="Profile1"
					component={ProfileScreen}
					options={{ title: "" }}
				/>
			</Stack.Navigator>
		);
	}
}

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	followers: store.userState.followers,
	followingLoaded: store.followingState.followingLoaded,
	followingPosts: store.followingState.followingPosts,
	clients: store.userState.clients,
	PTs: store.userState.PTs,
});

export default connect(mapStateToProps, null)(FeedScreen);
