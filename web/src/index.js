import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { Helmet } from 'react-helmet';

import NavBar from 'components/NavBar/NavBar.jsx';

import Search from 'views/Search/Search.jsx';
import Favorites from 'views/Favorites/Favorites.jsx';
import Map from 'views/Map/Map.jsx';
import Settings from 'views/Settings/Settings.jsx';
import Stop from 'views/Stop/Stop.jsx';

import storeCoords from 'stores/coords.js';
import storeSearch from 'stores/search.js';
import storeFavorites from 'stores/favorites.js';
import storeSettings from 'stores/settings.js';

import './i18n.js';
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
				<Helmet>
					<title>Bussiaeg.ee - Ühistranspordi ajad üle kogu Eesti.</title>
					<meta name="theme-color" content="#ffffff" />
					<meta property="og:type" content="website" />
					<meta property="og:title" content="Bussiaeg.ee" />
				</Helmet>
				<Map />
				<Switch>
					<Route path="/search" component={Search} />
					<Route path="/favorites" component={Favorites} />
					<Route path="/settings" component={Settings} />
					<Route path="/stop" component={Stop} />
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
