import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
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

	return (
		user && (
			<View style={styles.userSummary}>
				<Image
					source={{
						uri:
							user.profilePicURI ??
							"https://www.gravatar.com/avatar/?d=mp",
					}}
					style={styles.profilePic}
				/>
				<Text style={styles.username}>{user.username}</Text>
				{props.showLabels && (
					<View style={styles.labels}>
						{props.uid === firebase.auth().currentUser!.uid && (
							<Label text="You" />
						)}
						{user.isPT &&
							(PTs.includes(props.uid) ? (
								<Label text="Your PT" />
							) : (
								<Label text="PT" />
							))}
						{clients.includes(props.uid) && (
							<Label text="Your client" />
						)}
						{following.includes(props.uid) && (
							<Label text="Following" />
						)}
					</View>
				)}
			</View>
		)
	);
}

const styles = StyleSheet.create({
	userSummary: {
		gap: 5,
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	labels: {
		flex: 1,
		gap: 5,
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	username: {
		fontSize: 20,
		fontWeight: "bold",
	},
	profilePic: {
		height: 30,
		aspectRatio: 1,
		borderRadius: 5,
	},
});
