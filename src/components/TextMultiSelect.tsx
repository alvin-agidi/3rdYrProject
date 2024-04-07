import React, { useEffect } from "react";
import {
	StyleSheet,
	FlatList,
	TouchableOpacity,
	View,
	Text,
} from "react-native";

export function TextMultiSelect(props: any): JSX.Element {
	useEffect(() => {
		props.onPress();
	}, [props.selected]);

	return (
		<View style={styles.textMultiSelect}>
			{props.label ? (
				<Text style={styles.label}>{props.label}</Text>
			) : null}
			<FlatList
				{...props}
				horizontal={true}
				numColumns={1}
				data={props.options}
				extraData={props.selected}
				contentContainerStyle={{
					gap: 5,
				}}
				renderItem={({ item, index }) => (
					<TouchableOpacity
						onPress={() => {
							props.setSelected((selected: any) => {
								selected.indexOf(index) === -1
									? selected.push(index)
									: selected.splice(
											selected.indexOf(index),
											1
									  );
								return [...selected];
							});
						}}
					>
						<View
							style={{
								...styles.btn,
								...(props.selected.includes(index)
									? styles.selected
									: null),
							}}
						>
							<Text style={styles.text}>{item}</Text>
						</View>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	textMultiSelect: {
		backgroundColor: "white",
		padding: 5,
		borderRadius: 10,
		gap: 5,
		flexDirection: "row",
		alignItems: "center",
	},
	label: {
		fontSize: 15,
		fontWeight: "bold",
		color: "deepskyblue",
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
