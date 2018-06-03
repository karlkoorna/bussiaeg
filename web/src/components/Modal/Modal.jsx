import React, { PureComponent } from 'react';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';

export default class Model extends PureComponent {
	
	// Add animation class to button and call function.
	onClick =(e, cb)=> {
		e.nativeEvent.target.classList.add('is-active');
		cb();
	}
	
	// Cancel modal on escape key.
	onKeyDown =(e)=> {
		if (e.which === 27) this.props.onCancel();
	}
	
	// Toggle keydown listener based on visibility.
	componentDidUpdate() {
		if (this.props.isVisible) return document.addEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keydown', this.onKeyDown);
	}
	
	render() {
		return (
			<CSSTransition in={this.props.isVisible} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={250} onExited={this.onExited} unmountOnExit>
				<div id="modal" onClick={this.props.onCancel}>
					<div id="modal-panel" onClick={(e) => { e.stopPropagation() }}>
						<div id="modal-panel-title">{this.props.title}</div>
						<div id="modal-panel-text">{this.props.text}</div>
						<div id="modal-panel-buttons">
							<div id="modal-panel-buttons-button-cancel" onClick={(e) => this.onClick(e, this.props.onCancel)}>Tühista</div>
							<div id="modal-panel-buttons-button-confirm" onClick={(e) => this.onClick(e, this.props.onConfirm)}>Kinnita</div>
						</div>
					</div>
				</div>
			</CSSTransition>
		);
	}
	
}
