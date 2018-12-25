import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withNamespaces } from 'react-i18next';
import { Helmet } from 'react-helmet';

import Scroller from 'components/Scroller.jsx';
import Icon, { colors as stopColors } from 'components/Icon.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';

import './Search.css';

class Search extends Component {
	
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
						<div id="search-results">
							{results.length ? results.map((result) => (
								<div className="search-results-result-container" key={result.id}>
									<Link className="search-results-result" to={`/stop?id=${result.id}`}>
										<Icon className="search-results-result-icon" shape="stop" type={result.type} />
										<div style={{ color: stopColors[result.type][0] }}>
											<div className="search-results-result-name">{result.name}</div>
											<div className="search-results-result-area">{result.description || (result.origin && result.destination ? `${result.origin} - ${result.destination}` : '')}</div>
										</div>
										<div className="search-results-result-distance">~{result.distance ? result.distance >= 100000 ? `${Math.round(result.distance / 10000) * 10}km` : result.distance >= 10000 ? `${(result.distance / 1000).toFixed()}km` : result.distance >= 1000 ? `${(result.distance / 1000).toFixed(1)}km` : `${Math.round(result.distance / 10) * 10}m` : ''}</div>
									</Link>
								</div>
							)) : (
								<div className="view-empty">
									{t('search.empty')}
								</div>
							)}
						</div>
					</Scroller>
				</main>
			</>
		);
		
	}
	
}

export default withNamespaces()(inject('storeSearch')(observer(Search)));
