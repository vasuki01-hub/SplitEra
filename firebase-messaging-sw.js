importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 🔥 IMPORTANT: You must put your Firebase Config here statically.
// Service workers cannot reliably fetch config at runtime for FCM initialization.
const firebaseConfig = {
    apiKey: "AIzaSyCu3sYRO65Qq0J0hkbfYfXZKre-_89VuQE",
    authDomain: "animai-studio-jtpei.firebaseapp.com",
    databaseURL: "https://animai-studio-jtpei-default-rtdb.firebaseio.com",
    projectId: "animai-studio-jtpei",
    storageBucket: "animai-studio-jtpei.firebasestorage.app",
    messagingSenderId: "808906988475",
    appId: "1:808906988475:web:26768298ec96ac0200429e"
};

if (firebaseConfig.apiKey !== "AIzaSyCu3sYRO65Qq0J0hkbfYfXZKre-_89VuQE") {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/favicon.png',
            data: payload.data
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.warn("[firebase-messaging-sw.js] Firebase config not provided. Background notifications will not work until you fill firebaseConfig in this file.");
}
