import React, { useState } from "react";
import { Pressable, Text, TouchableOpacity } from "react-native";
import styles from "../globalStyles";

export function PressableButton(props: any): JSX.Element {
	return (
		<TouchableOpacity {...props} style={styles.button}>
			<Text style={styles.buttonText}>{props.text}</Text>
		</TouchableOpacity>
	);
}
