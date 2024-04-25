import React, { useCallback } from "react";
import {
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import globalStyles from "../globalStyles";
import { Label } from "./Label";
import { useNavigation } from "@react-navigation/native";
import { LoadingIndicator } from "./LoadingIndicator";
import { NoResults } from "./NoResults";
import { dateToAge } from "../../redux/actions";

export function PostSummaryList(props: any) {
	const navigation = useNavigation<any>();

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
				<View style={styles.post}>
					<Image
						source={{
							uri: post.isVideo
								? post.thumbnailURI
								: post.mediaURL,
						}}
						style={styles.image}
					/>
					<View style={styles.postDesc}>
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
						<Text style={globalStyles.date}>{post.createdAt}</Text>
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
				<NoResults icon="image-off-outline" text="No posts" />
			),
		[props.isLoading]
	);

	return (
		<FlatList
			horizontal={false}
			numColumns={1}
			data={props.posts}
			contentContainerStyle={{
				gap: 2,
				flexGrow: 1,
			}}
			style={styles.posts}
			renderItem={renderItem}
			ListEmptyComponent={ListEmptyComponent}
		/>
	);
}

const styles = StyleSheet.create({
	image: {
		aspectRatio: 1,
		borderRadius: 5,
		width: 100,
	},
	posts: {
		flex: 1,
		borderRadius: 10,
		gap: 2,
		backgroundColor: "lightgrey",
	},
	post: {
		padding: 5,
		gap: 5,
		flexDirection: "row",
		backgroundColor: "white",
	},
	postDesc: {
		flex: 1,
		gap: 5,
		justifyContent: "space-between",
	},
	caption: {
		flex: 1,
	},
});
