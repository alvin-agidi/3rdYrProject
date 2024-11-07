import React, { useState } from "react";
import { View, Text } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import styles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";
import { useNavigation } from "@react-navigation/native";
import { ValidatedTextField } from "../../components/ValidatedTextField";
import globalStyles from "../../globalStyles";
import { DialogBox } from "../../components/DialogBox";

export default function SignInScreen() {
	const navigation = useNavigation<any>();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	function signIn() {
		setError("");
		firebase
			.auth()
			.signInWithEmailAndPassword(email, password)
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
			<ValidatedTextField
				placeholder="Email"
				inputMode="email"
				textContentType="emailAddress"
				validRegex={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
				validationMessage="Please enter a valid email."
				onChangeText={(email: string) => setEmail(email)}
				iconName="email-outline"
			/>
			<ValidatedTextField
				placeholder="Password"
				secureTextEntry={true}
				validRegex={/.{6,}/}
				validationMessage="Password must have at least 6 characters."
				onChangeText={(password: string) => setPassword(password)}
				iconName="lock-outline"
			/>
			<PressableButton onPress={signIn} text="Sign in" />
			<PressableButton
				onPress={() => navigation.navigate("Reset password")}
				text="Forgot my password"
			/>
		</View>
	);
}
