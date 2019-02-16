import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'mobx-react';

import 'i18n.js';

import NavBar from 'components/NavBar/NavBar.jsx';

import ViewSearch from 'views/Search/Search.jsx';
import ViewFavorites from 'views/Favorites/Favorites.jsx';
import ViewMap from 'views/Map/Map.jsx';
import ViewSettings from 'views/Settings/Settings.jsx';
import ViewStop from 'views/Stop/Stop.jsx';

import storeCoords from 'stores/coords.js';
import storeSearch from 'stores/search.js';
import storeFavorites from 'stores/favorites.js';
import storeSettings from 'stores/settings.js';

import './index.css';

const stores = {
	storeCoords,
	storeSearch,
	storeFavorites,
	storeSettings
};

render((
	<Provider {...stores}>
		<BrowserRouter>
			<>
				<ViewMap />
				{storeSettings.data.view !== 'map' ? <Redirect to={'/' + storeSettings.data.view} /> : null}
				<Switch>
					<Redirect from="/map" to="/" />
					<Route path="/search" component={ViewSearch} />
					<Route path="/favorites" component={ViewFavorites} />
					<Route path="/settings" component={ViewSettings} />
					<Route path="/stop" component={ViewStop} />
				</Switch>
				<NavBar />
			</>
		</BrowserRouter>
	</Provider>
), document.getElementById('app'));

// Disable navigating through elements with tab key.
window.addEventListener('keydown', (e) => {
	if (e.which === 9) e.preventDefault();
});

// Send analytics about active page.
if (process.env['REACT_APP_GA']) {
	
	let lastPath = '';
	
	setInterval(() => {
		
		const path = window.location.pathname + window.location.search;
		if (path === lastPath) return;
		lastPath = path;
		
		if (window.gtag) window.gtag('config', process.env['REACT_APP_GA'], {
			'page_title': document.title,
			'page_path': path
		});
		
	}, 2000);
	
}
