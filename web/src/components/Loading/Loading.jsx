import React from 'react';

import Vehicle from 'components/Vehicle';

import './Loading.css';

export default function Loading() {
	return (
		<div id="loading">
			{Vehicle({ id: 'loading-bus', className: 'loading-vehicle', type: 'bus' })}
			{Vehicle({ id: 'loading-trol', className: 'loading-vehicle', type: 'trol' })}
			{Vehicle({ id: 'loading-tram', className: 'loading-vehicle', type: 'tram' })}
		</div>
	);
}
