import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import Ink from 'react-ink';

import './Modal.css';

function stopPropagation(e) {
	e.stopPropagation();
}

class Modal extends Component {
	
	onCancel = (e) => {
		if (e.button === 0) this.props.onCancel();
	}
	
	render() {
		const { t, title, text, isVisible, onCancel, onConfirm } = this.props;
		
		return (
			<CSSTransition in={isVisible} timeout={{ enter: 150, exit: 150 }} onExited={this.onExited} unmountOnExit>
				<div id="modal-container" onMouseDown={this.onCancel}>
					<div id="modal" onMouseDown={stopPropagation}>
						<div id="modal-title">{title}</div>
						<div id="modal-text">{text}</div>
						<div id="modal-buttons">
							<div id="modal-buttons-cancel" onClick={onCancel}>{t('modal.cancel')}
								<Ink background={false} opacity={.5} />
							</div>
							<div id="modal-buttons-confirm" onClick={onConfirm}>{t('modal.confirm')}
								<Ink background={false} opacity={.5} />
							</div>
						</div>
					</div>
				</div>
			</CSSTransition>
		);
	}
	
}

export default withTranslation()(Modal);
