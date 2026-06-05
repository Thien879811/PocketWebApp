/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// Clean up old caches
cleanupOutdatedCaches()

// Precaching all assets injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST)

// Event listener for push notifications from the push server (Supabase/Firebase/Vapid)
self.addEventListener('push', (event) => {
  let title = 'PocketFlow'
  let body = 'Bạn có thông báo mới!'
  let url = '/'
  let icon = '/pwa-192x192.png'

  if (event.data) {
    try {
      const data = event.data.json()
      title = data.title || title
      body = data.body || data.message || body
      url = data.url || data.link || url
      icon = data.icon || icon
    } catch (e) {
      // If payload is plain text instead of JSON
      body = event.data.text()
    }
  }

  const options = {
    body,
    icon,
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { url },
    actions: [
      { action: 'open', title: 'Xem chi tiết' },
      { action: 'close', title: 'Đóng' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification click to navigate or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if window is already open
      for (const client of clientList) {
        const url = new URL(client.url)
        if (url.pathname === targetUrl || client.url.includes(targetUrl)) {
          if ('focus' in client) {
            return (client as any).focus()
          }
        }
      }
      // If not open, open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// Immediately activate the service worker
self.addEventListener('install', () => {
  self.skipWaiting()
})
