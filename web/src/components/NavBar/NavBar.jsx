import React, { PureComponent } from 'react';
import { NavLink } from 'react-router-dom';
import Ink from 'react-ink';

import './NavBar.css';

export default function NavBar() {
	return (
		<div id="navbar">
			<NavBarItem to="/search" colors={[ '#ff8400', '#ffa94d' ]}>search</NavBarItem>
			<NavBarItem to="/favorites" colors={[ '#f22559', '#f5557e' ]}>favorites</NavBarItem>
			<NavBarItem to="/" colors={[ '#00cc9a', '#00e6ad' ]}>map</NavBarItem>
			<NavBarItem to="/settings" colors={[ '#00ace6', '#00bfff' ]}>settings</NavBarItem>
		</div>
	);
}

class NavBarItem extends PureComponent {
	
	state = {}
	
	animate = this.animate.bind(this)
	
	animate() {
		
		if (this.state.animation) return;
		
		this.setState({ animation: `navbar-item-${this.props.children} .75s ease` });
		
		setTimeout(() => {
			this.setState({ animation: '' });
		}, 750);
		
	}
	
	render() {
		
		const { to, colors, children } = this.props;
		const [ primaryColor, secondaryColor ] = window.location.pathname === to ? colors : [ '#b3b3b3', '#bfbfbf' ];
		
		return (
			<NavLink className="navbar-item" title={children.charAt(0).toUpperCase() + children.substr(1)} to={to} exact onClick={this.animate}>
				<svg xmlns="http://www.w3.org/2000/svg" style={this.state} viewBox="0 0 1024 1024">
					{{
						search: (
							<g>
								<path stroke={secondaryColor} strokeWidth="125" d="M650.7 650.7l321 321" />
								<circle fill="none" stroke={primaryColor} strokeWidth="100" cx="399.3" cy="399.3" r="347" />
							</g>
						),
						favorites: (
							<g>
								<path fill={secondaryColor} stroke={primaryColor} strokeWidth="100" d="M512 927.7l-65.7-59.8C213 656.3 58.9 516.3 58.9 345.5c0-140 109.6-249.2 249.2-249.2 78.8 0 154.5 36.7 203.9 94.2 49.4-57.5 125-94.2 203.9-94.2 139.5 0 249.2 109.2 249.2 249.2 0 170.8-154 310.8-387.4 522.4L512 927.7z" />
							</g>
						),
						map: (
							<g>
								<path fill={primaryColor} d="M712.5 965.7l288-48.7V74l-288 45-391-45-296 45v846l295-47z" />
								<path fill={secondaryColor} d="M712.5 119l-391-45-1 844 392 47.7z" />
							</g>
						),
						settings: (
							<g>
								<path fill={secondaryColor} d="M512.1 683c-94.4 0-171-76.6-171-171s76.6-171 171-171 171 76.6 171 171-76.6 171-171 171m363-123.6c2-15.6 3.4-31.3 3.4-47.4s-1.5-32.2-3.4-48.9l103.1-79.6c9.3-7.3 11.7-20.5 5.9-31.3l-97.7-169.1c-5.9-10.7-19.1-15.1-29.8-10.7l-121.7 48.9c-25.4-19.1-51.8-35.7-82.6-47.9l-18-129.5c-2-11.7-12.2-20.5-24.4-20.5H414.4c-12.2 0-22.5 8.8-24.4 20.5l-18.1 129.5c-30.8 12.2-57.2 28.8-82.6 47.9l-121.7-48.9c-10.7-4.4-23.9 0-29.8 10.7L40.1 352.2c-6.4 10.7-3.4 23.9 5.9 31.3l103.1 79.6c-2 16.6-3.4 32.7-3.4 48.9s1.5 31.8 3.4 47.4L46 640.5c-9.3 7.3-12.2 20.5-5.9 31.3l97.7 169.1c5.9 10.7 19.1 14.7 29.8 10.7l121.7-49.3c25.4 19.5 51.8 36.2 82.6 48.4L390 980.1c2 11.7 12.2 20.5 24.4 20.5h195.4c12.2 0 22.5-8.8 24.4-20.5l18.1-129.5c30.8-12.7 57.2-28.8 82.6-48.4l121.7 49.3c10.7 3.9 23.9 0 29.8-10.7l97.7-169.1c5.9-10.7 3.4-23.9-5.9-31.3l-103.1-81z" />
								<circle fill="none" stroke={primaryColor} strokeWidth="100" cx="512" cy="512" r="205.6" />
							</g>
						)
					}[children]}
				</svg>
				<Ink hasTouch={false} background={false} opacity={.5} style={{ color: colors[0] }} />
			</NavLink>
		);
		
	}
	
}
