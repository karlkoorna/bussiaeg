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
		variant: 1,
		stopId: null,
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
	
	// Select direction.
	selectDirection = (e) => {
		this.setState({ variant: e.target.value }, () => {
			this.focusStop(this.state.stopId);
		});
	}
	
	// Fetch directions.
	async componentDidMount() {
		try {
			const id = (new URLSearchParams(window.location.search)).get('id');
			const route = restoreViewData('route', id) || await (await fetch(`${process.env['REACT_APP_API']}/routes/${id}`)).json();
			
			this.setState({ route }, async () => {
				const directions = await (await fetch(`${process.env['REACT_APP_API']}/routes/${route.id || route.routeId}/directions${route.tripId ? '?trip_id=' + route.tripId : ''}`)).json();
				
				this.setState({
					directions,
					variant: directions.findIndex((direction) => direction.marker) + 1 || 1,
					stopId: route.stopId,
					isLoading: false
				}, () => {
					if (route.stopId) this.focusStop(route.stopId);
				});
			});
		} catch {
			this.setState({
				route: {
					id: 'hogwarts',
					name: 'Sigatüüka Ekspress',
					type: 'coach_cc'
				},
				directions: [
					{
						name: "King's Cross Station - Hogsmeade"
					},
					{
						name: "Hogsmeade - King's Cross Station"
					}
				],
				hasErrored: true
			});
		}
	}
	
	render() {
		const { route, directions, variant, isLoading, hasErrored } = this.state;
		const direction = directions[variant - 1] || {};
		
		return (
			<>
				{Object.keys(route).length ? (
					<Helmet>
						<title>{route.name + (direction.name ? ' – ' + direction.name : '')}</title>
						<meta property="og:title" content={route.name + (direction.name ? ' – ' + direction.name : '')} />
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
									<select id="route-info-description" value={variant} onChange={this.selectDirection}>{directions.map((_direction, i) => <option value={i + 1} key={i}>{_direction.name}</option>)}</select>
								</div>
							</span>
						) : null}
					</div>
					<ol id="route-stops">
						<Status isLoading={isLoading} hasErrored={hasErrored}>
							{() => direction.stops.map((stop, i) => (
								<li key={String(variant) + String(i)}>
									<Link className="route-stops-stop" to={`/stop?id=${stop.id}`} onMouseDown={prepareViewData.bind(this, 'stop', stop)}>
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
