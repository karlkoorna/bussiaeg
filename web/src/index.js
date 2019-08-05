import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { Helmet } from 'react-helmet';
import { DragDropContext } from 'react-beautiful-dnd';

import 'i18n.js';

import storeCoords from 'stores/coords.js';
import storeSearch from 'stores/search.js';
import storeFavorites from 'stores/favorites.js';
import storeCards from 'stores/cards.js';
import storeSettings from 'stores/settings.js';
import ViewSearch from 'views/Search/Search.jsx';
import ViewFavorites, { reorder as reorderFavorites } from 'views/Favorites/Favorites.jsx';
import ViewMap from 'views/Map/Map.jsx';
import ViewCards from 'views/Cards/Cards.jsx';
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
	<Provider {...{ storeCoords, storeSearch, storeFavorites, storeCards, storeSettings }}>
		<BrowserRouter>
			<DragDropContext onDragEnd={reorderFavorites}>
				<Helmet defaultTitle="Bussiaeg.ee" />
				<ViewMap />
				<Route render={handleRoute} />
				<Switch>
					<Route exact path="/search" component={ViewSearch} />
					<Route exact path="/favorites" component={ViewFavorites} />
					<Route exact path="/cards" component={ViewCards} />
					<Route exact path="/settings" component={ViewSettings} />
					<Route exact path="/stop" component={ViewStop} />
					<Route exact path="/route" component={ViewRoute} />
				</Switch>
				<NavBar />
			</DragDropContext>
		</BrowserRouter>
	</Provider>
), $app);

// Enable desktop mode.
if (!navigator.userAgent.toLowerCase().includes('mobi')) $app.classList.add('is-desktop');

// Update current theme color CSS variable.
(new MutationObserver(() => {
	const el = document.querySelector('meta[name="theme-color"]');
	if (el) $app.style.setProperty('--color-theme', el.content);
})).observe(document.head, { childList: true });

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
