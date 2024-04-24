import React from "react";
import { Text, TouchableOpacity } from "react-native";
import globalStyles from "../globalStyles";

export function PressableButton(props: any): JSX.Element {
	return (
		<TouchableOpacity
			{...props}
			accessibilityLabel={props.text}
			style={{
				...globalStyles.button,
				backgroundColor: props.backgroundColor ?? "deepskyblue",
			}}
		>
			<Text style={globalStyles.buttonText}>{props.text}</Text>
		</TouchableOpacity>
	);
}
