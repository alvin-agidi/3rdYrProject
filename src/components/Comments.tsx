import React, { useCallback, useEffect, useState } from "react";
import {
	FlatList,
	View,
	StyleSheet,
	Text,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
} from "react-native";
import firebase from "firebase/compat/app";
import globalStyles from "../globalStyles";

import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { TextField } from "./TextField";
import { useNavigation } from "@react-navigation/native";
import { NoResults } from "./NoResults";
import { LoadingIndicator } from "./LoadingIndicator";
import { dateToAge } from "../../redux/actions";

export default function Comments(props: any) {
	const navigation = useNavigation();
	const [comments, setComments] = useState<any>([]);
	const [text, setText] = useState("");
	const [postID, setPostID] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	function sendComment() {
		if (text) {
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("posts")
				.doc(props.route.params.postID)
				.collection("comments")
				.add({
					text,
					createdBy: firebase.auth().currentUser!.uid,
					createdAt: firebase.firestore.FieldValue.serverTimestamp(),
				});
			Keyboard.dismiss();
		}
	}

	function fetchUser(uid: string) {
		return new Promise((resolve) => {
			firebase
				.firestore()
				.collection("users")
				.doc(uid)
				.get()
				.then((doc) => {
					const uid = doc.id;
					resolve({ uid, ...doc.data() });
				});
		});
	}

	function fetchCommentCreators(comments: any[]) {
		Promise.all(
			comments.map((comment: any) =>
				fetchUser(comment.createdBy).then((creator) => {
					comment.creator = creator;
				})
			)
		).then(() => {
			setComments(comments);
		});
	}

	useEffect(() => {
		if (props.route.params.postID !== postID) {
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("posts")
				.doc(props.route.params.postID)
				.collection("comments")
				.orderBy("createdAt", "desc")
				.onSnapshot((snapshot) => {
					const comments = snapshot.docs.map((doc) => {
						const data = doc.data();
						const id = doc.id;
						const createdAt = dateToAge(
							(
								data.createdAt ??
								firebase.firestore.Timestamp.now()
							).toDate()
						);
						return { id, ...data, createdAt };
					});
					setIsLoading(true);
					fetchCommentCreators(comments);
					setIsLoading(false);
				});
			setPostID(props.route.params.postID);
		}
	}, [props.route.params.postID]);

	const renderItem = useCallback(
		({ item }) => (
			<View style={styles.comment}>
				<View style={styles.commentText}>
					<Text
						style={globalStyles.bold}
						onPress={() => {
							navigation.popToTop();
							navigation.navigate("Profile", {
								uid: item.creator.uid,
							});
						}}
					>
						{item.creator.username}
					</Text>
					<Text style={styles.commentText}>{item.text}</Text>
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
				<NoResults icon="comment-off-outline" text="No comments" />
			),
		[]
	);
	return (
		<View style={globalStyles.container}>
			<KeyboardAvoidingView
				style={globalStyles.kav}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 70}
			>
				<FlatList
					horizontal={false}
					numColumns={1}
					data={comments}
					contentContainerStyle={{
						gap: 5,
						flexGrow: 1,
					}}
					style={styles.comments}
					renderItem={renderItem}
					ListEmptyComponent={ListEmptyComponent}
				/>
				<TextField
					placeholder="Comment"
					iconName="comment-outline"
					multiline={true}
					onChangeText={(text: string) => {
						setText(text);
					}}
					value={text}
					buttonText="Send"
					onPressButton={() => {
						sendComment();
						setText("");
					}}
				/>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	comments: {
		flex: 1,
		padding: 5,
		backgroundColor: "lightgrey",
		borderRadius: 10,
		alignSelf: "stretch",
	},
	comment: {
		flex: 1,
		padding: 5,
		borderRadius: 5,
		gap: 5,
		backgroundColor: "white",
	},
	commentText: {
		flex: 1,
		flexDirection: "row",
		gap: 5,
	},
});
