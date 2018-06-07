export default function doubleTapDrag(map) {
	
	const $map = map._container;
	
	let isDoubleTap = false;
	let isDragging = false;
	
	let startZoom = 0;
	let startY = 0;
	
	$map.addEventListener('touchstart', (e) => {
		
		// Return early on single tap.
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
		map.dragging.enable();
		isDragging = false;
	});
	
	$map.addEventListener('touchmove', (e) => {
		
		if (e.touches.length > 1) return;
		if (!isDragging) return;
		
		// Calculate vertical distance from start to finger.
		const y = startY - e.touches[0].pageY;
		const height = $map.getBoundingClientRect().height;
		
		// Calculate vertical heights from start.
		const posHeight = startY;
		const negHeight = height - posHeight;
		
		// Equally divide four zoom levels into heights.
		const posStep = posHeight / 4;
		const negStep = negHeight / 4;
		
		// Increase/Decrease zoom level by step.
		if (y > 0) {
			map.setZoom(startZoom + Math.floor(y / posStep));
		} else {
			map.setZoom(startZoom - Math.floor(-y / negStep));
		}
		
	});
	
}
