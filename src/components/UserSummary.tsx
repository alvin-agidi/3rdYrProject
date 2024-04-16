import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { Label } from "./Label";
import { connect } from "react-redux";

function UserSummary(props: any) {
	const [user, setUser] = useState<any>();

	function getUser(): void {
		if (props.uid === firebase.auth().currentUser!.uid) {
			setUser(props.currentUser);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(props.uid)
				.get()
				.then((doc) => {
					setUser(doc.data());
				});
		}
	}

	useEffect(() => {
		getUser();
	}, [props.uid]);

	return user ? (
		<View style={styles.usernameBox}>
			<Text style={styles.username}>{user.username}</Text>
			{props.uid === firebase.auth().currentUser!.uid ? (
				<Label text="You" />
			) : null}
			{user.isPT ? (
				props.PTs.includes(props.uid) ? (
					<Label text="Your PT" />
				) : (
					<Label text="PT" />
				)
			) : null}
			{props.clients.includes(props.uid) ? (
				<Label text="Your client" />
			) : null}

			{props.following.includes(props.uid) ? (
				<Label text="Following" />
			) : null}
		</View>
	) : null;
}

const styles = StyleSheet.create({
	usernameBox: {
		gap: 5,
		flexDirection: "row",
	},
	username: {
		flex: 1,
		fontSize: 30,
		fontWeight: "bold",
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	posts: store.userState.posts,
	following: store.userState.following,
	followers: store.userState.followers,
	clients: store.userState.clients,
	PTs: store.userState.PTs,
});

export default connect(mapStateToProps, null)(UserSummary);
