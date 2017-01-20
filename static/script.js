// Declarations

var coords, map, markers = new Array(), updater, live,
	clickable = {locate: true};

const fadeTime = 250;

// Functions

function getParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function getSecondsSinceMidnight() {
	return ~~((new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
}

function toHMS(seconds) {
	var hours   = Math.floor(seconds / 3600),
		minutes = Math.floor((seconds % 3600) / 60);	
	seconds = seconds - (minutes * 60) - (hours * 3600);
	return {
		h: ('0' + hours).slice(-2),
		m: ('0' + minutes).slice(-2),
		s: ('0' + seconds).slice(-2)
	};
}

function toCountdown(seconds, showHours) {
	seconds = seconds - getSecondsSinceMidnight();
	var time = toHMS(Math.abs(seconds));
	return (seconds < 0 ? '-' : '') + (showHours ? time.h + 'h ': '') + time.m + 'm ' + (showHours ? '' : time.s + 's');
}

function toTime(seconds) {
	var time = toHMS(seconds);
	return time.h + ':' + time.m;
}

function showStop(id, settings) {
	if (updater && !live) {
		
		$('.trip-scheduled').each(function() {
			$(this).text(toCountdown($(this).attr('data-time'), true));
			
			if ($(this).attr('data-time') > getSecondsSinceMidnight()) return;
				
			$(this).parent().animate({left: window.innerWidth + 'px'}, 1000, function() {
				$(this).remove();
				
				$('.trip').each(function() {
					$(this).animate({top: (parseInt($(this).css('top')) - 80) + 'px'}, 500);
				});
				
			});
			
		});
		
		return;
	}
	
	$.get('//' + location.host + '/getstop?id=' + id).done(function(data) {
		let trips   = data.trips,
			content = '';
		
		live = data.live;
		
		for (let i = 0; i < trips.length; i++) {
			let trip = trips[i];
			
			if (live) {
				content += '<div class="trip" style="top:' + i * 80 + 'px;"><img class="trip-type" src="assets/' + trip.type + '.png"><div class="trip-number">' + trip.number + '</div><div class="trip-scheduled">' + toCountdown(trip.scheduled, false) + '</div><div class="trip-expected">' + toCountdown(trip.expected, false) + '</div></div>';
			} else {
				content += '<div class="trip" style="top:' + i * 80 + 'px;"><img class="trip-type" src="assets/' + trip.type + '.png"><div class="trip-number">' + trip.number + '</div><div class="trip-scheduled" data-time="' + trip.time + '">' + toCountdown(trip.time, true) + '</div><div class="trip-expected">' + toTime(trip.time) + '</div></div>';
			}
			
		}
		$('#stop-trips').html(content);
		
		if (settings.panMap) map.panTo({
			lat: data.lat,
			lng: data.lng
		});
		
		$('#stop-name').text(data.name);
		$('#stop-desc').text(data.desc);
		
		if (!settings.fadeIn) return;
		
		document.title = 'Bussiaeg - ' + data.name + (data.desc ? ' - ' + data.desc : '');
		history.pushState(null, document.title, '/?stop=' + data.id);
		
		$('#stop').fadeIn(fadeTime);
	});
	
}

// Initialization

function init() {
	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: parseFloat(getParameter('lat')) || 59.388,
			lng: parseFloat(getParameter('lng')) || 24.684
		},
		zoom: 17,
		minZoom: 10,
		maxZoom: 20,
		disableDoubleClickZoom: true,
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
	
	google.maps.event.addListener(map, 'idle', function(e) {
		let bounds = map.getBounds();
		
		if (map.getZoom() <= 15) {
			
			for (let i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			
			return;
		}
		
		$.get('//' + location.host + '/getstops?lat_min=' + bounds.f.b + '&lng_min=' + bounds.b.f + '&lat_max=' + bounds.f.f + '&lng_max=' + bounds.b.b, function(stops) {
			
			for (let i = 0; i < stops.length; i++) {
				let stop = stops[i];
				
				let marker = new google.maps.Marker({
					position: {
						lat: stop.lat,
						lng: stop.lng
					},
					icon: new google.maps.MarkerImage('assets/stop.png', new google.maps.Size(24, 24), null, null),
					map: map
				});
				
				marker.addListener('click', function() {
					if (updater) return;
					
					showStop(stop.id, {panMap: false, fadeIn: true});
					updater = setInterval(function() {
						showStop(stop.id, {panMap: false, fadeIn: false});
					}, 1000);
					
				});
				
				markers.push(marker);
			}
			
		});
		
	});
	
	navigator.geolocation.watchPosition(function(pos) {
		coords = pos.coords;
	});
	
}

const share = parseInt(getParameter('stop'));
if (share) if (!isNaN(share)) if (!updater) {
	
	showStop(share, {panMap: true, fadeIn: true});
	updater = setInterval(function() {
		showStop(share, {panMap: false, fadeIn: false});
	}, 1000);
	
}

// User Interface

$('#stop-top').click(function() {
	clearInterval(updater); updater = null;
	
	$(this).parent().fadeOut(fadeTime, function() {
		$('#stop-name').text('...');
		$('#stop-desc').text('...');
		$('#stop-trips').html('');
	});
	
});

$('#btn-help').click(function() {
	
	$(this).addClass('bounce');
	$('#help').fadeIn(fadeTime, function() {
		$('#btn-help').removeClass('bounce');
	});
	
});

$('#help').click(function() {
	$(this).fadeOut(fadeTime);
});

$('#btn-locate').click(function() {
	if (!clickable.locate) return;
	
	$(this).addClass('load'); clickable.locate = false;
	
	map.panTo({
		lat: coords.latitude,
		lng: coords.longitude
	});
	
	$(this).on('webkitAnimationIteration', function() {
		$('#btn-locate').removeClass('load'); clickable.locate = true;
	});
	
});