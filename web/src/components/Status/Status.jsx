import React from 'react';
import { withTranslation } from 'react-i18next';

import Icon from 'components/Icon.jsx';

import './Status.css';

function Status({ t, space, hasErrored, isLoading, isEmpty, children }) {
	return hasErrored ? (
		<li id="status" key="errored">
			{t('status.error')}
		</li>
	) : isLoading ? (
		<li id="status" key="loading">
			<Icon id="loader-bus" className="loader-vehicle" shape="vehicle" type="bus" />
			<Icon id="loader-trol" className="loader-vehicle" shape="vehicle" type="trol" />
			<Icon id="loader-tram" className="loader-vehicle" shape="vehicle" type="tram" />
		</li>
	) : isEmpty ? (
		<li id="status" key="empty">
			{t('status.empty.' + space)}
		</li>
	) : children;
}

export default withTranslation()(Status);
