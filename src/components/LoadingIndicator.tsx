import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingIndicator(props: any): JSX.Element {
	return (
		<View style={styles.loadingIndicator}>
			<ActivityIndicator
				{...props}
				animating={true}
				color="white"
				size="large"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	loadingIndicator: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
