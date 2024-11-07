import React, { useState } from "react";
import { View, Text } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import styles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";
import { ValidatedTextField } from "../../components/ValidatedTextField";
import globalStyles from "../../globalStyles";
import { DialogBox } from "../../components/DialogBox";

export default function ChangePasswordScreen() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [text, setText] = useState("");

	function sendPasswordResetEmail() {
		firebase
			.auth()
			.sendPasswordResetEmail(email)
			.then(() =>
				setText(
					"If an account exists with your email, an email has been sent to you with a reset link for your password"
				)
			)
			.catch((e: any) => {
				console.log(e.code);
				if (e.code === "auth/invalid-email") {
					setError("Email is invalid.");
				} else if (e.code === "auth/missing-password") {
					setError("Password is missing.");
				} else if (e.code === "auth/invalid-credential") {
					setError("Email/password is incorrect.");
				} else {
					setError(e.code);
				}
			});
	}

	return (
		<View style={styles.container}>
			<Text style={globalStyles.logo}>ΛCTIV</Text>
			{error && <DialogBox text={error} icon="alert-circle-outline" />}
			{text && <DialogBox text={text} icon="alert-circle-outline" />}
			<ValidatedTextField
				placeholder="Email"
				inputMode="email"
				textContentType="emailAddress"
				validRegex={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
				validationMessage="Please enter a valid email."
				onChangeText={(email: string) => setEmail(email)}
				iconName="email-outline"
			/>
			<PressableButton
				onPress={sendPasswordResetEmail}
				text="Send reset email"
			/>
		</View>
	);
}
