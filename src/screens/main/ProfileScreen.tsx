import React from "react";
import { useSelector } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CommentsScreen from "./CommentsScreen";
import PostList from "../../components/PostList";
import UserList from "../../components/UserList";
import Profile from "../../components/Profile";
import MessagesScreen from "./MessagesScreen";

const Stack = createNativeStackNavigator();

export default function ProfileScreen() {
	const clients = useSelector((state: any) => state.userState.clients);
	const PTs = useSelector((state: any) => state.userState.PTs);

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
			<Stack.Screen name="Messages" component={MessagesScreen} />
			<Stack.Screen
				name="Your Clients"
				component={UserList}
				initialParams={{ users: clients }}
			/>
			<Stack.Screen
				name="Your PTs"
				component={UserList}
				initialParams={{ users: PTs }}
			/>
		</Stack.Navigator>
	);
}
