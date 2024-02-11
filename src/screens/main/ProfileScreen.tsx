import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";
import { Video } from "expo-av";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

function ProfileScreen(props) {
	const [userPosts, setUserPosts] = useState([]);
	const [user, setUser] = useState();
	const [isFollowing, setIsFollowing] = useState(false);

	useEffect(() => {
		const { currentUser, posts } = props;

		if (props.route.params.uid === firebase.auth().currentUser!.uid) {
			setUser(currentUser);
			setUserPosts(posts);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.get()
				.then((snapshot) => {
					if (snapshot.exists) {
						setUser(snapshot.data());
					} else {
						console.log("User does not exist");
					}
				});
			firebase
				.firestore()
				.collection("posts")
				.doc(props.route.params.uid)
				.collection("userPosts")
				.orderBy("createdAt", "asc")
				.get()
				.then((snapshot) => {
					let posts = snapshot.docs.map((doc) => {
						const id = doc.id;
						const data = doc.data();
						const createdAt = data.createdAt.toDate().toISOString();
						return { id, ...data, createdAt };
					});
					setUserPosts(posts);
				});
		}
	}, [props.route.params.uid]);

	function toggleFollow() {
		if (isFollowing) {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("following")
				.doc(props.route.params.uid)
				.delete();
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("followedBy")
				.doc(firebase.auth().currentUser!.uid)
				.delete();
			setIsFollowing(false);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(firebase.auth().currentUser!.uid)
				.collection("following")
				.doc(props.route.params.uid)
				.set({});
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.collection("followedBy")
				.doc(firebase.auth().currentUser!.uid)
				.set({});
			setIsFollowing(true);
		}
	}

	if (user === undefined) return <View />;
	return (
		<View style={styles.container}>
			<View style={styles.infoContainer}>
				<Text>{user.username}</Text>
				<Text>{user.email}</Text>
				{props.route.params.uid !== firebase.auth().currentUser!.uid ? (
					<Button
						onPress={() => {
							toggleFollow();
						}}
						title={isFollowing ? "Unfollow" : "Follow"}
					/>
				) : null}
			</View>
			<View style={styles.galleryContainer}>
				<FlatList
					horizontal={false}
					numColumns={3}
					data={userPosts}
					renderItem={({ item }) => (
						<View style={styles.imageContainer}>
							<Image
								source={{ uri: item.downloadURL }}
								style={styles.image}
							/>
						</View>
					)}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 0,
	},
	infoContainer: {
		margin: 0,
	},
	galleryContainer: {
		margin: 0,
	},
	imageContainer: {
		flex: 1 / 3,
	},
	image: {
		flex: 1,
		aspectRatio: 1 / 1,
	},
});

const mapStateToProps = (store) => ({
	currentUser: store.userState.currentUser,
	posts: store.userState.posts,
});

export default connect(mapStateToProps, null)(ProfileScreen);
