import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import { withRouter } from 'react-router-dom';

import IconStop from './IconStop';

const googleMaps = window.google.maps;

export default withRouter(class Map extends Component {
	
	update() {
		
		const { markers } = this.state;
		const map = window.map;
		
		if (map.getZoom() < 16) {
			
			for (const marker of markers) marker.setMap(null);
			
			return void this.setState({ markers: [] });
			
		}
		
		const bounds = map.getBounds();
		
		for (let i in markers) {
			const marker = markers[i];
			
			const [ lat, lng ] = [ marker.position.lat(), marker.position.lng() ];
			
			if (lat < bounds.f.f && lat > bounds.f.b && lng < bounds.b.f && lng > bounds.b.b) continue;
			
			marker.setMap(null);
			markers.splice(i, 1);
			
		}
		
		for (const stop of window.stops) {
			
			if (stop.lat > bounds.f.f || stop.lat < bounds.f.b) continue;
			if (stop.lng > bounds.b.f || stop.lng < bounds.b.b) continue;
			
			let found;
			for (const marker of markers) if (marker.id === stop.id) { found = true; break; }
			if (found) continue;
			
			const marker = new googleMaps.Marker({
				id: stop.id,
				optimized: true,
				position: { lat: stop.lat, lng: stop.lng },
				icon: {
					anchor: new googleMaps.Point(13, 13),
					url: 'data:image/svg+xml;charset=utf-8, ' + renderToString(IconStop({ type: stop.type, map: true })),
				},
				map
			});
			
			marker.addListener('click', function() {
				this.props.history.push('/stop?id=' + stop.id);
			}.bind(this));
			
			markers.push(marker);
			
		}
		
		this.setState({ markers });
		
	}
	
	locate(e) {
		
		const [ lat, lng, accuracy ] = [ e.coords.latitude, e.coords.longitude, e.coords.accuracy ];
		const { init, marker, circle } = this.state.gps;
		const map = window.map;
		const bounds = map.getBounds();
		
		marker.setPosition({ lat, lng });
		circle.setCenter({ lat, lng });
		circle.setRadius(accuracy);
		
		if (bounds) if (init || (lat < bounds.f.f && lat > bounds.f.b && lng < bounds.b.f && lng > bounds.b.b)) map.setCenter({ lat, lng });
		
		this.setState({ gps: { init: false, marker, circle } });
		
	}
	
	componentDidMount() {
		
		const map = new googleMaps.Map(this.refs.map, {
			center: {
				lat: 59.388,
				lng: 24.685
			},
			zoom: 16,
			minZoom: 7,
			maxZoom: 18,
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
		
		window.map = map;
		
		this.setState({
			markers: [],
			gps: {
				init: true,
				marker: new googleMaps.Marker({
					optimized: true,
					clickable: false,
					icon: {
						anchor: new googleMaps.Point(12, 12),
						url: 'data:image/svg+xml;charset=utf-8, ' + renderToString((
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="24">
								<circle fill="#fff" cx="512" cy="512" r="512" />
								<circle fill="#00bfff" cx="512" cy="512" r="400" />
							</svg>
						))
					},
					map
				}),
				circle: new googleMaps.Circle({
					clickable: false,
					fillColor: '#00bfff',
					fillOpacity: 0.15,
					strokeWeight: 0,
					map
				})
			}
		}, () => {
			
			map.addListener('bounds_changed', this.update.bind(this));
			navigator.geolocation.watchPosition(this.locate.bind(this));
			
		});
		
	}
	
	render() {
		return <div id="map" ref="map"></div>;
	}
	
});
