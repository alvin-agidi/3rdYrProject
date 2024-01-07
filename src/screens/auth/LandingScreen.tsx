import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { useNavigation } from "@react-navigation/core";

export default function LandingScreen() {
	const navigation = useNavigation();
	return (
		<View style={styles.container}>
			<Button
				title="Register"
				onPress={() => navigation.navigate("Register")}
			/>
			<Button
				title="Sign in"
				onPress={() => navigation.navigate("Sign In")}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
