import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import Loader from 'components/Loader/Loader.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';

import storeSettings from 'stores/settings.js';

import './Vehicle.css';

class ViewVehicle extends Component {
	
	state = {
		vehicle: {},
		trips: {},
		variant: 0,
		isLoading: true
	};
	
	// Navigate to trip.
	selectTrip = (e) => {
		this.props.history.push(`/vehicle?id=${this.state.vehicle.id}&variant=${e.target.selectedIndex + 1}`);
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
				vehicle: route,
				trips,
				variant: Math.max(Number(params.get('variant')) - 1, 0) || 0,
				isLoading: false
			});
		} catch (ex) {
			return void this.props.history.push('/' + storeSettings.data.view);
		}
	}
	
	render() {
		const { vehicle, trips, variant, isLoading } = this.state;
		const descriptions = Object.keys(trips);
		const description = descriptions[Math.min(variant, descriptions.length - 1)];
		
		return (
			<>
				{vehicle.id ? (
					<Helmet>
						<title>{`Bussiaeg.ee: ${vehicle.name} – ${description}`}</title>
						<meta property="og:title" content={`Bussiaeg.ee: ${vehicle.name} – ${description}`} />
						<meta name="theme-color" content={iconColors[vehicle.type][1]} />
					</Helmet>
				) : null}
				<main id="vehicle" className="view">
					<div id="vehicle-info-bar" />
					{vehicle.id ? (
						<div id="vehicle-info">
							<Icon id="vehicle-info-icon" shape="vehicle" type={vehicle.type} />
							<div>
								<div id="vehicle-info-name">{vehicle.name || ''}</div>
								<select id="vehicle-info-description" defaultValue={description} onChange={this.selectTrip}>{descriptions.map((key) => <option key={key}>{key}</option>)}</select>
							</div>
						</div>
					) : null}
					<ol id="vehicle-stops">
						{isLoading ? <Loader /> : trips[description].map((stop) => (
							<li key={stop.id}>
								<Link className="vehicle-stops-stop" to={`/stop?id=${stop.id}`}>
									<Icon className="vehicle-stops-stop-icon" shape="stop" type={stop.type} />
									<div>
										<div className="vehicle-stops-stop-name" style={{ color: iconColors[stop.type][0] }}>{stop.name}</div>
										<div className="vehicle-stops-stop-description" style={{ color: iconColors[stop.type][1] }}>{stop.description || (stop.origin && stop.destination ? `${stop.origin} - ${stop.destination}` : '')}</div>
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

export default withTranslation()(withRouter(ViewVehicle));