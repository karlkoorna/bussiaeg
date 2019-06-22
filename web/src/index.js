import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { Helmet } from 'react-helmet';

import 'i18n.js';

import NavBar from 'components/NavBar/NavBar.jsx';

import ViewSearch from 'views/Search/Search.jsx';
import ViewFavorites from 'views/Favorites/Favorites.jsx';
import ViewMap from 'views/Map/Map.jsx';
import ViewSettings from 'views/Settings/Settings.jsx';
import ViewStop from 'views/Stop/Stop.jsx';
import ViewRoute from 'views/Route/Route.jsx';

import storeCoords from 'stores/coords.js';
import storeSearch from 'stores/search.js';
import storeFavorites from 'stores/favorites.js';
import storeSettings from 'stores/settings.js';

import './index.css';

let hasRedirected = false;
function handleRoute() {
	// Send analytics about active page.
	if (hasRedirected) {
		if (process.env['REACT_APP_GA'] && window.gtag) window.gtag('config', process.env['REACT_APP_GA'], {
			page_title: document.title,
			page_path: window.location.pathname + window.location.search
		});
		
		return null;
	}
	hasRedirected = true;
	
	// Redirect to default view if different.
	if (window.location.pathname !== '/' + storeSettings.data.view) return <Redirect to={'/' + storeSettings.data.view} />;
}

render((
	<Provider {...{ storeCoords, storeSearch, storeFavorites, storeSettings }}>
		<BrowserRouter>
			<>
				<Helmet defaultTitle="Bussiaeg.ee" />
				<ViewMap />
				<Route render={handleRoute} />
				<Switch>
					<Route exact path="/search" component={ViewSearch} />
					<Route exact path="/favorites" component={ViewFavorites} />
					<Route exact path="/settings" component={ViewSettings} />
					<Route exact path="/stop" component={ViewStop} />
					<Route exact path="/route" component={ViewRoute} />
				</Switch>
				<NavBar />
			</>
		</BrowserRouter>
	</Provider>
), document.getElementById('app'));

// Disable navigating through elements with tab.
window.addEventListener('keydown', (e) => {
	if (e.which === 9) e.preventDefault();
});
