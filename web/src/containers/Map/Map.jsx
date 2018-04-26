import React, { PureComponent } from 'react';
import { renderToString } from 'react-dom/server';
import { withRouter } from 'react-router-dom';

import Vehicle from 'components/Vehicle';

import './Map.css';

const googleMaps = window.google.maps;

@withRouter
export default class Map extends PureComponent {
	
	markers = []
	coords = {}
	
	update = this.update.bind(this)
	locate = this.locate.bind(this)
	
	update() {
		
		const { map } = window;
		const { markers } = this;
		
		if (map.getZoom() < 16) {
			
			for (const marker of markers) marker.setMap(null);
			
			return void (this.markers = []);
			
		}
		
		const bounds = map.getBounds();
		
		for (const i in markers) {
			const marker = markers[i];
			
			if (bounds.f.f > marker.position.lat() > bounds.f.b) continue;
			if (bounds.b.b < marker.position.lng() < bounds.b.f) continue;
			
			marker.setMap(null);
			this.markers.splice(i, 1);
			
		}
		
		nextstop:
		for (const stop of window.stops) {
			
			if (stop.lat > bounds.f.f || stop.lat < bounds.f.b) continue;
			if (stop.lng > bounds.b.f || stop.lng < bounds.b.b) continue;
			
			for (const marker of markers) if (marker.id === stop.id) continue nextstop;
			
			const marker = new googleMaps.Marker({
				id: stop.id,
				optimized: true,
				position: {
					lat: stop.lat,
					lng: stop.lng
				},
				icon: {
					anchor: new googleMaps.Point(13, 13),
					url: `data:image/svg+xml;base64,${btoa(renderToString(Vehicle({ type: stop.type, silhouette: true, size: 26 })))}`
				},
				map
			});
			
			marker.addListener('click', () => {
				this.props.history.push(`stop?id=${stop.id}`);
			});
			
			this.markers.push(marker);
			
		}
		
	}
	
	locate() {
		
		const { coords, refs: { $locate } } = this;
		
		if (!coords.lat) return;
		
		window.map.panTo(coords);
		
		$locate.style.animation = 'map-bounce .4s';
		
		setTimeout(() => {
			$locate.style.animation = '';
		}, 400);
		
	}
	
	message(str) {
		
		const { $message } = this.refs;
		
		if ($message.innerText !== str) $message.innerText = str;
		
	}
	
	componentDidMount() {
		
		const map = new googleMaps.Map(this.refs.$map, {
			center: {
				lat: 59.436,
				lng: 24.753
			},
			zoom: 16,
			minZoom: 7,
			maxZoom: 18,
			clickableIcons: false,
			disableDefaultUI: true,
			styles: [
				{
					featureType: 'transit.station',
					elementType: 'all',
					stylers: [
						{
							visibility: 'off'
						}
					]
				}
			]
		});
		
		const marker = new googleMaps.Marker({
			clickable: false,
			optimized: true,
			icon: {
				anchor: new googleMaps.Point(10, 10),
				url: `data:image/svg+xml;base64,${btoa(renderToString(
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="20" height="20">
						<circle fill="#fff" cx="512" cy="512" r="512" />
						<circle fill="#4285f4" cx="512" cy="512" r="400" />
					</svg>
				))}`
			},
			map
		});
		
		const circle = new googleMaps.Circle({
			clickable: false,
			optimized: true,
			fillColor: '#00bfff',
			fillOpacity: .15,
			strokeWeight: 0,
			map
		});
		
		const time = new Date();
		
		map.addListener('bounds_changed', this.update);
		window.map = map;
		
		watchPosition.call(this);
		function watchPosition() {
			
			navigator.geolocation.watchPosition((e) => {
				
				const { latitude: lat, longitude: lng, accuracy } = e.coords;
				
				const coords = { lat, lng };
				
				marker.setPosition(coords);
				circle.setCenter(coords);
				circle.setRadius(accuracy);
				
				if (new Date() - time < 3000) map.panTo(coords);
				if (!this.coords.lat) this.refs.$locate.classList.add('is-visible');
				this.message('');
				
				this.coords = coords;
				
			}, (err) => {
				
				if (err.code === 3) return;
				
				this.message(err.code === 1 ? 'GPS on välja lülitatud' : err.code === 2 ? 'Seade ei toeta GPSi' : '');
				
				if (err.code === 1) setTimeout(watchPosition.bind(this), 1000);
				
			}, {
				enableHighAccuracy: true,
				timeout: 100
			});
			
		}
		
	}
	
	render() {
		return (
			<div id="map">
				<div id="map-container" ref="$map"></div>
				<span id="map-message" ref="$message"></span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="map-locate" onClick={this.locate} ref="$locate">
					<path fill="#4285f4" d="M512 .1C246.2.1 172.6 219.7 172.6 344.7c0 274.6 270 679.3 339.4 679.3s339.4-404.6 339.4-679.3C851.4 219.6 777.8.1 512 .1zm0 471.1c-71.3 0-129-57.8-129-129s57.7-129.1 129-129.1 129 57.8 129 129-57.7 129.1-129 129.1z" />
				</svg>
			</div>
		);
	}
	
}
