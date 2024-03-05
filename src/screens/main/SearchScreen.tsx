import React, { Component, useCallback, useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	FlatList,
	TouchableOpacity,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { connect } from "react-redux";
import { TextField } from "../../components/TextField";
import globalStyles from "../../globalStyles";
import { Label } from "../../components/Label";
import Profile from "./Profile";
import PostList from "./PostList";
import Comments from "./Comments";
import UserList from "./UserList";

const Stack = createNativeStackNavigator();

function Search(props: any) {
	const navigation = useNavigation();
	const [users, setUsers] = useState<any>([]);

	function fetchUsers(queryString: string): void {
		if (!queryString) return setUsers([]);
		firebase
			.firestore()
			.collection("users")
			.where("username", ">=", queryString)
			.where("username", "<=", queryString + "~")
			.onSnapshot((snapshot) => {
				var users = snapshot.docs.map((doc) => {
					const uid = doc.id;
					return { uid, ...doc.data() };
				});
				setUsers(users);
			});
	}

	const renderItem = useCallback(
		({ item }) => (
			<TouchableOpacity
				onPress={() =>
					navigation.navigate("Profile", {
						uid: item.uid,
					})
				}
				style={styles.result}
			>
				<Text style={styles.user}>{item.username}</Text>
				<View style={globalStyles.labelList}>
					{firebase.auth().currentUser!.uid === item.uid ? (
						<Label text="You" />
					) : null}
					{props.clients.includes(item.uid) ? (
						<Label text="Your client" />
					) : null}
					{props.PTs.includes(item.uid) ? (
						<Label text="Your PT" />
					) : null}
					{props.following.includes(item.uid) ? (
						<Label text="Following" />
					) : null}
				</View>
			</TouchableOpacity>
		),
		[]
	);

	const ListEmptyComponent = useCallback(
		() => (
			<View style={styles.noResults}>
				<Icon name="account-off-outline" size={80} color="white" />
				<Text style={globalStyles.noResultsText}>No results</Text>
			</View>
		),
		[]
	);

	return (
		<View style={globalStyles.container}>
			<TextField
				placeholder="Search users"
				onChangeText={(queryString: any) => fetchUsers(queryString)}
				style={globalStyles.textInput}
				iconName="magnify"
			/>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={users}
				style={styles.results}
				contentContainerStyle={{
					gap: 2,
					flexGrow: 1,
				}}
				renderItem={renderItem}
				ListEmptyComponent={ListEmptyComponent}
			/>
		</View>
	);
}

export class SearchScreen extends Component {
	render() {
		return (
			<Stack.Navigator
				initialRouteName="Search"
				screenOptions={{
					headerTintColor: "deepskyblue",
					headerTitleStyle: { color: "black" },
				}}
			>
				<Stack.Screen
					name="Search"
					children={(props) => <Search {...props} {...this.props} />}
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
	results: {
		flex: 1,
		alignSelf: "stretch",
		borderRadius: 10,
		backgroundColor: "lightgrey",
		flexDirection: "column",
	},
	noResults: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	result: {
		flex: 1,
		gap: 5,
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "white",
		flexDirection: "row",
		padding: 10,
	},
	labelBox: {
		gap: 5,
		flexDirection: "row",
	},
	user: {
		fontSize: 20,
		flex: 1,
	},
});

const mapStateToProps = (store: any) => ({
	following: store.userState.following,
	clients: store.userState.clients,
	PTs: store.userState.PTs,
});

export default connect(mapStateToProps, null)(SearchScreen);
