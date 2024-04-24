import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export function Toggle(props: any): JSX.Element {
	return (
		<TouchableOpacity accessibilityLabel={props.text}>
			<View style={styles.toggle}>
				<Icon name={props.iconName} size={30} color="skyblue" />
				<Text style={styles.text}>{props.text}</Text>
				<Switch
					{...props}
					trackColor="skyblue"
					thumbColor="white"
					ios_backgroundColor="skyblue"
				/>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	toggle: {
		gap: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	text: {
		padding: 10,
		fontSize: 15,
		flex: 1,
	},
});
