import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import Ink from 'react-ink';

import './Modal.css';

function stopPropagation(e) {
	e.stopPropagation();
}

class Modal extends Component {
	
	state = {
		active: 0
	}
	
	onCancel = (e) => {
		this.setState({ active: 1 });
		if (e.button === 0) this.props.onCancel();
	}
	
	onConfirm = () => {
		this.setState({ active: 2 });
		this.props.onConfirm();
	}
	
	// Reset active button once modal fades out.
	onExited = () => {
		this.setState({ active: 0 });
	}
	
	render() {
		const { t, title, text, isVisible } = this.props;
		const { active } = this.state;
		
		return (
			<CSSTransition in={isVisible} timeout={{ enter: 150, exit: 375 }} onExited={this.onExited} unmountOnExit>
				<div id="modal-container" onMouseDown={this.onCancel}>
					<div id="modal" onMouseDown={stopPropagation}>
						<div id="modal-title">{title}</div>
						<div id="modal-text">{text}</div>
						<div id="modal-buttons">
							<div id="modal-buttons-cancel" className={active === 1 ? 'is-active' : ''} onClick={this.onCancel}>{t('modal.cancel')}
								<Ink background={false} opacity={.5} />
							</div>
							<div id="modal-buttons-confirm" className={active === 2 ? 'is-active' : ''} onClick={this.onConfirm}>{t('modal.confirm')}
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
