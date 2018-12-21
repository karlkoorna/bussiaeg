import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withNamespaces } from 'react-i18next';
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
					<div className="search-results-result-area">{data.description || (data.origin && data.destination ? `${data.origin} - ${data.destination}` : '')}</div>
				</div>
				<div className="search-results-result-distance">~{data.distance ? data.distance >= 100000 ? `${Math.round(data.distance / 10000) * 10}km` : data.distance >= 10000 ? `${(data.distance / 1000).toFixed()}km` : data.distance >= 1000 ? `${(data.distance / 1000).toFixed(1)}km` : `${Math.round(data.distance / 10) * 10}m` : ''}</div>
			</Link>
		</div>
	);
}

@withNamespaces()
@inject('storeSearch')
@observer
export default class Search extends Component {
	
	dispose = null
	debounce = 0
	
	updateQuery = (e) => {
		
		this.props.storeSearch.updateQuery(e.target.value);
		
		clearTimeout(this.debounce);
		this.debounce = setTimeout(this.props.storeSearch.fetchResults, 250);
		
	}
	
	clearQuery = (e) => {
		this.props.storeSearch.updateQuery('');
		this.props.storeSearch.fetchResults();
	}
	
	changeType = (index) => {
		this.props.storeSearch.updateType(index ? 'routes' : 'stops');
	}
	
	hideKeyboard = (e) => {
		if (e.which === 13) e.target.blur();
	}
	
	componentWillMount() {
		this.props.storeSearch.startScanning();
	}
	
	componentWillUnmount() {
		this.props.storeSearch.stopScanning();
	}
	
	render() {
		
		const t = this.props.t;
		const { query, type, results } = this.props.storeSearch;
		
		return (
			<main id="search" className="view">
				<div id="search-top">
					<input id="search-top-input" value={query} placeholder={t('search.search')} autoComplete="off" required onKeyDown={this.hideKeyboard} onChange={this.updateQuery} />
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
						<path strokeWidth="125" d="M650.7 650.7l321 321" />
						<circle fill="transparent" strokeWidth="100" cx="399.3" cy="399.3" r="347" />
					</svg>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" onMouseDown={this.clearQuery}>
						<path strokeWidth="128" d="M92 92l840 840M932 92L92 932" />
					</svg>
					<div id="search-top-types">
						<div className={'search-top-types-item' + (type === 'stops' ? ' is-active' : '')} onMouseDown={() => { this.changeType(0); }}>{t('search.stops')}
							<Gate><Ink hasTouch={false} background={false} opacity={.5} style={{ color: '#ffa94d' }} /></Gate>
						</div>
						<div className={'search-top-types-item' + (type === 'routes' ? ' is-active' : '')} onMouseDown={() => { this.changeType(1); }}>{t('search.routes')}
							<Gate><Ink hasTouch={false} background={false} opacity={.5} style={{ color: '#ffa94d' }} /></Gate>
						</div>
					</div>
				</div>
				<Scroller>
					<SwipeableViews id="search-results" index={Number(type === 'routes')} onChangeIndex={this.changeType}>
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
