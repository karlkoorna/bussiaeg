import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withRouter } from 'react-router-dom';
import { reaction } from 'mobx';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import Leaflet from 'leaflet';
import KDBush from 'kdbush';

import Icon from 'components/Icon.jsx';
import Modal from 'components/Modal/Modal.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';
import storeCoords from 'stores/coords.js';
import storeSettings from 'stores/settings.js';
import storeFavorites from 'stores/favorites.js';
import { prepareViewData } from 'utils.js';
import addDragZoom from './dragZoom.js';

import './Map.css';
import 'leaflet/dist/leaflet.css';

export const opts = {
	startZoom: 15,
	stopZoom: 15,
	startLat: 59.436,
	startLng: 24.753,
	minZoom: 8,
	maxZoom: 18,
	panTimeout: 1500,
	panAccuracy: 1000,
	locateAccuracy: 150
};

class ViewMap extends Component {
	
	state = {
		message: '',
		showModal: false,
		isVisible: false,
		isLocating: false
	}
	
	debounce = 0
	tileLayer = null
	
	stops = []
	spatial = []
	markers = {}
	
	modalHide = () => {
		this.setState({ showModal: false });
	}
	
	// Update start location.
	modalConfirm = () => {
		this.modalHide();
		
		const map = window.map;
		const center = map.getCenter();
		
		localStorage.setItem('start', JSON.stringify({
			lat: center.lat,
			lng: center.lng,
			zoom: map.getZoom()
		}));
	}
	
	// Start locating at zoom where stops are visible.
	startLocating = () => {
		const map = window.map;
		
		this.setState({ isLocating: true }, () => {
			map.setView([ storeCoords.lat, storeCoords.lng ], Math.max(opts.stopZoom, map.getZoom()));
		});
	}
	
	// Stop locating.
	stopLocating = () => {
		if (this.state.isLocating) this.setState({ isLocating: false });
	}
	
	// Update map message.
	updateMessage = () => {
		const { t } = this.props;
		const map = window.map;
		
		if (!(new Leaflet.LatLngBounds([ 57.57, 21.84 ], [ 59.7, 28 ])).contains(map.getCenter())) this.setState({ message: t('map.zoom') });
		else if (!storeCoords.enabled) this.setState({ message: t('map.gps') });
		else if (map.getZoom() < opts.stopZoom) this.setState({ message: t('map.bounds') });
		else if (this.state.message) this.setState({ message: '' });
	}
	
	// Update map stops.
	updateStops = (redraw) => {
		this.updateMessage();
		
		const map = window.map;
		const { _southWest: { lat: latMin, lng: lngMin }, _northEast: { lat: latMax, lng: lngMax } } = map.getBounds();
		const zoom = map.getZoom();
		
		// Remove all markers if zoomed below threshold.
		if (zoom < opts.stopZoom) {
			for (const marker of Object.values(this.markers)) marker.remove();
			return void (this.markers = {});
		}
		
		// Remove out of bounds markers.
		for (const id in this.markers) {
			const marker = this.markers[id];
			
			if (!redraw || (marker._latlng.lat > latMin && marker._latlng.lat < latMax && marker._latlng.lng > lngMin && marker._latlng.lng < lngMax)) continue;
			
			marker.remove();
			delete this.markers[id];
		}
		
		for (const stop of this.spatial.range(latMin, lngMin, latMax, lngMax).map((id) => this.stops[id])) if (!this.markers[stop.id]) this.markers[stop.id] = (new Leaflet.Marker([ stop.lat, stop.lng ], {
			id: stop.id,
			icon: new Leaflet.Icon({
				iconSize: [ 32, 32 ],
				iconAnchor: [ 16, 16 ],
				iconUrl: 'data:image/svg+xml;base64,' + btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: stop.type, checkFavorite: stop.id, forMap: true })))
			})
		})).addTo(map).on('click', () => {
			prepareViewData('stop', stop);
			this.props.history.push(`/stop?id=${stop.id}`);
		});
	}
	
	async componentDidMount() {
		const start = JSON.parse(localStorage.getItem('start') || '{}');
		
		const map = window.map = new Leaflet.Map('map-leaflet', {
			center: [
				start.lat || opts.startLat,
				start.lng || opts.startLng
			],
			zoom: start.zoom || opts.startZoom,
			minZoom: opts.minZoom,
			maxZoom: opts.maxZoom,
			zoomControl: false,
			bounceAtZoomLimits: false,
			attributionControl: false,
			zoomSnap: .1,
			zoomDelta: 1
		});
		
		// Expose function to global map variable.
		map.updateMessage = this.updateMessage;
		
		// Fix map size.
		setTimeout(() => {
			map.invalidateSize();
		}, 0);
		
		// Load tile layer and update on theme change.
		reaction(() => storeSettings.data.theme, (theme) => {
			if (this.tileLayer) this.tileLayer.remove();
			this.tileLayer = Leaflet.tileLayer(process.env['REACT_APP_MAP_' + theme.toUpperCase()]).addTo(window.map);
		}, { fireImmediately: true });
		
		// Cancel locating on user interaction.
		map._container.addEventListener('mousedown', this.stopLocating, { passive: true });
		map._container.addEventListener('touchstart', this.stopLocating, { passive: true });
		
		this.stops = await (await fetch(`${process.env['REACT_APP_API']}/stops`)).json();
		this.spatial = new KDBush(this.stops, (stop) => stop.lat, (stop) => stop.lng, 64, Float32Array);
		
		const marker = new Leaflet.Marker([ 0, 0 ], {
			interactive: false,
			icon: new Leaflet.Icon({
				iconSize: [ 20, 20 ],
				iconAnchor: [ 10, 10 ],
				iconUrl: 'data:image/svg+xml;base64,' + btoa(renderToStaticMarkup((
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
						<circle fill="#fff" cx="512" cy="512" r="512" />
						<circle fill={viewColors.map[0]} cx="512" cy="512" r="350" />
					</svg>
				)))
			})
		}).addTo(map);
		
		const circle = new Leaflet.Circle([ 0, 0 ], {
			interactive: false,
			renderer: new Leaflet.SVG({ padding: 1 }),
			fillColor: viewColors.map[0],
			fillOpacity: .15,
			color: viewColors.map[0],
			weight: 2
		}).addTo(map);
		
		// (Re)draw stops.
		map.whenReady(() => {
			reaction(() => storeFavorites.favorites.length, this.updateStops.bind(this, true));
			map.on('moveend', this.updateStops);
			map.on('move', () => {
				this.debounce++;
				if (this.debounce < 10) return;
				this.debounce = 0;
				this.updateStops();
			});
			this.updateStops();
		});
		
		// Open modal on right click (desktop) or hold (mobile).
		map.on('mousedown contextmenu', (e) => {
			if (e.type !== 'contextmenu' && e.originalEvent.button !== 2) return;
			
			map.dragging.disable();
			map.dragging.enable();
			this.setState({ showModal: true });
		});
		
		// Add drag zoom handler (mobile).
		addDragZoom(map);
		
		const timestamp = new Date();
		
		// Update location marker, accuracy circle and locate button.
		reaction(() => ({
			lat: storeCoords.lat,
			lng: storeCoords.lng,
			accuracy: storeCoords.accuracy
		}), ({ lat, lng, accuracy }) => {
			if (accuracy < opts.locateAccuracy) { // Show marker and circle on high accuracy.
				marker.setLatLng([ lat, lng ]);
				circle.setLatLng([ lat, lng ]);
				circle.setRadius(accuracy <= 10 ? 0 : accuracy); // Hide circle on very high accuracy.
			} else { // Hide marker and circle on low accuracy.
				marker.setLatLng([ 0, 0 ]);
				circle.setRadius(0);
			}
			
			// Show/hide locate button.
			this.setState({ isVisible: accuracy < opts.locateAccuracy });
			
			// Pan map if locating.
			if (this.state.isLocating) return void map.panTo([ lat, lng ], { duration: .5 });
			
			// Pan map if coords found within timeout.
			if (accuracy < opts.panAccuracy && new Date() - timestamp < opts.panTimeout) map.setView([ lat, lng ]);
		}, { fireImmediately: true });
		
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
	
	render() {
		const { t } = this.props;
		const { isVisible, isLocating } = this.state;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.map[0]} />
				</Helmet>
				<div id="map" className="view">
					<div id="map-leaflet" />
					<span id="map-message">{this.state.message}</span>
					<svg viewBox="0 0 24 24" id="map-locate" className={(isVisible ? ' is-visible' : '') + (isLocating ? ' is-active' : '')} onMouseDown={this.startLocating}>
						<path fill={viewColors.map[0]} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
					</svg>
					<Modal isVisible={this.state.showModal} title={t('map.start.title')} text={t('map.start.text')} showCancel onCancel={this.modalHide} onConfirm={this.modalConfirm} />
				</div>
			</>
		);
	}
	
}

export default withTranslation()(withRouter(ViewMap));
