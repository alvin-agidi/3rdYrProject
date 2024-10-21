import React, { useCallback } from "react";
import { FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import globalStyles from "../../globalStyles";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/native";
import Profile from "../../components/Profile";
import PostList from "../../components/PostList";
import { useSelector } from "react-redux";
import Comments from "./CommentsScreen";
import UserList from "../../components/UserList";
import { NoResults } from "../../components/NoResults";
import MessagesScreen from "./MessagesScreen";
import UserSummary from "../../components/UserSummary";
import MessageList from "../../components/MessageList";

const Stack = createNativeStackNavigator();

function Chats() {
	const navigation = useNavigation<any>();
	const chats = useSelector((state: any) => state.userState.chats);

	const ListEmptyComponent = useCallback(
		() => <NoResults icon="chat-remove-outline" text="No chats" />,
		[]
	);

	const renderItem = useCallback(
		({ item }) => (
			<TouchableOpacity
				onPress={() =>
					navigation.navigate("Messages", {
						chatID: item.chatID,
						uid: item.uid,
					})
				}
				style={styles.chat}
			>
				<UserSummary uid={item.uid} showLabels />
				<MessageList
					chatID={item.chatID}
					uid={item.uid}
					limit={1}
					order="desc"
				/>
			</TouchableOpacity>
		),
		[]
	);

	return (
		<View style={globalStyles.container}>
			{/* <PressableButton
				text={"New chat"}
				onPress={navigation.navigate("Search")}
			/> */}
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
			<Stack.Screen name="Messages" component={MessagesScreen} />
			{/* <Stack.Screen name="Search" component={SearchScreen} /> */}
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
