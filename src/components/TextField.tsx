import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import globalStyles from "../styles";

export function TextField(props: any): JSX.Element {
	return (
		<View style={styles.searchSection}>
			<Icon name={props.iconName} size={30} color="skyblue" />
			<TextInput
				{...props}
				style={{ ...globalStyles.textInput, flex: 1 }}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	searchSection: {
		gap: 5,
		flexDirection: "row",
		alignItems: "center",
	},
	searchIcon: {
		padding: 10,
	},
});
