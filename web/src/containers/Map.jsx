import React, { PureComponent } from 'react';
import { renderToString } from 'react-dom/server';
import { withRouter } from 'react-router-dom';

import Vehicle from 'components/Vehicle';

const googleMaps = window.google.maps;

@withRouter
export default class Map extends PureComponent {
	
	markers = []
	
	update = this.update.bind(this)
	
	update() {
		
		const map = window.map;
		const { markers } = this;
		
		if (map.getZoom() < 16) {
			
			for (const marker of markers) marker.setMap(null);
			
			return void (this.markers = []);
			
		}
		
		const bounds = map.getBounds();
		
		for (const i in markers) {
			const marker = markers[i];
			
			if (bounds.f.b < marker.position.lat() < bounds.f.f) continue;
			if (bounds.b.f > marker.position.lng() > bounds.b.b) continue;
			
			marker.setMap(null);
			this.markers.splice(i, 1);
			
		}
		
		stops:
		for (const stop of window.stops) {
			
			if (stop.lat > bounds.f.f || stop.lat < bounds.f.b) continue;
			if (stop.lng > bounds.b.f || stop.lng < bounds.b.b) continue;
			
			for (const marker of markers) if (marker.id === stop.id) continue stops;
			
			const marker = new googleMaps.Marker({
				id: stop.id,
				optimized: true,
				position: {
					lat: stop.lat,
					lng: stop.lng
				},
				icon: {
					url: `data:image/svg+xml;base64,${btoa(renderToString(Vehicle({ type: stop.type, silhouette: true, size: 26 })))}`
				},
				map
			});
			
			marker.addListener('click', () => {
				this.props.history.push(`/stop?id=${stop.id}`);
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
			clickableIcon: false,
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
		
		map.addListener('bounds_changed', this.update);
		window.map = map;
		
	}
	
	render() {
		return <div id="map" ref="map"></div>;
	}
	
}
