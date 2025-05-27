import React, { useState } from 'react';
import '../styles/EventForm.css';

const EventForm = ({ selectedDate, onAddEvent, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('default');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceDays, setRecurrenceDays] = useState({
    0: false, // Sunday
    1: false, // Monday
    2: false, // Tuesday
    3: false, // Wednesday
    4: false, // Thursday
    5: false, // Friday
    6: false  // Saturday
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !time.trim()) {
      alert('Please enter event title and time');
      return;
    }
    
    // Create new event object with proper date handling
    const newEvent = {
      id: Date.now() + Math.floor(Math.random() * 1000), // More unique ID
      title,
      description,
      time,
      date: new Date(selectedDate), // Ensure it's a proper Date object
      category
    };
    
    // Log the event being created for debugging
    console.log('Creating new event:', newEvent);
    
    // Add recurrence information if enabled
    if (isRecurring) {
      // For weekly recurrence, collect selected days
      let selectedDays = [];
      if (recurrenceType === 'weekly') {
        selectedDays = Object.keys(recurrenceDays)
          .filter(day => recurrenceDays[day])
          .map(day => parseInt(day));
        
        // If no days selected, default to the current day of week
        if (selectedDays.length === 0) {
          selectedDays = [selectedDate.getDay()];
        }
      }
      
      newEvent.recurrence = {
        type: recurrenceType,
        interval: recurrenceType === 'custom' ? recurrenceInterval : undefined,
        days: recurrenceType === 'weekly' ? selectedDays : undefined
      };
    }
    
    // Pass the new event to parent component
    onAddEvent(newEvent);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTime('');
    setCategory('default');
    setIsRecurring(false);
    setRecurrenceType('daily');
    setRecurrenceInterval(1);
    setRecurrenceDays({
      0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false
    });
  };
  
  const handleDayToggle = (day) => {
    setRecurrenceDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


  return (
    <div className="event-form-container">
      <div className="event-form-header">
        <h3>Add New Event for {selectedDate.toDateString()}</h3>
        <button type="button" className="close-button" onClick={onCancel}>
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="time">Time *</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="important">Important</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter event description"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group recurrence-toggle">
          <label htmlFor="isRecurring" className="checkbox-label">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
            />
            Recurring Event
          </label>
        </div>
        
        {isRecurring && (
          <div className="recurrence-options">
            <div className="form-group">
              <label htmlFor="recurrenceType">Recurrence Type</label>
              <select
                id="recurrenceType"
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Interval</option>
              </select>
            </div>
            
            {recurrenceType === 'weekly' && (
              <div className="form-group day-selector">
                <label>Repeat on</label>
                <div className="weekday-buttons">
                  {weekDays.map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      className={`day-button ${recurrenceDays[index] ? 'selected' : ''}`}
                      onClick={() => handleDayToggle(index)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {recurrenceType === 'custom' && (
              <div className="form-group">
                <label htmlFor="recurrenceInterval">Repeat every</label>
                <div className="interval-input">
                  <input
                    type="number"
                    id="recurrenceInterval"
                    min="1"
                    max="365"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                  />
                  <span>days</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Add Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;