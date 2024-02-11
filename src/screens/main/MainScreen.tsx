import { StyleSheet, View, Text } from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUser, fetchUserPosts } from "../../../redux/actions";
import EmptyScreen from "./EmptyScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Tab = createBottomTabNavigator();

export class Main extends Component {
	componentDidMount() {
		this.props.fetchUser();
		this.props.fetchUserPosts();
	}

	render() {
		const { currentUser } = this.props;
		if (currentUser == undefined) {
			return (
				<View style={styles.container}>
					<Text>User is not signed in.</Text>
				</View>
			);
		}
		return (
			<Tab.Navigator
				initialRouteName="Feed"
				screenOptions={{ tabBarShowLabel: false }}
			>
				<Tab.Screen
					name="FeedTab"
					component={EmptyScreen}
					listeners={({ navigation }) => ({
						tabPress: (event) => {
							event.preventDefault();
							navigation.navigate("Feed");
						},
					})}
					options={{
						tabBarIcon: ({ iconColour, iconSize }) => (
							<Icon
								name="home-outline"
								color={iconColour}
								size={iconSize}
							/>
						),
					}}
				/>
				<Tab.Screen
					name="SearchTab"
					component={EmptyScreen}
					listeners={({ navigation }) => ({
						tabPress: (event) => {
							event.preventDefault();
							navigation.navigate("Search");
						},
					})}
					options={{
						tabBarIcon: ({ iconColour, iconSize }) => (
							<Icon
								name="magnify"
								color={iconColour}
								size={iconSize}
							/>
						),
					}}
				/>
				<Tab.Screen
					name="CameraTab"
					component={EmptyScreen}
					listeners={({ navigation }) => ({
						tabPress: (event) => {
							event.preventDefault();
							navigation.navigate("Camera");
						},
					})}
					options={{
						tabBarIcon: ({ iconColour, iconSize }) => (
							<Icon
								name="camera-plus-outline"
								color={iconColour}
								size={iconSize}
							/>
						),
					}}
				/>
				<Tab.Screen
					name="ProfileTab"
					component={EmptyScreen}
					listeners={({ navigation }) => ({
						tabPress: (event) => {
							event.preventDefault();
							navigation.navigate("Profile");
						},
					})}
					options={{
						tabBarIcon: ({ iconColour, iconSize }) => (
							<Icon
								name="account-outline"
								color={iconColour}
								size={iconSize}
							/>
						),
					}}
				/>
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
	bindActionCreators({ fetchUser, fetchUserPosts }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Main);
