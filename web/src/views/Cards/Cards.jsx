import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Droppable, Draggable } from 'react-beautiful-dnd';

import Scroller from 'components/Scroller.jsx';
import Status from 'components/Status/Status.jsx';
import Modal from 'components/Modal/Modal.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';
import storeCards from 'stores/cards.js';

import './Cards.css';

// Update cards afer reorder.
export function reorder(result) {
	if (!result.destination) return;
	
	const cards = [ ...storeCards.favorites ];
	cards.splice(result.destination.index, 0, cards.splice(result.source.index, 1)[0]);
	storeCards.favorites = cards;
}

class ViewCards extends Component {
	
	state = {
		showModal: false
	}
	
	addCard = () => {
		this.setState({ showModal: true });
	}
	
	modalHide = () => {
		this.setState({ showModal: false });
	}
	
	modalConfirm = () => {
		
	}
	
	render() {
		const { t } = this.props;
		const { cards } = this.props.storeCards;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.cards[0]} />
				</Helmet>
				<Droppable droppableId="cards">
					{(dropProvided) => (
						<Scroller>
							<main id="cards" className="view" ref={dropProvided.innerRef}>
								<ol>
									<Status space="cards" isEmpty={!cards.length}>
										{() => cards.map((card, i) => (
											<Draggable draggableId={`cards-${card.id}`} index={i} key={card.id}>
												{(dragProvided, dragSnapshot) => (
													<li className={dragSnapshot.isDragging ? ' is-dragging' : ''} ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
														<Link className="cards-card" style={{ backgroundColor: iconColors[card.type][0] }} to={`/stop?id=${card.id}`}>
															<Icon className="cards-card-icon" shape="stop" type={card.type} />
															<div>
																<div className="cards-card-name">{card.name}</div>
																<div className="cards-card-description">{card.description}</div>
															</div>
														</Link>
													</li>
												)}
											</Draggable>
										))}
									</Status>
									{dropProvided.placeholder}
								</ol>
								<Modal isVisible={this.state.showModal} title="Add card" showCancel onCancel={this.modalHide} onConfirm={this.modalConfirm}>
									{[
										{
											key: 'name',
											name: 'Name',
											type: 'text'
										}, {
											key: 'code',
											name: 'Code',
											type: 'number'
										}
									]}
								</Modal>
								<svg viewBox="0 0 24 24" id="cards-add" onClick={this.addCard}>
									<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
								</svg>
							</main>
						</Scroller>
					)}
				</Droppable>
			</>
		);
	}
	
}

export default withTranslation()(inject('storeCards')(observer(ViewCards)));
