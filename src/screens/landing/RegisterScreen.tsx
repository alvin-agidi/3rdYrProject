import React, { useState } from "react";
import { View, Text } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import styles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";
import { ValidatedTextField } from "../../components/ValidatedTextField";
import { Toggle } from "../../components/Toggle";
import globalStyles from "../../globalStyles";

export default function RegisterScreen() {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isPT, setIsPT] = useState(false);

	function register() {
		firebase
			.auth()
			.createUserWithEmailAndPassword(email, password)
			.then(() => {
				firebase
					.firestore()
					.collection("users")
					.doc(firebase.auth().currentUser!.uid)
					.set({ email, username, isPT });
			})
			.catch((result: any) => {
				console.log(result);
			});
	}

	return (
		<View style={styles.container}>
			<Text style={globalStyles.logo}>ΛCTIV</Text>
			<ValidatedTextField
				placeholder="Email"
				inputMode="email"
				validRegex={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
				validationMessage="Please enter a valid email."
				onChangeText={(email: string) => setEmail(email)}
				iconName="email-outline"
			/>
			<ValidatedTextField
				placeholder="Username"
				validRegex={/^[a-z]+$/}
				validationMessage="Username must only have lowercase letters."
				onChangeText={(username: string) => {
					username = username.toLowerCase();
					setUsername(username);
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
					setPassword(password);
				}}
				iconName="lock-outline"
			/>
			<Toggle
				text="Register as a personal trainer"
				iconName="account-supervisor-outline"
				onValueChange={() => {
					setIsPT((isPT: boolean) => !isPT);
				}}
				value={isPT}
			/>
			<PressableButton onPress={register} text="Register" />
		</View>
	);
}
