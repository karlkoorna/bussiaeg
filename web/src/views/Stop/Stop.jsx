import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withNamespaces } from 'react-i18next';
import { Helmet } from 'react-helmet';

import { formatTime, formatCountdown } from 'utils.js';

import Loader from 'components/Loader/Loader.jsx';
import Icon, { colors } from 'components/Icon.jsx';

import './Stop.css';

@withNamespaces()
@withRouter
@inject('storeFavorites')
@observer
export default class Stop extends Component {
	
	state = {
		id: '',
		name: '',
		description: '',
		type: '',
		trips: [],
		isFavorite: false,
		isLoading: true
	}
	
	interval = 0
	
	// Toggle favorite status.
	toggleFavorite = () => {
		
		const isFavorite = this.props.storeFavorites.toggle(this.state.id, {
			id: this.state.id,
			name: this.state.name,
			description: this.state.description,
			type: this.state.type
		});
		
		this.setState({ isFavorite });
		
	}
	
	// Update trips if mounted.
	fetchTrips = async () => {
		if (this._isMounted) this.setState({ trips: await (await fetch(`${process.env['REACT_APP_API']}/trips?stop=${this.state.id}`)).json(), isLoading: false });
	}
	
	async componentWillMount() {
		
		// Fetch and verify stop, redirect to home view if unsuccessful.
		let stop = await (await fetch(`${process.env['REACT_APP_API']}/stops?id=${(new URLSearchParams(window.location.search)).get('id')}`)).json();
		if (!stop.length) return void this.props.history.push('/');
		stop = stop[0];
		
		// Load stop data into state.
		this.setState({
			...stop,
			isFavorite: this.props.storeFavorites.exists(stop.id)
		}, () => {
			
			const map = window.map;
			
			// Pan map to stop if outside view.
			if (!map.getBounds().contains([ stop.lat, stop.lng ]) || map.getZoom() < 15) map.setView([ stop.lat, stop.lng ], 17);
			
			// Start fetching trips (with 2s interval).
			this.fetchTrips();
			this.interval = setInterval(this.fetchTrips, 2000);
			
		});
		
	}
	
	componentDidMount() {
		this._isMounted = true;
	}
	
	componentWillUnmount() {
		this._isMounted = false;
		clearInterval(this.interval);
	}
	
	render() {
		
		const t = this.props.t;
		const { id, name, description, type, trips, isFavorite, isLoading } = this.state;
		
		return (
			<Fragment>
				{id ? (
					<Helmet>
						<title>{name}</title>
						<meta name="theme-color" content={colors[type][0]} />
						<meta property="og:type" content="article" />
						<meta property="og:title" content={`Bussiaeg.ee: ${name} - ${description}`} />
					</Helmet>
				) : null}
				<main id="stop" className="view">
					<div id="stop-info">
						{id ? (
							<Fragment>
								<Icon id="stop-info-icon" shape="stop" type={type} />
								<span id="stop-info-description">{description}</span>
								<span id="stop-info-name">{name}</span>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="stop-info-favorite" className={isFavorite ? 'is-active' : null} onClick={this.toggleFavorite}>
									<path strokeWidth="100" d="M512 927.7l-65.7-59.8C213 656.3 58.9 516.3 58.9 345.5c0-140 109.6-249.2 249.2-249.2 78.8 0 154.5 36.7 203.9 94.2 49.4-57.5 125-94.2 203.9-94.2 139.5 0 249.2 109.2 249.2 249.2 0 170.8-154 310.8-387.4 522.4L512 927.7z" />
								</svg>
							</Fragment>
						) : null}
					</div>
					<div id="stop-trips">
						{isLoading ? <Loader /> : trips.length ? trips.map((trip, i) => {
							
							const [ primaryColor, secondaryColor ] = colors[trip.type];
							
							return (
								<Link className="stop-trips-trip" to={`/routes?id=${id}&name=${trip.name}&type=${trip.type}&provider=${trip.provider}`} key={trip.type + trip.name + trip.time}>
									<Icon className="stop-trips-trip-icon" shape="vehicle" type={trip.type} />
									<div className="stop-trips-trip-name" style={{ color: secondaryColor }}>{trip.name}</div>
									<div className="stop-trips-trip-destination" style={{ color: secondaryColor }}>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
											<path fill={primaryColor} d="M1024 512l-337.6 512H462l338.2-512L462 0h224.4z" />
											<path fill={secondaryColor} d="M562 512l-337.6 512H0l338.2-512L0 0h224.4z" />
										</svg>
										{trip.destination}
									</div>
									<div className="stop-trips-trip-countdown">
										{formatCountdown(trip.countdown)}
										{trip.live ? (
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill={primaryColor}>
												<path d="M87.2 492.3c31.7 7.3 62.6 17.6 92.5 30.2-5.1-2.1-10.3-4.3-15.3-6.4 45.3 19.2 88.3 43.8 127.3 73.9-4.3-3.3-8.7-6.7-13-10.1 31.8 24.6 60.6 52.9 85.2 84.7-3.3-4.3-6.7-8.7-10.1-13 22 28.5 40.3 59.5 54.2 92.7-2.1-5.1-4.3-10.3-6.4-15.3 14.3 34.4 24 70.5 29.1 107.3-.7-5.7-1.5-11.3-2.2-17.1 2.9 21.3 4.2 42.8 4.3 64.2 0 16.5 7.2 33.7 18.8 45.4 11.1 11.1 29.4 19.5 45.4 18.8 16.6-.7 33.8-6.2 45.4-18.8 11.6-12.5 18.8-28.1 18.8-45.4 0-32-3.4-63.9-8.7-95.5-4.1-24.3-10.3-48.3-18.5-71.4-9.5-26.8-21-53.1-34.9-78-13.4-23.9-29.3-45.8-46.3-67.3-29.6-37.8-65.2-69.1-103.5-97.8-32-23.9-66.8-44.2-103.1-60.9-36.6-16.8-74.3-31.4-113.4-41.3-3.9-1-7.6-1.9-11.5-2.8-16.7-3.9-34.5-2.2-49.5 6.4-13.3 7.8-26 23.1-29.6 38.4-3.7 16.5-2.9 34.9 6.4 49.5 9.1 13.9 22.2 25.9 38.6 29.6zm84.7-366.2c40.4 6.1 79.9 17 118.2 30.9 12 4.4 23.8 9 35.5 14-5.1-2.1-10.3-4.3-15.3-6.4 56.5 23.9 110.4 54.1 161 88.8 15.2 10.5 30.1 21.3 44.8 32.7-4.3-3.3-8.7-6.7-13-10.1 52.3 40.4 100.5 85.8 143.9 135.4 12.6 14.6 24.9 29.4 36.7 44.8-3.3-4.3-6.7-8.7-10.1-13 37.9 49 71.2 101.7 98.7 157.4 8 16.3 15.6 32.9 22.7 49.7-2.1-5.1-4.3-10.3-6.4-15.3 23.1 55.1 40.8 112.5 52.3 171.2 3.3 17.1 6.2 34.4 8.5 51.6-.7-5.7-1.5-11.3-2.2-17.1 5.2 39.4 7.8 79.2 7.9 119 0 16.5 7.2 33.7 18.8 45.4 11.1 11.1 29.4 19.5 45.4 18.8 16.6-.7 33.8-6.2 45.4-18.8 11.6-12.5 18.8-28.1 18.8-45.4-.1-101.1-16-203.1-48.3-299-30-88.7-72.4-173.4-126.5-249.7-51.2-72.3-110.4-138.6-178-195.9C568.4 162.1 500.6 115 427.5 78c-63-31.8-130.3-58.5-200-72-7.1-1.4-14.2-2.6-21.4-3.6-8.6-2.7-17.1-3.1-25.6-1.2-8.6.4-16.5 2.9-23.9 7.6-13.3 7.8-26 23.1-29.6 38.4-3.7 16.5-2.9 34.9 6.4 49.5 8.5 13.1 22.3 27 38.5 29.4z" />
											</svg>
										) : null}
									</div>
									<div className="stop-trips-trip-time">{formatTime(trip.time)}</div>
								</Link>
							);
							
						}) : (
							<div className="view-empty">
								{t('stop.empty')}
							</div>
						)}
					</div>
				</main>
			</Fragment>
		);
		
	}
	
};
