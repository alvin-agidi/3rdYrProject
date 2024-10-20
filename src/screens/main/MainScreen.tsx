import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import {
	dispatchUser,
	dispatchUserPosts,
	dispatchFollowing,
	dispatchFollowers,
	dispatchNotifications,
	dispatchClients,
	dispatchPTs,
	dispatchChats,
	dispatchChat,
	clearData,
} from "../../../redux/actions";
import SearchScreen from "./SearchScreen";
import FeedScreen from "./FeedScreen";
import CameraScreen from "./CameraScreen";
import ProfileScreen from "./ProfileScreen";
import NotificationsScreen from "./NotificationsScreen";
import ChatsScreen from "./ChatsScreen";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { Dispatch } from "redux";

const Tab = createBottomTabNavigator();

export default function Main() {
	const dispatch: Dispatch<any> = useDispatch();

	useEffect(() => {
		dispatch(clearData());
		dispatch(dispatchUser(firebase.auth().currentUser!.uid));
		dispatch(dispatchUserPosts(firebase.auth().currentUser!.uid));
		dispatch(dispatchFollowing(firebase.auth().currentUser!.uid));
		dispatch(dispatchFollowers(firebase.auth().currentUser!.uid));
		dispatch(dispatchNotifications(firebase.auth().currentUser!.uid));
		dispatch(dispatchClients(firebase.auth().currentUser!.uid));
		dispatch(dispatchPTs(firebase.auth().currentUser!.uid));
		dispatch(dispatchChats(firebase.auth().currentUser!.uid));
		dispatch(dispatchChat(firebase.auth().currentUser!.uid));
	}, [dispatch]);

	return (
		<Tab.Navigator
			initialRouteName="FeedScreen"
			screenOptions={{
				tabBarActiveTintColor: "deepskyblue",
				tabBarShowLabel: false,
			}}
		>
			<Tab.Screen
				name="FeedScreen"
				component={FeedScreen}
				options={{
					tabBarIcon: ({ color, size = 25 }) => (
						<Icon name="home-outline" color={color} size={size} />
					),
					tabBarLabel: "Feed",
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="SearchScreen"
				component={SearchScreen}
				options={{
					tabBarIcon: ({ color, size = 25 }) => (
						<Icon name="magnify" color={color} size={size} />
					),
					tabBarLabel: "Search",
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="CameraScreen"
				component={CameraScreen}
				options={{
					tabBarIcon: ({ color, size = 25 }) => (
						<Icon
							name="camera-plus-outline"
							color={color}
							size={size}
						/>
					),
					tabBarLabel: "Camera",
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="NotificationsScreen"
				component={NotificationsScreen}
				options={{
					tabBarIcon: ({ color, size = 25 }) => (
						<Icon name="bell-outline" color={color} size={size} />
					),
					tabBarLabel: "Notifications",
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="ChatsScreen"
				component={ChatsScreen}
				options={{
					tabBarIcon: ({ color, size = 25 }) => (
						<Icon name="chat-outline" color={color} size={size} />
					),
					tabBarLabel: "Chats",
					headerShown: false,
				}}
			/>
			<Tab.Screen
				name="ProfileScreen"
				component={ProfileScreen}
				options={{
					tabBarIcon: ({ color, size = 25 }) => (
						<Icon
							name="account-outline"
							color={color}
							size={size}
						/>
					),
					headerShown: false,
				}}
			/>
		</Tab.Navigator>
	);
}
