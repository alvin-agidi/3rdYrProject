import { StyleSheet, View, Text } from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
	fetchUser,
	fetchUserPosts,
	fetchFollowing,
	clearData,
} from "../../../redux/actions";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import SearchScreen from "./SearchScreen";
import FeedScreen from "./FeedScreen";
import CameraScreen from "./CameraScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

export class Main extends Component {
	componentDidMount() {
		this.props.clearData();
		this.props.fetchUser();
		this.props.fetchUserPosts();
		this.props.fetchFollowing();
	}

	render() {
		return (
			<Tab.Navigator
				initialRouteName="FeedScreen"
				// screenOptions={{ tabBarShowLabel: false }}
			>
				<Tab.Screen
					name="FeedScreen"
					component={FeedScreen}
					options={{
						tabBarIcon: ({ color, size }) => (
							<Icon
								name="home-outline"
								color={color}
								size={size}
							/>
						),
						tabBarLabel: "Feed",
						headerShown: false,
					}}
				/>
				<Tab.Screen
					name="SearchScreen"
					component={SearchScreen}
					options={{
						tabBarIcon: ({ color, size }) => (
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
						tabBarIcon: ({ color, size }) => (
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
					name="My Profile"
					component={ProfileScreen}
					initialParams={{ uid: firebase.auth().currentUser!.uid }}
					options={{
						tabBarIcon: ({ color, size }) => (
							<Icon
								name="account-outline"
								color={color}
								size={size}
							/>
						),
					}}
				/>
			</Tab.Navigator>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
});

const mapDispatchProps = (dispatch: any) =>
	bindActionCreators(
		{ fetchUser, fetchUserPosts, fetchFollowing, clearData },
		dispatch
	);

export default connect(mapStateToProps, mapDispatchProps)(Main);
