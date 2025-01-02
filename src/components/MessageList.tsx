import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { fetchMessages } from "../../redux/actions";
import globalStyles from "../globalStyles";
import { LoadingIndicator } from "./LoadingIndicator";
import { NoResults } from "./NoResults";

export default function MessageList(props: any) {
	const [messages, setMessages] = useState<any>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		fetchMessages(props.chatID, props.limit, props.order, setMessages);
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser!.uid)
			.collection("chats")
			.doc(props.uid)
			.update({
				lastReadAt: firebase.firestore.FieldValue.serverTimestamp(),
			});
		setIsLoading(false);
	}, [props.chatID]);

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
					<Text
						style={styles.messageText}
						numberOfLines={props.preview ? 1 : undefined}
					>
						{item.text}
					</Text>
				</View>
				<Text style={globalStyles.date}>{item.age}</Text>
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
