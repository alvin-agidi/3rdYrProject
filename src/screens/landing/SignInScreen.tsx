import React, { useState } from "react";
import { View, Text } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import styles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";
import { ValidatedTextField } from "../../components/ValidatedTextField";
import globalStyles from "../../globalStyles";

export default function SignInScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	function signIn() {
		firebase
			.auth()
			.signInWithEmailAndPassword(email, password)
			.catch((result: any) => console.log(result));
	}

	return (
		<View style={styles.container}>
			<Text style={globalStyles.logo}>ΛCTIV</Text>
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
		</View>
	);
}
