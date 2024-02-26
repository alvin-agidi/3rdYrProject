import { StyleSheet } from "react-native";

export default StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
		gap: 10,
		alignItems: "center",
	},
	textInput: {
		padding: 10,
		fontSize: 15,
		borderRadius: 5,
		backgroundColor: "white",
		borderColor: "skyblue",
		borderWidth: 2,
		alignSelf: "stretch",
		flex: 1,
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