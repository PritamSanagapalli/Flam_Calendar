import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Calendar from '../components/Calendar';
import EventForm from '../components/EventForm';
import DroppableEventList from '../components/DroppableEventList';
import '../styles/HomePage.css';

// Import fonts
import '@fontsource/bebas-neue';
// Note: @fontsource/corbert was not found, so we're not importing it

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarSlideMode, setCalendarSlideMode] = useState(false);

  // Load events from localStorage on component mount
  useEffect(() => {
    try {
      console.log('Loading events from localStorage');
      const savedEvents = localStorage.getItem('calendarEvents');
      console.log('Raw saved events:', savedEvents);
      
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        console.log('Parsed events:', parsedEvents);
        
        // Ensure dates are properly converted from strings to Date objects
        const eventsWithDates = parsedEvents.map(event => {
          const eventWithDate = {
            ...event,
            date: new Date(event.date)
          };
          console.log('Converted event date:', event.date, '->', eventWithDate.date);
          return eventWithDate;
        });
        
        console.log('Setting events with proper dates:', eventsWithDates);
        setEvents(eventsWithDates);
      } else {
        console.log('No saved events found in localStorage');
      }
    } catch (error) {
      console.error('Error loading events from localStorage:', error);
      setEvents([]);
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    try {
      console.log('Saving events to localStorage:', events);
      
      // Ensure dates are properly serialized
      const eventsToSave = events.map(event => ({
        ...event,
        // Convert Date objects to ISO strings for proper serialization
        date: event.date instanceof Date ? event.date.toISOString() : event.date
      }));
      
      console.log('Serialized events for localStorage:', eventsToSave);
      localStorage.setItem('calendarEvents', JSON.stringify(eventsToSave));
      console.log('Events saved to localStorage successfully');
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }, [events]);

  // Handle date selection from Calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowEventForm(true);
    setCalendarSlideMode(true);
  };

  // Handle closing event form
  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setCalendarSlideMode(false);
    setSelectedDate(null);
  };

  // Handle adding a new event
  const handleAddEvent = (newEvent) => {
    setEvents([...events, newEvent]);
    setShowEventForm(false);
    setCalendarSlideMode(false);
    setSelectedDate(null);
  };

  // Handle deleting an event
  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };
  
  // Handle drag and drop of events
  const handleDragEnd = (result) => {
    console.log('handleDragEnd called with result:', result);
    const { destination, source, draggableId } = result;
    
    // If there's no destination or the item was dropped back in its original position
    if (!destination) {
      console.log('No destination, drag cancelled');
      return;
    }
    
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) {
      console.log('Dropped in same position, no change needed');
      return;
    }

    try {
      // Get the event ID from the draggableId (format: 'event-{id}')
      const eventId = parseInt(draggableId.split('-')[1]);
      console.log('Extracted event ID:', eventId);
      
      // Find the event that was dragged
      const draggedEvent = events.find(event => event.id === eventId);
      
      if (!draggedEvent) {
        console.error('Could not find the dragged event with ID:', eventId);
        console.log('Available events:', events.map(e => ({ id: e.id, title: e.title })));
        return;
      }
      
      console.log('Found dragged event:', draggedEvent);
      
      // If the destination is a date (format: 'date-{yyyy-mm-dd}')
      if (destination.droppableId.startsWith('date-')) {
        // Extract the date from the droppableId
        const dateString = destination.droppableId.substring(5);
        console.log('Extracted date string:', dateString);
        
        const [year, month, day] = dateString.split('-').map(Number);
        
        // Create a new date object for the destination date
        const newDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        console.log('Parsed new date:', newDate);
        
        // Check for conflicts with existing events
        const conflictingEvents = events.filter(event => {
          // Skip the event being dragged
          if (event.id === eventId) return false;
          
          // Check if dates match
          const eventDate = new Date(event.date);
          const sameDate = eventDate.getFullYear() === newDate.getFullYear() &&
                           eventDate.getMonth() === newDate.getMonth() &&
                           eventDate.getDate() === newDate.getDate();
          
          // Check if times match (only if we have time information)
          const sameTime = draggedEvent.time && event.time && draggedEvent.time === event.time;
          
          return sameDate && sameTime;
        });
        
        console.log('Conflicting events:', conflictingEvents.length);
        
        // If there are conflicts, show a confirmation dialog
        if (conflictingEvents.length > 0) {
          const confirmMove = window.confirm(
            `There ${conflictingEvents.length === 1 ? 'is' : 'are'} already ${conflictingEvents.length} ` +
            `event${conflictingEvents.length === 1 ? '' : 's'} at this time. Do you want to move this event anyway?`
          );
          
          if (!confirmMove) return;
        }
        
        // If the event is recurring, ask if they want to move all occurrences or just this one
        let updatedEvent = { ...draggedEvent };
        
        if (draggedEvent.recurrence) {
          const moveRecurring = window.confirm(
            "This is a recurring event. Do you want to move all occurrences to this date? " +
            "Click 'OK' to move all occurrences, or 'Cancel' to move only this instance."
          );
          
          if (!moveRecurring) {
            // Remove recurrence for this instance only
            delete updatedEvent.recurrence;
          }
        }
        
        // Update the event date
        updatedEvent.date = newDate;
        console.log('Updated event with new date:', updatedEvent);
        
        // Create a new array with the updated event
        const updatedEvents = events.map(event => 
          event.id === eventId ? updatedEvent : event
        );
        
        console.log('Setting updated events:', updatedEvents);
        // Update state and localStorage
        setEvents(updatedEvents);
      }
    } catch (error) {
      console.error('Error during drag and drop operation:', error);
      // Optionally show user-friendly error message
      alert('There was an error moving the event. Please try again.');
    }
  };

  // Filter events for the selected date
  const filteredEvents = selectedDate
    ? events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  // Filter events by search term
  const searchFilteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      (event.description && event.description.toLowerCase().includes(searchLower)) ||
      event.category.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="home-page">
        <header className="app-header">
          <h1>Event Calendar</h1>
          <p>Manage your events and stay organized</p>
          
          {/* Global Search Bar */}
          <div className="global-search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="global-search-input"
              />
              <div className="search-icon">🔍</div>
              {searchTerm && (
                <button
                  className="clear-search-button"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="search-results">
                <h4>Search Results ({searchFilteredEvents.length} events found)</h4>
                {searchFilteredEvents.length > 0 ? (
                  <div className="search-results-list">
                    {searchFilteredEvents.slice(0, 5).map(event => (
                      <div key={event.id} className={`search-result-item category-${event.category}`}>
                        <div className="search-result-date">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="search-result-details">
                          <strong>{event.title}</strong>
                          {event.time && <span className="search-result-time"> - {event.time}</span>}
                          {event.description && <p className="search-result-description">{event.description}</p>}
                        </div>
                      </div>
                    ))}
                    {searchFilteredEvents.length > 5 && (
                      <div className="search-results-more">
                        +{searchFilteredEvents.length - 5} more events
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-search-results">No events found matching "{searchTerm}"</p>
                )}
              </div>
            )}
          </div>
        </header>

        <main className={`main-content ${calendarSlideMode ? 'slide-mode' : ''}`}>
          <section className="calendar-section">
            <Calendar 
              events={events} 
              onDateSelect={handleDateSelect}
              searchTerm={searchTerm}
            />
          </section>

          {showEventForm && selectedDate && (
            <section className="event-form-section">
              <EventForm 
                selectedDate={selectedDate}
                onAddEvent={handleAddEvent}
                onCancel={handleCloseEventForm}
              />
            </section>
          )}

          {selectedDate && !showEventForm && (
            <section className="events-section">
              <div className="events-header">
                <h2>Events for {selectedDate.toDateString()}</h2>
                <button 
                  className="add-event-button"
                  onClick={() => setShowEventForm(true)}
                >
                  Add Event
                </button>
              </div>

              <DroppableEventList 
                events={filteredEvents} 
                droppableId={`date-${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`}
                onDeleteEvent={handleDeleteEvent}
              />
            </section>
          )}
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Event Calendar App</p>
        </footer>
      </div>
    </DragDropContext>
  );
};

export default HomePage;