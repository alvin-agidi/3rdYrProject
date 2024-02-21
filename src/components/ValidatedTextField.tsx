import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import globalStyles from "../styles";

export function ValidatedTextField(props: any): JSX.Element {
	const [text, setText] = useState("");
	const [validationMessage, setValidationMessage] = useState("");

	function onChangeText(changedText: string) {
		props.onChangeText(changedText);
		setText(changedText);
		if (validationMessage) {
			isValid();
		}
	}

	function isValid() {
		const isValid = props.validRegex.test(text);
		if (!isValid) {
			setValidationMessage(props.validationMessage);
		} else {
			setValidationMessage("");
		}
	}

	return (
		<View style={styles.container}>
			{validationMessage ? (
				<Text style={styles.validationMessage}>
					{validationMessage}
				</Text>
			) : null}
			<View style={styles.search}>
				<Icon name={props.iconName} size={30} color="skyblue" />
				<TextInput
					{...props}
					style={globalStyles.textInput}
					onEndEditing={isValid}
					onChangeText={onChangeText}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 5,
		alignItems: "center",
	},
	search: {
		gap: 5,
		flexDirection: "row",
		alignItems: "center",
	},
	searchIcon: {
		padding: 10,
	},
	validationMessage: {
		color: "red",
		fontWeight: "bold",
	},
});
