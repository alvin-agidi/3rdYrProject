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
import UserSummary from "../../components/UserSummary";
import { fetchMessages } from "../../../redux/actions";

export default function ChatScreen(props: any) {
	const [messages, setMessages] = useState<any>([]);
	const [text, setText] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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
		}
	}

	useEffect(() => {
		setIsLoading(true);
		fetchMessages(props.route.params.chatID, setMessages);
		setIsLoading(false);
	}, []);

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
		[isLoading]
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
