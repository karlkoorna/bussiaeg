import React from 'react';

import VehicleIcon from 'components/VehicleIcon';

import './Loading.css';

export default function Loading() {
	return (
		<div id="loading">
			{VehicleIcon({ id: 'loading-bus', className: 'loading-vehicle', type: 'bus' })}
			{VehicleIcon({ id: 'loading-trol', className: 'loading-vehicle', type: 'trol' })}
			{VehicleIcon({ id: 'loading-tram', className: 'loading-vehicle', type: 'tram' })}
		</div>
	);
}
