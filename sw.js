

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installed!');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated!');
    event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
    if (!event.data) {
        self.registration.showNotification('🎁 CAPSULE', {
            body: 'You have a new notification!',
            icon: '/icon-192.png'
        });
        return;
    }

    const data  = event.data.json();
    const title = data.title || '🎁 Your Time Capsule is Open!';
    const body  = data.body  || 'A memory from your past is ready!';
    const icon  = data.icon  || '/icon-192.png';
    const url   = data.url   || '/dashboard.html';

    event.waitUntil(
        self.registration.showNotification(title, {
            body:    body,
            icon:    icon,
            badge:   '/icon-192.png',
            vibrate: [200, 100, 200],
            data:    { url: url },
            actions: [
                { action: 'view',  title: '👀 View Memory' },
                { action: 'close', title: '✕ Close' }
            ]
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view' || !event.action) {
        const url = event.notification.data?.url || '/dashboard.html';

        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    }
});