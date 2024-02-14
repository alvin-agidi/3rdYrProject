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

	let uri: string = "";

	if (props.route.params.video) {
		uri = props.route.params.video.uri;
	} else {
		uri = props.route.params.photo.uri;
	}

	async function uploadImage(): Promise<void> {
		const response = await fetch(uri);
		const blob = await response.blob();
		const childPath = `post/${
			firebase.auth().currentUser!.uid
		}/${Math.random().toString(36)}`;
		const task = firebase.storage().ref().child(childPath).put(blob);

		const taskProgress = (snapshot: any) => {
			console.log(`Transferred = ${snapshot.bytesTransferred}`);
		};
		const taskError = (error: any) => {
			console.log(error);
		};
		const taskCompleted = () => {
			task.snapshot.ref.getDownloadURL().then((downloadURL) => {
				savePostData(downloadURL);
				console.log(downloadURL);
			});
		};

		task.on(
			firebase.storage.TaskEvent.STATE_CHANGED,
			taskProgress,
			taskError,
			taskCompleted
		);
	}

	function savePostData(downloadURL: string): void {
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("posts")
			.add({
				downloadURL,
				caption,
				createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			})
			.then(() => {
				navigation.popToTop();
			});
	}

	return (
		<View>
			<Image source={{ uri: uri }} />
			<TextInput
				placeholder="Write a caption..."
				onChangeText={(caption) => {
					setCaption(caption);
				}}
			/>
			<Button title="Publish" onPress={uploadImage} />
		</View>
	);
}
