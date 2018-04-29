import React, { PureComponent } from 'react';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';

export default class Model extends PureComponent {
	
	state = {
		action: ''
	}
	
	onClick = this.onClick.bind(this)
	onExited = this.onExited.bind(this)
	
	onClick(e) {
		
		const { onCancel, onConfirm } = this.props;
		const action = e.target.id.substr(27);
		
		if (action === 'cancel') onCancel();
		else if (action === 'confirm') onConfirm();
		
		this.setState({ action });
		
	}
	
	onExited() {
		this.setState({ action: '' });
	}
	
	render() {
		
		const { isVisible, title, text, onCancel } = this.props;
		const { action } = this.state;
		
		return (
			<CSSTransition in={isVisible} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={250} onExited={this.onExited} unmountOnExit>
				<div id="modal" onClick={onCancel}>
					<div id="modal-panel" className={this.state.action} onClick={(e) => { e.stopPropagation() }}>
						<div id="modal-panel-"></div>
						<div id="modal-panel-title">{title}</div>
						<div id="modal-panel-text">{text}</div>
						<div id="modal-panel-buttons">
							<div id="modal-panel-buttons-button-cancel" className={action === 'cancel' ? 'is-active' : null} onClick={this.onClick}>Tühista</div>
							<div id="modal-panel-buttons-button-confirm" className={action === 'confirm' ? 'is-active' : null} onClick={this.onClick}>Kinnita</div>
						</div>
					</div>
				</div>
			</CSSTransition>
		);
		
	}
	
}
