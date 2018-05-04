import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import { withRouter } from 'react-router-dom';
import Leaflet from 'leaflet';

import StopIcon from 'components/StopIcon';
import Modal from 'components/Modal/Modal';

import './Map.css';
import 'leaflet/dist/leaflet.css';

@withRouter
export default class Map extends Component {
	
	state = {
		coords: {},
		message: '',
		showModal: false
	}
	
	markers = []
	
	update = this.update.bind(this)
	locate = this.locate.bind(this)
	modalHide = this.modalHide.bind(this)
	modalConfirm = this.modalConfirm.bind(this)
	
	update() {
		
		const { map } = window;
		const { markers } = this;
		
		if (map.getZoom() < 16) {
			
			for (const marker of markers) marker.remove();
			
			if (!this.state.message) this.setState({ message: 'Suumi lähemale, et näha peatuseid' });
			
			return void (this.markers = []);
			
		}
		
		if (this.state.message) this.setState({ message: '' });
		
		const bounds = map.getBounds();
		
		for (const i in markers) {
			const marker = markers[i];
			
			const position = marker.getLatLng();
			
			if (bounds._northEast.lat > position.lat > bounds._southWest.lat) continue;
			if (bounds._northEast.lng > position.lng > bounds._southWest.lng) continue;
			
			marker.remove();
			this.markers.splice(i, 1);
			
		}
		
		nextStop:
		for (const stop of window.stops) {
			
			if (stop.lat > bounds._northEast.lat || stop.lat < bounds._southWest.lat) continue;
			if (stop.lng > bounds._northEast.lng || stop.lng < bounds._southWest.lng) continue;
			
			for (const marker of markers) if (marker.id === stop.id) continue nextStop;
			
			const marker = new Leaflet.Marker([ stop.lat, stop.lng ], {
				icon: new Leaflet.Icon({
					iconSize: [ 26, 26 ],
					iconAnchor: [ 13, 13 ],
					iconUrl: `data:image/svg+xml;base64,${btoa(renderToString(StopIcon({ type: stop.type })))}`
				})
			}).addTo(map);
			
			marker.addEventListener('click', () => {
				this.props.history.push(`stop?id=${stop.id}`);
			});
			
			this.markers.push(marker);
			
		}
		
	}
	
	locate() {
		
		const { coords } = this.state;
		
		if (coords.lat) window.map.panTo(coords);
		
	}
	
	modalHide() {
		this.setState({ showModal: false });
	}
	
	modalConfirm() {
		this.modalHide();
		
		const { map } = window;
		const center = map.getCenter();
		
		localStorage.setItem('start', JSON.stringify({
			lat: center.lat,
			lng: center.lng,
			zoom: map.getZoom()
		}));
		
	}
	
	componentDidMount() {
		
		const start = JSON.parse(localStorage.getItem('start') || '{}');
		
		const map = new Leaflet.Map('map-container', {
			center: [
				start.lat || 59.436,
				start.lng || 24.753
			],
			zoom: start.zoom || 16,
			minZoom: 8,
			maxZoom: 17,
			zoomControl: false,
			attributionControl: false,
			boxZoom: false,
			keyboard: false,
			preferCanvas: true
		});
		
		const attribution = Leaflet.control.attribution({
			position: 'topright',
			prefix: ''
		});
		
		attribution.addAttribution('<a href="https://openstreetmap.org">OpenStreetMap</a>');
		attribution.addAttribution('<a href="https://mapbox.com/about/maps">Mapbox</a>');
		attribution.addAttribution('<a href="https://mapbox.com/feedback">Improve this map</a>');
		
		map.addControl(attribution);
		
		Leaflet.tileLayer(`https://api.mapbox.com/styles/v1/${process.env['REACT_APP_MAPBOX_STYLE']}/tiles/256/{z}/{x}/{y}?access_token=${process.env['REACT_APP_MAPBOX_KEY']}`).addTo(map);
		
		const marker = new Leaflet.Marker([ 0, 0 ], {
			interactive: false,
			icon: new Leaflet.Icon({
				iconSize: [ 20, 20 ],
				iconAnchor: [ 10, 10 ],
				iconUrl: `data:image/svg+xml;base64,${btoa(renderToString(
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
						<circle fill="#fff" cx="512" cy="512" r="512" />
						<circle fill="#4285f4" cx="512" cy="512" r="350" />
					</svg>
				))}`
			}),
		}).addTo(map);
		
		const circle = new Leaflet.Circle([ 0, 0 ], {
			renderer: new Leaflet.Canvas({ padding: 1 }),
			interactive: false,
			fillColor: '#4285f4',
			fillOpacity: .15,
			color: '#4285f4',
			weight: 2
		}).addTo(map);
		
		const timestamp = new Date();
		
		map.addEventListener('contextmenu', (e) => {
			this.setState({ showModal: true });
		});
		
		map.addEventListener('move', this.update);
		window.map = map;
		
		watchPosition.call(this);
		function watchPosition() {
			
			navigator.geolocation.watchPosition((e) => {
				
				const { latitude: lat, longitude: lng, accuracy } = e.coords;
				const coords = { lat, lng };
				
				marker.setLatLng(coords);
				circle.setLatLng(coords);
				circle.setRadius(accuracy);
				
				if (new Date() - timestamp < 3000) map.panTo(coords);
				
				this.setState({ coords });
				
			}, (err) => {
				if (err.code !== 3) setTimeout(watchPosition.bind(this), 3000);
			}, {
				enableHighAccuracy: true,
				timeout: 1000
			});
			
		}
		
	}
	
	render() {
		return (
			<div id="map">
				<div id="map-container" ref="$map"></div>
				<span id="map-message">{this.state.message}</span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="map-locate" className={this.state.coords.lat ? 'is-visible' : null} onClick={this.locate}>
					<path fill="#4285f4" d="M512 .1C246.2.1 172.6 219.7 172.6 344.7c0 274.6 270 679.3 339.4 679.3s339.4-404.6 339.4-679.3C851.4 219.6 777.8.1 512 .1zm0 471.1c-71.3 0-129-57.8-129-129s57.7-129.1 129-129.1 129 57.8 129 129-57.7 129.1-129 129.1z" />
				</svg>
				<Modal isVisible={this.state.showModal} title="Kinnita alguskoht?" text="Asukoha mitteleidmisel kuvatav koht" onCancel={this.modalHide} onConfirm={this.modalConfirm} />
			</div>
		);
	}
	
}
