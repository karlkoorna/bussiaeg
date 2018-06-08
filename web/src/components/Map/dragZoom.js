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
		
		map.dragging.disable();
		
		startZoom = map.getZoom();
		startY = e.touches[0].pageY;
		isDragging = true;
		
	});
	
	$map.addEventListener('touchend', (e) => {
		isDragging = false;
	});
	
	$map.addEventListener('touchmove', (e) => {
		if (isDragging) map.setZoom(startZoom - (startY - e.touches[0].pageY) / 80);
	});
	
}
