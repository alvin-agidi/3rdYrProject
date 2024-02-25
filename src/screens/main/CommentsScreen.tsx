import React, { useEffect, useState } from "react";
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
import globalStyles from "../../globalStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { TextField } from "../../components/TextField";
import { PressableButton } from "../../components/PressableButton";
import { useNavigation } from "@react-navigation/native";

export default function Comments(props: any) {
	const navigation = useNavigation();
	const [comments, setComments] = useState<any>([]);
	const [text, setText] = useState("");
	const [postID, setPostID] = useState("");

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
				.onSnapshot((doc) => {
					const uid = doc.id;
					resolve({ uid, ...doc.data() });
				});
		});
	}

	useEffect(() => {
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
					var comments = snapshot.docs.map((doc) => {
						const data = doc.data();
						const id = doc.id;
						var createdAt = (
							data.createdAt
								? data.createdAt
								: firebase.firestore.Timestamp.now()
						)
							.toDate()
							.toLocaleString();
						return { id, ...data, createdAt };
					});
					fetchCommentCreators(comments);
				});
			setPostID(props.route.params.postID);
		}
	}, [props.route.params.postID]);
	return (
		<KeyboardAvoidingView
			style={globalStyles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 70}
		>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={comments}
				contentContainerStyle={{
					gap: 5,
				}}
				style={styles.comments}
				renderItem={({ item }) => (
					<View style={styles.comment}>
						<View style={styles.commentInfo}>
							<Text
								style={styles.username}
								onPress={() => {
									navigation.popToTop();
									navigation.navigate("Profile1", {
										uid: item.creator.uid,
									});
								}}
							>
								{item.creator.username}
							</Text>
							<Text>{item.text}</Text>
						</View>
						<Text>{item.createdAt}</Text>
					</View>
				)}
				ListEmptyComponent={() => (
					<View style={styles.noResults}>
						<Icon
							name="comment-off-outline"
							size={80}
							color="white"
						/>
						<Text style={styles.noResultsText}>No comments</Text>
					</View>
				)}
			/>
			<TextField
				placeholder="Comment"
				iconName="comment-outline"
				onChangeText={(text: string) => {
					setText(text);
				}}
			/>
			<PressableButton text="Send" onPress={sendComment} />
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	noResults: {
		flex: 1,
		alignSelf: "stretch",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 250,
	},
	comments: {
		flex: 1,
		padding: 5,
		backgroundColor: "lightgrey",
		borderRadius: 10,
		alignSelf: "stretch",
	},
	comment: {
		padding: 5,
		borderRadius: 5,
		backgroundColor: "white",
	},
	noResultsText: {
		color: "white",
		fontSize: 50,
		fontWeight: "bold",
	},
	username: {
		fontSize: 15,
		// padding: 10,
		fontWeight: "bold",
	},
	commentInfo: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-start",
		gap: 5,
		alignContent: "center",
	},
});
