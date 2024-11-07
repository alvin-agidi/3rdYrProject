import React, { useCallback, useEffect } from "react";
import {
	StyleSheet,
	FlatList,
	TouchableOpacity,
	View,
	Text,
} from "react-native";

export function TextSelect(props: any): JSX.Element {
	useEffect(() => {
		props.onPress();
	}, [props.selected]);

	const renderItem = useCallback(
		({ item, index }: { item: any; index: number }) => (
			<TouchableOpacity
				onPress={() => {
					if (props.multiSelect) {
						props.setSelected((selected: any) => {
							selected.indexOf(index) === -1
								? selected.push(index)
								: selected.splice(selected.indexOf(index), 1);
							return [...selected];
						});
					} else {
						props.setSelected(index);
					}
				}}
			>
				<View
					style={{
						...styles.btn,
						...((props.multiSelect &&
							props.selected.includes(index)) ||
						index === props.selected
							? styles.selected
							: null),
					}}
				>
					<Text style={styles.text}>{item}</Text>
				</View>
			</TouchableOpacity>
		),
		[props.selected]
	);

	return (
		<View style={styles.textSelect}>
			{props.label && <Text style={styles.label}>{props.label}</Text>}
			<FlatList
				{...props}
				horizontal={true}
				numColumns={1}
				data={props.options}
				contentContainerStyle={{
					gap: 5,
				}}
				renderItem={renderItem}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	textSelect: {
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
		borderWidth: 2,
		borderRadius: 5,
		padding: 5,
		backgroundColor: "white",
		borderColor: "lightgrey",
	},
	selected: {
		borderColor: "deepskyblue",
	},
});
