import React from "react";
import SignInScreen from "./src/screens/landing/SignInScreen";
import renderer from "react-test-renderer";

test("renders correctly", () => {
	const tree = renderer.create(<SignInScreen />).toJSON();
	expect(tree).toMatchSnapshot();
});
