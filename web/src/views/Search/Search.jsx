import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import Ink from 'react-ink';
import { Swipeable } from 'react-swipeable';

import Scroller from 'components/Scroller.jsx';
import Status from 'components/Status/Status.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';
import { formatDistance, prepareViewData } from 'utils.js';

import './Search.css';

class ViewSearch extends Component {
	
	$input = React.createRef()
	debounce = 0
	
	// Debounced query update.
	updateQuery = (e) => {
		this.props.storeSearch.updateQuery(e.target.value);
		
		clearTimeout(this.debounce);
		this.debounce = setTimeout(this.props.storeSearch.fetchResults.bind(this, true), 500);
	}
	
	// Clear query and fetch results.
	clearQuery = () => {
		this.props.storeSearch.updateQuery('');
		this.props.storeSearch.fetchResults(true);
	}
	
	// Change search type to stop.
	changeTypeStops = () => {
		this.props.storeSearch.updateType('stops');
	}
	
	// Change search type to route.
	changeTypeRoutes = () => {
		this.props.storeSearch.updateType('routes');
	}
	
	// Hide on-screen keyboard when enter pressed.
	hideKeyboard = (e) => {
		if (e.which === 13) e.target.blur();
	}
	
	// Start displaying nearby results.
	componentDidMount() {
		// Auto focus input (desktop).
		if (!navigator.userAgent.toLowerCase().includes('mobi')) setTimeout(() => {
			if (this.$input.current) this.$input.current.focus();
		}, 0);
		
		this.props.storeSearch.startScanning();
	}
	
	// Stop displaying nearby results.
	componentWillUnmount() {
		this.props.storeSearch.stopScanning();
	}
	
	render() {
		const { t } = this.props;
		const { query, type, results, isLoading, hasErrored } = this.props.storeSearch;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.search[0]} />
				</Helmet>
				<main id="search" className="view">
					<div id="search-top">
						<input id="search-top-input" type="search" value={query} placeholder={t('search.search')} autoComplete="off" required ref={this.$input} onKeyDown={this.hideKeyboard} onChange={this.updateQuery} />
						<svg viewBox="0 0 1024 1024">
							<path strokeWidth="125" d="M650.7 650.7l321 321" />
							<circle fill="transparent" strokeWidth="100" cx="399.3" cy="399.3" r="347" />
						</svg>
						<svg viewBox="0 0 1024 1024" onMouseDown={this.clearQuery}>
							<path strokeWidth="128" d="M92 92l840 840M932 92L92 932" />
						</svg>
						<div id="search-top-types">
							<div className={'search-top-types-item' + (type === 'stops' ? ' is-active' : '')} onMouseDown={this.changeTypeStops}>{t('search.stops')}
								<Ink hasTouch={false} background={false} opacity={.5} style={{ color: viewColors.search[0] }} />
							</div>
							<div className={'search-top-types-item' + (type === 'routes' ? ' is-active' : '')} onMouseDown={this.changeTypeRoutes}>{t('search.routes')}
								<Ink hasTouch={false} background={false} opacity={.5} style={{ color: viewColors.search[0] }} />
							</div>
						</div>
					</div>
					<Scroller>
						<Swipeable nodeName="ol" className="search-results" onSwipedLeft={this.changeTypeRoutes} onSwipedRight={this.changeTypeStops}>
							<Status space="search" hasErrored={hasErrored} isLoading={isLoading} isEmpty={!results[type].length}>
								{results[type].map((result) => (
									<li key={result.id}>
										<Link className="search-results-result" to={`/${type.slice(0, -1)}?id=${result.id}`} onMouseDown={prepareViewData.bind(this, result)}>
											<Icon className="search-results-result-icon" shape={type === 'stops' ? 'stop' : 'vehicle'} type={result.type} checkFavorite={type === 'stops' ? result.id : null} />
											<div>
												<div className="search-results-result-name" style={{ color: iconColors[result.type][0] }}>{result.name}</div>
												<div className="search-results-result-description" style={{ color: iconColors[result.type][1] }}>{result.description}</div>
											</div>
											<div className="search-results-result-distance">~{formatDistance(result.distance)}</div>
										</Link>
									</li>
								))}
							</Status>
						</Swipeable>
					</Scroller>
				</main>
			</>
		);
	}
	
}

export default withTranslation()(inject('storeSearch')(observer(ViewSearch)));
