import React, { Component, Fragment } from 'react';
import { render } from 'react-dom';
import { withRouter, BrowserRouter, Switch, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import NavBar from 'components/NavBar/NavBar.jsx';

import Search from 'views/Search/Search.jsx';
import Favorites from 'views/Favorites/Favorites.jsx';
import Map from 'views/Map/Map.jsx';
import Settings from 'views/Settings/Settings.jsx';
import Stop from 'views/Stop/Stop.jsx';

import storeStops from 'stores/stops.js';

import './index.css';

// Fetch all stop into global variable and proceed rendering the page.
fetch(`${process.env['REACT_APP_API']}/stops`).then((res) => res.json()).then((stops) => {
	
	storeStops.set(stops);
	
	render((
		<BrowserRouter>
			<Fragment>
				<Helmet>
					<title>Bussiaeg.ee - Ühistranspordi ajad üle kogu Eesti.</title>
					<meta name="theme-color" content="#ffffff" />
					<meta property="og:type" content="website" />
					<meta property="og:title" content="Bussiaeg.ee" />
				</Helmet>
				<main>
					<Route path="/" exact children={({ match }) => <Map isActive={Boolean(match)} />} />
					<Route path="/search" children={({ match }) => <Search isActive={Boolean(match)} />} />
					<Route path="/favorites" children={({ match }) => <Favorites isActive={Boolean(match)} />} />
					<Route path="/settings" children={({ match }) => <Settings isActive={Boolean(match)} />} />
					<Route path="/stop" component={Stop} />
				</main>
				<NavBar />
			</Fragment>
		</BrowserRouter>
	), document.getElementById('root'));
	
	// Disable navigating through elements with tab key.
	window.addEventListener('keydown', (e) => {
		if (e.which === 9) e.preventDefault();
	});
	
});
