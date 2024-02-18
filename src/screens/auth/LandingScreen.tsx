import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { SignInScreen } from "./SignInScreen";
import { RegisterScreen } from "./RegisterScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

function Landing() {
	const navigation = useNavigation();
	return (
		<View style={styles.container}>
			<Button
				title="Register"
				onPress={() => navigation.navigate("Register")}
			/>
			<Button
				title="Sign in"
				onPress={() => navigation.navigate("Sign in")}
			/>
		</View>
	);
}

export class LandingScreen extends Component {
	render() {
		return (
			<Stack.Navigator initialRouteName="Landing">
				<Stack.Screen name="Landing" component={Landing} />
				<Stack.Screen name="Register" component={RegisterScreen} />
				<Stack.Screen name="Sign in" component={SignInScreen} />
			</Stack.Navigator>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
