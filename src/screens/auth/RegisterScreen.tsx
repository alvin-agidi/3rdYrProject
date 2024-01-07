import React, { Component } from "react";
import { View, Button, TextInput } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";

export class RegisterScreen extends Component<{}, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			email: "",
			password: "",
			username: "",
		};

		this.register = this.register.bind(this);
	}

	register() {
		const { email, password, username } = this.state;
		firebase
			.auth()
			.createUserWithEmailAndPassword(email, password)
			.then((result: any) => {
				firebase
					.firestore()
					.collection("users")
					.doc(firebase.auth().currentUser!.uid)
					.set({ email, username });
				console.log("Success1 = " + result);
			})
			.catch((result: any) => {
				console.log("Fail1 = " + result);
			});
	}

	render() {
		return (
			<View>
				<TextInput
					placeholder="Email"
					inputMode="email"
					onChangeText={(email) => {
						this.setState({ email });
					}}
				/>
				<TextInput
					placeholder="Password"
					secureTextEntry={true}
					textContentType="newPassword"
					onChangeText={(password) => {
						this.setState({ password });
					}}
				/>
				<TextInput
					placeholder="username"
					onChangeText={(username) => {
						this.setState({ username });
					}}
				/>

				<Button title="Register" onPress={() => this.register()} />
			</View>
		);
	}
}

export default RegisterScreen;
