import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Loading from '../Loading/Loading';
import IconStop from '../IconStop';
import IconVehicle from '../IconVehicle';
import './Stop.css';

export default withRouter(class Stop extends Component {
	
	async update() {
		this.setState({ trips: await (await fetch(`${process.env['REACT_APP_API']}/gettrips?id=${this.state.stop.id}`)).json() });
	}
	
	componentWillMount() {
		
		const stop = window.stops.find((stop) => stop.id === (new URLSearchParams(window.location.search).get('id')));
		
		if (!stop) return void this.props.history.push('/');
		
		if (!window.init) setTimeout(() => {
			window.map.setCenter({ lat: stop.lat, lng: stop.lng });
			window.init = true;
		}, 100);
		
		this.update.call(this);
		
		this.setState({
			interval: setInterval(this.update.bind(this), 2000),
			trips: [],
			stop
		});
		
	}
	
	componentWillUnmount() {
		if (this.state) clearInterval(this.state.interval);
	}
	
	render() {
		
		if (!this.state) return null;
		
		const { stop, trips } = this.state;
		
		return (
			<Fragment>
				<div id="stop-bar">
					{IconStop({ type: stop.type })}
					<span id="stop-bar-name">{stop.name}</span>
					<span id="stop-bar-extra">{stop.name}</span>
				</div>
				<div id="stop-trips">
				{
					trips.length ? trips.map((trip) => {
						
						const [ primaryColor, secondaryColor ] = {
							bus: [ '#00e1b4', '#00a181' ],
							trol: [ '#3682ce', '#255a8e' ],
							tram: [ '#ff7b3b', '#bf5c2c' ],
							train: [ '#f69b4c', '#b67338' ],
							coach: [ '#b552ba', '#79377c' ]
						}[trip.type];
						
						return (
							<div className="stop-trips-trip" key={trip.shortName + trip.altTime}>
								{IconVehicle({ type: trip.type, className: 'stop-trips-trip-icon' })}
								<div className="stop-trips-trip-shortname" style={{ color: secondaryColor }}>{trip.shortName}</div>
								<div className="stop-trips-trip-longname" style={{ color: secondaryColor }}>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill={primaryColor}>
										<path d="M562 512l-337.6 512H0l338.2-512L0 0h224.4z" />
										<path d="M1024 512l-337.6 512H462l338.2-512L462 0h224.4z" />
									</svg>
									{trip.longName}
								</div>
								<div className="stop-trips-trip-countdown">
									{trip.time.split('m')[0]}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill={trip.gps !== 'off' ? primaryColor : 'transparent'}>
										<path d="M87.2 492.3c31.7 7.3 62.6 17.6 92.5 30.2-5.1-2.1-10.3-4.3-15.3-6.4 45.3 19.2 88.3 43.8 127.3 73.9-4.3-3.3-8.7-6.7-13-10.1 31.8 24.6 60.6 52.9 85.2 84.7-3.3-4.3-6.7-8.7-10.1-13 22 28.5 40.3 59.5 54.2 92.7-2.1-5.1-4.3-10.3-6.4-15.3 14.3 34.4 24 70.5 29.1 107.3-.7-5.7-1.5-11.3-2.2-17.1 2.9 21.3 4.2 42.8 4.3 64.2 0 16.5 7.2 33.7 18.8 45.4 11.1 11.1 29.4 19.5 45.4 18.8 16.6-.7 33.8-6.2 45.4-18.8 11.6-12.5 18.8-28.1 18.8-45.4 0-32-3.4-63.9-8.7-95.5-4.1-24.3-10.3-48.3-18.5-71.4-9.5-26.8-21-53.1-34.9-78-13.4-23.9-29.3-45.8-46.3-67.3-29.6-37.8-65.2-69.1-103.5-97.8-32-23.9-66.8-44.2-103.1-60.9-36.6-16.8-74.3-31.4-113.4-41.3-3.9-1-7.6-1.9-11.5-2.8-16.7-3.9-34.5-2.2-49.5 6.4-13.3 7.8-26 23.1-29.6 38.4-3.7 16.5-2.9 34.9 6.4 49.5 9.1 13.9 22.2 25.9 38.6 29.6zm84.7-366.2c40.4 6.1 79.9 17 118.2 30.9 12 4.4 23.8 9 35.5 14-5.1-2.1-10.3-4.3-15.3-6.4 56.5 23.9 110.4 54.1 161 88.8 15.2 10.5 30.1 21.3 44.8 32.7-4.3-3.3-8.7-6.7-13-10.1 52.3 40.4 100.5 85.8 143.9 135.4 12.6 14.6 24.9 29.4 36.7 44.8-3.3-4.3-6.7-8.7-10.1-13 37.9 49 71.2 101.7 98.7 157.4 8 16.3 15.6 32.9 22.7 49.7-2.1-5.1-4.3-10.3-6.4-15.3 23.1 55.1 40.8 112.5 52.3 171.2 3.3 17.1 6.2 34.4 8.5 51.6-.7-5.7-1.5-11.3-2.2-17.1 5.2 39.4 7.8 79.2 7.9 119 0 16.5 7.2 33.7 18.8 45.4 11.1 11.1 29.4 19.5 45.4 18.8 16.6-.7 33.8-6.2 45.4-18.8 11.6-12.5 18.8-28.1 18.8-45.4-.1-101.1-16-203.1-48.3-299-30-88.7-72.4-173.4-126.5-249.7-51.2-72.3-110.4-138.6-178-195.9C568.4 162.1 500.6 115 427.5 78c-63-31.8-130.3-58.5-200-72-7.1-1.4-14.2-2.6-21.4-3.6-8.6-2.7-17.1-3.1-25.6-1.2-8.6.4-16.5 2.9-23.9 7.6-13.3 7.8-26 23.1-29.6 38.4-3.7 16.5-2.9 34.9 6.4 49.5 8.5 13.1 22.3 27 38.5 29.4z" />
									</svg>
									<span> min</span>
								</div>
								<div className="stop-trips-trip-time">{trip.altTime}</div>
							</div>
						);
						
					}) : <Loading />
				}
				</div>
			</Fragment>
		);
		
	}
	
});
