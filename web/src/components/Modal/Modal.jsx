import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';

class Modal extends Component {
	
	// Add animation class to button and call function.
	fire = (e, cb) => {
		e.target.classList.add('is-active');
		if (cb) cb();
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
		
		const { t, title, text, showCancel, isVisible, onCancel, onConfirm } = this.props;
		
		return (
			<CSSTransition in={isVisible} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={{ enter: 300, exit: 170 }} onExited={this.onExited} unmountOnExit>
				<div id="modal-container" onMouseDown={onCancel}>
					<div id="modal" onMouseDown={(e) => { e.stopPropagation() }}>
						<div id="modal-title">{title}</div>
						<div id="modal-text">{text}</div>
						<div id="modal-buttons">
							{showCancel ? <div id="modal-buttons-cancel" onMouseDown={(e) => this.fire(e, onCancel)}>{t('modal.cancel')}</div> : null}
							<div id="modal-buttons-confirm" onMouseDown={(e) => this.fire(e, onConfirm)}>{t('modal.confirm')}</div>
						</div>
					</div>
				</div>
			</CSSTransition>
		);
		
	}
	
}

export default withNamespaces()(Modal);
