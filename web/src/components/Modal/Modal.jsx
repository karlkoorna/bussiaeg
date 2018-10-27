import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';

@withNamespaces()
export default class Model extends Component {
	
	// Add animation class to button and call function.
	fire = (e, cb) => {
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
		
		const t = this.props.t;
		
		return (
			<CSSTransition in={this.props.isVisible} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={{ enter: 300, exit: 170 }} onExited={this.onExited} unmountOnExit>
				<div id="modal-container" onMouseDown={this.props.onCancel}>
					<div id="modal" onMouseDown={(e) => { e.stopPropagation() }}>
						<div id="modal-title">{this.props.title}</div>
						<div id="modal-text">{this.props.text}</div>
						<div id="modal-buttons">
							<div id="modal-buttons-cancel" onMouseDown={(e) => this.fire(e, this.props.onCancel)}>{t('modal.cancel')}</div>
							<div id="modal-buttons-confirm" onMouseDown={(e) => this.fire(e, this.props.onConfirm)}>{t('modal.confirm')}</div>
						</div>
					</div>
				</div>
			</CSSTransition>
		);
		
	}
	
};
