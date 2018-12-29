import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withNamespaces } from 'react-i18next';
import { Helmet } from 'react-helmet';

import { colors as viewColors } from 'components/NavBar/NavBar.jsx';

import './Settings.css';

class Settings extends Component {
	
	state = {
		version: ''
	}
	
	updateSetting = (e) => {
		const target = e.target;
		this.props.storeSettings.update(target.name, target.options[e.target.selectedIndex].value, true);
	}
	
	async componentDidMount() {
		this.setState({ version: await (await fetch(`${process.env['REACT_APP_API']}/version`)).text() });
	}
	
	render() {
		
		const { t, storeSettings: { data, defaultData } } = this.props;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.settings[0]} />
				</Helmet>
				<main id="settings" className="view">
					<label className="is-select"><i className="material-icons">public</i>{t('settings.language')}</label>
					<select name="lang" defaultValue={data.lang} onInput={this.updateSetting}>
						<option value="et">Eesti keel</option>
						<option value="en">English</option>
						<option value="ru">Русский</option>
					</select>
					<label className="is-select"><i className="material-icons">color_lens</i>{t('settings.theme')}</label>
					<select name="theme" defaultValue={data.theme} onInput={this.updateSetting}>
						<option value="light">{t('settings.theme-light')}</option>
						<option value="dark">{t('settings.theme-dark')}</option>
					</select>
					<label className="is-select"><i className="material-icons">view_carousel</i>{t('settings.view')}</label>
					<select name="view" defaultValue={data.view} onInput={this.updateSetting}>
						<option value="search">{t('settings.view-search')}</option>
						<option value="favorites">{t('settings.view-favorites')}</option>
						<option value="map">{t('settings.view-map')}</option>
					</select>
					<label><i className="material-icons">people</i>Credits</label>
					<p>
						<h1 class="first-party">Programmeerija</h1>
						<a>Karl Köörna</a>
						<h1 class="first-party">Disainer</h1>
						<a>Kaur Hendrikson</a>
						<h1 class="third-party">Plaaniajad</h1>
						<a target="_blank" rel="noopener noreferrer" href="https://mnt.ee">Maanteeamet</a>
						<h1 class="third-party">Reaalajad Tallinnas</h1>
						<a target="_blank" rel="noopener noreferrer" href="https://tallinnlt.ee">Tallinna Linna Transport</a>
						<h1 class="third-party">Rongiajad</h1>
						<a target="_blank" rel="noopener noreferrer" href="http://elron.ee/">Elron</a>
					</p>
				</main>
			</>
		);
		
	}
	
}

export default withNamespaces()(inject('storeSettings')(observer(Settings)));
