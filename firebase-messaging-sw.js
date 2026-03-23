importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBtKdC5Po01JvwfC33AywIZKDZ-4-6SH9Y",
    authDomain: "capsule-d556e.firebaseapp.com",
    projectId: "capsule-d556e",
    storageBucket: "capsule-d556e.firebasestorage.app",
    messagingSenderId: "667845284113",
    appId: "1:667845284113:web:cf11b1d4b7ef99eb83fcb0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || '🎁 Your Time Capsule is Open!';
    const body  = payload.notification?.body  || 'A memory from your past is ready!';
    self.registration.showNotification(title, {
        body,
        icon: '/Capsule/icon-192.png',
        badge: '/Capsule/icon-192.png',
        vibrate: [200, 100, 200]
    });
});
