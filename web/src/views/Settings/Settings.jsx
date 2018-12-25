import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { Helmet } from 'react-helmet';

import { colors as viewColors } from 'components/NavBar/NavBar.jsx';
import { opts as mapOpts } from 'views/Map/Map.jsx';
import settings from 'stores/settings.js';

import './Settings.css';

class Settings extends Component {
	
	updateSetting = (e) => {
		const target = e.target;
		settings.update(target.name, target.valueAsNumber || target.value || target.options[e.target.selectedIndex].value, true);
	}
	
	render() {
		
		const { t } = this.props;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.settings[0]} />
				</Helmet>
				<main id="settings" className="view">
					<label><i className="material-icons">language</i>Language</label>
					<select name="lang" defaultValue={settings.data.lang} onInput={this.updateSetting}>
						<option value="et">Eesti keel</option>
						<option value="en">English</option>
						<option value="ru">Русскии</option>
					</select>
					<label><i className="material-icons">style</i>Theme</label>
					<select name="theme" defaultValue={settings.data.theme} onInput={this.updateSetting}>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
					<label><i className="material-icons">search</i>Start zoom</label>
					<input name="startZoom" defaultValue={settings.data.startZoom} type="number" min={mapOpts.minZoom} max={mapOpts.maxZoom} onInput={this.updateSetting}></input>
					<label><i className="material-icons">visibility</i>Stop zoom</label>
					<input name="stopZoom" defaultValue={settings.data.stopZoom} type="number" min={mapOpts.minZoom} max={mapOpts.maxZoom} onInput={this.updateSetting}></input>
				</main>
			</>
		);
		
	}
	
}

export default withNamespaces()(Settings);
