import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { Helmet } from 'react-helmet';

import 'i18n.js';

import storeCoords from 'stores/coords.js';
import storeSearch from 'stores/search.js';
import storeFavorites from 'stores/favorites.js';
import storeSettings from 'stores/settings.js';
import ViewSearch from 'views/Search/Search.jsx';
import ViewFavorites from 'views/Favorites/Favorites.jsx';
import ViewMap from 'views/Map/Map.jsx';
import ViewSettings from 'views/Settings/Settings.jsx';
import ViewStop from 'views/Stop/Stop.jsx';
import ViewRoute from 'views/Route/Route.jsx';
import NavBar from 'components/NavBar/NavBar.jsx';

import './index.css';

const $app = document.getElementById('app');

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
	
	// Redirect to default view when launched as an app.
	if ((new URLSearchParams(window.location.search).has('app'))) return <Redirect to={'/' + storeSettings.data.view.replace('map', '')} />;
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
), $app);

// Enable desktop mode.
if (!navigator.userAgent.toLowerCase().includes('mobi')) {
	(new MutationObserver(() => {
		$app.style.setProperty('--color-theme', document.querySelector('meta[name="theme-color"]').content);
	})).observe(document.head, { childList: true });
	
	$app.classList.add('is-desktop');
}

// Disable context menu.
window.addEventListener('contextmenu', (e) => {
	e.preventDefault();
});

// Disable navigating through elements with tab.
window.addEventListener('keydown', (e) => {
	if (e.which === 9) e.preventDefault();
});

// Setup PWA requirements.
if ('serviceWorker' in navigator) {
	window.addEventListener('beforeinstallprompt', () => {});
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('worker.js');
	});
}
