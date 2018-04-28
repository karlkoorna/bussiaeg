import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import NavBar from 'components/NavBar/NavBar';
import Map from 'containers/Map/Map';
import Search from 'containers/Search/Search';
import Favorites from 'containers/Favorites/Favorites';
import Settings from 'containers/Settings/Settings';
import Stop from 'containers/Stop/Stop';

import './index.css';

init();
async function init() {
	
	window.stops = await (await fetch('https://bussiaeg.ee/getstops?lat_min=60.0&lng_min=60.0&lat_max=20.0&lng_max=20.0')).json();
	
	render((
		<BrowserRouter>
			<Fragment>
				<Route render={({ location }) => (
					<TransitionGroup id="pages" className={location.pathname === '/' ? 'is-empty' : ''}>
						<CSSTransition key={location.pathname} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={250}>
							<div id="page">
								<Switch location={location}>
									<Route path="/search" component={Search} />
									<Route path="/favorites" component={Favorites} />
									<Route path="/settings" component={Settings} />
									<Route path="/stop" component={Stop} />
								</Switch>
							</div>
						</CSSTransition>
					</TransitionGroup>
				)} />
				<Map />
				<NavBar />
			</Fragment>
		</BrowserRouter>
	), document.getElementById('root'));
	
}
