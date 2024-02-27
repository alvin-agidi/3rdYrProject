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
import { connect } from "react-redux";
import Comments from "./CommentsScreen";

const Stack = createNativeStackNavigator();

function Notifications(props: any) {
	const navigation = useNavigation();
	const [notifications, setNotifications] = useState<any>([]);
	useEffect(() => {
		setNotifications(props.notifications);
	}, [props.notifications]);
	return (
		<View style={globalStyles.container}>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={notifications}
				contentContainerStyle={{
					gap: 5,
				}}
				style={styles.notifications}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() => {
							navigation.navigate(
								item.navPostID ? "Post" : "Profile1",
								{
									uid: item.navUID,
									postID: item.navPostID,
								}
							);
						}}
					>
						<View style={styles.notification}>
							<Text style={globalStyles.bold}>{item.title}</Text>
							<Text>{item.body}</Text>
							<Text style={globalStyles.date}>
								{item.createdAt}
							</Text>
						</View>
					</TouchableOpacity>
				)}
				ListEmptyComponent={() => (
					<View style={styles.noResults}>
						<Icon name="bell-off-outline" size={80} color="white" />
						<Text style={globalStyles.noResultsText}>
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
				<Stack.Screen name="Comments" component={Comments} />
				<Stack.Screen
					name="Profile1"
					component={ProfileScreen}
					options={{ title: "" }}
				/>
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
	notifications: {
		flex: 1,
		padding: 5,
		backgroundColor: "lightgrey",
		borderRadius: 10,
		gap: 5,
		alignSelf: "stretch",
	},
	title: {
		fontSize: 15,
		fontWeight: "bold",
	},
	notification: {
		padding: 5,
		borderRadius: 5,
		backgroundColor: "white",
		flex: 1,
		justifyContent: "flex-start",
		gap: 5,
	},
});

const mapStateToProps = (store: any) => ({
	notifications: store.userState.notifications,
});

export default connect(mapStateToProps, null)(NotificationsScreen);
