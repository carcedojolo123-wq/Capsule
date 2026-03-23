importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBtKdC5Po01JvwfC33AywIZKDZ-4-6SH9Y",
    authDomain: "capsule-d556e.firebaseapp.com",
    projectId: "capsule-d556e",
    storageBucket: "capsule-d556e.firebasestorage.app",
    messagingSenderId: "667845284113",
    appId: "1:667845284113:web:cf11b1d4b7ef99eb83fcb0",
    databaseURL: "https://capsule-d556e-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const messaging = firebase.messaging();

// ── Install ──
self.addEventListener('install', (event) => {
    console.log('Service Worker installed!');
    self.skipWaiting();
});

// ── Activate ──
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated!');
    event.waitUntil(clients.claim());
});

// ── Push event (your original) ──
self.addEventListener('push', (event) => {
    if (!event.data) {
        self.registration.showNotification('🎁 CAPSULE', {
            body: 'You have a new notification!',
            icon: '/Capsule/icon-192.png'
        });
        return;
    }
    const data  = event.data.json();
    const title = data.title || '🎁 Your Time Capsule is Open!';
    const body  = data.body  || 'A memory from your past is ready!';
    const icon  = data.icon  || '/Capsule/icon-192.png';
    const url   = data.url   || '/Capsule/dashboard.html';

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon,
            badge:   '/Capsule/icon-192.png',
            vibrate: [200, 100, 200],
            data:    { url, capsuleId: data.capsuleId },
            actions: [
                { action: 'view',  title: '👀 View Memory' },
                { action: 'close', title: '✕ Close' }
            ]
        })
    );
});

// ── FCM Background message ──
messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || '🎁 Your Time Capsule is Open!';
    const body  = payload.notification?.body  || 'A memory from your past is ready!';

    self.registration.showNotification(title, {
        body,
        icon:    '/Capsule/icon-192.png',
        badge:   '/Capsule/icon-192.png',
        vibrate: [200, 100, 200],
        data:    payload.data,
        actions: [
            { action: 'view',  title: '👀 View Memory' },
            { action: 'close', title: '✕ Close' }
        ]
    });
});

// ── Notification click (your original + capsule ID support) ──
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    const capsuleId = event.notification.data?.capsuleId;
    const url = capsuleId
        ? '/Capsule/capsule-detail.html?id=' + capsuleId
        : (event.notification.data?.url || '/Capsule/dashboard.html');

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('/Capsule/') && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
