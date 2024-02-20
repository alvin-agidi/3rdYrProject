import { StyleSheet } from "react-native";

export default StyleSheet.create({
	form: {
		flex: 1,
		padding: 10,
		gap: 10,
		alignItems: "center",
	},
	textInput: {
		padding: 10,
		fontSize: 15,
		borderRadius: 5,
		backgroundColor: "skyblue",
		color: "white",
		alignSelf: "stretch",
	},
	button: {
		borderRadius: 5,
		padding: 10,
		backgroundColor: "deepskyblue",
		alignItems: "center",
		width: "auto",
	},
	buttonText: {
		fontSize: 15,
		color: "white",
		fontWeight: "bold",
	},
	logo: {
		fontSize: 70,
		fontWeight: "bold",
		color: "deepskyblue",
	},
});
