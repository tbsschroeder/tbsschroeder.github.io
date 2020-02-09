"use strict";
let PRE_CACHE = '';
let CACHE_NAME = 'drtbssschroeder-v1';
let URLS_TO_CACHE = [
    './',
    'index.html',
    '/images/favicon.png',
    '/images/profile.jpg',
    '/images/wizard-128.png',
    '/images/wizard-144.png',
    '/images/wizard-152.png',
    '/images/wizard-192.png',
    '/images/wizard-256.png',
    '/images/wizard-512.png',
    '/images/wizard-64.png',
    '/public/2016_09_potsdam_comma16.pdf',
    '/public/2017_09_gummersbach.pdf',
    '/public/2017_11_bari_ai3.pdf',
    '/public/2018_09_warschau_comma18.pdf',
    '/vendor/css/main.min.css',
    '/vendor/css/vendor.min.css',
    '/vendor/js/main.min.js',
    '/vendor/js/vendor.min.js',
];

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/serviceworker.js')
            .then(registration => {
                console.log('[ServiceWorker] Registration successful with scope: ', registration.scope);
            }, err => {
                console.log('[ServiceWorker] Registration failed: ', err);
            });
    });
}

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[ServiceWorker] Open cache');
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    const currentCaches = [PRE_CACHE, CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    console.log('[ServiceWorker] Fetch', event.request.url);
    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            console.log('[ServiceWorker] Serves fetch', cachedResponse);
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(
                response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});