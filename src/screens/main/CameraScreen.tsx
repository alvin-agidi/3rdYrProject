import { CameraView, Camera, CameraType } from "expo-camera";
import { StyleSheet, View, Image } from "react-native";
import { useEffect, useRef, useState } from "react";
import { shareAsync } from "expo-sharing";
import { Video, ResizeMode } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PublishPostScreen from "./PublishPostScreen";
import { PressableButton } from "../../components/PressableButton";
import globalStyles from "../../globalStyles";
import { NoResults } from "../../components/NoResults";

const Stack = createNativeStackNavigator();

function CameraComponent() {
	const navigation = useNavigation<any>();
	const cameraRef = useRef();
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
	const [facing, setFacing] = useState<CameraType>("back");

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
		return (
			<NoResults
				icon="camera-outline"
				text="Requesting camera permissions"
			/>
		);
	} else if (!hasCameraPermission) {
		return (
			<NoResults icon="camera-off-outline" text="No camera permissions" />
		);
	}

	function startVideo(): void {
		setIsRecording(true);
		var options = {
			quality: "720p",
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
			quality: 0.6,
			base64: true,
			exif: false,
		};

		cameraRef.current.takePictureAsync(options).then((newPhoto: any) => {
			setMedia(newPhoto);
		});
	}

	function openGallery(): void {
		const options = {
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			quality: 0.6,
		};
		ImagePicker.launchImageLibraryAsync(options).then((media: any) => {
			if (!media.canceled) {
				setMedia(media.assets[0]);
			}
		});
	}

	function switchFacing() {
		setFacing((facing) => (facing === "back" ? "front" : "back"));
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
			<View style={globalStyles.container}>
				<View style={styles.cameraBox}>
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
						<Image
							style={styles.media}
							source={{ uri: media.uri }}
						/>
					)}
					<View style={styles.iconBox}>
						<Icon
							name="export-variant"
							size={50}
							style={styles.icon}
							onPress={shareMedia}
						/>
						{hasMediaLibraryPermission ? (
							<Icon
								name="content-save-outline"
								size={50}
								style={styles.icon}
								onPress={saveMedia}
							/>
						) : undefined}
						<Icon
							name="trash-can-outline"
							size={50}
							style={styles.icon}
							onPress={() => setMedia(undefined)}
						/>
						<Icon
							name="arrow-right"
							size={50}
							style={styles.icon}
							color="deepskyblue"
							onPress={() =>
								navigation.navigate("Publish Post", {
									media,
									isVideo: isVideoMode,
								})
							}
						/>
					</View>
				</View>
			</View>
		);
	}

	return (
		<View style={globalStyles.container}>
			<View style={styles.cameraBox}>
				<CameraView
					style={styles.camera}
					facing={facing}
					ref={cameraRef}
				/>
				<View style={styles.iconBox}>
					<Icon
						name="camera-flip-outline"
						size={50}
						style={styles.icon}
						onPress={switchFacing}
					/>
					{isVideoMode ? (
						<Icon
							name={
								isRecording
									? "stop-circle-outline"
									: "radiobox-marked"
							}
							size={80}
							style={styles.icon}
							color={isRecording ? "red" : "deepskyblue"}
							onPress={isRecording ? stopVideo : startVideo}
						/>
					) : (
						<Icon
							name="circle-outline"
							size={80}
							style={styles.icon}
							color="deepskyblue"
							onPress={takePhoto}
						/>
					)}
					<Icon
						name={isVideoMode ? "camera-outline" : "video-outline"}
						size={50}
						style={styles.icon}
						onPress={switchVideoMode}
					/>
				</View>
				{hasImagePickerPermission ? (
					<Icon
						name="image-outline"
						size={50}
						style={{ ...styles.icon, ...styles.galleryIcon }}
						onPress={openGallery}
					/>
				) : undefined}
			</View>
		</View>
	);
}

export default function CameraScreen() {
	return (
		<Stack.Navigator
			initialRouteName="Camera"
			screenOptions={{
				headerTintColor: "deepskyblue",
				headerTitleStyle: { color: "black" },
			}}
		>
			<Stack.Screen name="Camera" component={CameraComponent} />
			<Stack.Screen name="Publish Post" component={PublishPostScreen} />
		</Stack.Navigator>
	);
}

const styles = StyleSheet.create({
	cameraBox: {
		flex: 1,
		borderRadius: 5,
		overflow: "hidden",
	},
	camera: {
		flex: 1,
	},
	iconBox: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		position: "absolute",
		width: "100%",
		bottom: 10,
	},
	icon: {
		backgroundColor: "rgba(255, 255, 255, 0.35)",
		borderRadius: 5,
		overflow: "hidden",
	},
	galleryIcon: {
		position: "absolute",
		top: 10,
		right: 10,
	},
	media: {
		flex: 1,
		borderRadius: 5,
	},
});
