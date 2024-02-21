import React, { Component } from "react";
import { View, TextInput, Text, Pressable } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import styles from "../../styles";
import { PressableButton } from "../../components/PressableButton";
import { ValidatedTextField } from "../../components/ValidatedTextField";

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
			.catch((result: any) => {
				console.log("Fail2 = " + result);
			});
	}

	render() {
		return (
			<View style={styles.container}>
				<ValidatedTextField
					placeholder="Email"
					inputMode="email"
					textContentType="emailAddress"
					validRegex={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
					validationMessage="Please enter a valid email."
					onChangeText={(email: string) => {
						this.setState({ email });
					}}
					iconName="email-outline"
				/>
				<ValidatedTextField
					placeholder="Password"
					secureTextEntry={true}
					validRegex={/.{6,}/}
					validationMessage="Password must have at least 6 characters."
					onChangeText={(password: string) => {
						this.setState({ password });
					}}
					iconName="lock-outline"
				/>
				<PressableButton onPress={this.signIn} text="Sign in" />
			</View>
		);
	}
}
