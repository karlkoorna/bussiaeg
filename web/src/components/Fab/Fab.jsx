import React from 'react';
import Ink from 'react-ink';

import './Fab.css';

function Fab({ icon, color, isVisible, isActive, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave }) {
	return <i id="map-locate" className={'fab material-icons' + (isVisible ? ' is-visible' : '') + (isActive ? ' is-active' : '')} style={{ color, borderColor: color }} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{icon}<Ink opacity={.5} /></i>;
}

export default Fab;
