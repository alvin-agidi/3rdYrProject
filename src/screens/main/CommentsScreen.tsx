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
import globalStyles from "../../globalStyles";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { TextField } from "../../components/TextField";
import { useNavigation } from "@react-navigation/native";
import { NoResults } from "../../components/NoResults";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { fetchComments } from "../../../redux/actions";

export default function Comments(props: any) {
	const navigation = useNavigation<any>();
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

	useEffect(() => {
		if (props.route.params.postID !== postID) {
			(async () => {
				setIsLoading(true);
				await fetchComments(
					props.route.params.uid,
					props.route.params.postID,
					setComments
				);
				setIsLoading(false);
				setPostID(props.route.params.postID);
			})();
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
				<NoResults icon="comment-off-outline" text="No comments" />
			),
		[isLoading]
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
