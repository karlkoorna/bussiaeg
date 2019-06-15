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
	
	debug = storeSettings.data.debug
	
	updateSetting = (e) => {
		const target = e.target;
		storeSettings.update(target.name, target.options[e.target.selectedIndex].value, true);
	}
	
	switchDebug = () => {
		storeSettings.update('debug', ++this.debug % 3, true);
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
						<label htmlFor="settings-lang"><i className="material-icons">public</i>{t('settings.language')}</label>
						<select id="settings-lang" name="lang" defaultValue={data.lang} onInput={this.updateSetting}>
							<option value="et">Eesti keel</option>
							<option value="en">English</option>
							<option value="ru">Русский</option>
						</select>
						<label htmlFor="settings-theme"><i className="material-icons">color_lens</i>{t('settings.theme')}</label>
						<select id="settings-theme" name="theme" defaultValue={data.theme} onInput={this.updateSetting}>
							<option value="light">{t('settings.theme-light')}</option>
							<option value="dark">{t('settings.theme-dark')}</option>
						</select>
						<label htmlFor="settings-view"><i className="material-icons">view_carousel</i>{t('settings.view')}</label>
						<select id="settings-view" name="view" defaultValue={data.view} onInput={this.updateSetting}>
							<option value="search">{t('settings.view-search')}</option>
							<option value="favorites">{t('settings.view-favorites')}</option>
							<option value="map">{t('settings.view-map')}</option>
						</select>
						<label><i className="material-icons">people</i>{t('settings.credits')}</label>
						<section>
							<h1 className="settings-first_party">{t('settings.credits-programmer')}</h1>
							<a href="https://github.com/karlkoorna" target="_blank" rel="noopener noreferrer">Karl Köörna<i className="material-icons">open_in_new</i></a>
							<h1 className="settings-first_party">{t('settings.credits-designer')}</h1>
							<a href="https://facebook.com/kaur.hendrikson" target="_blank" rel="noopener noreferrer">Kaur Hendrikson<i className="material-icons">open_in_new</i></a>
							<h1 className="settings-third_party">{t('settings.credits-coach')}</h1>
							<a href="https://mnt.ee" target="_blank" rel="noopener noreferrer">Maanteeamet<i className="material-icons">open_in_new</i></a>
							<h1 className="settings-third_party">{t('settings.credits-tallinn')}</h1>
							<a href="https://tallinn.ee/est/transpordiamet" target="_blank" rel="noopener noreferrer">Tallinna Transpordiamet<i className="material-icons">open_in_new</i></a>
							<h1 className="settings-third_party">{t('settings.credits-train')}</h1>
							<a href="http://elron.ee">Elron<i className="material-icons" target="_blank" rel="noopener noreferrer">open_in_new</i></a>
						</section>
						<label><i className="material-icons">memory</i>{t('settings.version')}</label>
						<section onClick={this.switchDebug}>{process.env['REACT_APP_VERSION'] || '3.y.z'} <small>(API {this.state.version})</small></section>
					</main>
				</Scroller>
			</>
		);
	}
	
}

export default withTranslation()(ViewSettings);
