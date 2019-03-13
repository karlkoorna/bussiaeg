import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Scroller from 'components/Scroller.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';

import './Favorites.css';

class ViewFavorites extends Component {
	
	// Update favorites afer reorder.
	reorder = (result) => {
		if (!result.destination) return;
		
		const favorites = [ ...this.props.storeFavorites.favorites ];
		favorites.splice(result.destination.index, 0, favorites.splice(result.source.index, 1)[0]);
		this.props.storeFavorites.favorites = favorites;
	}
	
	render() {
		const { t } = this.props;
		const { favorites } = this.props.storeFavorites;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.favorites[0]} />
				</Helmet>
				<DragDropContext onDragEnd={this.reorder}>
					<Droppable droppableId="favorites">
						{(dropProvided) => (
							<Scroller>
								<main id="favorites" className="view" ref={dropProvided.innerRef}>
									{favorites.length ? favorites.map((favorite, i) => (
										<Draggable draggableId={`favorites-${favorite.id}`} index={i} key={favorite.id}>
											{(dragProvided) => (
												<article className="favorites-stop-container" ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
													<Link className="favorites-stop" style={{ backgroundColor: iconColors[favorite.type][0] }} to={`/stop?id=${favorite.id}`}>
														<Icon className="favorites-stop-icon" shape="stop" type={favorite.type} />
														<div>
															<div className="favorites-stop-name">{favorite.name}</div>
															<div className="favorites-stop-description">{favorite.description}</div>
														</div>
													</Link>
												</article>
											)}
										</Draggable>
									)) : (
										<div className="view-empty">
											{t('favorites.empty')}
										</div>
									)}
									{dropProvided.placeholder}
								</main>
							</Scroller>
						)}
					</Droppable>
				</DragDropContext>
			</>
		);
	}
	
}

export default withTranslation()(inject('storeFavorites')(observer(ViewFavorites)));
