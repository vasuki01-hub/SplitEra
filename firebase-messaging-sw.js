// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Parse config from query string (passed during registration)
const urlParams = new URLSearchParams(self.location.search);
const configParam = urlParams.get('config');
let firebaseConfig = null;

if (configParam) {
    try {
        firebaseConfig = JSON.parse(decodeURIComponent(configParam));
    } catch (err) {
        console.error('[firebase-messaging-sw.js] Failed to parse config from URL', err);
    }
}

if (firebaseConfig) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification?.title || "SplitEra Notification";
        const notificationOptions = {
            body: payload.notification?.body || "You have a new update",
            icon: '/favicon.png',
            data: payload.data || {}
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.warn('[firebase-messaging-sw.js] No config found in URL. Background notifications may not work.');
}