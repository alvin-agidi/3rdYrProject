import React, { useState } from "react";
import { View, TextInput, Image, Button } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import { useNavigation } from "@react-navigation/core";

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
			.then(() => {
				navigation.popToTop();
			});
	}

	return (
		<View>
			<Image source={{ uri: mediaUri }} />
			<TextInput
				placeholder="Write a caption..."
				onChangeText={(caption) => {
					setCaption(caption);
				}}
			/>
			<Button title="Publish" onPress={uploadMedia} />
		</View>
	);
}
