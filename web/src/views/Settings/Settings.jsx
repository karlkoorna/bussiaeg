import React, { Component } from 'react';

export default class Settings extends Component {
	
	render() {
		return (
			<section id="settings" className={`view${ this.props.isActive ? ' is-visible': ''}`}>
				Settings
			</section>
		);
	}
	
};
