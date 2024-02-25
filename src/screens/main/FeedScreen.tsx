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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileScreen from "./ProfileScreen";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import CommentsScreen from "./CommentsScreen";
import PostList from "./PostList";

const Stack = createNativeStackNavigator();

export class FeedScreen extends Component {
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
});

export default connect(mapStateToProps, null)(FeedScreen);
