var coords, map, marker, stop, updater;

const fadeTime = 250;
const updateTime = 2000;
const zoomLevel = 16;
const flyTime = 1;

function getParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

// Functions (Bookmarks)

function addBookmark() {
	
	swal({
		type: 'input',
		title: 'Sisesta nimi',
		confirmButtonText: 'Lisa',
		cancelButtonText: 'Tagasi',
		showCancelButton: true,
		inputPlaceholder: 'Minu kodu',
		animation: 'slide-from-top'
	}, function(input) {
		if (!input) return;
		
		var bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
		
		if (input.trim() !== '') bookmarks.push({
			name: input,
			lat: map.getCenter().lat,
			lng: map.getCenter().lng,
			zoom: map.getZoom()
		});
		
		localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
		
		hideBookmarks();
		
	});
	
}

function deleteBookmark(el) {hideBookmarks();
	
	swal({
		title: 'Kustuta?',
		text: el.text(),
		confirmButtonText: 'Jah',
		cancelButtonText: 'Ei',
		showCancelButton: true,
		animation: 'slide-from-bottom'
	}, function(isConfirm) {
		if (!isConfirm) return;
		
		var bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
		
		for (var i = 0; i < bookmarks.length; i++) {
			var bookmark = bookmarks[i];
			
			if (bookmark.lat !== el.data('lat') || bookmark.lng !== el.data('lng')) continue;
			
			bookmarks.splice(i, 1);
			el.remove();
			
			break;
			
		}
		
		localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
		
	});
	
}

function showBookmarks() {
	
	var bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
	var content = '<div id="bookmarks-add">Lisa asukoht</div>';
	
	for (var i = 0; i < bookmarks.length; i++) {
		var bookmark = bookmarks[i];
		
		content += '<div class="bookmark" data-lat="' + bookmark.lat + '" data-lng="' + bookmark.lng + '" data-zoom="' + bookmark.zoom + '">' + bookmark.name + '</div>';
		
	}
	
	$('#bookmarks').html(content);
	
	$('.bookmark').each(function() {
		
		$(this).hammer().on('swiperight press', function() {
			deleteBookmark($(this));
		});
		
	});
	
	$('#bookmarks').animate({ left: '0px' }, fadeTime);
	
}

function hideBookmarks() {
	$('#bookmarks').animate({ left: '-240px' }, fadeTime);
}

// Functions (Stops)

function showStops() {
	
	if (map.getZoom() <= 15) return map.eachLayer(function(layer) {
		if (layer._icon) if (layer._icon.currentSrc.indexOf('stop') >= 0) map.removeLayer(layer);
	});
	
	var bounds = map.getBounds();
	$.get('/getstops?lat_min=' + bounds._northEast.lat + '&lng_min=' + bounds._northEast.lng + '&lat_max=' + bounds._southWest.lat + '&lng_max=' + bounds._southWest.lng).done(function(stops) {
	
		for (var i = 0; i < stops.length; i++) {
		
			(function() {
				var stop = stops[i];
				
				L.marker([ stop.lat, stop.lng ], {
					icon: L.icon({
						iconUrl: 'assets/stop_' + stop.type + '.png',
						iconSize: [ 24, 24 ]
					})
				}).addTo(map).on('click', function() {
					
					if (updater) return;
					
					showStop(stop.id, { panMap: false, fadeIn: true });
					updater = setInterval(function() {
						showStop(stop.id, { panMap: false, fadeIn: false });
					}, updateTime);
					
				});
				
			})();
			
		}
	
	});
	
}

function showStop(id, settings) {
	
	if (!updater) {
		
		$.get('/getstop?id=' + id).done(function(data) {
			
			stop = data;
			
		});
		
	}
	
	$.get('/gettrips?id=' + id).done(function(trips) {hideBookmarks();
		
		var content = '';
		
		for (var i = 0; i < trips.length; i++) {
			var trip = trips[i];
			
			content += '<div class="trip">';
			content +=   '<img class="trip-type" src="assets/' + (trip.type === 'bus' ? trip.owner ? 'bus_' + trip.owner : 'bus' : trip.type) + '.png" alt="">';
			content +=   '<div class="trip-short_name">' + trip.short_name + '</div>';
			content +=   '<div class="trip-long_name">' + trip.long_name + '</div>';
			content +=   '<div class="trip-time">' + trip.time + '</div>';
			content +=   '<div class="trip-alt_time">' + trip.alt_time + '</div>';
			content += '</div>';
			
		}
		
		$('#stop-trips').html(content);
		
		if (settings.panMap) map.flyTo({ lat: stop.lat, lng: stop.lng }, zoomLevel, { duration: flyTime });
		if (!settings.fadeIn) return;
		
		document.title = 'Bussiaeg - ' + stop.name;
		history.pushState(null, document.title, '/?stop=' + stop.id);
		
		var color = '#' + (stop.type === 'trol' ? '0071e4' : stop.type === 'tram' ? 'ff7b3b' : stop.type === 'train' ? 'ff8222' : '00bfff');
		
		$('#stop-name').css('background-color', color);
		$('meta[name="theme-color"]').attr('content', color);
		
		$('#stop-name').text(stop.name);
		
		$('#stop').fadeIn(fadeTime);
		
	}).fail(function() {
		hideStop();
	});
	
}

function hideStop() {
	
	clearInterval(updater); updater = null;
	
	document.title = 'Bussiaeg';
	history.pushState(null, document.title, '/');
	
	$('#stop').fadeOut(fadeTime, function() {
		$('meta[name="theme-color"]').attr('content', '#00bfff');
	});
	
}

// Share

const share = getParameter('stop');
if (share) {
	
	showStop(share, { panMap: true, fadeIn: true });
	updater = setInterval(function() {
		showStop(share, { panMap: false, fadeIn: false });
	}, updateTime);
	
}

// Map

var map = L.map('map', {
	center: [
		parseFloat(getParameter('lat')) || 59.388,
		parseFloat(getParameter('lng')) || 24.685
	],
	zoom: zoomLevel,
	minZoom: 7,
	maxZoom: 18,
	maxBounds: [ [ 59.874204, 21.396935 ], [ 57.290822, 28.838625 ] ],
	attributionControl: false,
	bounceAtZoomLimits: false,
	doubleClickZoom: false,
	zoomControl: false,
	keyboard: false,
	boxZoom: false
});

L.tileLayer('//{s}.google.com/vt/lyrs=phl=en&x={x}&y={y}&z={z}&pbhttps://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i372053562!3m14!2sen-US!3sUS!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy50OjY2fHAudjpvZmY!4e0', {
    subdomains: [ 'mt0', 'mt1', 'mt2', 'mt3' ]
}).addTo(map);

L.control.attribution({
	position: 'bottomleft',
	prefix: 'Bussiaeg.ee | <a href="https://soiduplaan.tallinn.ee/">Sõiduplaanid</a> | <a href="http://peatus.ee">Peatus.ee</a> | <a href="http://elron.ee">Elron</a> | <a href="https://maps.google.com">Google</a>'
}).addTo(map);

showStops();
map.on('moveend', function() {
	showStops();
});

// GPS

navigator.geolocation.watchPosition(function(pos) {coords = pos.coords;
	
	if (marker) return marker.setLatLng([ coords.latitude, coords.longitude ]);
	
	map.flyTo([ coords.latitude, coords.longitude ], zoomLevel, { duration: flyTime });
	
	$('#btn-locate').css('filter', 'grayscale(0%)');
	$('#btn-locate').addClass('bounce');
	
	marker = new L.marker([ coords.latitude, coords.longitude ], {
		icon: L.icon({
			iconUrl: 'assets/marker.png',
			iconSize: [ 24, 24 ]
		})
	});
	
	marker.addTo(map);
	
	Object.assign(marker._icon.style, {
		transformOrigin: 'center',
		pointerEvents: 'none'
	});
	
});

// Interface

$('.btn').on('animationend', function() {
	$(this).removeClass('bounce');
});

$('.btn').click(function() {
	$(this).addClass('bounce');
});

// Interface (Stops)

$('#stop-name').click(function() {
	hideStop();
});

// Interface (Bookmarks)

$('#trigger-bookmarks').hammer().on('swiperight', function() {
	showBookmarks();
});

$('#btn-bookmarks').click(function() {
	showBookmarks();
});

$('#bookmarks').on('click', '#bookmarks-add', function() {
	addBookmark();
});

$('#bookmarks').on('click', '.bookmark', function() {hideBookmarks();
	map.flyTo([ $(this).data('lat'), $(this).data('lng') ], $(this).data('zoom'), { duration: flyTime });
});

$('#bookmarks').hammer().on('swipeleft', function() {
	hideBookmarks();
});

map.on('click dragstart', function() {
	hideBookmarks();
});

// Interface (Help)

$('#btn-help').click(function() {hideBookmarks();
	
	if (!$('#help-version').text()) $.get('/version').done(function(data) {
		$('#help-version').text('Bussiaeg.ee v' + data);
	});
	
	$('#help').fadeIn(fadeTime);
	
});

$('#help').click(function() {
	$(this).fadeOut(fadeTime);
});

// Interface (Locate)

$('#btn-locate').click(function() {
	if (coords) map.flyTo([ coords.latitude, coords.longitude ], zoomLevel, { duration: flyTime });
});
