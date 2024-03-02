import React, { Component } from "react";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CommentsScreen from "./Comments";
import PostList from "./PostList";
import UserList from "./UserList";
import Profile from "./Profile";

const Stack = createNativeStackNavigator();

class ProfileScreen extends Component {
	render() {
		return (
			<Stack.Navigator
				initialRouteName="Your Profile"
				screenOptions={{
					headerTintColor: "deepskyblue",
					headerTitleStyle: { color: "black" },
				}}
			>
				<Stack.Screen
					name="Your Profile"
					component={Profile}
					initialParams={{ uid: firebase.auth().currentUser!.uid }}
				/>
				<Stack.Screen name="Profile" component={Profile} />
				<Stack.Screen name="Post" component={PostList} />
				<Stack.Screen name="Comments" component={CommentsScreen} />
				<Stack.Screen
					name="Your Clients"
					component={UserList}
					initialParams={{ users: this.props.clients }}
				/>
				<Stack.Screen
					name="Your PTs"
					component={UserList}
					initialParams={{ users: this.props.PTs }}
				/>
			</Stack.Navigator>
		);
	}
}

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	posts: store.userState.posts,
	following: store.userState.following,
	followers: store.userState.followers,
	clients: store.userState.clients,
	PTs: store.userState.PTs,
});

export default connect(mapStateToProps, null)(ProfileScreen);
