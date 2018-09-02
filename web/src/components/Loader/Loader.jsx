import React, { Component } from 'react';

import VehicleIcon from 'components/VehicleIcon.jsx';

import './Loader.css';

export default function Loader() {
	return (
		<div id="loader">
			{VehicleIcon({ id: 'loader-bus', className: 'loader-vehicle', type: 'bus' })}
			{VehicleIcon({ id: 'loader-trol', className: 'loader-vehicle', type: 'trol' })}
			{VehicleIcon({ id: 'loader-tram', className: 'loader-vehicle', type: 'tram' })}
		</div>
	);
};
