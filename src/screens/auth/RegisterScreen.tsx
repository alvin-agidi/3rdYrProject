import React, { Component } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import styles from "../../styles";
import { PressableButton } from "../../components/PressableButton";

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
				console.log("Fail1 = " + result);
			});
	}

	render() {
		return (
			<View style={styles.form}>
				<TextInput
					placeholder="Email"
					inputMode="email"
					style={styles.textInput}
					onChangeText={(email) => {
						this.setState({ email });
					}}
				/>
				<TextInput
					placeholder="Username"
					style={styles.textInput}
					onChangeText={(username) => {
						this.setState({ username });
					}}
				/>
				<TextInput
					placeholder="Password"
					secureTextEntry={true}
					textContentType="newPassword"
					style={styles.textInput}
					onChangeText={(password) => {
						this.setState({ password });
					}}
				/>

				<PressableButton onPress={this.register} text="Register" />
			</View>
		);
	}
}
