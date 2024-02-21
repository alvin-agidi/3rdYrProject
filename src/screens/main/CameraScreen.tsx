import { Camera, CameraType, AutoFocus } from "expo-camera";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import { Component, useEffect, useRef, useState } from "react";
import { shareAsync } from "expo-sharing";
import { Video, ResizeMode } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PublishPostScreen from "./PublishPostScreen";
import { connect } from "react-redux";
import { PressableButton } from "../../components/PressableButton";

const Stack = createNativeStackNavigator();

function CameraComponent() {
	const navigation = useNavigation();
	var cameraRef = useRef();
	const [cameraDirection, setCameraDirection] = useState(CameraType.back);
	const [isVideoMode, setVideoMode] = useState(true);
	const [hasCameraPermission, setHasCameraPermission] = useState(false);
	const [hasMicrophonePermission, setHasMicrophonePermission] =
		useState(false);
	const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
		useState(false);
	const [hasImagePickerPermission, setHasImagePickerPermission] =
		useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [media, setMedia] = useState();

	useEffect(() => {
		(async () => {
			const cameraPermission =
				await Camera.requestCameraPermissionsAsync();
			const microphonePermission =
				await Camera.requestMicrophonePermissionsAsync();
			const mediaLibraryPermission =
				await MediaLibrary.requestPermissionsAsync();
			const imagePickerPermission =
				await ImagePicker.requestMediaLibraryPermissionsAsync();

			setHasCameraPermission(cameraPermission.status === "granted");
			setHasMicrophonePermission(
				microphonePermission.status === "granted"
			);
			setHasMediaLibraryPermission(
				mediaLibraryPermission.status === "granted"
			);
			setHasImagePickerPermission(
				imagePickerPermission.status === "granted"
			);
		})();
	}, []);

	if (
		hasCameraPermission === undefined ||
		hasMicrophonePermission === undefined
	) {
		return <Text>Requestion permissions...</Text>;
	} else if (!hasCameraPermission) {
		return <Text>Permission for camera not granted.</Text>;
	}

	function startVideo(): void {
		setIsRecording(true);
		var options = {
			quality: "1080p",
			maxDuration: 60,
			mute: false,
		};

		cameraRef.current.recordAsync(options).then((recordedVideo: any) => {
			setMedia(recordedVideo);
			setIsRecording(false);
		});
	}

	function stopVideo(): void {
		setIsRecording(false);
		cameraRef.current.stopRecording();
	}

	function takePhoto(): void {
		var options = {
			quality: 1,
			base64: true,
			exif: false,
		};

		cameraRef.current.takePictureAsync(options).then((newPhoto: any) => {
			setMedia(newPhoto);
		});
	}

	function pickMedia(): void {
		ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		}).then((media: any) => {
			if (!media.canceled) {
				setMedia(media.assets[0]);
			}
		});
	}

	function switchCameraDirection() {
		setCameraDirection((direction) =>
			direction === CameraType.back ? CameraType.front : CameraType.back
		);
	}

	function switchVideoMode() {
		setVideoMode((mode) => (mode ? false : true));
	}

	function shareMedia(): void {
		shareAsync(media.uri).then(() => {
			setMedia(undefined);
		});
	}

	function saveMedia(): void {
		MediaLibrary.saveToLibraryAsync(media.uri).then(() => {
			setMedia(undefined);
		});
	}

	if (media) {
		return (
			<View style={styles.container}>
				{isVideoMode ? (
					<Video
						style={styles.media}
						source={{ uri: media.uri }}
						useNativeControls
						resizeMode={ResizeMode.CONTAIN}
						isLooping
						shouldPlay
					/>
				) : (
					<Image style={styles.media} source={{ uri: media.uri }} />
				)}
				<View style={styles.iconBox}>
					<Icon
						name="export-variant"
						size={50}
						onPress={shareMedia}
					/>
					{hasMediaLibraryPermission ? (
						<Icon
							name="content-save-outline"
							size={50}
							onPress={saveMedia}
						/>
					) : undefined}
					<Icon
						name="trash-can-outline"
						size={50}
						onPress={() => setMedia(undefined)}
					/>
				</View>
				<PressableButton
					text="Create post"
					onPress={() =>
						navigation.navigate("Publish Post", {
							media,
							isVideo: isVideoMode,
						})
					}
				/>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Camera
				style={styles.camera}
				ref={cameraRef}
				type={cameraDirection}
				autoFocus={AutoFocus.on}
			/>
			<View style={styles.iconBox}>
				<Icon
					name="camera-flip-outline"
					size={50}
					// color="skyblue"
					onPress={switchCameraDirection}
				/>
				{isVideoMode ? (
					<Icon
						name={
							isRecording
								? "stop-circle-outline"
								: "radiobox-marked"
						}
						size={80}
						color={isRecording ? "red" : "black"}
						onPress={isRecording ? stopVideo : startVideo}
					/>
				) : (
					<Icon
						name="circle-outline"
						size={80}
						// color="skyblue"
						onPress={takePhoto}
					/>
				)}
				<Icon
					name={isVideoMode ? "camera-outline" : "video-outline"}
					size={50}
					onPress={switchVideoMode}
				/>
			</View>

			{/* {hasImagePickerPermission ? (
				<Button title={"Pick from gallery"} onPress={pickMedia} />
			) : undefined} */}
		</View>
	);
}

export class CameraScreen extends Component {
	render() {
		return (
			<Stack.Navigator
				initialRouteName="Camera"
				screenOptions={{
					headerTintColor: "deepskyblue",
					headerTitleStyle: { color: "black" },
				}}
			>
				<Stack.Screen name="Camera" component={CameraComponent} />
				<Stack.Screen
					name="Publish Post"
					component={PublishPostScreen}
				/>
			</Stack.Navigator>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 5,
		gap: 5,
	},
	camera: {
		alignSelf: "stretch",
		flex: 1,
	},
	iconBox: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
	},
	media: {
		flex: 1,
		alignSelf: "stretch",
		borderRadius: 5,
	},
});

const mapStateToProps = (store: any) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	followers: store.userState.followers,
	followingLoaded: store.followingState.followingLoaded,
	followingPosts: store.followingState.followingPosts,
});

export default connect(mapStateToProps, null)(CameraScreen);
