import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import globalStyles from "../../globalStyles";
import { PressableButton } from "../../components/PressableButton";
import { ValidatedTextField } from "../../components/ValidatedTextField";
import { Toggle } from "../../components/Toggle";
import { DialogBox } from "../../components/DialogBox";
import { useSelector } from "react-redux";
import { deleteMedia, uploadMedia } from "../../../redux/actions";
import { Camera } from "expo-camera";

export default function SettingsScreen() {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isPT, setIsPT] = useState(false);
	const [media, setMedia] = useState();
	const [hasCameraPermission, setHasCameraPermission] = useState(false);
	const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
		useState(false);
	const [hasImagePickerPermission, setHasImagePickerPermission] =
		useState(false);
	const currentUser = useSelector(
		(state: any) => state.userState.currentUser
	);

	useEffect(() => {
		(async () => {
			const cameraPermission =
				await Camera.requestCameraPermissionsAsync();
			const mediaLibraryPermission =
				await MediaLibrary.requestPermissionsAsync();
			const imagePickerPermission =
				await ImagePicker.requestMediaLibraryPermissionsAsync();

			setHasCameraPermission(cameraPermission.status === "granted");
			setHasMediaLibraryPermission(
				mediaLibraryPermission.status === "granted"
			);
			setHasImagePickerPermission(
				imagePickerPermission.status === "granted"
			);
		})();
	}, []);

	function changeUsername() {
		setError("");
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.update({ username })
			.catch((e: any) => {
				if (e.code === "auth/invalid-email") {
					setError("Email is invalid.");
				} else if (e.code === "auth/missing-password") {
					setError("Password is less than 6 characters.");
				} else if (e.code === "auth/weak-password") {
					setError("Password is less than 6 characters.");
				} else if (e.code === "auth/email-already-in-use") {
					setError("Email is already in use.");
				} else {
					setError(e.code);
				}
			});
	}

	function signOut() {
		firebase.auth().signOut();
	}

	function changePassword() {}
	function changeProfilePic() {
		deleteMedia(currentUser.profilePicURI);
		uploadMedia();
	}
	function toggleIsPT() {}

	return (
		<View style={globalStyles.container}>
			<Text style={globalStyles.logo}>ΛCTIV</Text>
			{error && <DialogBox text={error} icon="alert-circle-outline" />}
			<Image
				source={{
					uri:
						currentUser.profilePicURI ??
						"https://www.gravatar.com/avatar/?d=mp",
				}}
				style={styles.profilePic}
			/>
			<PressableButton
				onPress={changeProfilePic}
				text="Change profile picture"
			/>
			<ValidatedTextField
				placeholder={currentUser.username}
				validRegex={/^[a-z]+$/}
				validationMessage="Username must only have lowercase letters."
				onChangeText={(username: string) => {
					username = username.toLowerCase();
					setUsername(username);
				}}
				iconName="account-outline"
			/>
			<PressableButton onPress={changeUsername} text="Change username" />
			<PressableButton onPress={changePassword} text="Change password" />
			{/* <ValidatedTextField
				placeholder="Password"
				secureTextEntry={true}
				validRegex={/.{6,}/}
				validationMessage="Password must have at least 6 characters."
				textContentType="newPassword"
				onChangeText={(password: string) => {
					setPassword(password);
				}}
				iconName="lock-outline"
			/> */}
			<Toggle
				text="Use as personal trainer"
				iconName="account-supervisor-outline"
				onValueChange={toggleIsPT()}
				value={currentUser.isPT}
			/>
			<PressableButton onPress={signOut} text="Sign out" />
		</View>
	);
}

const styles = StyleSheet.create({
	profilePic: {
		height: 70,
		aspectRatio: 1,
		borderRadius: 5,
		alignSelf: "center",
	},
});
