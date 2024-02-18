import React from "react";
import { Pressable, Text } from "react-native";
import styles from "../styles";

export function PressableButton(props: any): JSX.Element {
	return (
		<Pressable onPress={props.onPress} style={styles.button}>
			<Text style={styles.buttonText}>{props.text}</Text>
		</Pressable>
	);
}
