import React, { Component } from 'react';

import './Settings.css';

export default class Settings extends Component {
	
	render() {
		return (
			<main id="settings" className="view">
				<label><i className="material-icons">language</i>Language</label>
				<select>
					<option>Eesti keel</option>
					<option>English</option>
					<option>Русскии</option>
				</select>
				<label><i className="material-icons">style</i>Theme</label>
				<select>
					<option>Light</option>
					<option>Dark</option>
				</select>
				<label><i className="material-icons">view_carousel</i>Default view</label>
				<select>
					<option>Search</option>
					<option>Favorites</option>
					<option>Map</option>
				</select>
				<label><i className="material-icons">search</i>Stop zoom</label>
				<input type="number" min="0" max="18"></input>
			</main>
		);
	}
	
}
