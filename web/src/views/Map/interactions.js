export default function interactions(map, that) {
	const $map = map._container;
	
	// Drag zoom
	
	let hasTapped = false;
	let isDragging = false;
	let isMoving = false;
	
	let startZoom = 0;
	let startY = 0;
	
	$map.addEventListener('touchstart', (e) => {
		if (e.touches.length > 1) return void (isDragging = false);
		
		if (!hasTapped) {
			hasTapped = true;
			
			return void setTimeout(() => {
				hasTapped = false;
			}, 300);
		}
		
		map.dragging.disable();
		startZoom = map.getZoom();
		startY = e.touches[0].clientY;
		isDragging = true;
	}, { passive: true });
	
	$map.addEventListener('touchmove', (e) => {
		if (!isDragging) return;
		
		const offset = startY - e.touches[0].clientY;
		const zoom = map._limitZoom(startZoom - offset / 100);
		
		if (!isMoving && Math.abs(offset) > 16) {
			map.doubleClickZoom.disable();
			isMoving = true;
		}
		
		requestAnimationFrame(() => {
			map._move(map.getCenter(), zoom, { pinch: true });
		});
	}, { passive: true });
	
	$map.addEventListener('touchend', (e) => {
		map.doubleClickZoom.enable();
		map.dragging.enable();
		isDragging = false;
		isMoving = false;
	});
	
	// Location modal
	
	map.on('mousedown contextmenu', (e) => {
		if (e.type !== 'contextmenu' && e.originalEvent.button !== 2) return;
		if (isDragging) return;
		
		map.dragging.disable();
		map.dragging.enable();
		that.setState({ showModal: true });
	});
}
