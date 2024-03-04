import React, { useState } from "react";
import {
	StyleSheet,
	Image,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/core";
import { PressableButton } from "../../components/PressableButton";
import globalStyles from "../../globalStyles";
import { ResizeMode, Video } from "expo-av";
import { TextField } from "../../components/TextField";
import { detectorURL } from "../../config";

async function detectExercises(videoURL: string) {
	return await fetch(detectorURL, {
		method: "POST",
		mode: "cors",
		headers: {
			"ngrok-skip-browser-warning": "1",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			videoURL,
		}),
	}).catch((error: any) => {
		console.error("Error:", error);
	});
}

export default function PublishPost(props: any) {
	const navigation = useNavigation();
	const [caption, setCaption] = useState("");

	const isVideo = props.route.params.isVideo;
	const mediaUri = props.route.params.media.uri;

	async function uploadMedia(): Promise<void> {
		const response = await fetch(mediaUri);
		const blob = await response.blob();
		const childPath = `${
			firebase.auth().currentUser!.uid
		}/posts/${Math.random().toString(36)}`;
		const task = firebase.storage().ref().child(childPath).put(blob);

		const taskProgress = (snapshot: any) => {
			console.log(`Transferred = ${snapshot.bytesTransferred}`);
		};
		const taskError = (error: any) => {
			console.log(error);
		};
		const taskCompleted = () => {
			task.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
				savePostData(downloadURL);
			});
		};

		task.on(
			firebase.storage.TaskEvent.STATE_CHANGED,
			taskProgress,
			taskError,
			taskCompleted
		);
	}

	function savePostData(mediaURL: string): void {
		navigation.popToTop();
		navigation.navigate("Your Profile", {
			uid: firebase.auth().currentUser!.uid,
		});
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("posts")
			.add({
				mediaURL,
				isVideo,
				caption,
				exercisesDetected: false,
				createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			})
			.then((doc) => {
				if (isVideo) {
					detectExercises(mediaURL).then((response) => {
						console.log(response);
						if (response && response.ok) {
							response.json().then((exercises) => {
								console.log(exercises);
								if (exercises) {
									firebase
										.firestore()
										.collection("users")
										.doc(firebase.auth().currentUser!.uid)
										.collection("posts")
										.doc(doc.id)
										.set(
											{ exercisesDetected: true },
											{ merge: true }
										);
								}
								for (const exercise of exercises) {
									firebase
										.firestore()
										.collection("users")
										.doc(firebase.auth().currentUser!.uid)
										.collection("posts")
										.doc(doc.id)
										.collection("exercises")
										.add({
											exercise: exercise.exercise,
										});
								}
							});
						}
					});
				}
			});
	}

	return (
		<KeyboardAvoidingView
			style={globalStyles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 70}
		>
			{isVideo ? (
				<Video
					style={styles.media}
					source={{ uri: mediaUri }}
					useNativeControls
					resizeMode={ResizeMode.CONTAIN}
					isLooping
					shouldPlay
				/>
			) : (
				<Image source={{ uri: mediaUri }} style={styles.media} />
			)}
			<TextField
				placeholder="Write a caption"
				onChangeText={(caption: string) => {
					setCaption(caption);
				}}
				style={globalStyles.textInput}
				iconName="comment-outline"
			/>
			<PressableButton onPress={uploadMedia} text="Publish" />
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	media: {
		flex: 1,
		alignSelf: "stretch",
		borderRadius: 5,
	},
});
