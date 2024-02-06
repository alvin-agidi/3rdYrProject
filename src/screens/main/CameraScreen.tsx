import { Camera, CameraType } from "expo-camera";
import {
	Button,
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	Image,
} from "react-native";
// import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { shareAsync } from "expo-sharing";
import { Video, ResizeMode } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";

export default function App() {
	let cameraRef = useRef();
	const [cameraDirection, setCameraDirection] = useState(CameraType.back);
	const [isVideoMode, setVideoMode] = useState(true);
	const [hasCameraPermission, setHasCameraPermission] = useState();
	const [hasMicrophonePermission, setHasMicrophonePermission] = useState();
	const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
		useState();
	const [hasImagePickerPermission, setHasImagePickerPermission] = useState();
	const [isRecording, setIsRecording] = useState(false);
	const [video, setVideo] = useState();
	const [photo, setPhoto] = useState();

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
			setVideo(recordedVideo);
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
			setPhoto(newPhoto);
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
				console.log(media);
				if (media.assets[0].type == "image") {
					setPhoto(media.assets[0]);
				} else {
					setVideo(media.assets[0]);
				}
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

	if (video) {
		function shareVideo(): void {
			shareAsync(video.uri).then(() => {
				setVideo(undefined);
			});
		}

		function saveVideo(): void {
			MediaLibrary.saveToLibraryAsync(video.uri).then(() => {
				setVideo(undefined);
			});
		}

		return (
			<SafeAreaView style={styles.container}>
				<Video
					style={styles.media}
					source={{ uri: video.uri }}
					useNativeControls
					resizeMode={ResizeMode.CONTAIN}
					isLooping
				/>

				<Button title="Share" onPress={shareVideo} />
				{hasMediaLibraryPermission ? (
					<Button title="Save" onPress={saveVideo} />
				) : undefined}
				<Button title="Discard" onPress={() => setVideo(undefined)} />
			</SafeAreaView>
		);
	}

	if (photo) {
		function sharePhoto(): void {
			shareAsync(photo.uri).then(() => {
				setPhoto(undefined);
			});
		}

		function savePhoto(): void {
			MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
				setPhoto(undefined);
			});
		}

		return (
			<SafeAreaView style={styles.container}>
				<Image
					style={styles.media}
					source={{
						// uri: "data:image/jpg;base64," + photo.base64,
						uri: photo.uri,
					}}
				/>

				<Button title="Share" onPress={sharePhoto} />
				{hasMediaLibraryPermission ? (
					<Button title="Save" onPress={savePhoto} />
				) : undefined}
				<Button title="Discard" onPress={() => setPhoto(undefined)} />
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
			<Button title={"Pick from gallery"} onPress={pickMedia} />
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
