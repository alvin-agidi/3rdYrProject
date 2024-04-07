import React, { useCallback } from "react";
import {
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
	StyleSheet,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import globalStyles from "../../globalStyles";
import { Label } from "../../components/Label";
import { useNavigation } from "@react-navigation/native";
import { LoadingIndicator } from "../../components/LoadingIndicator";

export function PostSummaryList(props: any) {
	const navigation = useNavigation();

	const renderItem = useCallback(
		({ item: post }) => (
			<TouchableOpacity
				onPress={() => {
					navigation.navigate("Post", {
						uid: post.uid,
						postID: post.id,
					});
				}}
			>
				<View style={styles.highlightPost}>
					<Image
						source={{
							uri: post.isVideo
								? post.thumbnailURI
								: post.mediaURL,
						}}
						style={styles.image}
					/>
					<View style={styles.highlightPostDesc}>
						<Text style={styles.caption}>{post.caption}</Text>
						<FlatList
							horizontal={false}
							numColumns={1}
							data={post.exercises}
							contentContainerStyle={{
								gap: 5,
							}}
							style={globalStyles.labelList}
							renderItem={({ item: exercise }) => (
								<Label text={exercise.exercise} />
							)}
						/>
						<Text style={globalStyles.date}>
							{post.createdAt.toLocaleString()}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		),
		[props.posts]
	);

	const ListEmptyComponent = useCallback(
		() =>
			props.isLoading ? (
				<LoadingIndicator />
			) : (
				<View style={globalStyles.noResults}>
					<Icon name="image-off-outline" size={80} color="white" />
					<Text style={globalStyles.noResultsText}>No posts</Text>
				</View>
			),
		[props.isLoading]
	);

	return (
		<FlatList
			horizontal={false}
			numColumns={1}
			data={props.posts}
			contentContainerStyle={{
				gap: 5,
				flexGrow: 1,
			}}
			style={styles.highlightPosts}
			renderItem={renderItem}
			ListEmptyComponent={ListEmptyComponent}
		/>
	);
}

const styles = StyleSheet.create({
	image: {
		aspectRatio: 1 / 1,
		borderRadius: 5,
		width: 100,
	},
	highlightPosts: {
		flex: 1,
		alignSelf: "stretch",
		borderRadius: 10,
		backgroundColor: "lightgrey",
	},
	highlightPost: {
		padding: 5,
		gap: 5,
		flexDirection: "row",
		backgroundColor: "white",
	},
	highlightPostDesc: {
		flex: 1,
		gap: 5,
		justifyContent: "space-between",
	},
	caption: {
		flex: 1,
	},
});
