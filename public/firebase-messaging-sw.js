/* public/firebase-messaging-sw.js */
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB-AeNTP02F4962DmhD0LB7hxOBP8DJslA",
  authDomain: "web-app-226e2.firebaseapp.com",
  projectId: "web-app-226e2",
  storageBucket: "web-app-226e2.firebasestorage.app",
  messagingSenderId: "190857860344",
  appId: "1:190857860344:web:ae2049ddc0c5c40e18970d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  //console.log("Mensagem recebida em segundo plano:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // Personalize conforme necessário
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// importScripts(
//   "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
// );

// fetch("/firebase-config.json")
//   .then((response) => {
//     return response.json();
//   })
//   .then((jsContent) => {
//     const config = eval(jsContent);
//     firebase.initializeApp(config.firebaseConfig);
//     firebase.messaging();
//   })
//   .catch((error) => {
//     console.error("Error initializing Firebase in service worker:", error);
//   });