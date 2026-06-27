// Give the service worker access to Firebase Messaging.
// Note: Using a stable Firebase JS SDK version (10.13.0) for CDN compatibility.
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// Extract Firebase config from the Service Worker URL query parameters
const urlParams = new URLSearchParams(location.search);

firebase.initializeApp({
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId')
});

// Retrieve an instance of Firebase Cloud Messaging.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message: ", payload);

  const notificationTitle = payload.notification?.title || "PocketFlow";
  const notificationOptions = {
    body: payload.notification?.body || "Bạn có thông báo mới!",
    icon: payload.notification?.icon || "/pwa-192x192.png",
    data: {
      url: payload.data?.link || payload.data?.url || "/"
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to navigate to the url sent in payload
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        const url = new URL(client.url);
        if (url.pathname === targetUrl || client.url.includes(targetUrl)) {
          if ("focus" in client) {
            return (client).focus();
          }
        }
      }
      // If not, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});