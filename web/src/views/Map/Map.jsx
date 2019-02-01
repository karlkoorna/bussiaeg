import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withRouter } from 'react-router-dom';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { withNamespaces } from 'react-i18next';
import { Helmet } from 'react-helmet';
import Leaflet from 'leaflet';

import Icon from 'components/Icon.jsx';
import Modal from 'components/Modal/Modal.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';

import storeSettings from 'stores/settings.js';
import { withTheme } from 'utils.js';
import dragZoom from './dragZoom.js';

import './Map.css';
import 'leaflet/dist/leaflet.css';

export const opts = {
	startZoom: 15,
	stopZoom: 15,
	startLat: 59.436,
	startLng: 24.753,
	minZoom: 8,
	maxZoom: 18,
	accuracyTreshold: 512,
	panTimeout: 1500
};

class Map extends Component {
	
	state = {
		message: '',
		showModal: false,
		isLocating: false
	}
	
	dispose = null
	debounce = 0
	
	tileLayer = null
	markers = []
	
	modalHide = () => {
		this.setState({ showModal: false });
	}
	
	// Update start location.
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
	
	// Start locating.
	startLocating = () => {
		
		const { map } = window;
		
		this.setState({ isLocating: true }, () => {
			map.flyTo([ this.props.storeCoords.lat, this.props.storeCoords.lng ], Math.max(opts.stopZoom, map.getZoom()));
		});
		
	}
	
	// Stop locating.
	stopLocating = () => {
		if (this.state.isLocating) this.setState({ isLocating: false });
	}
	
	// Update message based on bounds and redraw stops.
	fetchStops = async () => {
		
		const { t } = this.props;
		const { map } = window;
		const { _southWest: { lat: lat_min, lng: lng_min }, _northEast: { lat: lat_max, lng: lng_max } } = map.getBounds();
		
		// Handle message cases.
		if (!(new Leaflet.LatLngBounds([ 57.57, 21.84 ], [ 59.7, 28 ])).contains(map.getCenter())) {
			this.setState({ message: t('map.zoom') });
		} else if (map.getZoom() < opts.stopZoom) {
			this.setState({ message: t('map.bounds') });
		} else {
			if (this.state.message) this.setState({ message: '' });
		}
		
		try {
			
			// Remove all markers if zoomed below treshold.
			if (map.getZoom() < opts.stopZoom) {
				for (const marker of this.markers) marker.remove();
				return void (this.markers = []);
			}
			
			const stops = await (await fetch(`${process.env['REACT_APP_API']}/stops?lat_min=${lat_min}&lat_max=${lat_max}&lng_min=${lng_min}&lng_max=${lng_max}`)).json();
			
			// Remove out of bounds markers.
			for (const i in this.markers) {
				const marker = this.markers[i];
				
				if (marker._latlng.lat > lat_min && marker._latlng.lat < lat_max && marker._latlng.lng > lng_min && marker._latlng.lng < lng_max) continue;
				
				marker.remove();
				this.markers.splice(i, 1);
				
			}
			
			// Add new stop markers.
			for (const stop of stops) {
				
				if (this.markers.find((marker) => marker.options.id === stop.id)) continue;
				
				this.markers.push((new Leaflet.Marker([ stop.lat, stop.lng ], {
					id: stop.id,
					icon: new Leaflet.Icon({
						iconSize: [ 26, 26 ],
						iconAnchor: [ 13, 13 ],
						iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: stop.type })))}`
					})
				})).addTo(map).on('click', () => {
					this.props.history.push(`/stop?id=${stop.id}`);
				}));
				
			}
			
		} catch (ex) {}
		
	}
	
	// Update map tile layer.
	onThemeChange = () => {
		if (this.tileLayer) this.tileLayer.remove();
		this.tileLayer = Leaflet.tileLayer(process.env['REACT_APP_MAP_' + storeSettings.data.theme.toUpperCase()]).addTo(window.map);
	}
	
	componentDidMount() {
		
		const start = JSON.parse(localStorage.getItem('start') || '{}');
		
		const map = window.map = new Leaflet.Map('map', {
			center: [
				start.lat || opts.startLat,
				start.lng || opts.startLng
			],
			zoom: start.zoom || opts.startZoom,
			minZoom: opts.minZoom,
			maxZoom: opts.maxZoom,
			preferCanvas: true,
			zoomControl: false,
			bounceAtZoomLimits: false,
			attributionControl: false,
			boxZoom: false,
			keyboard: false,
			inertia: false
		});
		
		const $map = map._container;
		
		const marker = new Leaflet.Marker([ 0, 0 ], {
			interactive: false,
			icon: new Leaflet.Icon({
				iconSize: [ 20, 20 ],
				iconAnchor: [ 10, 10 ],
				iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
						<circle fill="#fff" cx="512" cy="512" r="512" />
						<circle fill="#00e6ad" cx="512" cy="512" r="350" />
					</svg>
				))}`
			}),
		}).addTo(map);
		
		const circle = new Leaflet.Circle([ 0, 0 ], {
			renderer: new Leaflet.Canvas({ padding: 1 }),
			interactive: false,
			fillColor: '#00e6ad',
			fillOpacity: .15,
			color: '#00e6ad',
			weight: 2
		}).addTo(map);
		
		// Load tile layer.
		this.onThemeChange();
		
		// Redraw stops.
		map.once('moveend', () => {
			
			map.on('zoomend', this.fetchStops);
			map.on('moveend', this.fetchStops);
			map.on('move', () => {
				this.debounce++;
				if (this.debounce < 15) return;
				this.debounce = 0;
				this.fetchStops();
			});
			
		});
		
		// Open modal on right click (desktop) or hold (mobile).
		map.on('contextmenu', () => {
			this.setState({ showModal: true });
		});
		
		// Cancel locating on user interaction.
		$map.addEventListener('mousedown', this.stopLocating, { passive: true });
		$map.addEventListener('touchstart', this.stopLocating, { passive: true });
		
		// Update location marker and accuracy circle.
		
		const timestamp = new Date();
		
		this.dispose = reaction(() => ({
			lat: this.props.storeCoords.lat,
			lng: this.props.storeCoords.lng,
			accuracy: this.props.storeCoords.accuracy
		}), ({ lat, lng, accuracy }) => {
			
			// Overlay accuracy cases.
			if (accuracy < opts.accuracyTreshold) { // Show overlay on high accuracy.
				
				marker.setLatLng([ lat, lng ]);
				circle.setLatLng([ lat, lng ]);
				circle.setRadius(accuracy);
				
			} else { // Hide overlay on low accuracy.
				
				marker.setLatLng([ 0, 0 ]);
				circle.setLatLng([ 0, 0 ]);
				circle.setRadius(0);
				
			}
			
			// Pan map if GPS found on load within timeout.
			if (new Date() - timestamp < opts.panTimeout) map.panTo([ lat, lng ]);
			
			// Pan map if locating.
			if (accuracy < opts.accuracyTreshold && this.state.isLocating) map.flyTo([ lat, lng ]);
			
		}, { fireImmediately: true });
		
		// Register drag zoom handler (for mobile).
		dragZoom(map);
		
		// Setup attribution.
		
		const attribution = Leaflet.control.attribution({
			position: 'topright',
			prefix: ''
		});
		
		attribution.addAttribution('<a target="_blank" rel="noopener noreferrer" href="https://openstreetmap.org">OpenStreetMap</a>');
		attribution.addAttribution('<a target="_blank" rel="noopener noreferrer" href="https://mapbox.com/about/maps">Mapbox</a>');
		attribution.addAttribution('<a target="_blank" rel="noopener noreferrer" href="https://mapbox.com/feedback">Improve this map</a>');
		
		map.addControl(attribution);
		
	}
	
	componentWillUnmount() {
		this.dispose();
	}
	
	render() {
		
		const { t } = this.props;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.map[0]} />
				</Helmet>
				<div id="map-container" className="view">
					<div id="map"></div>
					<span id="map-message">{this.state.message}</span>
					<i id="map-locate" className={`material-icons ${(this.props.storeCoords.accuracy < 512 ? 'is-visible' : '') + (this.state.isLocating ? ' is-active' : '')}`} onMouseDown={this.startLocating}>location_on</i>
					<Modal isVisible={this.state.showModal} title={t('map.start.title')} text={t('map.start.text')} showCancel onCancel={this.modalHide} onConfirm={this.modalConfirm} />
				</div>
			</>
		);
		
	}
	
}

export default withNamespaces()(withRouter(withTheme(inject('storeCoords')(observer(Map)))));
