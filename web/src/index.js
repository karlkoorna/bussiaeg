import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import NavBar from 'components/NavBar/NavBar';
import Map from 'pages/Map/Map';
import Search from 'pages/Search/Search';
import Favorites from 'pages/Favorites/Favorites';
import Settings from 'pages/Settings/Settings';
import Stop from 'pages/Stop/Stop';

import './index.css';

init();
async function init() {
	
	window.stops = await (await fetch('https://bussiaeg.ee/getstops?lat_min=60.0&lng_min=60.0&lat_max=20.0&lng_max=20.0')).json();
	
	render((
		<BrowserRouter>
			<Fragment>
				<Map />
				<Route render={({ location }) => (
					<TransitionGroup id="pages" className={location.pathname === '/' ? 'is-empty' : ''}>
						<CSSTransition key={location.pathname} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={250}>
							<Switch location={location}>
								<Route path="/search" component={Search} />
								<Route path="/favorites" component={Favorites} />
								<Route path="/settings" component={Settings} />
								<Route path="/stop" component={Stop} />
							</Switch>
						</CSSTransition>
					</TransitionGroup>
				)} />
				<NavBar />
			</Fragment>
		</BrowserRouter>
	), document.getElementById('root'));
	
}
