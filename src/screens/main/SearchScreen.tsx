import React, { Component, useState } from "react";
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
import ProfileScreen from "./ProfileScreen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { connect } from "react-redux";
import globalStyles from "../../globalStyles";
import { TextField } from "../../components/TextField";

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
			.get()
			.then((snapshot) => {
				var users = snapshot.docs.map((doc) => {
					const id = doc.id;
					const data = doc.data();
					return { id, ...data };
				});
				setUsers(users);
			});
	}

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
				}}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() =>
							navigation.navigate("Profile", {
								uid: item.id,
							})
						}
						style={styles.result}
					>
						<Text style={styles.user}>{item.username}</Text>
						{props.following.includes(item.id) ? (
							<View style={styles.following}>
								<Text>Following</Text>
							</View>
						) : null}
					</TouchableOpacity>
				)}
				ListEmptyComponent={() => (
					<View style={styles.noResults}>
						<Icon
							name="account-off-outline"
							size={80}
							color="white"
						/>
						<Text style={styles.noResultsText}>No results</Text>
					</View>
				)}
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
				<Stack.Screen name="Profile" component={ProfileScreen} />
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
		alignSelf: "stretch",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 240,
	},
	noResultsText: {
		color: "white",
		fontSize: 50,
		fontWeight: "bold",
	},
	result: {
		flex: 1,
		gap: 10,
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "white",
		flexDirection: "row",
		padding: 10,
	},
	following: {
		fontSize: 20,
		borderColor: "skyblue",
		borderWidth: 1,
		borderRadius: 5,
		padding: 5,
	},
	user: {
		fontSize: 20,
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	followers: store.userState.followers,
	followingLoaded: store.followingState.followingLoaded,
	followingPosts: store.followingState.followingPosts,
});

export default connect(mapStateToProps, null)(SearchScreen);
