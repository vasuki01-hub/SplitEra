// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

// 🔥 Your Firebase Config (already correct)
const firebaseConfig = {
    apiKey: "AIzaSyCu3sYRO65Qq0J0hkbfYfXZKre-_89VuQE",
    authDomain: "animai-studio-jtpei.firebaseapp.com",
    databaseURL: "https://animai-studio-jtpei-default-rtdb.firebaseio.com",
    projectId: "animai-studio-jtpei",
    storageBucket: "animai-studio-jtpei.firebasestorage.app",
    messagingSenderId: "808906988475",
    appId: "1:808906988475:web:26768298ec96ac0200429e"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
        body: payload.notification?.body || "You have a new message",
        icon: '/favicon.png',
        data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});