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
		flex: 1,
		paddingTop: 10,
		paddingBottom: 10,
	},
	button: {
		borderRadius: 5,
		padding: 10,
		backgroundColor: "deepskyblue",
		alignItems: "center",
		justifyContent: "center",
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
	date: {
		alignSelf: "flex-end",
		textAlign: "right",
		justifyContent: "flex-end",
		color: "grey",
	},
	bold: {
		fontSize: 15,
		fontWeight: "bold",
	},
	labelList: {
		gap: 5,
		flexDirection: "row",
		flexWrap: "wrap",
	},
	kav: {
		flex: 1,
		gap: 10,
		alignItems: "center",
		alignSelf: "stretch",
	},
});
