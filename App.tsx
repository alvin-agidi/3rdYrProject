import React, { Component } from "react";
import { StyleSheet, Text, View, Button, AsyncStorage } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import LandingScreen from "./src/screens/auth/LandingScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import SignInScreen from "./src/screens/auth/SignInScreen";
import MainScreen from "./src/screens/main/MainScreen";
import FeedScreen from "./src/screens/main/FeedScreen";
import SearchScreen from "./src/screens/main/SearchScreen";
import CameraScreen from "./src/screens/main/CameraScreen";
import ProfileScreen from "./src/screens/main/ProfileScreen";
import PublishPostScreen from "./src/screens/main/PublishPostScreen";
import { Provider } from "react-redux";
import { applyMiddleware } from "redux";
import rootReducer from "./redux/reducers";
import { configureStore, Tuple } from "@reduxjs/toolkit";
import thunk from "redux-thunk";

const store = configureStore({
	reducer: rootReducer,
});

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
					<Stack.Navigator initialRouteName="LandingScreen">
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
		} else {
			return (
				<Provider store={store}>
					<NavigationContainer>
						<Stack.Navigator initialRouteName="Main">
							<Stack.Screen
								name="Main"
								component={MainScreen}
								// options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="Feed"
								component={FeedScreen}
								// options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="Search"
								component={SearchScreen}
								// options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="Camera"
								component={CameraScreen}
								// options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="Profile"
								component={ProfileScreen}
								// options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="Publish Post"
								component={PublishPostScreen}
								// options={{ headerShown: false }}
							/>
						</Stack.Navigator>
					</NavigationContainer>
				</Provider>
			);
		}
	}
}

export default App;
