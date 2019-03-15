import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import Scroller from 'components/Scroller.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';

import './Settings.css';

class ViewSettings extends Component {
	
	state = {
		version: '3.x.x'
	}
	
	updateSetting = (e) => {
		const target = e.target;
		this.props.storeSettings.update(target.name, target.options[e.target.selectedIndex].value, true);
	}
	
	async componentDidMount() {
		try {
			const res = await fetch(`${process.env['REACT_APP_API']}/version`);
			if (res.ok) this.setState({ version: await res.text() });
		} catch {}
	}
	
	render() {
		const { t, storeSettings: { data } } = this.props;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.settings[0]} />
				</Helmet>
				<Scroller>
					<main id="settings" className="view">
						<label htmlFor="input-lang"><i className="material-icons">public</i>{t('settings.language')}</label>
						<select id="input-lang" name="lang" defaultValue={data.lang} onInput={this.updateSetting}>
							<option value="et">Eesti keel</option>
							<option value="en">English</option>
							<option value="ru">Русский</option>
						</select>
						<label htmlFor="input-theme"><i className="material-icons">color_lens</i>{t('settings.theme')}</label>
						<select id="input-theme" name="theme" defaultValue={data.theme} onInput={this.updateSetting}>
							<option value="light">{t('settings.theme-light')}</option>
							<option value="dark">{t('settings.theme-dark')}</option>
						</select>
						<label htmlFor="input-view"><i className="material-icons">view_carousel</i>{t('settings.view')}</label>
						<select id="input-view" name="view" defaultValue={data.view} onInput={this.updateSetting}>
							<option value="search">{t('settings.view-search')}</option>
							<option value="favorites">{t('settings.view-favorites')}</option>
							<option value="map">{t('settings.view-map')}</option>
						</select>
						<label><i className="material-icons">people</i>{t('settings.credits')}</label>
						<div>
							<h1 className="first-party">{t('settings.credits-programmer')}</h1>
							<a target="_blank" rel="noopener noreferrer" href="https://github.com/karlkoorna">Karl Köörna<i className="material-icons">open_in_new</i></a>
							<h1 className="first-party">{t('settings.credits-designer')}</h1>
							<a target="_blank" rel="noopener noreferrer" href="https://facebook.com/kaur.hendrikson">Kaur Hendrikson<i className="material-icons">open_in_new</i></a>
							<h1 className="third-party">{t('settings.credits-coach')}</h1>
							<a target="_blank" rel="noopener noreferrer" href="https://mnt.ee">Maanteeamet<i className="material-icons">open_in_new</i></a>
							<h1 className="third-party">{t('settings.credits-tallinn')}</h1>
							<a target="_blank" rel="noopener noreferrer" href="https://tallinn.ee/est/transpordiamet">Tallinna Transpordiamet<i className="material-icons">open_in_new</i></a>
							<h1 className="third-party">{t('settings.credits-train')}</h1>
							<a target="_blank" rel="noopener noreferrer" href="http://elron.ee">Elron<i className="material-icons">open_in_new</i></a>
						</div>
						<label><i className="material-icons">memory</i>{t('settings.version')}</label>
						<div>{this.state.version}</div>
					</main>
				</Scroller>
			</>
		);
	}
	
}

export default withTranslation()(inject('storeSettings')(observer(ViewSettings)));
