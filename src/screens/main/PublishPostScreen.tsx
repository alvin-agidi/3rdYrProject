import React, { useState } from "react";
import { StyleSheet, View, TextInput, Image } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/core";
import { PressableButton } from "../../components/PressableButton";
import globalStyles from "../../styles";
import { ResizeMode, Video } from "expo-av";

async function detectExercises(videoURL: string) {
	return await fetch("http://143.47.229.158:5000/detectExercises", {
		method: "POST",
		mode: "cors",
		headers: {
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
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("posts")
			.add({
				mediaURL,
				isVideo,
				caption,
				createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			})
			.then((doc) => {
				if (isVideo) {
					detectExercises(mediaURL).then((response) => {
						firebase
							.firestore()
							.collection("users")
							.doc(firebase.auth().currentUser!.uid)
							.collection("posts")
							.doc(doc.id)
							.set(
								{ exercises: JSON.stringify(response) },
								{ merge: true }
							);
					});
				}
				// navigation.popToTop();
				navigation.navigate("Profile", {
					uid: firebase.auth().currentUser!.uid,
				});
			});
	}

	return (
		<View style={styles.container}>
			<TextInput
				placeholder="Write a caption..."
				onChangeText={(caption) => {
					setCaption(caption);
				}}
				style={globalStyles.textInput}
			/>
			<PressableButton onPress={uploadMedia} text="Publish" />

			{isVideo ? (
				<Video
					style={styles.media}
					source={{ uri: mediaUri }}
					useNativeControls
					resizeMode={ResizeMode.CONTAIN}
					isLooping
				/>
			) : (
				<Image source={{ uri: mediaUri }} style={styles.media} />
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 10,
		padding: 10,
	},
	media: {
		flex: 1,
		alignSelf: "stretch",
		borderRadius: 5,
	},
});
