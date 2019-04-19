import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import Ink from 'react-ink';
import { Swipeable } from 'react-swipeable';

import Scroller from 'components/Scroller.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';
import storeFavorites from 'stores/favorites.js';
import { formatDistance } from 'utils.js';

import './Search.css';

class ViewSearch extends Component {
	
	$input = React.createRef()
	$results = React.createRef()
	debounce = 0
	
	updateQuery = (e) => {
		this.props.storeSearch.updateQuery(e.target.value);
		
		clearTimeout(this.debounce);
		this.debounce = setTimeout(this.props.storeSearch.fetchResults, 250);
	}
	
	clearQuery = () => {
		this.props.storeSearch.updateQuery('');
		this.props.storeSearch.fetchResults();
	}
	
	changeType = (index) => {
		this.props.storeSearch.updateType(index ? 'route' : 'stop');
	}
	
	changeTypeStop = () => {
		this.props.storeSearch.updateType('stop');
	}
	
	changeTypeRoute = () => {
		this.props.storeSearch.updateType('route');
	}
	
	hideKeyboard = (e) => {
		if (e.which === 13) e.target.blur();
	}
	
	// Auto focus input if on desktop.
	componentDidMount() {
		this.$results.current.id = 'search-results';
		if (navigator.userAgent.toLowerCase().indexOf('mobi') === -1) setTimeout(() => { if (this.$input.current) this.$input.current.focus(); }, 0);
		this.props.storeSearch.startScanning();
	}
	
	componentWillUnmount() {
		this.props.storeSearch.stopScanning();
	}
	
	render() {
		const { t } = this.props;
		const { query, type, results } = this.props.storeSearch;
		
		return (
			<>
				<Helmet>
					<title>Bussiaeg.ee: Kogu Eesti ühistranspordi väljumisajad ühest kohast.</title>
					<meta property="og:title" content="Bussiaeg.ee: Kogu Eesti ühistranspordi väljumisajad ühest kohast." />
					<meta name="theme-color" content={viewColors.search[0]} />
				</Helmet>
				<main id="search" className="view">
					<div id="search-top">
						<input id="search-top-input" value={query} placeholder={t('search.search')} autoComplete="off" required ref={this.$input} onKeyDown={this.hideKeyboard} onChange={this.updateQuery} />
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
							<path strokeWidth="125" d="M650.7 650.7l321 321" />
							<circle fill="transparent" strokeWidth="100" cx="399.3" cy="399.3" r="347" />
						</svg>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" onMouseDown={this.clearQuery}>
							<path strokeWidth="128" d="M92 92l840 840M932 92L92 932" />
						</svg>
						<div id="search-top-types">
							<div className={'search-top-types-item' + (type === 'stop' ? ' is-active' : '')} onMouseDown={this.changeTypeStop}>{t('search.stops')}
								<Ink hasTouch={false} background={false} opacity={.5} style={{ color: viewColors.search[0] }} />
							</div>
							<div className={'search-top-types-item' + (type === 'route' ? ' is-active' : '')} onMouseDown={this.changeTypeRoute}>{t('search.routes')}
								<Ink hasTouch={false} background={false} opacity={.5} style={{ color: viewColors.search[0] }} />
							</div>
						</div>
					</div>
					<Scroller>
						<Swipeable nodeName="ol" delta={16} ref={this.$results} onSwipedRight={this.changeTypeStop} onSwipedLeft={this.changeTypeRoute} onSwiping={this.swipe}>
							{results[type + 's'].length ? results[type + 's'].map((result) => (
								<li key={result.id}>
									<Link className={'search-results-result' + (type === 'stops' && storeFavorites.get(result.id) ? ' is-favorite' : '')} to={`/${type}?id=${result.id}`}>
										<Icon className="search-results-result-icon" shape={type} type={result.type} />
										<div className={type === 'route' ? ' is-vehicle' : ''}>
											<div className="search-results-result-name" style={{ color: iconColors[result.type][0] }}>{result.name}</div>
											<div className="search-results-result-description" style={{ color: iconColors[result.type][1] }}>{result.description || (result.origin ? `${result.origin} - ${result.destination}` : '')}</div>
										</div>
										<div className="search-results-result-distance">~{formatDistance(result.distance)}</div>
									</Link>
								</li>
							)) : (
								<div className="view-empty" style={this.debounce ? {} : { animation: 'var(--animation-fadeIn) .75s', opacity: 0 }}>
									{t('search.empty')}
								</div>
							)}
						</Swipeable>
					</Scroller>
				</main>
			</>
		);
	}
	
}

export default withTranslation()(inject('storeSearch')(observer(ViewSearch)));
