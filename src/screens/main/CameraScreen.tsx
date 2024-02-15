import { Camera, CameraType } from "expo-camera";
import { Button, StyleSheet, Text, SafeAreaView, Image } from "react-native";
// import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { shareAsync } from "expo-sharing";
import { Video, ResizeMode } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/core";

export default function CameraScreen() {
	const navigation = useNavigation();
	let cameraRef = useRef();
	const [cameraDirection, setCameraDirection] = useState(CameraType.back);
	const [isVideoMode, setVideoMode] = useState(true);
	const [hasCameraPermission, setHasCameraPermission] = useState();
	const [hasMicrophonePermission, setHasMicrophonePermission] = useState();
	const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
		useState();
	const [hasImagePickerPermission, setHasImagePickerPermission] = useState();
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
		let options = {
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
		let options = {
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
			<SafeAreaView style={styles.container}>
				{isVideoMode ? (
					<Video
						style={styles.media}
						source={{ uri: media.uri }}
						useNativeControls
						resizeMode={ResizeMode.CONTAIN}
						isLooping
					/>
				) : (
					<Image style={styles.media} source={{ uri: media.uri }} />
				)}
				<Button title="Share" onPress={shareMedia} />
				{hasMediaLibraryPermission ? (
					<Button title="Save" onPress={saveMedia} />
				) : undefined}
				<Button title="Discard" onPress={() => setMedia(undefined)} />
				<Button
					title="Create post"
					onPress={() =>
						navigation.navigate("Publish Post", {
							media,
							isVideo: isVideoMode,
						})
					}
				/>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<Camera
				style={styles.camera}
				ref={cameraRef}
				type={cameraDirection}
				autoFocus={Camera.Constants.AutoFocus.on}
			/>

			{isVideoMode ? (
				<Button
					title={isRecording ? "Stop recording" : "Record video"}
					onPress={isRecording ? stopVideo : startVideo}
				/>
			) : (
				<Button title={"Take photo"} onPress={takePhoto} />
			)}
			<Button
				title={
					cameraDirection === CameraType.back
						? "Switch to front camera"
						: "Switch to back camera"
				}
				onPress={switchCameraDirection}
			/>
			<Button
				title={isVideoMode ? "Switch to photo" : "Switch to video"}
				onPress={switchVideoMode}
			/>

			{hasImagePickerPermission ? (
				<Button title={"Pick from gallery"} onPress={pickMedia} />
			) : undefined}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	camera: {
		flex: 1,
	},

	media: {
		flex: 1,
		alignSelf: "stretch",
	},
});
