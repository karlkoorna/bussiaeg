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
		trips: {},
		variant: 0,
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
	
	// Navigate to trip.
	selectTrip = (e) => {
		this.setState({ variant: e.target.selectedIndex }, () => {
			if (this.state.stopId) this.focusStop(this.state.stopId);
		});
	}
	
	// Fetch trips, redirect to default view if unsuccessful.
	async componentDidMount() {
		try {
			const params = new URLSearchParams(window.location.search);
			const route = restoreViewData() || await (await fetch(`${process.env['REACT_APP_API']}/routes/${params.get('id')}`)).json();
			this.setState({ route });
			const trips = await (await fetch(`${process.env['REACT_APP_API']}/routes/${params.get('id')}/trips`)).json();
			
			this.setState({
				trips,
				variant: params.get('trip_id') ? Object.values(trips).reverse().findIndex((trip) => trip[0].time) : params.get('variant') || 0,
				stopId: params.get('stop_id'),
				isLoading: false
			}, () => {
				if (this.state.stopId) this.focusStop(this.state.stopId);
			});
		} catch (ex) {
			this.setState({
				hasErrored: true
			});
		}
	}
	
	render() {
		const { route, trips, variant, isLoading, hasErrored } = this.state;
		const descriptions = Object.keys(trips).reverse();
		const description = descriptions[Math.min(Math.max(variant, 0), descriptions.length - 1)];
		
		return (
			<>
				<Helmet>
					<title>{route.name + ' – ' + description}</title>
					<meta property="og:title" content={route.name + ' – ' + description} />
					<meta name="theme-color" content={route.type ? iconColors[route.type][1] : 'var(--color-back-light)'} />
				</Helmet>
				<main id="route" className="view">
					<div id="route-info" style={{ backgroundColor: route.type ? iconColors[route.type][0] : 'var(--color-back-light)' }}>
						{Object.keys(route).length ? (
							<span>
								<Icon id="route-info-icon" shape="vehicle" type={route.type} />
								<div>
									<div id="route-info-name">{route.name}</div>
									<select id="route-info-description" defaultValue={description} onChange={this.selectTrip}>{descriptions.map((key) => <option key={key}>{key}</option>)}</select>
								</div>
							</span>
						) : null}
					</div>
					<ol id="route-stops">
						<Status isLoading={isLoading} hasErrored={hasErrored}>
							{() => trip.stops.map((stop, i) => (
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
