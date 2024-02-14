import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";
import { Video } from "expo-av";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

function FeedScreen(props: any) {
	const [posts, setPosts] = useState<any>([]);

	useEffect(() => {
		let posts: any = [];
		if (props.usersLoaded == props.following.length) {
			for (const uid of props.following) {
				// const user = props.users.find((u: any) => {
				// 	u && u.uid == uid;
				// });
				const user = props.users[0];
				// console.log("user = " + user.username);
				if (user != undefined) {
					posts.push(...user.posts);
				}
			}
			posts.sort((x: any, y: any) => {
				return x.createdAt - y.createdAt;
			});
			setPosts(posts);
		}
	}, [props.usersLoaded]);

	return (
		<View style={styles.container}>
			<FlatList
				horizontal={false}
				numColumns={1}
				data={posts}
				renderItem={({ item }) => (
					<View style={styles.postContainer}>
						<Image
							source={{ uri: item.downloadURL }}
							style={styles.image}
						/>
						<Text>{item.user.username}</Text>
						<Text>{item.caption}</Text>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 0,
	},
	postContainer: {
		flex: 1,
		margin: 0,
	},
	image: {
		flex: 1,
		aspectRatio: 1 / 1,
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	users: store.usersState.users,
	usersLoaded: store.usersState.usersLoaded,
});

export default connect(mapStateToProps, null)(FeedScreen);
