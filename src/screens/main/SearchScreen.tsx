import React, { useState } from "react";
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	FlatList,
	TouchableOpacity,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/core";

export default function SearchScreen() {
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
				let users = snapshot.docs.map((doc) => {
					const id = doc.id;
					const data = doc.data();
					return { id, ...data };
				});
				setUsers(users);
			});
	}

	return (
		<View>
			<TextInput
				placeholder="Search for a user..."
				onChangeText={(queryString) => fetchUsers(queryString)}
			/>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={users}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() =>
							navigation.navigate("Profile", {
								uid: item.id,
							})
						}
					>
						<Text style={styles.userContainer}>
							{item.username}
							{item.email}
						</Text>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 0,
	},
	userContainer: {
		margin: 0,
	},
});
