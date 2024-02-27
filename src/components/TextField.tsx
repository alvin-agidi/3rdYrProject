import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import globalStyles from "../globalStyles";

export function TextField(props: any): JSX.Element {
	const [color, setColor] = useState("skyblue");
	return (
		<View style={styles.textField}>
			<Icon name={props.iconName} size={30} color={color} />
			<TextInput
				{...props}
				style={{
					...globalStyles.textInput,
					borderColor: color,
				}}
				onEndEditing={() => {
					setColor("skyblue");
				}}
				onFocus={() => setColor("deepskyblue")}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	textField: {
		gap: 5,
		flexDirection: "row",
		alignItems: "center",
	},
});
