// Enable CSS transitions after page load.
addEventListener('load', () => {
	document.body.classList.remove('is-loading');
});

// Lazy load images.
const observer = new IntersectionObserver(((entries) => {
	for (const entry of entries) if (entry.isIntersecting) {
		const image = entry.target;
		image.src = image.getAttribute('data-src');
		image.classList.remove('is-lazy');
		observer.unobserve(image);
	}
}));

// Observe lazy images.
for (const image of [ ...document.querySelectorAll('img.is-lazy') ]) observer.observe(image);
