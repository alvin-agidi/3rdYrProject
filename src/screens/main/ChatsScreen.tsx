import React, { useCallback, Component, useEffect, useState } from "react";
import {
	FlatList,
	View,
	StyleSheet,
	Text,
	TouchableOpacity,
} from "react-native";
import globalStyles from "../../globalStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/native";
import Profile from "../../components/Profile";
import PostList from "../../components/PostList";
import { useSelector } from "react-redux";
import Comments from "../../components/Comments";
import UserList from "../../components/UserList";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { NoResults } from "../../components/NoResults";
import ChatScreen from "./ChatScreen";
import UserSummary from "../../components/UserSummary";

const Stack = createNativeStackNavigator();

function Chats() {
	const navigation = useNavigation<any>();
	const chats = useSelector((state: any) => state.userState.chats);

	function dismissChat(id: string): void {
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("chat")
			.doc(id);
	}

	const ListEmptyComponent = useCallback(
		() => <NoResults icon="chat-remove-outline" text="No chats" />,
		[]
	);

	const renderItem = useCallback(
		({ item }) => (
			<TouchableOpacity
				onPress={() =>
					navigation.navigate("Chat", {
						chatID: item.chatID,
						uid: item.uid,
					})
				}
				style={styles.chat}
			>
				<UserSummary uid={item.uid} />
			</TouchableOpacity>
		),
		[]
	);

	return (
		<View style={globalStyles.container}>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={chats}
				style={styles.chatList}
				contentContainerStyle={{
					gap: 5,
					flexGrow: 1,
				}}
				renderItem={renderItem}
				ListEmptyComponent={ListEmptyComponent}
			/>
		</View>
	);
}

export default function ChatsScreen() {
	const clients = useSelector((state: any) => state.userState.clients);
	const PTs = useSelector((state: any) => state.userState.PTs);

	return (
		<Stack.Navigator
			initialRouteName="Chats"
			screenOptions={{
				headerTintColor: "deepskyblue",
				headerTitleStyle: { color: "black" },
			}}
		>
			<Stack.Screen name="Chats" children={(props) => <Chats />} />
			<Stack.Screen name="Profile" component={Profile} />
			<Stack.Screen name="Post" component={PostList} />
			<Stack.Screen name="Comments" component={Comments} />
			<Stack.Screen name="Chat" component={ChatScreen} />
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

const styles = StyleSheet.create({
	chatList: {
		flex: 1,
		padding: 5,
		backgroundColor: "lightgrey",
		borderRadius: 10,
		gap: 5,
	},
	chat: {
		padding: 5,
		borderRadius: 5,
		backgroundColor: "white",
		flex: 1,
		justifyContent: "flex-start",
		gap: 5,
	},
	chatBody: {
		// justifyContent: "space-between",
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 5,
		paddingRight: 5,
		gap: 5,
		backgroundColor: "red",
	},
});
