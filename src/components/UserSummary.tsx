import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { Label } from "./Label";
import { useSelector } from "react-redux";
import { fetchUser } from "../../redux/actions";

export default function UserSummary(props: any) {
	const [user, setUser] = useState<any>();
	const currentUser = useSelector(
		(state: any) => state.userState.currentUser
	);
	const following = useSelector((state: any) => state.userState.following);
	const clients = useSelector((state: any) => state.userState.clients);
	const PTs = useSelector((state: any) => state.userState.PTs);

	async function getUser(): Promise<void> {
		if (props.uid === firebase.auth().currentUser!.uid) {
			setUser(currentUser);
		} else {
			setUser(await fetchUser(props.uid));
		}
	}

	useEffect(() => {
		getUser();
	}, [props.uid, currentUser]);

	return user ? (
		<View style={styles.usernameBox}>
			<Text style={styles.username}>{user.username}</Text>
			{props.uid === firebase.auth().currentUser!.uid ? (
				<Label text="You" />
			) : null}
			{user.isPT ? (
				PTs.includes(props.uid) ? (
					<Label text="Your PT" />
				) : (
					<Label text="PT" />
				)
			) : null}
			{clients.includes(props.uid) ? <Label text="Your client" /> : null}
			{following.includes(props.uid) ? <Label text="Following" /> : null}
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
