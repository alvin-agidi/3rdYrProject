import React, { Component } from "react";
import { View, TextInput, Text, Pressable } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import styles from "../../styles";
import { PressableButton } from "../../components/PressableButton";

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
			<View style={styles.form}>
				<TextInput
					placeholder="Email"
					inputMode="email"
					textContentType="emailAddress"
					style={styles.textInput}
					onChangeText={(email) => {
						this.setState({ email });
					}}
				/>
				<TextInput
					placeholder="Password"
					secureTextEntry={true}
					style={styles.textInput}
					onChangeText={(password) => {
						this.setState({ password });
					}}
				/>
				<PressableButton onPress={this.signIn} text="Sign In" />
			</View>
		);
	}
}
