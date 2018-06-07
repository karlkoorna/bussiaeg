import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import NavBar from 'components/NavBar/NavBar.js';
import Map from 'components/Map/Map.js';
import Search from 'pages/Search/Search.js';
import Favorites from 'pages/Favorites/Favorites.js';
import Settings from 'pages/Settings/Setting.jss';
import Stop from 'pages/Stop/Stop.js';

import './index.css';

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
