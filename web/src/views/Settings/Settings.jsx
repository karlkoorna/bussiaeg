import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import Scroller from 'components/Scroller.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';

import storeSettings from 'stores/settings.js';

import './Settings.css';

class ViewSettings extends Component {
	
	state = {
		version: '3.y.z'
	}
	
	updateSetting = (e) => {
		const target = e.target;
		storeSettings.update(target.name, target.options[e.target.selectedIndex].value, true);
	}
	
	async componentDidMount() {
		this.setState({ version: await (await fetch(`${process.env['REACT_APP_API']}/version`)).text() });
	}
	
	render() {
		const { t } = this.props;
		const { data } = storeSettings;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.settings[0]} />
				</Helmet>
				<Scroller>
					<main id="settings" className="view">
						<label htmlFor="settings-lang">
							<svg viewBox="0 0 24 24" role="img" aria-hidden="true">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
							</svg>
							{t('settings.language')}
						</label>
						<select id="settings-lang" name="lang" defaultValue={data.lang} onInput={this.updateSetting}>
							<option value="et">Eesti keel</option>
							<option value="en">English</option>
							<option value="ru">Русский</option>
						</select>
						<label htmlFor="settings-theme">
							<svg viewBox="0 0 24 24" role="img" aria-hidden="true">
								<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
							</svg>
							{t('settings.theme')}
						</label>
						<select id="settings-theme" name="theme" defaultValue={data.theme} onInput={this.updateSetting}>
							<option value="light">{t('settings.theme-light')}</option>
							<option value="dark">{t('settings.theme-dark')}</option>
						</select>
						<label htmlFor="settings-view">
							<svg viewBox="0 0 24 24" role="img" aria-hidden="true">
								<path d="M7 19h10V4H7v15zm-5-2h4V6H2v11zM18 6v11h4V6h-4z" />
							</svg>
							{t('settings.view')}
						</label>
						<select id="settings-view" name="view" defaultValue={data.view} onInput={this.updateSetting}>
							<option value="search">{t('settings.view-search')}</option>
							<option value="favorites">{t('settings.view-favorites')}</option>
							<option value="map">{t('settings.view-map')}</option>
						</select>
						<label>
							<svg viewBox="0 0 24 24" role="img" aria-hidden="true">
								<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
							</svg>
							{t('settings.credits')}
						</label>
						<section>
							<h1 className="settings-first_party">{t('settings.creditees.programmer')}</h1>
							<a href="https://github.com/karlkoorna" target="_blank" rel="noopener noreferrer">Karl Köörna</a>
							<h1 className="settings-first_party">{t('settings.creditees.designer')}</h1>
							<a href="https://facebook.com/kaur.hendrikson" target="_blank" rel="noopener noreferrer">Kaur Hendrikson</a>
							<h1 className="settings-third_party">{t('settings.creditees.gtfs')}</h1>
							<a href="https://mnt.ee" target="_blank" rel="noopener noreferrer">Maanteeamet</a>
							<h1 className="settings-third_party">{t('settings.creditees.siri')}</h1>
							<a href="https://tallinn.ee/est/transpordiamet" target="_blank" rel="noopener noreferrer">Tallinna Transpordiamet</a>
							<h1 className="settings-third_party">{t('settings.creditees.elron')}</h1>
							<a href="https://elron.ee">Elron</a>
						</section>
						<label>
							<svg viewBox="0 0 24 24">
								<path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z" />
							</svg>
							{t('settings.version')}
						</label>
						<section>{process.env['REACT_APP_VERSION'] || '3.y.z'} <small>(API {this.state.version})</small></section>
					</main>
				</Scroller>
			</>
		);
	}
	
}

export default withTranslation()(ViewSettings);
