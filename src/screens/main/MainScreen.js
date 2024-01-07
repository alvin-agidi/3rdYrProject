import { StyleSheet, View, Text } from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUser } from "../../../redux/actions";

export class Main extends Component {
	componentDidMount() {
		this.props.fetchUser();
	}

	render() {
		const { currentUser } = this.props;
		console.log(currentUser);
		if (currentUser == undefined) {
			return (
				<View style={styles.container}>
					<Text>User is not signed in.</Text>
				</View>
			);
		}
		return (
			<Tab.Navigator>
				<Tab.Screen name="Home" component={HomeScreen} />
			</Tab.Navigator>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f00",
		alignItems: "center",
		justifyContent: "center",
	},
});

const mapStateToProps = (store) => ({
	currentUser: store.userState.currentUser,
});

const mapDispatchProps = (dispatch) =>
	bindActionCreators({ fetchUser }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Main);
