import React, { PureComponent } from 'react';
import { CSSTransition } from 'react-transition-group';

import './Modal.css';

export default class Model extends PureComponent {
	
	state = {
		action: ''
	}
	
	onClick = this.onClick.bind(this)
	onExited = this.onExited.bind(this)
	onKeyDown = this.onKeyDown.bind(this)
	
	onClick(e) {
		
		const { onCancel, onConfirm } = this.props;
		const action = e.target.id.substr(27);
		
		if (action === 'cancel') onCancel();
		else if (action === 'confirm') onConfirm();
		
		this.setState({ action });
		
	}
	
	onKeyDown(e) {
		if (e.which === 27) this.props.onCancel();
	}
	
	onExited() {
		this.setState({ action: '' });
	}
	
	componentDidUpdate() {
		
		if (this.state.isVisible) return void document.addEventListener('keydown', this.onKeyDown);
		
		document.removeEventListener('keydown', this.onKeyDown);
		
	}
	
	componentWillUnmount() {
		document.removeEventListener('keydown', this.onKeyDown);
	}
	
	render() {
		return (
			<CSSTransition in={this.props.isVisible} classNames={{ enter: 'is-entering', exit: 'is-exiting' }} timeout={250} onExited={this.onExited} unmountOnExit>
				<div id="modal" onClick={this.onCancel}>
					<div id="modal-panel" className={this.state.action} onClick={(e) => { e.stopPropagation() }}>
						<div id="modal-panel-title">{this.props.title}</div>
						<div id="modal-panel-text">{this.props.text}</div>
						<div id="modal-panel-buttons">
							<div id="modal-panel-buttons-button-cancel" className={this.state.action === 'cancel' ? 'is-active' : null} onClick={this.onClick}>Tühista</div>
							<div id="modal-panel-buttons-button-confirm" className={this.state.action === 'confirm' ? 'is-active' : null} onClick={this.onClick}>Kinnita</div>
						</div>
					</div>
				</div>
			</CSSTransition>
		);
	}
	
}
