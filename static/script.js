// Declarations

var coords, map, markers = new Array(), updater, live,
	clickable = {help: true, locate: true};

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

function showSchedule(id, fadeIn) {
	if (updater && !live) {
		
		$('.scheduled').each(function() {
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
				content += '<div class="trip" style="top:' + i * 80 + 'px;"><img class="type" src="assets/' + trip.type + '.png"><div class="number">' + trip.number + '</div><div class="scheduled">' + toCountdown(trip.scheduled, false) + '</div><div class="expected">' + toCountdown(trip.expected, false) + '</div></div>';
			} else {
				content += '<div class="trip" style="top:' + i * 80 + 'px;"><img class="type" src="assets/' + trip.type + '.png"><div class="number">' + trip.number + '</div><div class="scheduled" data-time="' + trip.time + '">' + toCountdown(trip.time, true) + '</div><div class="expected">' + toTime(trip.time) + '</div></div>';
			}
			
		}
		$('#trips').html(content);
		
		if (fadeIn) $('#stop').fadeIn(fadeTime);
	}).fail(function(data) {
		clearInterval(updater); updater = null;
	});
}

// Initialization

function init() {
	
	map = new google.maps.Map($('#map').get(0), {
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
					title: stop.name + ' - ' + stop.desc,
					map: map,
					stop: {
						name: stop.name,
						desc: stop.desc,
						id:   stop.id
					}
				});
				
				marker.addListener('click', function() {
					
					$('#name').text(stop.name);
					$('#desc').text(stop.desc);
					
					showSchedule(stop.id, true);
					updater = setInterval(function() {
						showSchedule(stop.id, false);
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

// UI

$('#info').click(function() {
	clearInterval(updater); updater = null;
	
	$(this).parent().fadeOut(fadeTime, function() {
		$('#name').text('...');
		$('#desc').text('...');
		$('#trips').html('');
	});
	
});

$('#btn-help').click(function() {
	if (!clickable.help) return;
	
	$(this).addClass('bounce'); clickable.help = false;
	$('#help').fadeToggle(fadeTime, function() {
		$('#btn-help').removeClass('bounce'); clickable.help = true;
	});
	
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