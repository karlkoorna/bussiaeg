var coords, map, marker, stop, updater;
var markers = [];

var fadeTime = 250;
var updateTime = 2000;
var zoomLevel = 16;

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
			lat: map.getCenter().lat(),
			lng: map.getCenter().lng(),
			zoom: map.getZoom()
		});
		
		localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
		
		hideBookmarks();
		
	});
	
}

function deleteBookmark(el) {
	
	hideBookmarks();
	
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
	
	if (map.getZoom() <= 15) {
		
		for (var i = 0; i < markers.length; i++) markers[i].setMap(null);
		
		markers = [];
		
		return;
		
	}
	
	var bounds = map.getBounds();
	$.get('/getstops?lat_min=' + bounds.f.f + '&lng_min=' + bounds.b.f + '&lat_max=' + bounds.f.b + '&lng_max=' + bounds.b.b).done(function(stops) {
		
		for (var i = 0; i < stops.length; i++) {
		
			(function() {
				var stop = stops[i];
				
				var marker = new google.maps.Marker({
					position: {
						lat: stop.lat,
						lng: stop.lng
					},
					icon: {
						url: 'assets/stop_' + stop.type + '.png',
						scaledSize: new google.maps.Size(24, 24)
					},
					map: map
				});
				
				marker.addListener('click', function() {
					
					if (updater) return;
					
					showStop(stop.id, { panMap: false, fadeIn: true });
					updater = setInterval(function() {
						showStop(stop.id, { panMap: false, fadeIn: false });
					}, updateTime);
					
				});
				
				markers.push(marker);
				
			})();
			
		}
	
	});
	
}

function showStop(id, settings) {
	
	if (!updater) $.get('/getstop?id=' + id).done(function(data) {
		stop = data;
	});
	
	$.get('/gettrips?id=' + id).done(function(trips) {
		
		hideBookmarks();
		
		var content = '';
		
		for (var i = 0; i < trips.length; i++) {
			var trip = trips[i];
			
			content += '<div class="trip" style="color:' + (trip.type === 'bus' ? trip.owner === 'parnu' ? '#3794fb' : trip.owner === 'tartu' ? '#fb3b37' : '#48d457' : trip.type === 'coach' ? '#7e11db' : trip.type === 'trol' ? '#0263d4' : trip.type === 'tram' ? '#ff7b3b' : trip.type === 'train' ? '#f2740e' : '') + ';">';
			content +=   '<img class="trip-type" src="assets/' + (trip.type === 'bus' ? trip.owner ? 'bus_' + trip.owner : 'bus' : trip.type) + '.png" alt="">';
			content +=   '<div class="trip-short_name">' + trip.short_name + '</div>';
			content +=   '<div class="trip-long_name">' + trip.long_name + '</div>';
			content +=   '<div class="trip-time">' + trip.time + '</div>';
			content +=   '<div class="trip-alt_time">' + trip.alt_time + '</div>';
			content += '</div>';
			
		}
		
		$('#stop-trips').html(content);
		
		if (settings.panMap) {
			
			map.panTo({
				lat: stop.lat,
				lng: stop.lng
			});
			
			map.setZoom(zoomLevel);
			
		}
		
		if (!settings.fadeIn) return;
		
		document.title = 'Bussiaeg - ' + stop.name;
		history.pushState(null, document.title, '/?stop=' + stop.id);
		
		$('#stop-name').css('background-color', stop.type === 'bus' ? '#48d457' : stop.type === 'coach' ? '#7e11db' : stop.type === 'trol' ? '#0263d4' : stop.type === 'tram' ? '#ff7b3b' : stop.type === 'train' ? '#f2740e' : stop.type === 'parnu' ? '#3794fb' : stop.type === 'tartu' ? '#fb3b37' : '');
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
	
	$('#stop').fadeOut(fadeTime);
	
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

function map() {
	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: parseFloat(getParameter('lat')) || 59.388,
			lng: parseFloat(getParameter('lng')) || 24.685
		},
		zoom: zoomLevel,
		minZoom: 7,
		maxZoom: 18,
		disableDefaultUI: true,
		clickableIcons: false,
		styles: [{
			featureType: 'transit.station',
			elementType: 'all',
			stylers: [{
				visibility: 'off'
			}]
		}]
	});
	
	map.addListener('idle', function() {
		showStops();
	});
	
	map.addListener('mousedown', function() {
		hideBookmarks();
	});
	
}

// GPS

navigator.geolocation.watchPosition(function(pos) {coords = pos.coords;
	
	if (marker) {
		
		marker.setPosition({
			lat: coords.latitude,
			lng: coords.longitude
		});
		
		return;
		
	}
	
	map.panTo({
		lat: coords.latitude,
		lng: coords.longitude
	});
	
	map.setZoom(zoomLevel);
	
	marker = new google.maps.Marker({
		position: {
			lat: coords.latitude,
			lng: coords.longitude
		},
		icon: {
			url: 'assets/marker.png',
			scaledSize: new google.maps.Size(24, 24)
		},
		map: map
	});
	
	Object.assign(marker._icon.style, {
		transformOrigin: 'center',
		pointerEvents: 'none'
	});
	
	$('#btn-locate').css('filter', 'grayscale(0%)');
	$('#btn-locate').addClass('bounce');
	
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

$('#bookmarks').on('click', '.bookmark', function() {
	
	hideBookmarks();
	
	map.panTo({
		lat: $(this).data('lat'),
		lng: $(this).data('lng')
	});
	
	map.setZoom($(this).data('zoom'));
	
});

$('#bookmarks').hammer().on('swipeleft', function() {
	hideBookmarks();
});

// Interface (Help)

$('#btn-help').click(function() {
	
	hideBookmarks();
	
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
	
	if (!coords) return;
	
	map.panTo({
		lat: coords.latitude,
		lng: coords.longitude
	});
	
	map.setZoom(zoomLevel);	
	
});
