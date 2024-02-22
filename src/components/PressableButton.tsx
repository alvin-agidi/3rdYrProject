import React from "react";
import { Pressable, Text } from "react-native";
import styles from "../globalStyles";

export function PressableButton(props: any): JSX.Element {
	return (
		<Pressable {...props} style={styles.button}>
			<Text style={styles.buttonText}>{props.text}</Text>
		</Pressable>
	);
}
