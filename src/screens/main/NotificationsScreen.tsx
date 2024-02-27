import React, { Component, useEffect, useState } from "react";
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
import ProfileScreen from "./ProfileScreen";
import PostList from "./PostList";

const Stack = createNativeStackNavigator();

export default function Notifications(props: any) {
	const navigation = useNavigation();
	const [notifications, setNotifications] = useState<any>([]);
	// useEffect(() => {}, []);
	return (
		<View style={globalStyles.container}>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={notifications}
				contentContainerStyle={{
					gap: 5,
				}}
				style={styles.comments}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.comment}
						onPress={() => {
							navigation.navigate("Profile1", {
								uid: item.routeUID,
							});
						}}
					>
						<View style={styles.commentInfo}>
							<Text style={styles.username}>{item.title}</Text>
							<Text>{item.body}</Text>
						</View>
						<Text>{item.createdAt}</Text>
					</TouchableOpacity>
				)}
				ListEmptyComponent={() => (
					<View style={styles.noResults}>
						<Icon name="bell-off-outline" size={80} color="white" />
						<Text style={styles.noResultsText}>
							No notifications
						</Text>
					</View>
				)}
			/>
		</View>
	);
}

class NotificationsScreen extends Component {
	render() {
		return (
			<Stack.Navigator
				initialRouteName="Notifications"
				screenOptions={{
					headerTintColor: "deepskyblue",
					headerTitleStyle: { color: "black" },
				}}
			>
				<Stack.Screen
					name="Notifications"
					children={(props) => (
						<Notifications {...props} {...this.props} />
					)}
				/>
				<Stack.Screen name="Post" component={PostList} />
				<Stack.Screen name="Profile1" component={ProfileScreen} />
			</Stack.Navigator>
		);
	}
}

const styles = StyleSheet.create({
	noResults: {
		flex: 1,
		alignSelf: "stretch",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 250,
	},
	comments: {
		flex: 1,
		padding: 5,
		backgroundColor: "lightgrey",
		borderRadius: 10,
		alignSelf: "stretch",
	},
	comment: {
		padding: 5,
		borderRadius: 5,
		backgroundColor: "white",
	},
	noResultsText: {
		color: "white",
		fontSize: 50,
		fontWeight: "bold",
	},
	username: {
		fontSize: 15,
		// padding: 10,
		fontWeight: "bold",
	},
	commentInfo: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-start",
		gap: 5,
		alignContent: "center",
	},
});
