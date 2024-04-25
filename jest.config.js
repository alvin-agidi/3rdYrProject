module.exports = {
	preset: "jest-expo",
	transform: {
		"\\.[jt]sx?$": "babel-jest",
		"\\.[jt]s?$": "babel-jest",
	},
	transformIgnorePatterns: [
		"node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|@react-native-community|expo(nent)?|@expo(nent)?/.*|firebase|@firebase|@react-redux|react-redux|@react-test-renderer|react-test-renderer|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)",
	],
};
