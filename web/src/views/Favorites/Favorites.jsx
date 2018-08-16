import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { colors } from 'components/VehicleIcon.jsx';
import StopIcon from 'components/StopIcon.jsx';
import favorites from 'stores/favorites.js';

import './Favorites.css';

export default class Favorites extends Component {
	
	state = {
		ids: []
	}
	
	// Update favorites afer reorder.
	reorder = (result) => {
		
		if (!result.destination) return;
		
		const ids = [ ...this.state.ids ];
		ids.splice(result.destination.index, 0, ids.splice(result.source.index, 1)[0]);
		
		this.setState({ ids });
		favorites.set(ids);
		
	}
	
	componentWillMount() {
		this.setState({ ids: favorites.get() });
	}
	
	render() {
		
		const { ids } = this.state;
		
		return (
			<DragDropContext onDragEnd={this.reorder}>
				<Droppable droppableId="favorites">
					{(provided, snapshot) => (
						<div id="favorites" className="view" ref={provided.innerRef}>
							{ids.length ? ids.map((id, i) => {
								
								// Get stop info by id.
								const stop = window.stops.find((stop) => stop.id === id);
								
								return (
									<Draggable draggableId={`favorites-${stop.id}`} index={i} key={stop.id}>
										{(provided, snapshot) => (
											<div className={'favorites-stop-container' + (snapshot.isDragging ? ' is-dragging' : '')} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
												<Link className="favorites-stop" style={{ backgroundColor: colors[stop.type][0] }} to={`/stop?id=${stop.id}`}>
													{StopIcon({ className: 'favorites-stop-icon', type: stop.type })}
													<div className="favorites-stop-info">
														<div className="favorites-stop-info-name">{stop.name}</div>
														<div className="favorites-stop-info-direction">{stop.direction}</div>
													</div>
												</Link>
											</div>
										)}
									</Draggable>
								);
								
							}) : (
								<div id="favorites-empty">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="favorites-icon">
										<path fill="#bdbdbd" stroke="#b3b3b3" strokeWidth="100" d="M512 927.7l-65.7-59.8C213 656.3 58.9 516.3 58.9 345.5c0-140 109.6-249.2 249.2-249.2 78.8 0 154.5 36.7 203.9 94.2 49.4-57.5 125-94.2 203.9-94.2 139.5 0 249.2 109.2 249.2 249.2 0 170.8-154 310.8-387.4 522.4L512 927.7z" />
									</svg>
									No favorites added
								</div>
							)}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		);
		
	}
	
};
