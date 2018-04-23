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
		
		const map = window.map;
		const markers = this.markers;
		
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
				icon: `data:image/svg+xml;base64,${btoa(renderToString(Vehicle({ type: stop.type, silhouette: true, size: 26 })))}`,
				map
			});
			
			marker.addListener('click', () => {
				this.props.history.push(`stop?id=${stop.id}`);
			});
			
			this.markers.push(marker);
			
		}
		
	}
	
	componentDidMount() {
		
		const map = new googleMaps.Map(this.refs.map, {
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
		
		map.addListener('bounds_changed', this.update);
		window.map = map;
		
		navigator.geolocation.watchPosition((e) => {
			
			const { latitude, longitude, accuracy } = e.coords;
			
			const coords = {
				lat: latitude,
				lng: longitude
			};
			
			marker.setPosition(coords);
			circle.setCenter(coords);	
			circle.setRadius(accuracy);
			
			if (!this.coords.lat) map.panTo(coords);
			
			this.coords = coords;
			
		}, (err) => {}, {
			enableHighAccuracy: true,
			timeout: 100
		});
		
	}
	
	locate() {
		if (this.coords.lat) window.map.panTo(this.coords);
	}
	
	render() {
		return (
			<div id="map">
				<div id="map-container" ref="map"></div>
				<div id="map-locate" onClick={this.locate}></div>
			</div>
		);
	}
	
}
