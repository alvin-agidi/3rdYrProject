import React, { useCallback, useEffect, useState } from "react";
import {
	FlatList,
	View,
	StyleSheet,
	Text,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import globalStyles from "../../globalStyles";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { TextField } from "../../components/TextField";
import { NoResults } from "../../components/NoResults";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import UserSummary from "./UserSummary";

export default function ChatScreen(props: any) {
	const [messages, setMessages] = useState<any>([]);
	const [text, setText] = useState("");
	const [chatID, setChatID] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	function sendMessage() {
		if (text) {
			firebase
				.firestore()
				.collection("chats")
				.doc(chatID)
				.collection("messages")
				.add({
					text,
					createdBy: firebase.auth().currentUser!.uid,
					createdAt: firebase.firestore.FieldValue.serverTimestamp(),
				});
		}
	}

	function fetchChatID() {
		return new Promise((resolve) => {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("chats")
				.doc(props.route.params.uid)
				.get()
				.then((doc) => {
					resolve(setChatID(doc!.data()!.chatID));
				})
				.catch(() => {
					firebase
						.firestore()
						.collection("chats")
						.add({})
						.then((doc) => {
							resolve(setChatID(doc.id));
							firebase
								.firestore()
								.collection("users")
								.doc(firebase.auth().currentUser!.uid)
								.collection("chats")
								.doc(props.route.params.uid)
								.set({ chatID: doc.id });
							firebase
								.firestore()
								.collection("users")
								.doc(props.route.params.uid)
								.collection("chats")
								.doc(firebase.auth().currentUser!.uid)
								.set({ chatID: doc.id });
						});
				});
		});
	}

	function fetchMessages() {
		return new Promise((resolve) => {
			if (chatID) {
				firebase
					.firestore()
					.collection("chats")
					.doc(chatID)
					.collection("messages")
					.orderBy("createdAt", "asc")
					.onSnapshot((snapshot) => {
						const messages = snapshot.docs.map((doc) => {
							const data = doc.data();
							const id = doc.id;
							const createdAt = (
								data.createdAt ??
								firebase.firestore.Timestamp.now()
							)
								.toDate()
								.toLocaleString();
							return { id, ...data, createdAt };
						});
						resolve(setMessages(messages));
					});
			} else {
				resolve(null);
			}
		});
	}

	useEffect(() => {
		setIsLoading(true);
		fetchMessages();
		setIsLoading(false);
	}, [chatID]);

	useEffect(() => {
		// fetchUser();
		fetchChatID();
	}, [props.route.params.uid]);

	const renderItem = useCallback(
		({ item }) => (
			<View
				style={{
					...styles.message,
					...(item.createdBy === firebase.auth().currentUser!.uid
						? styles.myMessage
						: styles.theirMessage),
				}}
			>
				<View style={styles.messageText}>
					<Text style={styles.messageText}>{item.text}</Text>
				</View>
				<Text style={globalStyles.date}>{item.createdAt}</Text>
			</View>
		),
		[]
	);

	const ListEmptyComponent = useCallback(
		() =>
			isLoading ? (
				<LoadingIndicator />
			) : (
				<NoResults icon="chat-outline" text="Send a message" />
			),
		[]
	);

	return (
		<View style={globalStyles.container}>
			<UserSummary uid={props.route.params.uid} />
			<KeyboardAvoidingView
				style={globalStyles.kav}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 70}
			>
				<FlatList
					horizontal={false}
					numColumns={1}
					data={messages}
					contentContainerStyle={{
						gap: 5,
						flexGrow: 1,
					}}
					style={styles.messages}
					renderItem={renderItem}
					ListEmptyComponent={ListEmptyComponent}
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

const styles = StyleSheet.create({
	messages: {
		flex: 1,
		padding: 5,
		backgroundColor: "lightgrey",
		borderRadius: 10,
		alignSelf: "stretch",
	},
	message: {
		flex: 1,
		padding: 5,
		borderRadius: 5,
		gap: 5,
		maxWidth: "75%",
		flexWrap: "wrap",
		backgroundColor: "white",
	},
	theirMessage: {
		alignSelf: "flex-start",
	},
	myMessage: {
		alignSelf: "flex-end",
	},
	messageText: {
		flexShrink: 1,
		flexDirection: "row",
	},
});
