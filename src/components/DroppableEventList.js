import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import DraggableEvent from './DraggableEvent';
import '../styles/DroppableEventList.css';

const DroppableEventList = ({ events, droppableId, onDeleteEvent }) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          className={`droppable-event-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {events.length === 0 ? (
            <p className="no-events">No events scheduled for this day</p>
          ) : (
            <ul>
              {events.map((event, index) => (
                <DraggableEvent 
                  key={event.id} 
                  event={event} 
                  index={index} 
                  onDelete={onDeleteEvent}
                />
              ))}
            </ul>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DroppableEventList;