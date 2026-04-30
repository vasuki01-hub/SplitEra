// firebase-messaging-sw.js
// This file MUST be in the root of your project (same level as index.html)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// We fetch the config from the same API route the main app uses
// The SW cannot do async fetch on install, so we use a hardcoded config here.
// IMPORTANT: Replace these values with your actual Firebase config values.
// These are safe to include here — they are the same public-facing config
// that is already in your /api/firebaseConfig response.
firebase.initializeApp({
    apiKey: "AIzaSyCu3sYRO65Qq0J0hkbfYfXZKre-_89VuQE",
    authDomain: "animai-studio-jtpei.firebaseapp.com",
    projectId: "animai-studio-jtpei",
    storageBucket: "animai-studio-jtpei.firebasestorage.app",
    messagingSenderId: "808906988475",
    appId: "1:808906988475:web:26768298ec96ac0200429e"
});

const messaging = firebase.messaging();

// Handle background notifications (app is closed or in background)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    const { title, body, icon, data } = payload.notification || {};
    const notifTitle = title || 'SplitEra';
    const notifOptions = {
        body: body || '',
        icon: icon || '/favicon.png',
        badge: '/favicon.png',
        tag: data?.groupId || 'splitera-notif', // groups same-context notifications
        data: data || {},
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Open App' }
        ]
    };

    self.registration.showNotification(notifTitle, notifOptions);
});

// Handle notification click (when user taps the notification)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const groupId = event.notification.data?.groupId;
    const url = groupId
        ? `${self.location.origin}/#groups`
        : self.location.origin;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            return clients.openWindow(url);
        })
    );
});