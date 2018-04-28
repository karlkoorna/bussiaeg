import React from 'react';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';

export default function Model({ isVisible, title, text, onCancel, onConfirm, children }) {
	
	return (
		<CSSTransition in={isVisible} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={250} unmountOnExit>
			<div id="modal" onClick={onCancel}>
				<div id="modal-panel" onClick={(e) => { e.stopPropagation() }}>
					<div id="modal-panel-title">{title}</div>
					<div id="modal-panel-text">{text}</div>
					<div id="modal-panel-buttons">
						<div id="modal-panel-buttons-cancel" onClick={onCancel}>Tühista</div>
						<div id="modal-panel-buttons-confirm" onClick={onConfirm}>Kinnita</div>
					</div>
				</div>
			</div>
		</CSSTransition>
	);
	
}
