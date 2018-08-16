import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import NavBar from 'components/NavBar/NavBar.jsx';
import Map from 'components/Map/Map.jsx';
import Search from 'views/Search/Search.jsx';
import Favorites from 'views/Favorites/Favorites.jsx';
import Settings from 'views/Settings/Settings.jsx';
import Stop from 'views/Stop/Stop.jsx';

import './index.css';

// Fetch all stop into global variable and proceed rendering the page.
fetch(`${process.env['REACT_APP_API']}/stops`).then((res) => res.json()).then((stops) => {
	
	window.stops = stops;
	
	render((
		<BrowserRouter>
			<Fragment>
				<Map />
				<Switch>
					<Route path="/search" component={Search} />
					<Route path="/favorites" component={Favorites} />
					<Route path="/settings" component={Settings} />
					<Route path="/stop" component={Stop} />
				</Switch>
				<NavBar />
			</Fragment>
		</BrowserRouter>
	), document.getElementById('root'));
	
	// Disable navigating through elements with tab key.
	window.addEventListener('keydown', (e) => {
		if (e.which === 9) e.preventDefault();
	});
	
});
