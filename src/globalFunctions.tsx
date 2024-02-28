import * as VideoThumbnails from "expo-video-thumbnails";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";

export function generateThumbnail(mediaURL: any) {
	return new Promise((resolve) => {
		return VideoThumbnails.getThumbnailAsync(mediaURL, {
			time: 100,
		}).then((thumbnail) => resolve(thumbnail.uri));
	});
}
