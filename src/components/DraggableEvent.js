import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import '../styles/DraggableEvent.css';

// Add console logging for debugging drag and drop issues

const DraggableEvent = ({ event, index, onDelete }) => {
  // Log the event being rendered for debugging
  console.log('Rendering draggable event:', event.id, event.title);
  
  return (
    <Draggable draggableId={`event-${event.id}`} index={index}>
      {(provided, snapshot) => {
        // Log drag state changes
        if (snapshot.isDragging) {
          console.log('Dragging event:', event.id, event.title);
        }
        
        return (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`draggable-event category-${event.category} ${snapshot.isDragging ? 'is-dragging' : ''}`}
        >
          <div
            className="drag-handle"
            {...provided.dragHandleProps}
          >
            ⋮⋮
          </div>
          <div className="event-time">{event.time}</div>
          <div className="event-details">
            <h3>{event.title}</h3>
            {event.description && <p>{event.description}</p>}
            <span className="event-category">{event.category}</span>
            {event.recurrence && (
              <span className="event-recurrence">
                {event.recurrence.type === 'daily' && 'Repeats daily'}
                {event.recurrence.type === 'weekly' && 'Repeats weekly'}
                {event.recurrence.type === 'monthly' && 'Repeats monthly'}
                {event.recurrence.type === 'custom' && `Repeats every ${event.recurrence.interval} days`}
              </span>
            )}
          </div>
          <button 
            className="delete-event-button"
            onClick={() => onDelete(event.id)}
          >
            Delete
          </button>
        </li>
      );
      }}
    </Draggable>
  );
};

export default DraggableEvent;