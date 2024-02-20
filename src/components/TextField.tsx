import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import globalStyles from "../styles";

export function TextField(props: any): JSX.Element {
	return (
		<View style={styles.searchSection}>
			<Icon name={props.iconName} color="skyblue" size={30} />
			<TextInput
				style={{ ...globalStyles.textInput, flex: 1 }}
				placeholder={props.placeholder}
				onChangeText={props.onChangeText}
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
