import React from 'react';

import IconVehicle from '../IconVehicle';
import './Loading.css';

export default function Loading() {
	return (
		<div id="loading">
			{IconVehicle({ id: 'loading-bus', className: 'loading-vehicle', type: 'bus' })}
			{IconVehicle({ id: 'loading-trol', className: 'loading-vehicle', type: 'trol' })}
			{IconVehicle({ id: 'loading-tram', className: 'loading-vehicle', type: 'tram' })}
		</div>
	);
}
