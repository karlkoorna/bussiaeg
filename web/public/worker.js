self.addEventListener('install', (e) => {
	e.waitUntil(caches.open('default').then((cache) => cache.add('offline.html')));
});

self.addEventListener('fetch', (e) => {
	if (e.request.method !== 'GET') return;
	
	// Send offline page if page timed out.
	if (e.request.mode === 'navigate') return void e.respondWith(Promise.race([
		new Promise((resolve) => {
			setTimeout(() => {
				resolve(caches.match('offline.html'));
			}, 3000);
		}),
		fetch(e.request)
	]));
	
	// Workaround for PWA.
	e.respondWith(fetch(e.request).catch(() => new Response(null, { status: 404 })));
});
