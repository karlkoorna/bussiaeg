export default new class StoreScrolls {
	
	positions = {};
	
	constructor() {
		
		// Save scroll position to store.
		window.addEventListener('scroll', (e) => {
			const id = e.target.getAttribute('scroller');
			if (id) this.positions[id] = e.target.scrollTop;
		}, { passive: true, capture: true });
		
		// Apply scroll position from store.
		(new MutationObserver((mutations) => {
			for (const mutation of mutations) for (const node of mutation.addedNodes) if (node.querySelectorAll) for (const el of node.querySelectorAll('[scroller]')) el.scrollTop = this.positions[el.getAttribute('scroller')];
		})).observe(document.getElementById('root'), {
			childList: true,
			subtree: true
		});
		
	}
	
};
