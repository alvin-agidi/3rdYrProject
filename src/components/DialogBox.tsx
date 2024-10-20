import React from "react";
import { View, Text, StyleSheet } from "react-native";
import globalStyles from "../globalStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export function DialogBox(props: any): JSX.Element {
	return (
		<View {...props} style={styles.dialogBox}>
			<Icon name={props.icon} size={20} color="red" />
			<Text style={globalStyles.bold}>{props.text}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	dialogBox: {
		fontSize: 20,
		flexDirection: "row",
		gap: 5,
		alignItems: "center",
		borderWidth: 2,
		borderRadius: 5,
		padding: 5,
		justifyContent: "center",
		backgroundColor: "white",
		borderColor: "red",
		color: "red",
	},
});
