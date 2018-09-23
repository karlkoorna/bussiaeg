import { PureComponent } from 'react';
import ReactDOM from 'react-dom';

const positions = {};

export default class Scroller extends PureComponent {
	
	el = null
	
	updatePosition = () => {
		const el = this.el;
		positions[el.id] = el.scrollTop;
	}
	
	// On mount restore position.
	// On scroll update position.
	componentDidMount() {
		const el = this.el = ReactDOM.findDOMNode(this);
		el.scrollTop = positions[el.id];
		el.addEventListener('scroll', this.updatePosition, { passive: true });
	}
	
	componentWillUnmount() {
		this.el.removeEventListener('scroll', this.updatePosition);
	}
	
	render() {
		return this.props.children;
	}
	
};
