import React, { useEffect, useState } from "react";
import {
	FlatList,
	View,
	StyleSheet,
	Text,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
} from "react-native";
import firebase from "firebase/compat/app";
import globalStyles from "../../globalStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/native";

export default function NotificationsScreen(props: any) {
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
					<View style={styles.comment}>
						<View style={styles.commentInfo}>
							<Text
								style={styles.username}
								onPress={() => {
									navigation.navigate("Profile", {
										uid: item.createdBy,
									});
								}}
							>
								{item.creator.username}
							</Text>
							<Text>{item.text}</Text>
						</View>
						<Text>{item.createdAt}</Text>
					</View>
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
