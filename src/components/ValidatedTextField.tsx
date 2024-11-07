import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import globalStyles from "../globalStyles";

export function ValidatedTextField(props: any): JSX.Element {
	const [text, setText] = useState("");
	const [validationMessage, setValidationMessage] = useState("");
	const [color, setColor] = useState("skyblue");

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
			setColor("red");
		} else {
			setValidationMessage("");
			setColor("deepskyblue");
		}
	}

	return (
		<View style={styles.container}>
			{validationMessage && (
				<Text style={styles.validationMessage}>
					{validationMessage}
				</Text>
			) }
			<View style={styles.textField}>
				<Icon name={props.iconName} size={30} color={color} />
				<TextInput
					{...props}
					style={{
						...globalStyles.textInput,
						borderColor: color,
					}}
					onEndEditing={() => {
						isValid();
						setColor("skyblue");
					}}
					onChangeText={onChangeText}
					onFocus={() => setColor("deepskyblue")}
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
	textField: {
		gap: 5,
		flexDirection: "row",
		alignItems: "center",
	},
	validationMessage: {
		color: "red",
		fontWeight: "bold",
	},
});
