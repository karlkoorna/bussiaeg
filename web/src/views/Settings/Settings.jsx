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
		
		const { t, storeSettings: { data } } = this.props;
		
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
					<label><i className="material-icons">people</i>{t('settings.credits')}</label>
					<div>
						<h1 className="first-party">{t('settings.credits-programmer')}</h1>
						<a target="_blank" rel="noopener noreferrer" href="/">Karl Köörna</a>
						<h1 className="first-party">{t('settings.credits-designer')}</h1>
						<a target="_blank" rel="noopener noreferrer" href="/">Kaur Hendrikson</a>
						<h1 className="third-party">{t('settings.credits-coach')}</h1>
						<a target="_blank" rel="noopener noreferrer" href="https://mnt.ee">Maanteeamet</a>
						<h1 className="third-party">{t('settings.credits-tallinn')}</h1>
						<a target="_blank" rel="noopener noreferrer" href="https://tallinnlt.ee">Tallinna Linnatransport</a>
						<h1 className="third-party">{t('settings.credits-train')}</h1>
						<a target="_blank" rel="noopener noreferrer" href="http://elron.ee">Elron</a>
					</div>
					<label><i className="material-icons">memory</i>{t('settings.version')}</label>
					<p>{this.state.version || '3.x.x'}</p>
				</main>
			</>
		);
		
	}
	
}

export default withNamespaces()(inject('storeSettings')(observer(Settings)));
