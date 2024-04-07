import React, { useCallback, Component, useEffect, useState } from "react";
import {
	FlatList,
	View,
	StyleSheet,
	Text,
	TouchableOpacity,
	Touchable,
} from "react-native";
import globalStyles from "../../globalStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/native";
import Profile from "./Profile";
import PostList from "./PostList";
import { connect } from "react-redux";
import Comments from "./Comments";
import UserList from "./UserList";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { NoResults } from "../../components/NoResults";

const Stack = createNativeStackNavigator();

function Notifications(props: any) {
	const navigation = useNavigation();

	function dismissNotification(id: string): void {
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("notifications")
			.doc(id)
			.delete();
	}

	const renderItem = useCallback(
		({ item }) => (
			<TouchableOpacity
				onPress={() => {
					navigation.navigate(item.navPostID ? "Post" : "Profile", {
						uid: item.navUID,
						postID: item.navPostID,
					});
				}}
			>
				<View style={styles.notificationBody}>
					<View style={styles.notification}>
						<Text style={globalStyles.bold}>{item.title}</Text>
						<View style={{ flex: 1 }}>
							<Text>{item.body}</Text>
							<Text style={globalStyles.date}>
								{item.createdAt}
							</Text>
						</View>
					</View>
					<TouchableOpacity
						onPress={() => dismissNotification(item.id)}
					>
						<Icon name="window-close" size={25} />
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		),
		[]
	);

	const ListEmptyComponent = useCallback(
		() => <NoResults icon="bell-off-outline" text="No notifications" />,
		[]
	);

	return (
		<View style={globalStyles.container}>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={props.notifications}
				contentContainerStyle={{
					gap: 5,
					flexGrow: 1,
				}}
				style={styles.notifications}
				renderItem={renderItem}
				ListEmptyComponent={ListEmptyComponent}
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
				<Stack.Screen name="Profile" component={Profile} />
				<Stack.Screen name="Post" component={PostList} />
				<Stack.Screen name="Comments" component={Comments} />
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

const styles = StyleSheet.create({
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

	notificationBody: {
		justifyContent: "space-between",
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 5,
		paddingRight: 5,
		gap: 5,
		backgroundColor: "red",
	},
});

const mapStateToProps = (store: any) => ({
	notifications: store.userState.notifications,
});

export default connect(mapStateToProps, null)(NotificationsScreen);
