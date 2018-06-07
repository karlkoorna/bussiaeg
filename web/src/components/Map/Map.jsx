import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withRouter } from 'react-router-dom';
import Leaflet from 'leaflet';

import StopIcon from 'components/StopIcon.jsx';
import Modal from 'components/Modal/Modal.jsx';
import doubleTapDrag from './doubleTapDrag.js';

import './Map.css';
import 'leaflet/dist/leaflet.css';

@withRouter
export default class Map extends Component {
	
	state = {
		coords: {},
		message: '',
		showModal: false,
		showLocate: false
	}
	
	stops = []
	markers = []
	
	// Redraw stops based on viewport.
	update = () => {
		
		const { map } = window;
		
		// Remove all stops.
		
		for (const marker of this.markers) marker.remove();
		
		this.markers = [];
		
		// Add stops in viewport if zoomed in.
		
		if (map.getZoom() < 16) return this.setState({ message: 'Suumige sisse, et näha peatusi' });
		else this.setState({ message: '' });
		
		const bounds = map.getBounds();
		
		for (const stop of this.stops) {
			
			if (stop.lat < bounds._southWest.lat || stop.lat > bounds._northEast.lat) continue;
			if (stop.lng < bounds._southWest.lng || stop.lng > bounds._northEast.lng) continue;
			
			this.markers.push(new Leaflet.Marker([ stop.lat, stop.lng ], {
				icon: new Leaflet.Icon({
					iconSize: [ 26, 26 ],
					iconAnchor: [ 13, 13 ],
					iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(StopIcon({ type: stop.type })))}`
				})
			}).addTo(map).on('click', () => {
				this.props.history.push(`/stop?id=${stop.id}`);
			}));
			
		}
		
	}
	
	// Pan map to current location.
	locate = () => {
		
		const { coords } = this.state;
		
		if (coords.lat) window.map.panTo(coords);
		
	}
	
	// Hide modal.
	modalHide = () => {
		this.setState({ showModal: false });
	}
	
	// Set map center to start location.
	modalConfirm = () => {
		
		this.modalHide();
		
		const { map } = window;
		const center = map.getCenter();
		
		localStorage.setItem('start', JSON.stringify({
			lat: center.lat,
			lng: center.lng,
			zoom: map.getZoom()
		}));
		
	}
	
	// Preload stops before mount.
	async componentWillMount() {
		this.stops = await (await fetch(`${process.env['REACT_APP_API']}/getstops?lat_min=60.0&lng_min=60.0&lat_max=20.0&lng_max=20.0`)).json();
	}
	
	// Initialize map after mount.
	componentDidMount() {
		
		const start = JSON.parse(localStorage.getItem('start') || '{}');
		
		const map = window.map = new Leaflet.Map('map-container', {
			center: [
				start.lat || 59.436,
				start.lng || 24.753
			],
			zoom: start.zoom || 16,
			minZoom: 8,
			maxZoom: 18,
			zoomControl: false,
			bounceAtZoomLimits: false,
			attributionControl: false,
			boxZoom: false,
			keyboard: false,
			preferCanvas: true
		});
		
		// Add third-party tile layer from configuration.
		Leaflet.tileLayer(process.env['REACT_APP_MAP']).addTo(map);
		
		// Redraw stops on map move end.
		map.on('moveend', this.update);
		setImmediate(() => map.panBy([ 1, 1 ]));
		
		// Open modal on right click (desktop) and hold (mobile).
		map.on('contextmenu', () => {
			this.setState({ showModal: true });
		});
		
		// Register double tap drag handler (mobile zoom).
		doubleTapDrag(map);
		
		// Setup attribution.
		
		const attribution = Leaflet.control.attribution({
			position: 'topright',
			prefix: ''
		});
		
		attribution.addAttribution('<a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>');
		attribution.addAttribution('<a href="https://mapbox.com/about/maps" target="_blank">Mapbox</a>');
		attribution.addAttribution('<a href="https://mapbox.com/feedback" target="_blank">Improve this map</a>');
		
		map.addControl(attribution);
		
		// Setup current location marker and accuracy circle.
		
		const marker = new Leaflet.Marker([ 0, 0 ], {
			interactive: false,
			icon: new Leaflet.Icon({
				iconSize: [ 20, 20 ],
				iconAnchor: [ 10, 10 ],
				iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(
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
		
		// Update current location.
		
		// Pan timeout reference.
		const timestamp = new Date();
		
		watchPosition.call(this);
		function watchPosition() {
			
			navigator.geolocation.watchPosition((e) => {
				
				const { latitude: lat, longitude: lng, accuracy } = e.coords;
				const coords = { lat, lng, accuracy };
				
				this.setState({ coords });
				
				// Pan map if within timeout.
				if (new Date() - timestamp < 2000) map.panTo(coords);
				
				// Hide locate button if location is inacurrate.
				this.setState({ showLocate: accuracy < 500 });
				
				// Handle low accuracy cases.
				
				if (accuracy > 1000 && start.lat) {
					
					map.setView([ start.lat, start.lng ], start.zoom);
					
				} else if (accuracy > 500) {
					
					marker.setLatLng([ 0, 0 ]);
					circle.setLatLng([ 0, 0 ]);
					circle.setRadius(0);
					
				} else {
					
					marker.setLatLng(coords);
					circle.setLatLng(coords);
					circle.setRadius(accuracy);
					
				}
				
			}, (err) => {
				// Retry if location unavailable or denied (watching cancelled).
				if (err.code !== 3) setTimeout(watchPosition.bind(this), 3000);
			}, {
				enableHighAccuracy: true,
				timeout: 250
			});
			
		}
		
	}
	
	render() {
		return (
			<div id="map">
				<div id="map-container"></div>
				<span id="map-message">{this.state.message}</span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="map-locate" className={this.state.showLocate ? 'is-visible' : null} onClick={this.locate}>
					<path fill="#4285f4" d="M512 .1C246.2.1 172.6 219.7 172.6 344.7c0 274.6 270 679.3 339.4 679.3s339.4-404.6 339.4-679.3C851.4 219.6 777.8.1 512 .1zm0 471.1c-71.3 0-129-57.8-129-129s57.7-129.1 129-129.1 129 57.8 129 129-57.7 129.1-129 129.1z" />
				</svg>
				<Modal isVisible={this.state.showModal} title="Kinnita alguskoht" text="Asukoha mitteleidmisel kuvatav koht" onCancel={this.modalHide} onConfirm={this.modalConfirm} />
			</div>
		);
	}
	
}
