import React from 'react';

import Icon from 'components/Icon';

import './Loading.css';

export default function Loading() {
	return (
		<div id="loading">
			{Icon({ id: 'loading-bus', className: 'loading-vehicle', type: 'bus' })}
			{Icon({ id: 'loading-trol', className: 'loading-vehicle', type: 'trol' })}
			{Icon({ id: 'loading-tram', className: 'loading-vehicle', type: 'tram' })}
		</div>
	);
}
