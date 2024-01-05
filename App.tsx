import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import LandingScreen from "./src/components/screens/auth/LandingScreen";
import RegisterScreen from "./src/components/screens/auth/RegisterScreen";
import SignInScreen from "./src/components/screens/auth/SignInScreen";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAUV8eOm74mhlr3eEHZ8VZr74UYB2rNGJY",
	authDomain: "yrproject-64b5e.firebaseapp.com",
	projectId: "yrproject-64b5e",
	storageBucket: "yrproject-64b5e.appspot.com",
	messagingSenderId: "68905325798",
	appId: "1:68905325798:web:614befb202f9c97f44d727",
	measurementId: "G-95P67P8P3V",
};

if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}

const Stack = createNativeStackNavigator();
export class App extends Component<{}, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			loaded: false,
			signedIn: false,
		};
	}

	componentDidMount(): void {
		firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				this.setState({
					loaded: true,
					signedIn: false,
				});
			} else {
				this.setState({
					loaded: true,
					signedIn: true,
				});
			}
		});
	}

	render() {
		const { loaded, signedIn } = this.state;
		if (!loaded) {
		} else if (!signedIn) {
			return (
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Landing">
						<Stack.Screen
							name="Landing"
							component={LandingScreen}
							// options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="Register"
							component={RegisterScreen}
							// options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="Sign In"
							component={SignInScreen}
							// options={{ headerShown: false }}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			);
		}
	}
}

export default App;
