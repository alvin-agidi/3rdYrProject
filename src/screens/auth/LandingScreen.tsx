import React, { Component } from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { SignInScreen } from "./SignInScreen";
import { RegisterScreen } from "./RegisterScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import styles from "../../styles";
import { PressableButton } from "../../components/PressableButton";

const Stack = createNativeStackNavigator();

function Landing() {
	const navigation = useNavigation();
	return (
		<View style={{ ...styles.form, justifyContent: "center" }}>
			<Text style={styles.logo}>ΛCTIV</Text>
			<PressableButton
				onPress={() => navigation.navigate("Register")}
				text="Register"
			/>
			<PressableButton
				onPress={() => navigation.navigate("Sign in")}
				text="Sign in"
			/>
		</View>
	);
}

export class LandingScreen extends Component {
	render() {
		return (
			<Stack.Navigator initialRouteName="Landing">
				<Stack.Screen
					name="Landing"
					component={Landing}
					options={{ title: "" }}
				/>
				<Stack.Screen name="Register" component={RegisterScreen} />
				<Stack.Screen name="Sign in" component={SignInScreen} />
			</Stack.Navigator>
		);
	}
}
