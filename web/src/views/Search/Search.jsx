import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import Scroller from 'components/Scroller.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';
import storeFavorites from 'stores/favorites.js';
import { formatDistance } from 'utils.js';

import './Search.css';

class ViewSearch extends Component {
	
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
	
	hideKeyboard = (e) => {
		if (e.which === 13) e.target.blur();
	}
	
	componentDidMount() {
		this.props.storeSearch.startScanning();
	}
	
	componentWillUnmount() {
		this.props.storeSearch.stopScanning();
	}
	
	render() {
		const { t } = this.props;
		const { query, results } = this.props.storeSearch;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.search[0]} />
				</Helmet>
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
					</div>
					<Scroller>
						<ol id="search-results">
							{results.length ? results.map((result) => (
								<li key={result.id}>
									<Link className={'search-results-result' + (storeFavorites.get(result.id) ? ' is-favorite' : '')} to={`/stop?id=${result.id}`}>
										<Icon className="search-results-result-icon" shape="stop" type={result.type} />
										<div>
											<div className="search-results-result-name" style={{ color: iconColors[result.type][0] }}>{result.name}</div>
											<div className="search-results-result-description" style={{ color: iconColors[result.type][1] }}>{result.description || (result.origin && result.destination ? `${result.origin} - ${result.destination}` : '')}</div>
										</div>
										<div className="search-results-result-distance">~{formatDistance(result.distance)}</div>
									</Link>
								</li>
							)) : (
								<div className="view-empty" style={this.debounce ? {} : { animation: 'var(--animation-fadeIn) .75s', opacity: 0 }}>
									{t('search.empty')}
								</div>
							)}
						</ol>
					</Scroller>
				</main>
			</>
		);
	}
	
}

export default withTranslation()(inject('storeSearch')(observer(ViewSearch)));
