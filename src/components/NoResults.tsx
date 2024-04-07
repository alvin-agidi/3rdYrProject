import { View, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export function NoResults(props: any): JSX.Element {
	return (
		<View style={styles.noResults}>
			<Icon name={props.icon} size={50} color="white" />
			<Text style={styles.noResultsText}>{props.text}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	noResults: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		margin: 10,
	},
	noResultsText: {
		textAlign: "center",
		color: "white",
		fontSize: 25,
		fontWeight: "bold",
	},
});
