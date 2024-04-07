import { initializeApp } from "firebase-admin/app";
// import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";
import { log } from "firebase-functions/logger";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

var firebaseConfig = {
	apiKey: "AIzaSyAUV8eOm74mhlr3eEHZ8VZr74UYB2rNGJY",
	authDomain: "yrproject-64b5e.firebaseapp.com",
	databaseURL:
		"https://yrproject-64b5e-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "yrproject-64b5e",
	storageBucket: "yrproject-64b5e.appspot.com",
	messagingSenderId: "68905325798",
	appId: "1:68905325798:web:614befb202f9c97f44d727",
	measurementId: "G-95P67P8P3V",
};
setGlobalOptions({ region: "europe-west2" });

const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
const messaging = getMessaging(app);
const firestore = getFirestore(app);
// connectFirestoreEmulator(db, "localhost", "8080");

export const sendFollowerNotification = onDocumentCreated(
	"users/{followedUid}/followers/{followerUid}/",
	async (event) => {
		log(
			`User ${event.params.followerUid} is now following` +
				` user ${event.params.followedUid}`
		);

		const notificationTokens = (
			await firestore
				.collection("users")
				.doc(event.params.followedUid)
				.collection("notificationTokens")
				.get()
		).docs.map((doc) => doc.id);

		// log(notificationTokens);

		const follower = (
			await firestore
				.collection("users")
				.doc(event.params.followerUid)
				.get()
		).data();

		const notification = {
			title: "You have a new follower!",
			body: follower.username + " is now following you.",
			navUID: event.params.followerUid,
			navPostID: null,
		};

		firestore
			.collection("users")
			.doc(event.params.followedUid)
			.collection("notifications")
			.add({
				...notification,
				createdAt: FieldValue.serverTimestamp(),
			});

		// const messages = [];
		// notificationTokens.forEach((token) => {
		//   messages.push({
		//     token: token.key,
		//     notification: notification,
		//   });
		// });
		// const batchResponse = await messaging.sendEach(messages);

		// if (batchResponse.failureCount < 1) {
		//   // Messages sent sucessfully. We're done!
		//   log("Messages sent.");
		//   return;
		// }
		// warn(`${batchResponse.failureCount} messages weren't sent.`, batchResponse);

		// // Clean up the tokens that are not registered any more.
		// for (let i = 0; i < batchResponse.responses.length; i++) {
		//   const errorCode = batchResponse.responses[i].error?.code;
		//   const errorMessage = batchResponse.responses[i].error?.message;
		//   if (
		//     errorCode === "messaging/invalid-registration-token" ||
		//     errorCode === "messaging/registration-token-not-registered" ||
		//     (errorCode === "messaging/invalid-argument" &&
		//       errorMessage ===
		//         "The registration token is not a valid FCM registration token")
		//   ) {
		//     log(`Removing invalid token: ${messages[i].token}`);
		//     await tokensRef.child(messages[i].token).remove();
		//   }
		// }
	}
);
