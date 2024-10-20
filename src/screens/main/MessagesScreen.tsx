import React, { useEffect, useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import globalStyles from "../../globalStyles";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { TextField } from "../../components/TextField";
import UserSummary from "../../components/UserSummary";
import MessageList from "../../components/MessageList";
import { useFocusEffect } from "@react-navigation/native";

export default function MessageScreen(props: any) {
	const [text, setText] = useState("");

	function sendMessage() {
		if (text) {
			firebase
				.firestore()
				.collection("chats")
				.doc(props.route.params.chatID)
				.collection("messages")
				.add({
					text,
					createdBy: firebase.auth().currentUser!.uid,
					createdAt: firebase.firestore.FieldValue.serverTimestamp(),
				});
			firebase
				.firestore()
				.collection("chats")
				.doc(props.route.params.chatID)
				.update({
					lastActiveAt:
						firebase.firestore.FieldValue.serverTimestamp(),
				});
		}
	}

	async function update() {
		await firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("chats")
			.doc(props.route.params.uid)
			.update({
				lastReadAt: firebase.firestore.FieldValue.serverTimestamp(),
			});
	}

	useFocusEffect(
		React.useCallback(() => {
			update();
			return () => update();
		}, [])
	);

	return (
		<View style={globalStyles.container}>
			<UserSummary uid={props.route.params.uid} />
			<KeyboardAvoidingView
				style={globalStyles.kav}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 70}
			>
				<MessageList
					chatID={props.route.params.chatID}
					uid={props.route.params.uid}
				/>
				<TextField
					placeholder="Send message"
					iconName="chat-outline"
					multiline={true}
					onChangeText={(text: string) => {
						setText(text);
					}}
					value={text}
					buttonText="Send"
					onPressButton={() => {
						sendMessage();
						setText("");
					}}
				/>
			</KeyboardAvoidingView>
		</View>
	);
}
