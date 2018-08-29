import React, { PureComponent } from 'react';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';

export default class Model extends PureComponent {
	
	// Add animation class to button and call function.
	onPointerDown = (e, cb) => {
		e.target.classList.add('is-active');
		cb();
	}
	
	// Cancel modal on escape key.
	onKeyDown = (e) => {
		if (e.which === 27) this.props.onCancel();
	}
	
	// Toggle keydown listener based on visibility.
	componentDidUpdate() {
		if (this.props.isVisible) return document.addEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keydown', this.onKeyDown);
	}
	
	render() {
		return (
			<CSSTransition in={this.props.isVisible} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={{ enter: 300, exit: 170 }} onExited={this.onExited} unmountOnExit>
				<div id="modal-container" onPointerDown={this.props.onCancel}>
					<div id="modal" onPointerDown={(e) => { e.stopPropagation() }}>
						<div id="modal-title">{this.props.title}</div>
						<div id="modal-text">{this.props.text}</div>
						<div id="modal-buttons">
							<div id="modal-buttons-cancel" onPointerDown={(e) => this.onPointerDown(e, this.props.onCancel)}>Tühista</div>
							<div id="modal-buttons-confirm" onPointerDown={(e) => this.onPointerDown(e, this.props.onConfirm)}>Kinnita</div>
						</div>
					</div>
				</div>
			</CSSTransition>
		);
	}
	
};
