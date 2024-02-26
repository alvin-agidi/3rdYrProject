/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
import { log, warn } from "firebase-functions/logger";
import { onValueWritten } from "firebase-functions/v2/database";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
	authDomain: "myapp-project-123.firebaseapp.com",
	databaseURL: "https://myapp-project-123.firebaseio.com",
	projectId: "myapp-project-123",
	storageBucket: "myapp-project-123.appspot.com",
	messagingSenderId: "65211879809",
	appId: "1:65211879909:web:3ae38ef1cdcb2e01fe5f0c",
	measurementId: "G-8GSGZQ44ST",
};

initializeApp(firebaseConfig);
setGlobalOptions({ region: "europe-west2" });
// const db = getFirestore();
// connectFirestoreEmulator(db, "127.0.0.1", 8907);

export const sendFollowerNotification = onDocumentCreated(
	"users/{followerUid}/followers/{followedUid}/",
	async (event) => {
		log(
			`User ${event.params.followerUid} is now following` +
				` user ${event.params.followedUid}`
		);
		// const tokensRef = db.ref(
		//   `/users/${event.params.followedUid}/notificationTokens`
		// );

		// const notificationTokens = await tokensRef.get();
		// if (!notificationTokens.hasChildren()) {
		//   log("There are no tokens to send notifications to.");
		//   return;
		// }

		log(
			`There are ${notificationTokens.numChildren()} tokens` +
				" to send notifications to."
		);
		// const followerProfile = await auth.getUser(event.params.followerUid);

		// Notification details.
		const notification = {
			title: "You have a new follower!",
			body:
				(followerProfile.displayName ?? "Someone") +
				" is now following you.",
			// image: followerProfile.photoURL ?? "",
		};

		// Send notifications to all tokens.
		const messages = [];
		notificationTokens.forEach((token) => {
			messages.push({
				token: token.key,
				notification: notification,
			});
		});
		const batchResponse = await messaging.sendEach(messages);

		if (batchResponse.failureCount < 1) {
			// Messages sent sucessfully. We're done!
			log("Messages sent.");
			return;
		}
		warn(
			`${batchResponse.failureCount} messages weren't sent.`,
			batchResponse
		);

		// Clean up the tokens that are not registered any more.
		for (let i = 0; i < batchResponse.responses.length; i++) {
			const errorCode = batchResponse.responses[i].error?.code;
			const errorMessage = batchResponse.responses[i].error?.message;
			if (
				errorCode === "messaging/invalid-registration-token" ||
				errorCode === "messaging/registration-token-not-registered" ||
				(errorCode === "messaging/invalid-argument" &&
					errorMessage ===
						"The registration token is not a valid FCM registration token")
			) {
				log(`Removing invalid token: ${messages[i].token}`);
				await tokensRef.child(messages[i].token).remove();
			}
		}
	}
);
