import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import Loader from 'components/Loader/Loader.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';

import storeSettings from 'stores/settings.js';

import './Route.css';

class ViewRoute extends Component {
	
	state = {
		route: {},
		trips: {},
		variant: 0,
		isLoading: true
	};
	
	// Navigate to trip.
	selectTrip = (e) => {
		this.props.history.push(`/route?id=${this.state.route.id}&variant=${e.target.selectedIndex + 1}`);
	}
	
	// Update stops on view navigation.
	static getDerivedStateFromProps() {
		return { variant: Math.max(Number((new URLSearchParams(window.location.search)).get('variant')) - 1, 0) || 0 };
	}
	
	// Fetch trips, redirect to default view if unsuccessful.
	async componentDidMount() {
		try {
			const params = new URLSearchParams(window.location.search);
			const route = await (await fetch(`${process.env['REACT_APP_API']}/routes?id=${params.get('id')}`)).json();
			const trips = await (await fetch(`${process.env['REACT_APP_API']}/trips?route_id=${route.id}`)).json();
			
			this.setState({
				route,
				trips,
				variant: Math.max(Number(params.get('variant')) - 1, 0) || 0,
				isLoading: false
			});
		} catch (ex) {
			return void this.props.history.push('/' + storeSettings.data.view);
		}
	}
	
	render() {
		const { route, trips, variant, isLoading } = this.state;
		const descriptions = Object.keys(trips);
		const description = descriptions[Math.min(variant, descriptions.length - 1)];
		
		return (
			<>
				{route.id ? (
					<Helmet>
						<title>{`Bussiaeg.ee: ${route.name} – ${description}`}</title>
						<meta property="og:title" content={`Bussiaeg.ee: ${route.name} – ${description}`} />
						<meta name="theme-color" content={iconColors[route.type][1]} />
					</Helmet>
				) : null}
				<main id="route" className="view">
					<div id="route-info-bar" />
					{route.id ? (
						<div id="route-info">
							<Icon id="route-info-icon" shape="vehicle" type={route.type} />
							<div>
								<div id="route-info-name">{route.name || ''}</div>
								<select id="route-info-description" defaultValue={description} onChange={this.selectTrip}>{descriptions.map((key) => <option key={key}>{key}</option>)}</select>
							</div>
						</div>
					) : null}
					<ol id="route-stops">
						{isLoading ? <Loader /> : trips[description].map((stop) => (
							<li key={stop.id}>
								<Link className="route-stops-stop" to={`/stop?id=${stop.id}`}>
									<Icon className="route-stops-stop-icon" shape="stop" type={stop.type} />
									<div>
										<div className="route-stops-stop-name" style={{ color: iconColors[stop.type][0] }}>{stop.name}</div>
										<div className="route-stops-stop-description" style={{ color: iconColors[stop.type][1] }}>{stop.description || (stop.origin && stop.destination ? `${stop.origin} - ${stop.destination}` : '')}</div>
									</div>
								</Link>
							</li>
						))}
					</ol>
				</main>
			</>
		);
	}
	
}

export default withTranslation()(withRouter(ViewRoute));
