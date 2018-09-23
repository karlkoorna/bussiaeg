import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import SwipeableViews from 'react-swipeable-views';
import Ink from 'react-ink';

import Gate from 'components/Gate.jsx';
import Scroller from 'components/Scroller.jsx';
import Icon, { colors } from 'components/Icon.jsx';

import './Search.css';

function Result({ type, data }) {
	return (
		<div className="search-results-result-container">
			<Link className="search-results-result" to={`/${type.slice(0, -1)}?id=${data.id}`}>
				<Icon className={`search-results-result-icon is-${type}`} shape={[ 'stop', 'vehicle' ][Number(type === 'routes')]} type={data.type} />
				<div style={{ color: colors[data.type][0] }}>
					<div className="search-results-result-name">{data.name}</div>
					<div className="search-results-result-area">{data.direction || (data.origin && data.destination ? `${data.origin} - ${data.destination}` : '')}</div>
				</div>
				<div className="search-results-result-distance">~{data.distance ? data.distance >= 100000 ? `${Math.round(data.distance / 10000) * 10}km` : data.distance >= 10000 ? `${(data.distance / 1000).toFixed()}km` : data.distance >= 1000 ? `${(data.distance / 1000).toFixed(1)}km` : `${Math.round(data.distance / 10) * 10}m` : ''}</div>
			</Link>
		</div>
	);
}

@inject('storeSearch', 'storeCoords')
@observer
export default class Search extends Component {
	
	dispose = null
	debounce = 0
	
	updateQuery = (e) => {
		
		this.props.storeSearch.query = e.target.value;
		
		clearTimeout(this.debounce);
		this.debounce = setTimeout(this.props.storeSearch.fetchResults, 250);
		
	}
	
	clearQuery = (e) => {
		this.props.storeSearch.query = '';
		this.props.storeSearch.fetchResults();
	}
	
	hideKeyboard = (e) => {
		if (e.which === 13) e.target.blur();
	}
	
	updateType = (type) => {
		this.props.storeSearch.type = type;
	}
	
	swipeType = (index) => {
		this.updateType(index ? 'routes' : 'stops');
	}
	
	componentWillMount() {
		
		this.dispose = reaction(() => ({
			lat: this.props.storeCoords.lat,
			lng: this.props.storeCoords.lng
		}), () => {
			if (!this.props.storeSearch.query) this.props.storeSearch.fetchResults();
		});
		
	}
	
	componentWillUnmount() {
		this.dispose();
	}
	
	render() {
		
		const { query, type, results } = this.props.storeSearch;
		
		return (
			<main id="search" className="view">
				<div id="search-top">
					<input id="search-top-input" value={query} placeholder="Search..." autoComplete="off" required onKeyDown={this.hideKeyboard} onChange={this.updateQuery} />
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
						<path stroke="#b3b3b3" strokeWidth="125" d="M650.7 650.7l321 321" />
						<circle fill="transparent" stroke="#bdbdbd" strokeWidth="100" cx="399.3" cy="399.3" r="347" />
					</svg>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" onMouseDown={this.clearQuery}>
						<path stroke="#b3b3b3" strokeWidth="128" d="M92 92l840 840M932 92L92 932" />
					</svg>
					<div id="search-top-types">
						<div className={'search-top-types-item' + (type === 'stops' ? ' is-active' : '')} onMouseDown={() => { this.updateType('stops'); }}>Stops
							<Gate><Ink hasTouch={false} background={false} opacity={.5} style={{ color: '#ffa94d' }} /></Gate>
						</div>
						<div className={'search-top-types-item' + (type === 'routes' ? ' is-active' : '')} onMouseDown={() => { this.updateType('routes'); }}>Routes
							<Gate><Ink hasTouch={false} background={false} opacity={.5} style={{ color: '#ffa94d' }} /></Gate>
						</div>
					</div>
				</div>
				<Scroller>
					<SwipeableViews id="search-results" index={Number(type === 'routes')} onChangeIndex={this.swipeType}>
						<Gate check={results.stops}>
							{results.stops.map((stop) => <Result type="stops" data={stop} key={stop.id} />)}
						</Gate>
						<Gate check={results.routes}>
							{results.routes.map((route) => <Result type="routes" data={route} key={route.id} />)}
						</Gate>
					</SwipeableViews>
				</Scroller>
			</main>
		);
		
	}
	
};
