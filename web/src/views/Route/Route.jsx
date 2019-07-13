import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import Status from 'components/Status/Status.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';
import { prepareViewData, restoreViewData } from 'utils.js';

import './Route.css';

class ViewRoute extends Component {
	
	state = {
		route: {},
		directions: [],
		stopId: null,
		variant: 0,
		isLoading: true,
		hasErrored: false
	};
	
	// Focus stop by id.
	focusStop = (id) => {
		const el = document.querySelector(`.route-stops-stop[href$="${id}"]`);
		if (!el) return;
		
		el.classList.add('is-active');
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
	
	// Select trip.
	selectTrip = (e) => {
		this.setState({ variant: e.target.selectedIndex }, () => {
			if (this.state.stopId) this.focusStop(this.state.stopId);
		});
	}
	
	// Fetch directions.
	async componentDidMount() {
		try {
			const route = restoreViewData() || await (await fetch(`${process.env['REACT_APP_API']}/routes/${(new URLSearchParams(window.location.search)).get('id')}`)).json();
			
			this.setState({ route }, async () => {
				const directions = await (await fetch(`${process.env['REACT_APP_API']}/routes/${route.id || route.routeId}/directions?trip_id=${route.tripId}`)).json();
				
				this.setState({
					directions,
					stopId: route.stopId,
					variant: (directions.findIndex((direction) => direction.marker) + 1 || 1) - 1,
					isLoading: false
				}, () => {
					if (route.stopId) this.focusStop(route.stopId);
				});
			});
		} catch {
			this.setState({ hasErrored: true });
		}
	}
	
	render() {
		const { route, directions, variant, isLoading, hasErrored } = this.state;
		const direction = directions[variant] || {};
		
		return (
			<>
				{directions.length ? (
					<Helmet>
						<title>{route.name + ' – ' + direction.name}</title>
						<meta property="og:title" content={route.name + ' – ' + direction.name} />
						<meta name="theme-color" content={iconColors[route.type][1]} />
					</Helmet>
				) : null}
				<main id="route" className="view">
					<div id="route-info" style={{ backgroundColor: route.type ? iconColors[route.type][0] : 'var(--color-back-light)' }}>
						{Object.keys(route).length ? (
							<span>
								<Icon id="route-info-icon" shape="vehicle" type={route.type} />
								<div>
									<div id="route-info-name">{route.name}</div>
									<select id="route-info-description" defaultValue={direction.name} onChange={this.selectTrip}>{directions.map((_direction, i) => <option key={i}>{_direction.name}</option>)}</select>
								</div>
							</span>
						) : null}
					</div>
					<ol id="route-stops">
						<Status isLoading={isLoading} hasErrored={hasErrored}>
							{() => direction.stops.map((stop, i) => (
								<li key={String(variant) + String(i)}>
									<Link className="route-stops-stop" to={`/stop?id=${stop.id}`} onMouseDown={prepareViewData.bind(this, stop)}>
										<Icon className="route-stops-stop-icon" shape="stop" type={stop.type} />
										<div>
											<div className="route-stops-stop-name" style={{ color: iconColors[stop.type][0] }}>{stop.name}</div>
											<div className="route-stops-stop-description" style={{ color: iconColors[stop.type][1] }}>{stop.description}</div>
										</div>
									</Link>
								</li>
							))}
						</Status>
					</ol>
				</main>
			</>
		);
	}
	
}

export default withTranslation()(withRouter(ViewRoute));
