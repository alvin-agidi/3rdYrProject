import React from "react";
import { View, Text, Image, FlatList } from "react-native";
import { Video } from "expo-av";
import { connect } from "react-redux";

function ProfileScreen(props) {
	const { currentUser, posts } = props;
	console.log({ currentUser, posts });
	return (
		<View>
			<Text>Profile</Text>
		</View>
	);
}

const mapStateToProps = (store) => ({
	currentUser: store.userState.currentUser,
	posts: store.userState.posts,
});

export default connect(mapStateToProps, null)(ProfileScreen);
