import React from "react";
import { View, Text, StyleSheet } from "react-native";
import globalStyles from "../globalStyles";

export function Label(props: any): JSX.Element {
	return (
		<View {...props} style={styles.label}>
			<Text style={globalStyles.bold}>{props.text}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	label: {
		fontSize: 20,
		borderColor: "deepskyblue",
		borderWidth: 2,
		borderRadius: 5,
		padding: 5,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white",
	},
});
