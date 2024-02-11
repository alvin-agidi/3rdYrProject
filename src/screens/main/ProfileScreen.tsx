import React from "react";
import { StyleSheet, View, Text, Image, FlatList } from "react-native";
import { Video } from "expo-av";
import { connect } from "react-redux";

function ProfileScreen(props) {
	const { currentUser, posts } = props;
	console.log({ posts });
	return (
		<View style={styles.container}>
			<View style={styles.infoContainer}>
				<Text>{currentUser.username}</Text>
				<Text>{currentUser.email}</Text>
			</View>
			<View style={styles.galleryContainer}>
				<FlatList
					horizontal={false}
					numColumns={3}
					data={posts}
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
