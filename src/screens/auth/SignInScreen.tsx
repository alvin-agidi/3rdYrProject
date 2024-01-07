import React, { Component } from "react";
import { View, Button, TextInput } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

export class SignInScreen extends Component<{}, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			email: "",
			password: "",
		};

		this.signIn = this.signIn.bind(this);
	}

	signIn() {
		const { email, password } = this.state;
		firebase
			.auth()
			.signInWithEmailAndPassword(email, password)
			.then((result: any) => {
				console.log("Success2 = " + result);
			})
			.catch((result: any) => {
				console.log("Fail2 = " + result);
			});
	}

	render() {
		return (
			<View>
				<TextInput
					placeholder="Email"
					inputMode="email"
					textContentType="emailAddress"
					onChangeText={(email) => {
						this.setState({ email });
					}}
				/>
				<TextInput
					placeholder="Password"
					secureTextEntry={true}
					onChangeText={(password) => {
						this.setState({ password });
					}}
				/>

				<Button title="Sign in" onPress={() => this.signIn()} />
			</View>
		);
	}
}

export default SignInScreen;
