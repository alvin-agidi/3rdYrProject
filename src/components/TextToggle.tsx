import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	FlatList,
	TouchableOpacity,
	View,
	Text,
} from "react-native";

export function TextToggle(props: any): JSX.Element {
	useEffect(() => {
		props.onPress();
	}, [props.selected]);

	return (
		<FlatList
			{...props}
			horizontal={true}
			numColumns={1}
			data={props.options}
			contentContainerStyle={{
				gap: 5,
			}}
			style={styles.textToggle}
			renderItem={({ item, index }) => (
				<TouchableOpacity
					onPress={() => {
						props.setSelected(index);
					}}
				>
					<View
						style={{
							...styles.btn,
							...(index == props.selected
								? styles.selected
								: null),
						}}
					>
						<Text style={styles.text}>{item}</Text>
					</View>
				</TouchableOpacity>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	textToggle: {
		backgroundColor: "white",
		padding: 5,
		borderRadius: 10,
		flexGrow: 0,
	},
	text: {
		fontSize: 15,
		fontWeight: "bold",
	},
	btn: {
		fontSize: 20,
		borderColor: "lightgrey",
		borderWidth: 2,
		borderRadius: 5,
		padding: 5,
		backgroundColor: "white",
	},
	selected: {
		borderColor: "deepskyblue",
	},
});
