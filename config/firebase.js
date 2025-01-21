import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyB-AeNTP02F4962DmhD0LB7hxOBP8DJslA",
  authDomain: "web-app-226e2.firebaseapp.com",
  projectId: "web-app-226e2",
  storageBucket: "web-app-226e2.firebasestorage.app",
  messagingSenderId: "190857860344",
  appId: "1:190857860344:web:ae2049ddc0c5c40e18970d",
  measurementId: "G-782N3F5BX7"
};

export const FIREBASE_VAPID_KEY = "BNsTn7Hyyw6FOXrXG6_Lc--OOOd9-5WxXsGE7xdH40ny_ijpInBpjccD0W8bBQps3DP5O3C7GKAsvNqFVv8h1WM";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = () => {
  return getToken(messaging, { vapidKey: FIREBASE_VAPID_KEY })
    .then((currentToken) => {
      if (currentToken) {
        return currentToken;
      } else {
        alert(
          "No registration token available. Request permission to generate one."
        );
        return null;
      }
    })
    .catch((err) => {
      alert("An error occurred while retrieving token - " + err);
      return null;
    });
};

onMessage(messaging, ({ notification }) => {
  new Notification(notification.title, {
    body: notification.body,
    icon: notification.icon,
  });
});
