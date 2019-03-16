import { Component } from 'react';
import ReactDOM from 'react-dom';

const positions = {};

export default class Scroller extends Component {
	
	el = null
	
	updatePosition = () => {
		positions[this.el.id] = this.el.scrollTop;
	}
	
	// On mount restore position.
	// On scroll update position.
	componentDidMount() {
		this.el = ReactDOM.findDOMNode(this);
		this.el.scrollTop = positions[this.el.id];
		this.el.addEventListener('scroll', this.updatePosition, { passive: true });
	}
	
	componentWillUnmount() {
		this.el.removeEventListener('scroll', this.updatePosition);
	}
	
	render() {
		return this.props.children;
	}
	
}
