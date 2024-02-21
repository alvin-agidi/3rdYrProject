import React, { Component } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import styles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";
import { ValidatedTextField } from "../../components/ValidatedTextField";

export class RegisterScreen extends Component<{}, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			email: "",
			username: "",
			password: "",
		};

		this.register = this.register.bind(this);
	}

	register() {
		const { email, password, username } = this.state;
		firebase
			.auth()
			.createUserWithEmailAndPassword(email, password)
			.then(() => {
				firebase
					.firestore()
					.collection("users")
					.doc(firebase.auth().currentUser!.uid)
					.set({ email, username });
			})
			.catch((result: any) => {
				console.log(result);
			});
	}

	render() {
		return (
			<View style={styles.container}>
				<ValidatedTextField
					placeholder="Email"
					inputMode="email"
					validRegex={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
					validationMessage="Please enter a valid email."
					onChangeText={(email: string) => {
						this.setState({ email });
					}}
					iconName="email-outline"
				/>
				<ValidatedTextField
					placeholder="Username"
					validRegex={/^[a-z]+$/}
					validationMessage="Username must only have lowercase letters."
					onChangeText={(username: string) => {
						username = username.toLowerCase();
						this.setState({ username });
					}}
					iconName="account-outline"
				/>
				<ValidatedTextField
					placeholder="Password"
					secureTextEntry={true}
					validRegex={/.{6,}/}
					validationMessage="Password must have at least 6 characters."
					textContentType="newPassword"
					onChangeText={(password: string) => {
						this.setState({ password });
					}}
					iconName="lock-outline"
				/>
				<PressableButton onPress={this.register} text="Register" />
			</View>
		);
	}
}
