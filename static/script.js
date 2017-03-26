// Declarations

var coords, map, marker, updater, live;

const fadeTime = 250,
	  updateTime = 2000,
	  zoomLevel = 16,
	  flyTime = 1;

// Functions (Time)

function getParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function getSecondsSinceMidnight() {
	return ~~((new Date() - new Date().setHours(0, 0, 0, 0)) / 1000) - ((new Date()).getTimezoneOffset() + 120) * 60;
}

function toHMS(seconds) {
	var hours   = Math.floor(seconds / 3600),
		minutes = Math.floor((seconds % 3600) / 60);
	seconds = seconds - (minutes * 60) - (hours * 3600);
	return {h: hours, m: minutes, s: seconds};
}

function toCountdown(seconds) {
	seconds = seconds - getSecondsSinceMidnight();
	var time = toHMS(Math.abs(seconds));
	return (seconds < 0 ? '-' : '') + (!live && time.h !== 0 ? time.h + 'h ' : '') + (time.m !== 0 ? time.h !== 0 && time.m < 10 ? ('0' + time.m).slice(-2) + 'm ' : time.m + 'm ' : '') + (!live && time.h === 0 && time.m === 0 || live ? (time.m !== 0 ? ('0' + time.s).slice(-2) : time.s) + 's' : '');
}

function toTime(seconds) {
	var time = toHMS(seconds);
	return ('0' + time.h).slice(-2) + ':' + ('0' + time.m).slice(-2);
}

// Functions (Stops)

function showStop(id, settings) {
	
	if (updater && !live) {
		
		$('.trip').each(function() {
			$(this).find('.trip-scheduled').text(toCountdown($(this).data('time')));
			
			if ($(this).data('time') < getSecondsSinceMidnight()) $(this).parent().remove();
		});
		
		return;
	}
	
	$.get('//' + location.host + '/getstop?id=' + id).done(function(stop) {hideBookmarks();
		var trips   = stop.trips,
			content = '';
		
		live = stop.live;
		
		for (var i = 0; i < trips.length; i++) {
			var trip = trips[i];
			
			if (live) {
				content += '<div class="trip"><img class="trip-type" src="assets/' + trip.type + '.png"><div class="trip-name">' + trip.name + '</div><div class="trip-stop">' + trip.stop + '</div><div class="trip-scheduled">' + toCountdown(trip.scheduled) + '</div><div class="trip-expected">' + toCountdown(trip.expected) + '</div></div>';
			} else {
				content += '<div class="trip" data-time="' + trip.scheduled + '"><img class="trip-type" src="assets/' + (trip.type === 'bus' ? trip.owner === 'tartu' ? 'bus_red' : trip.owner === 'parnu' ? 'bus_blue' : 'bus' : trip.type) + '.png"><div class="trip-name">' + trip.name + '</div><div class="trip-stop">' + trip.stop + '</div><div class="trip-scheduled">' + toCountdown(trip.scheduled) + '</div><div class="trip-expected">' + toTime(trip.expected) + '</div></div>';
			}
			
		}
		$('#stop-trips').html(content);
		
		if (settings.panMap) map.flyTo({
			lat: stop.lat,
			lng: stop.lng
		}, zoomLevel, {duration: flyTime});
		
		if (!settings.fadeIn) return;
		
		document.title = 'Bussiaeg - ' + stop.name + (stop.desc ? ' - ' + stop.desc : '');
		history.pushState(null, document.title, '/?stop=' + stop.id);
		
		$('#stop-name').text(stop.name);
		$('#stop-desc').text(stop.desc);
		
		$('#stop').fadeIn(fadeTime);
	});
	
}

function showStops() {
	
	if (map.getZoom() <= 15) return map.eachLayer(function(layer) {
		if (layer._icon !== undefined) if (layer._icon.currentSrc.indexOf('stop') !== -1) map.removeLayer(layer);
	});
	
	var bounds = map.getBounds();
	$.get('//' + location.host + '/getstops?lat_min=' + bounds._northEast.lat + '&lng_min=' + bounds._northEast.lng + '&lat_max=' + bounds._southWest.lat + '&lng_max=' + bounds._southWest.lng, function(stops) {
	
		for (var i = 0; i < stops.length; i++) {
		
			(function() {
				var stop = stops[i];
				
				L.marker([stop.lat, stop.lng], {
					icon: L.icon({
						iconUrl: 'assets/stop_' + stop.type + '.png',
						iconSize: [24, 24]
					})
				}).addTo(map).on('click', function() {
					if (updater) return;
					
					showStop(stop.id, {panMap: false, fadeIn: true});
					updater = setInterval(function() {
						showStop(stop.id, {panMap: false, fadeIn: false});
					}, updateTime);
					
				});
				
			})();
			
		}
	
	});
	
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
		var bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
		
		if (input === false) return;
		
		if (input.trim() !== '') bookmarks.push({
			name: input,
			lat:  map.getCenter().lat,
			lng:  map.getCenter().lng,
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
			
			bookmarks.splice(i, 1); el.remove();
			
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
	
	$('#bookmarks').animate({left: '0px'}, fadeTime);
}

function hideBookmarks() {
	$('#bookmarks').animate({left: '-240px'}, fadeTime);
}

// Initialization (Options)

if (getParameter('hidescroll')) $('body').css('overflow', 'hidden');

// Initialization (Donation)

localStorage.setItem('visitCount', parseInt(localStorage.getItem('visitCount')) + 1 || 1);
if (!getParameter('nodonate') && (parseInt(localStorage.getItem('visitCount')) === 10 || !(parseInt(localStorage.getItem('visitCount')) % 50))) {
	
	swal({
		title: 'Tere!',
		text: 'Oleme märganud, et teile meeldib Bussiaeg.ee.\nKas soovite tegijaid toetada?',
		confirmButtonText: 'PayPal',
		cancelButtonText: 'Ei',
		showCancelButton: true
	}, function(isConfirm) {
		if (isConfirm) window.open('https://www.paypal.me/bussiaeg', '_self');
	});
	
}

// Initialization (Share)

const share = parseInt(getParameter('stop'));
if (share) if (!isNaN(share)) if (!updater) {
	
	showStop(share, {panMap: true, fadeIn: true});
	updater = setInterval(function() {
		showStop(share, {panMap: false, fadeIn: false});
	}, updateTime);
	
}

// Initialization (Map)

var map = L.map('map', {
	center: [
		parseFloat(getParameter('lat')) || 59.388,
		parseFloat(getParameter('lng')) || 24.685
	],
	zoom: zoomLevel,
	minZoom: 7,
	maxZoom: 18,
	maxBounds: [[59.874204, 21.396935], [57.290822, 28.838625]],
	attributionControl: false,
	bounceAtZoomLimits: false,
	doubleClickZoom: false,
	zoomControl: false,
	keyboard: false,
	boxZoom: false
});

L.tileLayer('//{s}.google.com/vt/lyrs=phl=en&x={x}&y={y}&z={z}&pbhttps://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i372053562!3m14!2sen-US!3sUS!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy50OjY2fHAudjpvZmY!4e0', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

L.control.attribution({
	position: 'bottomleft',
	prefix: 'Bussiaeg.ee | <a href="https://soiduplaan.tallinn.ee/">Sõiduplaanid</a> | <a href="http://peatus.ee">Peatus</a> | <a href="https://maps.google.com">Google</a> | <a href="http://leafletjs.com">Leaflet</a>'
}).addTo(map);

showStops();
map.on('moveend', function() {
	showStops();
});

// Initialization (GPS)

navigator.geolocation.getCurrentPosition(function(pos) {coords = pos.coords;
	$('#btn-locate').fadeIn(fadeTime * 2);
	
	map.flyTo([pos.coords.latitude, pos.coords.longitude], zoomLevel, {duration: flyTime});
}, function(err) {}, {timeout: 3000});

navigator.geolocation.watchPosition(function(pos) {coords = pos.coords;
	$('#btn-locate').fadeIn(fadeTime * 2);
	
	if (marker) return marker.setLatLng([coords.latitude, coords.longitude]);
	
	marker = new L.marker([coords.latitude, coords.longitude], {
		icon: L.icon({
			iconUrl: 'assets/marker.png',
			iconSize: [24, 24]
		})
	});
	
	marker.addTo(map);
	
	marker.getElement().style.pointerEvents = 'none';
	marker.getElement().style.opacity = '.8';
	
});

// User Interface

$('#btn-bookmarks, #btn-locate').on('animationend', function() {
	$(this).removeClass('bounce');
});

// User Interface (Stops)

$('#stop-top').click(function() {
	clearInterval(updater); updater = null;
	
	$(this).parent().fadeOut(fadeTime);
	
	document.title = 'Bussiaeg';
	history.pushState(null, document.title, '/');
	
});

// User Interface (Bookmarks)

map.on('click dragstart', function() {
	hideBookmarks();
});

$('#bookmarks').hammer().on('swipeleft', function() {
	hideBookmarks();
});

$('#btn-bookmarks').click(function() {
	$(this).addClass('bounce');
	showBookmarks();
});

$('#bookmarks').on('click', '#bookmarks-add', function() {
	addBookmark();
});

$('#bookmarks').on('click', '.bookmark', function() {
	hideBookmarks();
	map.flyTo([$(this).data('lat'), $(this).data('lng')], $(this).data('zoom'), {duration: flyTime});
});

// User Interface (Help)

$('#btn-help').click(function() {
	$(this).addClass('bounce');
	
	hideBookmarks();
	
	if (!$('#help-version').text()) $.get('//' + location.host + '/version').done(function(data) {
		$('#help-version').text('Bussiaeg.ee ' + data);
	});
	
	$('#help').fadeIn(fadeTime, function() {
		$('#btn-help').removeClass('bounce');
	});
	
});

$('#help').click(function() {
	$(this).fadeOut(fadeTime);
});

// User Interface (Locate)

$('#btn-locate').click(function() {
	$(this).addClass('bounce');
	if (coords) map.flyTo([coords.latitude, coords.longitude], zoomLevel, {duration: flyTime});
});
