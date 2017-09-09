var coords, map, marker, updater, booking;
var params = {}, lang = [ {}, {} ], markers = [];

var $map = document.getElementById('map');
var $stop = document.getElementById('stop');
var $stopName = document.getElementById('stop-name');
var $stopTrips = document.getElementById('stop-trips');
var $bookmarks = document.getElementById('bookmarks');
var $bookmarksList = document.getElementById('bookmarks-list');
var $help = document.getElementById('help');
var $helpVersion = document.getElementById('help-version');
var $btnBookmarks = document.getElementById('btn-bookmarks');
var $btnHelp = document.getElementById('btn-help');
var $btnLocate = document.getElementById('btn-locate');

var updateTime = 2000;
var zoomLevel = 16;

if (!NodeList.prototype.forEach) NodeList.prototype.forEach = Array.prototype.forEach;

(location.search.match(/[^?&]{3,}/g) || [ '=' ]).forEach(function(match) {
	params[match.split('=')[0]] = match.split('=')[1] || true;
});

function get(url, cb) {
	
	var xhr = new XMLHttpRequest();
	
	xhr.open('GET', url, true);
	xhr.send(null);
	
	xhr.addEventListener('readystatechange', function() {
		
		if (xhr.readyState !== 4) return;
		
		var status = xhr.status.toString()[0];
		var data = null;
		
		if (xhr.responseText) {
			
			data = xhr.responseText;
			
			try {
				data = JSON.parse(data);
			} catch (ex) {}
			
		}
		
		cb(status === '4' || status === '5' || status === '0', xhr.status, data);
		
	});
	
	xhr.addEventListener('timeout', function() {
		cb(true, null, null);
	});
	
}

// Share

if (params.stop) {
	
	showStop(params.stop, { panMap: true, fadeIn: true });
	updater = setInterval(function() {
		showStop(params.stop, { panMap: false, fadeIn: false });
	}, updateTime);
	
}

// Language

params.lang = params.lang || localStorage.getItem('lang');

if (params.lang) get('assets/langs/' + params.lang + '.lang', function(err, code, data) {
	
	if (err) return;
	
	for (var i in data[0]) document.querySelector('[data-lang="' + i + '"]').innerText = data[0][i];
	
	lang = data[1];
	
});

// Map

function map() {
	
	var start = JSON.parse(localStorage.getItem('start')) || { lat: null, lng: null, zoom: null }, long;
	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: parseFloat(params.lat) || start.lat || 59.388,
			lng: parseFloat(params.lng) || start.lng || 24.685
		},
		zoom: start.zoom || zoomLevel,
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
	
	map.addListener('drag', function() {
		clearTimeout(long);
	});
	
	$map.addEventListener('mouseup', function() {
		clearTimeout(long);
	});
	
	$map.addEventListener('mousedown', function(e) {
		
		if (e.which !== 1) return;
		
		hideBookmarks();
		
		long = setTimeout(function() {
			
			swal({
				title: lang.setstart_title || 'Kinnita alguskoht?',
				animation: 'slide-from-bottom',
				showCancelButton: true,
				confirmButtonText: lang.setstart_confirm || 'Jah',
				cancelButtonText: lang.setstart_cancel || 'Ei'
			}, function(isConfirm) {
				
				if (isConfirm) localStorage.setItem('start', JSON.stringify({
					lat: map.getCenter().lat(),
					lng: map.getCenter().lng(),
					zoom: map.getZoom()
				}));
				
			});
			
		}, 1004);
		
	});
	
}

// GPS

navigator.geolocation.watchPosition(function(pos) {
	
	coords = pos.coords;
	
	if (marker) return void marker.setPosition({
		lat: coords.latitude,
		lng: coords.longitude
	});
	
	if (!params.stop && !params.lat && !params.lng) {
		
		map.panTo({
			lat: coords.latitude,
			lng: coords.longitude
		});
		
		map.setZoom(zoomLevel);
		
	}
	
	marker = new google.maps.Marker({
		position: {
			lat: coords.latitude,
			lng: coords.longitude
		},
		icon: {
			url: 'assets/marker.png',
			scaledSize: new google.maps.Size(24, 24)
		},
		clickable: false,
		map: map
	});
	
	$btnLocate.style.filter = 'grayscale(0)';
	$btnLocate.classList.add('bounce');
	
});

$btnLocate.addEventListener('click', function() {
	
	if (!coords) return;
	
	map.panTo({
		lat: coords.latitude,
		lng: coords.longitude
	});
	
	map.setZoom(zoomLevel);
	
});

window.addEventListener('focus', function(e) {
	
	setTimeout(function() {
		$btnLocate.click();
	}, 500);
	
});

// UI

document.querySelectorAll('.btn').forEach(function(el) {
	
	el.addEventListener('click', function() {
		el.classList.add('bounce');
		hideBookmarks();
	});
	
	el.addEventListener('animationend', function() {
		el.classList.remove('bounce');
	});
	
});

$stop.addEventListener('transitionend', function() {
	if (!$stop.classList.contains('is-visible')) $stop.style.visibility = 'hidden';
});

$help.addEventListener('transitionend', function() {
	if (!$help.classList.contains('is-visible')) $help.style.visibility = 'hidden';
});

// Stops

function showStops() {
	
	if (map.getZoom() < 16) {
		
		for (var i = 0; i < markers.length; i++) markers[i].setMap(null);
		
		markers = [];
		
		return;
		
	}
	
	var bounds = map.getBounds();
	get('/getstops?lat_min=' + bounds.f.f + '&lng_min=' + bounds.b.f + '&lat_max=' + bounds.f.b + '&lng_max=' + bounds.b.b, function(err, code, stops) {
		
		if (err) return;
		
		for (var i = 0; i < stops.length; i++) {
			
			(function() {
				var stop = stops[i];
				
				var marker = new google.maps.Marker({
					position: {
						lat: stop.lat,
						lng: stop.lng
					},
					icon: {
						url: 'assets/stops/' + stop.type + '.png',
						scaledSize: new google.maps.Size(24, 24)
					},
					map: map
				});
				
				marker.addListener('click', function() {
					
					if (booking) return	void swal({
						type: 'input',
						animation: 'slide-from-top',
						showCancelButton: true,
						title: lang.bookmark_add_title2 || 'Sisesta nimi',
						inputPlaceholder: lang.bookmark_add_placeholder || 'Kodupeatus',
						inputValue: stop.name,
						confirmButtonText: lang.bookmark_add_confirm || 'Lisa',
						cancelButtonText: lang.bookmark_add_cancel || 'Tagasi'
					}, function(input) {
						
						if (input === false) return;
						if (!input.trim()) return;
						
						$bookmarksList.insertAdjacentHTML('beforeend', '<div class="bookmark" data-stop="' + stop.id + '">' + input.trim() + '</div>');
						
						updateBookmarks();
						endBooking();
						
					});
					
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
	
	if (!updater) get('/getstop?id=' + id, function(err, code, stop) {
		
		if (err) return void hideStop();
		
		if (settings.fadeIn) {
			
			$stopName.style.backgroundColor = `#${stop.type === 'bus' ? '48d457' : stop.type === 'coach' ? '7e11db' : stop.type === 'trol' ? '0263d4' : stop.type === 'tram' ? 'ff7b3b' : stop.type === 'train' ? 'f2740e' : stop.type === 'parnu' ? '3794fb' : stop.type === 'tartu' ? 'fb3b37' : '00bfff'}`;
			$stopName.innerText = stop.name;
			
			document.title = 'Bussiaeg.ee - ' + stop.name;
			history.pushState(null, document.title, '/?stop=' + stop.id);
			
			document.querySelector('meta[name="apple-mobile-web-app-title"]').setAttribute('content', stop.name);
			document.querySelector('meta[name="application-name"]').setAttribute('content', stop.name);
			
			$stop.style.background = 'no-repeat center/50vmin url(\'assets/loading.gif\') #fbfbfb';
			$stop.style.visibility = 'visible';
			$stop.classList.add('is-visible');
			
		}
		
		if (settings.panMap) {
			
			map.panTo({
				lat: stop.lat,
				lng: stop.lng
			});
			
			map.setZoom(zoomLevel);
			
		}
		
	});
	
	get('/gettrips?id=' + id, function(err, code, trips) {
		
		if (err) return void hideStop();
		
		var content = '';
		
		for (var i = 0; i < trips.length; i++) {
			var trip = trips[i];
			
			content += '<div class="trip" style="color:#' + (trip.type === 'parnu' ? '3794fb' : trip.type === 'tartu' ? 'fb3b37' : trip.type === 'bus' ? '48d457' : trip.type === 'coach' ? '7e11db' : trip.type === 'trol' ? '0263d4' : trip.type === 'tram' ? 'ff7b3b' : trip.type === 'train' ? 'f2740e' : '00bfff') + ';">';
			content +=   '<img class="trip-type" src="assets/vehicles/' + trip.type + '.png" alt="">';
			content +=   '<div class="trip-short_name">' + trip.shortName + '</div>';
			content +=   '<div class="trip-long_name">' + trip.longName + '</div>';
			content +=   '<div class="trip-time">' + trip.time + '<img class="trip-gps" src="assets/gps/' + trip.gps + '.png" alt=""></div>';
			content +=   '<div class="trip-alt_time">' + trip.altTime + '</div>';
			content += '</div>';
			
		}
		
		$stop.style.background = '#fbfbfb';
		$stopTrips.innerHTML = content;
		
	});
	
}

function hideStop() {
	
	window.stop();
	
	clearInterval(updater);
	updater = null;
	
	document.title = 'Bussiaeg.ee';
	history.pushState(null, document.title, '/');
	
	$stop.classList.remove('is-visible');
	$stop.style.background = '#fbfbfb';
	$stopTrips.innerHTML = '';
	
}

$stopName.addEventListener('click', function() {
	hideStop();
});

// Bookmarks

function updateBookmarks() {
	
	var bookmarks = [];
	
	$bookmarksList.querySelectorAll('.bookmark').forEach(function(el) {
		
		bookmarks.push({
			name: el.innerHTML,
			stop: el.getAttribute('data-stop')
		});
		
	});
	
	localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
	
}

function editBookmark(el) {
	
	var controls = document.getElementById('bookmark-controls');
	
	if (controls) controls.parentNode.removeChild(controls);
	
	el.insertAdjacentHTML('beforeend', '<div id="bookmark-controls"><div id="bookmark-controls-rename"></div><div id="bookmark-controls-delete"></div></div>');
	
	controls = document.getElementById('bookmark-controls');
	
	if (el.nextSibling) {
		
		controls.insertAdjacentHTML('afterbegin', '<div id="bookmark-controls-down"></div>');
		
		document.getElementById('bookmark-controls-down').addEventListener('click', function() {
			
			el.nextSibling.insertAdjacentElement('afterend', el);
			
			updateBookmarks();
			editBookmark(el);
			
		});
		
	}
	
	if (el.previousSibling) {
		
		controls.insertAdjacentHTML('afterbegin', '<div id="bookmark-controls-up"></div>');
		
		document.getElementById('bookmark-controls-up').addEventListener('click', function(e) {
			
			el.previousSibling.insertAdjacentElement('beforebegin', el);
			
			updateBookmarks();
			editBookmark(el);
			
		});
		
	}
	
	document.getElementById('bookmark-controls-rename').addEventListener('click', function() {
		
		swal({
			type: 'input',
			animation: 'slide-from-top',
			showCancelButton: true,
			title: lang.bookmark_rename_title || 'Muuda nime',
			text: el.innerText,
			inputPlaceholder: el.innerText,
			inputValue: el.innerText,
			confirmButtonText: lang.bookmark_rename_confirm || 'Muuda',
			cancelButtonText: lang.bookmark_rename_cancel || 'Tagasi'
		}, function(input) {
			
			if (input === false) return;
			if (!input.trim()) return;
			
			el.innerHTML = input.trim();
			updateBookmarks();
			
		});
		
	});
	
	document.getElementById('bookmark-controls-delete').addEventListener('click', function() {
		
		swal({
			animation: 'slide-from-bottom',
			title: lang.bookmark_delete_title || 'Kustuta?',
			showCancelButton: true,
			text: el.innerText,
			confirmButtonText: lang.bookmark_delete_confirm || 'Jah',
			cancelButtonText: lang.bookmark_delete_cancel || 'Ei'
		}, function(isConfirm) {
			
			if (!isConfirm) return;
			
			el.parentNode.removeChild(el);
			updateBookmarks();
			
		});
		
	});
	
}

function showBookmarks() {
	
	var bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
	var content = '';
	
	for (var i = 0; i < bookmarks.length; i++) {
		var bookmark = bookmarks[i];
		
		content += '<div class="bookmark" data-stop="' + bookmark.stop + '">' + bookmark.name + '</div>';
		
	}
	
	document.getElementById('bookmarks-list').innerHTML = content;
	
	$bookmarksList.querySelectorAll('.bookmark').forEach(function(el) {
		
		el.addEventListener('click', function(e) {
			
			var controls = document.getElementById('bookmark-controls');
			if (controls) if (el.contains(controls)) return; else return void controls.parentNode.removeChild(controls);
			
			hideBookmarks();
			
			showStop(el.getAttribute('data-stop'), { panMap: true, fadeIn: true });
			updater = setInterval(function() {
				showStop(el.getAttribute('data-stop'), { panMap: false, fadeIn: false });
			}, updateTime);
			
		});
		
		(new Hammer(el)).on('press', function() {
			
			setTimeout(function() {
				editBookmark(el);
			}, 300);
			
		});
		
	});
	
	$bookmarks.style.visibility = 'visible';
	$bookmarks.classList.add('is-visible');
	
}

function hideBookmarks() {
	$bookmarks.classList.remove('is-visible');
}

function startBooking() {
	booking = true;
	$btnBookmarks.src = 'assets/buttons/bookmarks-cancel.png';
}

function endBooking() {
	booking = false;
	$btnBookmarks.src = 'assets/buttons/bookmarks.png';
}

$bookmarksList.addEventListener('click', function(e) {
	
	if (e.srcElement !== $bookmarksList) return;
	
	var controls = document.getElementById('bookmark-controls');
	if (controls) controls.parentElement.removeChild(controls);
	
});

$btnBookmarks.addEventListener('click', function() {
	if ($btnBookmarks.src.indexOf('cancel') > -1) endBooking(); else showBookmarks();
});

document.getElementById('bookmarks-add').addEventListener('click', function() {
	hideBookmarks();
	startBooking();
});

(new Hammer(document.getElementById('trigger-bookmarks'))).on('swiperight', function() {
	showBookmarks();
});

(new Hammer($bookmarksList)).on('swipeleft', function() {
	hideBookmarks();
});

// Help

$btnHelp.addEventListener('click', function() {
	
	history.pushState(null, document.title, '/?help');
	
	if (!$helpVersion.innerText) get('/version', function(err, code, version) {
		if (!err) $helpVersion.innerText = 'Bussiaeg.ee v' + version;
	});
	
	$help.style.visibility = 'visible';
	$help.classList.add('is-visible');
	
});

$help.addEventListener('click', function() {
	$help.classList.remove('is-visible');
	history.pushState(null, document.title, '/');
});

document.querySelectorAll('.help-language').forEach(function(el) {
	
	el.addEventListener('click', function() {
		localStorage.setItem('lang', el.getAttribute('data-value'));
		location.reload();
	});
	
});

if (params.help) $btnHelp.click();
