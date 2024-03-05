import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/database";
import MainScreen from "./src/screens/main/MainScreen";
import { Provider } from "react-redux";
import rootReducer from "./redux/reducers";
import { configureStore } from "@reduxjs/toolkit";
import { LandingScreen } from "./src/screens/auth/LandingScreen";

const store = configureStore({
	reducer: rootReducer,
});

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
	firebase
		.firestore()
		.settings({ experimentalAutoDetectLongPolling: true, merge: true });
}

export class App extends Component<{}, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			signedIn: false,
		};
	}

	componentDidMount(): void {
		firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				this.setState({
					signedIn: false,
				});
			} else {
				this.setState({
					signedIn: true,
				});
			}
		});
	}

	render() {
		if (!this.state.signedIn) {
			return (
				<NavigationContainer>
					<LandingScreen />
				</NavigationContainer>
			);
		}
		return (
			<Provider store={store}>
				<NavigationContainer>
					<MainScreen />
				</NavigationContainer>
			</Provider>
		);
	}
}

export default App;
