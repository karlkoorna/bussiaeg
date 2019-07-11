import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Helmet } from 'react-helmet';
import { Droppable, Draggable } from 'react-beautiful-dnd';

import Scroller from 'components/Scroller.jsx';
import Status from 'components/Status/Status.jsx';
import Icon, { colors as iconColors } from 'components/Icon.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';
import storeFavorites from 'stores/favorites.js';

import './Favorites.css';

// Update favorites afer reorder.
export function reorder(result) {
	if (!result.destination) return;
	
	const favorites = [ ...storeFavorites.favorites ];
	favorites.splice(result.destination.index, 0, favorites.splice(result.source.index, 1)[0]);
	storeFavorites.favorites = favorites;
}

class ViewFavorites extends Component {
	
	render() {
		const { favorites } = this.props.storeFavorites;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.favorites[0]} />
				</Helmet>
				<Droppable droppableId="favorites">
					{(dropProvided) => (
						<Scroller>
							<main id="favorites" className="view" ref={dropProvided.innerRef}>
								<Status space="favorites" isEmpty={!favorites.length}>
									{favorites.map((favorite, i) => (
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
									))}
									{dropProvided.placeholder}
								</Status>
							</main>
						</Scroller>
					)}
				</Droppable>
			</>
		);
	}
	
}

export default inject('storeFavorites')(observer(ViewFavorites));
