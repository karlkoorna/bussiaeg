import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Ink from 'react-ink';

import VehicleIcon, { colors } from 'components/VehicleIcon.jsx';
import StopIcon from 'components/StopIcon.jsx';

import storeCoords from 'stores/coords.js';

import './Search.css';

export default class Search extends Component {
	
	state = {
		query: '',
		type: 'stops',
		results: []
	}
	
	debounce = null
	
	// Hide keyboard if enter key pressed (on mobile).
	hideKeyboard = (e) => {
		if (e.which === 13) e.target.blur();
	}
	
	// Clear query input field.
	clearQuery = (e) => {
		this.refs.$query.value = '';
		this.setState({ query: '' }, this.fetch);
	}
	
	// Update query and fetch new results.
	updateQuery = (e) => {
		
		const query = e.target.value;
		
		clearTimeout(this.debounce);
		this.debounce = setTimeout(() => {
			this.setState({ query }, this.fetch);
		}, 300);
		
	}
	
	// Update type, clear previous and fetch new results.
	updateType = (type) => {
		this.setState({ type, results: [] }, this.fetch);
	}
	
	// Fetch results by query, type and coords (if available).
	fetch = async () => {
		
		const { query, type } = this.state;
		const { lat, lng } = storeCoords.get();
		
		try {
			this.setState({ results: !lat && !lng && !query ? [] : await (await fetch(`${process.env['REACT_APP_API']}/search?${query ? `&query=${query}` : ''}&type=${type}${lat && lng ? `&lat=${lat}&lng=${lng}` : ''}`)).json() });
		} catch (ex) {
			this.setState({ results: [] });
		}
		
	}
	
	async componentWillMount() {
		if (Object.keys(await storeCoords.get(10)).length) this.fetch();
	}
	
	render() {
		
		const { type, results } = this.state;
		
		return (
			<section id="search" className={`view${ this.props.isActive ? ' is-visible': ''}`}>
				<div id="search-top">
					<input id="search-top-input" placeholder="Search..." autoComplete="off" required ref="$query" onKeyDown={this.hideKeyboard} onInput={this.updateQuery} />
					<svg xmlns="http://www.w3.org/2000/svg" style={this.state} viewBox="0 0 1024 1024">
						<path stroke="#b3b3b3" strokeWidth="125" d="M650.7 650.7l321 321" />
						<circle fill="transparent" stroke="#bdbdbd" strokeWidth="100" cx="399.3" cy="399.3" r="347" />
					</svg>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" onClick={this.clearQuery}>
						<path stroke="#b3b3b3" strokeWidth="128" d="M92 92l840 840M932 92L92 932" />
					</svg>
					<div id="search-top-types">
						<div className={'search-top-types-item' + (type === 'stops' ? ' is-active' : '')} onClick={() => this.updateType('stops')}>Stops
							<Ink hasTouch={false} background={false} opacity={.5} style={{ color: '#ffa94d' }} />
						</div>
						<div className={'search-top-types-item' + (type === 'routes' ? ' is-active' : '')} onClick={() => this.updateType('routes')}>Routes
							<Ink hasTouch={false} background={false} opacity={.5} style={{ color: '#ffa94d' }} />
						</div>
					</div>
				</div>
				<div id="search-results">
					{results.map((result, i) => (
						<div className="search-results-result-container" key={i}>
							<Link className="search-results-result" to={`/stop?id=${result.id}`}>
								{{ stops: StopIcon, routes: VehicleIcon }[type]({ className: `search-results-result-icon is-${type}`, type: result.type })}
								<div style={{ color: colors[result.type][0] }}>
									<div className="search-results-result-name">{result.name}</div>
									<div className="search-results-result-area">{result.direction || (result.origin && result.destination ? `${result.origin} - ${result.destination}` : '')}</div>
								</div>
								<div className="search-results-result-distance">{result.distance ? result.distance >= 100000 ? `${Math.round(result.distance / 10000) * 10}km` : result.distance >= 10000 ? `${(result.distance / 1000).toFixed()}km` : result.distance >= 1000 ? `${(result.distance / 1000).toFixed(1)}km` : `${Math.round(result.distance / 10) * 10}m` : ''}</div>
							</Link>
						</div>
					))}
				</div>
			</section>
		);
		
	}
	
};
