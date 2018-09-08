import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Icon, { colors } from 'components/Icon.jsx';

import './Favorites.css';

@inject('storeFavorites')
@observer
export default class Favorites extends Component {
	
	// Update favorites afer reorder.
	reorder = (result) => {
		
		if (!result.destination) return;
		
		const favorites = [ ...this.props.storeFavorites.favorites ];
		favorites.splice(result.destination.index, 0, favorites.splice(result.source.index, 1)[0]);
		this.props.storeFavorites.favorites = favorites;
		
	}
	
	render() {
		
		const favorites = this.props.storeFavorites.favorites;
		
		return (
			<DragDropContext onDragEnd={this.reorder}>
				<Droppable droppableId="favorites">
					{(provided, snapshot) => (
						<main id="favorites" className="view" ref={provided.innerRef}>
							{favorites.length ? favorites.map((favorite, i) => (
								<Draggable draggableId={`favorites-${favorite.id}`} index={i} key={favorite.id}>
									{(provided, snapshot) => (
										<div className="favorites-stop-container" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
											<Link className="favorites-stop" style={{ backgroundColor: colors[favorite.type][0] }} to={`/stop?id=${favorite.id}`}>
												<Icon className="favorites-stop-icon" shape="stop" type={favorite.type} />
												<div>
													<div className="favorites-stop-name">{favorite.name}</div>
													<div className="favorites-stop-direction">{favorite.direction}</div>
												</div>
											</Link>
										</div>
									)}
								</Draggable>
							)) : (
								<div id="favorites-empty">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="favorites-empty-icon">
										<path fill="#bdbdbd" stroke="#b3b3b3" strokeWidth="100" d="M512 927.7l-65.7-59.8C213 656.3 58.9 516.3 58.9 345.5c0-140 109.6-249.2 249.2-249.2 78.8 0 154.5 36.7 203.9 94.2 49.4-57.5 125-94.2 203.9-94.2 139.5 0 249.2 109.2 249.2 249.2 0 170.8-154 310.8-387.4 522.4L512 927.7z" />
									</svg>
									No favorites added
								</div>
							)}
							{provided.placeholder}
						</main>
					)}
				</Droppable>
			</DragDropContext>
		);
		
	}
	
};
