import React, { Component } from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import SignInScreen from "./SignInScreen";
import RegisterScreen from "./RegisterScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import globalStyles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";

const Stack = createNativeStackNavigator();

function Landing() {
	const navigation = useNavigation<any>();
	return (
		<View style={{ ...globalStyles.container, justifyContent: "center" }}>
			<Text style={globalStyles.logo}>ΛCTIV</Text>
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

export default function LandingScreen() {
	return (
		<Stack.Navigator
			initialRouteName="Landing"
			screenOptions={{
				headerTintColor: "deepskyblue",
				headerTitleStyle: { color: "black" },
			}}
		>
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
