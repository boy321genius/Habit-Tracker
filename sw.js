// Habit Tracker Service Worker
// Must be hosted at the root of your site alongside index.html

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

// Fired when the server sends a Web Push message
self.addEventListener('push', e => {
  let data = { title: '🔔 Habit Reminder', body: 'Time to complete your habit!', tag: 'habit-reminder' };
  try {
    if (e.data) data = { ...data, ...JSON.parse(e.data.text()) };
  } catch (_) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:      data.body,
      tag:       data.tag || 'habit-reminder',
      renotify:  true,
      icon:      '/icon.png',
      badge:     '/icon.png',
      data:      { url: self.location.origin }
    })
  );
});

// Fired when the user taps the notification — open or focus the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.startsWith(self.location.origin) && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(e.notification.data?.url || self.location.origin);
    })
  );
});

// Allow the page to trigger a notification directly (used by test button)
self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body:     e.data.body,
      tag:      e.data.tag || 'habit-reminder',
      renotify: true,
      icon:     '/icon.png',
      data:     { url: self.location.origin }
    });
  }
});
