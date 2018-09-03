import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withRouter } from 'react-router-dom';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import Leaflet from 'leaflet';

import Icon from 'components/Icon.jsx';
import Modal from 'components/Modal/Modal.jsx';

import dragZoom from './dragZoom.js';

import './Map.css';
import 'leaflet/dist/leaflet.css';


@inject('storeStops', 'storeCoords')
@observer
@withRouter
export default class Map extends Component {
	
	state = {
		message: '',
		showModal: false,
		isLocating: false
	}
	
	dispose = []
	markers = []
	ids = []
	
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
	
	// Start locating.
	locate = () => {
		
		this.setState({ isLocating: true }, () => {
			window.map.flyTo([ this.props.storeCoords.lat, this.props.storeCoords.lng ]);
		});
		
	}
	
	// Redraw stops and update message based on bounds.
	update = () => {
		
		const map = window.map;
		
		// Handle message cases.
		if (!(new Leaflet.LatLngBounds([ 57.57, 21.84 ], [ 59.7, 28 ])).contains(map.getCenter())) {
			this.setState({ message: 'Bussiaeg.ee ei toimi väljaspool Eestit' });
		} else if (map.getZoom() < 15) {
			this.setState({ message: 'Suumige sisse, et näha peatusi' });
		} else {
			if (this.state.message) this.setState({ message: '' });
		}
		
		// Remove all stops if zoomed out.
		if (map.getZoom() < 15) {
			for (const marker of this.markers) marker.remove();
			this.markers = [];
			this.ids = [];
			return;
		}
		
		const bounds = map.getBounds();
		
		// Remove markers outside bounds.
		if (this.markers.length) {
			
			const markers = [];
			const ids = [];
			
			for (const marker of this.markers) {
				
				const coords = marker._latlng;
				
				if (coords.lat > bounds._southWest.lat && coords.lat < bounds._northEast.lat && coords.lng > bounds._southWest.lng && coords.lng < bounds._northEast.lng) {
					markers.push(marker);
					ids.push(marker.options.id);
				} else {
					marker.remove();
				}
				
			}
			
			this.markers = markers;
			this.ids = ids;
			
		}
		
		// Add markers inside bounds, excluding previous.
		for (const stop of this.props.storeStops.stops.filter(({ lat, lng }) => lat > bounds._southWest.lat && lat < bounds._northEast.lat && lng > bounds._southWest.lng && lng < bounds._northEast.lng)) {
			
			if (this.ids.indexOf(stop.id) > -1) continue;
			
			this.ids.push(stop.id);
			this.markers.push(new Leaflet.Marker([ stop.lat, stop.lng ], {
				id: stop.id,
				icon: new Leaflet.Icon({
					iconSize: [ 26, 26 ],
					iconAnchor: [ 13, 13 ],
					iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: stop.type })))}`
				})
			}).addTo(map).on('click', () => {
				this.props.history.push(`/stop?id=${stop.id}`);
			}));
			
		}
		
	}
	
	componentDidMount() {
		
		const start = JSON.parse(localStorage.getItem('start') || '{}');
		
		const map = window.map = new Leaflet.Map('map', {
			center: [
				start.lat || 59.436,
				start.lng || 24.753
			],
			zoom: start.zoom || 16,
			minZoom: 8,
			maxZoom: 18,
			preferCanvas: true,
			zoomControl: false,
			bounceAtZoomLimits: false,
			attributionControl: false,
			boxZoom: false,
			keyboard: false
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
						<circle fill="#00bfff" cx="512" cy="512" r="350" />
					</svg>
				))}`
			}),
		}).addTo(map);
		
		const circle = new Leaflet.Circle([ 0, 0 ], {
			renderer: new Leaflet.Canvas({ padding: 1 }),
			interactive: false,
			fillColor: '#00bfff',
			fillOpacity: .15,
			color: '#00bfff',
			weight: 2
		}).addTo(map);
		
		// Add third-party tile layer from configuration.
		Leaflet.tileLayer(process.env['REACT_APP_MAP']).addTo(map);
		
		// Redraw stops when available and on bounds change.
		this.update();
		map.on('moveend', this.update);
		
		// Open modal on right click (desktop) or hold (mobile).
		map.on('contextmenu', () => {
			this.setState({ showModal: true });
		});
		
		// Cancel locating on user interaction.
		$map.addEventListener('pointerdown', () => {
			if (this.state.isLocating) this.setState({ isLocating: false });
		}, { passive: true });
		
		// Update location marker and accuracy circle.
		this.dispose = reaction(() => ({
			lat: this.props.storeCoords.lat,
			lng: this.props.storeCoords.lng,
			accuracy: this.props.storeCoords.accuracy
		}), ({ lat, lng, accuracy }) => {
			
			if (accuracy < 512) {
				
				marker.setLatLng([ lat, lng ]);
				circle.setLatLng([ lat, lng ]);
				circle.setRadius(accuracy);
				
			} else {
				
				marker.setLatLng([ 0, 0 ]);
				circle.setLatLng([ 0, 0 ]);
				circle.setRadius(0);
				
			}
			
			// Pan map if locating.
			if (this.state.isLocating) map.flyTo([ lat, lng ]);
			
		});
		
		// Register drag zoom handler (for mobile).
		dragZoom(map);
		
		// Setup attribution.
		
		const attribution = Leaflet.control.attribution({
			position: 'topright',
			prefix: ''
		});
		
		attribution.addAttribution('<a href="https://openstreetmap.org" target="_blank" rel="noreferrer">OpenStreetMap</a>');
		attribution.addAttribution('<a href="https://mapbox.com/about/maps" target="_blank" rel="noreferrer">Mapbox</a>');
		attribution.addAttribution('<a href="https://mapbox.com/feedback" target="_blank" rel="noreferrer">Improve this map</a>');
		
		map.addControl(attribution);
		
	}
	
	componentWillUnmount() {
		this.dispose();
	}
	
	render() {
		return (
			<div id="map-container" className="view">
				<div id="map"></div>
				<span id="map-message">{this.state.message}</span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="map-locate" className={(this.props.storeCoords.accuracy < 512 ? 'is-visible' : '') + (this.state.isLocating ? ' is-active' : '')} onPointerDown={this.locate}>
					<path fill="#00bfff" d="M512 .1C246.2.1 172.6 219.7 172.6 344.7c0 274.6 270 679.3 339.4 679.3s339.4-404.6 339.4-679.3C851.4 219.6 777.8.1 512 .1zm0 471.1c-71.3 0-129-57.8-129-129s57.7-129.1 129-129.1 129 57.8 129 129-57.7 129.1-129 129.1z" />
				</svg>
				<Modal isVisible={this.state.showModal} title="Kinnita alguskoht" text="Asukoha mitteleidmisel kuvatav koht" onCancel={this.modalHide} onConfirm={this.modalConfirm} />
			</div>
		);
	}
	
};
