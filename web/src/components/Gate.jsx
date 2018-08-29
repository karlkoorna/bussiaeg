import { Component } from 'react';

export default class Gate extends Component {
	
	shouldComponentUpdate(nextProps) {
		return this.props.check === undefined ? false : JSON.stringify(nextProps.check) !== JSON.stringify(this.props.check);
	}
	
	render() {
		return this.props.children;
	}
	
};
