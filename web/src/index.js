import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Split from './components/Split';
import Map from './components/Map';
import NavBar from './components/NavBar/NavBar';
import './index.css';

setup();
async function setup() {
	
	window.stops = await (await fetch(`https://bussiaeg.ee/getstops?lat_min=60.0&lng_min=60.0&lat_max=20.0&lng_max=20.0`)).json();
	
	render((
		<BrowserRouter>
			<Fragment>
				<Route render={({ location }) => (
					<TransitionGroup id="pages" className={location.pathname === '/' ? 'is-empty' : ''}>
						<CSSTransition key={location.pathname} classNames="page" timeout={250}>
								<div id="page">
									<Switch location={location}>
										<Route path="/stop" component={() => <Split path="./Stop/Stop" />} />
										<Route path="/directions" component={() => () => <Split path="./Search/Search" />} />
										<Route path="/settings" component={() => () => <Split path="./Settings/Settings" />} />
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
