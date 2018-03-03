import React, { PureComponent } from 'react';

import Loading from './Loading/Loading';

export default class Split extends PureComponent {
	
	state = { isLoading: false }
	
	async componentWillMount() {
		
		setTimeout(function() {
			this.setState({ isLoading: true });
		}.bind(this), 100);
		
		this.setState({ C: (await import('' + this.props.path)).default });
		
	}
	
	render() {
		const { C, isLoading } = this.state;
		return C ? <C {...this.props} /> : isLoading ? <Loading /> : null;
	}
	
}
