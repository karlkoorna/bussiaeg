import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Loadable from 'react-loadable';

import Map from 'containers/Map';
import NavBar from 'components/NavBar/NavBar';
import Loading from 'components/Loading/Loading';

import './index.css';

const Search = Loadable({
	loader: () => import('containers/Search/Search'),
	loading: Loading
});

const Favorites = Loadable({
	loader: () => import('containers/Favorites/Favorites'),
	loading: Loading
});

const Settings = Loadable({
	loader: () => import('containers/Settings/Settings'),
	loading: Loading
});

const Stop = Loadable({
	loader: () => import('containers/Stop/Stop'),
	loading: Loading
});

init();
async function init() {
	
	window.stops = await (await fetch('https://bussiaeg.ee/getstops?lat_min=60.0&lng_min=60.0&lat_max=20.0&lng_max=20.0')).json();
	
	render((
		<BrowserRouter>
			<Fragment>
				<Route render={({ location }) => (
					<TransitionGroup id="pages" className={location.pathname === '/' ? 'is-empty' : ''}>
						<CSSTransition key={location.pathname} classNames="page" timeout={250}>
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
