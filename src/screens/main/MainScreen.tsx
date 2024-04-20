import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import {
	fetchUser,
	fetchUserPosts,
	fetchFollowing,
	fetchFollowers,
	fetchNotifications,
	fetchClients,
	fetchPTs,
	clearData,
} from "../../../redux/actions";
import SearchScreen from "./SearchScreen";
import FeedScreen from "./FeedScreen";
import CameraScreen from "./CameraScreen";
import ProfileScreen from "./ProfileScreen";
import NotificationsScreen from "./NotificationsScreen";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const Tab = createBottomTabNavigator();

export default function Main() {
	const dispatch: Dispatch<any> = useDispatch();

	useEffect(() => {
		dispatch(clearData());
		dispatch(fetchUser(firebase.auth().currentUser!.uid));
		dispatch(fetchUserPosts(firebase.auth().currentUser!.uid));
		dispatch(fetchFollowing(firebase.auth().currentUser!.uid));
		dispatch(fetchFollowers(firebase.auth().currentUser!.uid));
		dispatch(fetchNotifications(firebase.auth().currentUser!.uid));
		dispatch(fetchClients(firebase.auth().currentUser!.uid));
		dispatch(fetchPTs(firebase.auth().currentUser!.uid));
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
