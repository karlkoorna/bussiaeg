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
	
	// Try calling input action callback.
	onAction = async (e) => {
		const target = e.target;
		if (target.nodeName !== 'svg') return;
		
		const value = await this.props.children.find((input) => input.key === target.parentElement.getAttribute('data-key')).action.cb();
		if (value) target.previousElementSibling.value = value;
	}
	
	render() {
		const { t, title, isVisible, onCancel, onConfirm, children } = this.props;
		
		return (
			<CSSTransition in={isVisible} timeout={{ enter: 150, exit: 150 }} onExited={this.onExited} unmountOnExit>
				<div id="modal-container" onMouseDown={this.onCancel}>
					<div id="modal" onMouseDown={stopPropagation}>
						<div id="modal-title">{title}</div>
						<div id="modal-content" onMouseDown={this.onAction}>
							{
								Array.isArray(children) ? children.map((input) => (
									<div className="modal-content-input" data-key={input.key} key={input.key}>
										{input.action ? input.action.icon : null}
										<input name={input.name} type={input.type} placeholder={input.name} />
									</div>
								)) : children
							}
						</div>
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
