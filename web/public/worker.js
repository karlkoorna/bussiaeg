this.addEventListener('fetch', (e) => {
	e.respondWith(fetch(e.request));
});
