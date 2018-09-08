import React from 'react';

import Icon from 'components/Icon.jsx';

import './Loader.css';

export default function Loader() {
	return (
		<div id="loader">
			<Icon id="loader-bus" className="loader-vehicle" shape="vehicle" type="bus" />
			<Icon id="loader-trol" className="loader-vehicle" shape="vehicle" type="trol" />
			<Icon id="loader-tram" className="loader-vehicle" shape="vehicle" type="tram" />
		</div>
	);
};
