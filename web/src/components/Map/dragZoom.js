export default function dragZoom(map) {
	
	const $map = map._container;
	
	let isDoubleTap = false;
	let isDragging = false;
	
	let startZoom = 0;
	let startY = 0;
	
	$map.addEventListener('touchstart', (e) => {
		
		// Cancel drag zoom with multiple fingers.
		if (e.touches.length > 1) return (isDragging = false);
		
		// Check for double tap.
		if (!isDoubleTap) {
			isDoubleTap = true;
			
			setTimeout(() => {
				isDoubleTap = false;
			}, 300);
			
			return;
			
		}
		
		// Disable move drag.
		map.dragging.disable();
		
		// Set initial variables.
		startZoom = map.getZoom();
		startY = e.touches[0].pageY;
		isDragging = true;
		
	}, { passive: true });
	
	// Set map zoom by the section the pointer is in.
	$map.addEventListener('touchmove', (e) => {
		if (isDragging) map.setZoom(startZoom - (startY - e.touches[0].pageY) / 80);
	}, { passive: true });
	
	// Cancel zoom drag and allow move drag.
	$map.addEventListener('touchend', (e) => {
		isDragging = false;
		map.dragging.enable();
	});
	
};
