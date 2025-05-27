import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addYears, subYears, isSameDay } from 'date-fns';
import { Droppable } from 'react-beautiful-dnd';
import '../styles/Calendar.css';
import windmillImage from '../assets/Windmill_Pritam.png';

const Calendar = ({ events = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [yearSelectionMode, setYearSelectionMode] = useState(false);
  const [showEventsPanel, setShowEventsPanel] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [yearsGridStart, setYearsGridStart] = useState(0);
  const [yearsGrid, setYearsGrid] = useState([]);
  const [calendarAnimation, setCalendarAnimation] = useState('');

  // Update grid start based on current year
  useEffect(() => {
    const centerYear = currentDate.getFullYear();
    const start = yearsGridStart || centerYear - 7;
    const grid = [];
    for (let r = 0; r < 4; r++) {
      const row = [];
      for (let c = 0; c < 4; c++) {
        row.push(start + r * 4 + c);
      }
      grid.push(row);
    }
    setYearsGrid(grid);
  }, [yearsGridStart, currentDate]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Month navigation
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  // Year navigation
  const prevYear = () => setCurrentDate(subYears(currentDate, 1));
  const nextYear = () => setCurrentDate(addYears(currentDate, 1));

  // Year-grid navigation
  const shiftGridBack = () => setYearsGridStart(yearsGridStart - 16 || currentYear - 23);
  const shiftGridForward = () => setYearsGridStart((yearsGridStart || currentYear - 7) + 16);

  const toggleYearSelectionMode = () => {
    setYearSelectionMode(!yearSelectionMode);
    if (!yearSelectionMode) {
      // When opening year selection, center around current year
      const centerYear = currentDate.getFullYear();
      setYearsGridStart(centerYear - 7);
    }
  };

  const selectYear = (year) => {
    setCurrentDate(new Date(year, currentMonth, 1));
    setYearSelectionMode(false);
  };

  const toggleEventsPanel = () => {
    setCalendarAnimation(showEventsPanel ? '' : 'slide-left');
    setShowEventsPanel(!showEventsPanel);
  };

  const filterEventsByType = (type) => setSelectedEventType(type);
  const handleDateClick = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startDate.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Check if there are events on this day
      const hasEvents = events.some(event => {
        const eventDate = new Date(event.date);
        
        // Check for direct match
        if (isSameDay(eventDate, date)) {
          return true;
        }
        
        // Check for recurring events
        if (event.recurrence) {
          const { type, days: recurrenceDays } = event.recurrence;
          
          // Daily recurrence
          if (type === 'daily') {
            return true;
          }
          
          // Weekly recurrence
          if (type === 'weekly' && recurrenceDays && recurrenceDays.includes(date.getDay())) {
            return true;
          }
          
          // Monthly recurrence
          if (type === 'monthly' && eventDate.getDate() === date.getDate()) {
            return true;
          }
          
          // Custom recurrence (implementation depends on your custom logic)
          if (type === 'custom') {
            // Implement your custom recurrence logic here
            return false;
          }
        }
        
        return false;
      });

      // Get events for this day to determine category-specific styling
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return isSameDay(eventDate, date) || 
               (event.recurrence && (
                 (event.recurrence.type === 'daily') ||
                 (event.recurrence.type === 'weekly' && event.recurrence.days && event.recurrence.days.includes(date.getDay())) ||
                 (event.recurrence.type === 'monthly' && eventDate.getDate() === date.getDate())
               ));
      });

      // Determine category-specific class
      let categoryClass = '';
      if (dayEvents.length > 0) {
        // Prioritize important events, then work, then personal
        if (dayEvents.some(e => e.category === 'important')) {
          categoryClass = 'category-important';
        } else if (dayEvents.some(e => e.category === 'work')) {
          categoryClass = 'category-work';
        } else if (dayEvents.some(e => e.category === 'personal')) {
          categoryClass = 'category-personal';
        } else {
          categoryClass = 'category-other';
        }
      }

      // Create droppable ID in the format expected by HomePage component: 'date-yyyy-mm-dd'
      const droppableId = `date-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      days.push(
        <Droppable droppableId={droppableId} key={dateString}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''} ${categoryClass} ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <span className="day-number">{day}</span>
              {hasEvents && <div className="event-indicator">{dayEvents.length > 1 ? `${dayEvents.length} events` : '1 event'}</div>}
              {isToday && <div className="today-indicator"><img src={windmillImage} alt="Today" className="today-image"/></div>}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }

    return days;
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Render the year selection grid with nav bar
  const renderYearSelectionGrid = () => (
    <div className="year-selection-container">
      <div className="year-nav-bar">
        <button onClick={shiftGridBack} className="grid-nav-button">&lt;&lt;</button>
        <span>Select Year</span>
        <button onClick={shiftGridForward} className="grid-nav-button">&gt;&gt;</button>
      </div>
      <div className="year-selection-grid">
        {yearsGrid.map((row, ri) => (
          <div key={ri} className="year-row">
            {row.map(y => (
              <div key={y} className={`year-cell ${y===currentYear?'current-year':''}`} onClick={() => selectYear(y)}>
                {y}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  
  // Events panel with search and filter
  const renderEventsPanel = () => {
    // Filter events by type and search term
    const filteredEvents = events.filter(e => {
      const matchesType = selectedEventType === 'all' || e.category === selectedEventType;
      const matchesSearch = searchTerm === '' || 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    });
    
    // Group by month
    const byMonth = {};
    filteredEvents.forEach(e => {
      const dt = new Date(e.date);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      byMonth[key] = byMonth[key] || [];
      byMonth[key].push(e);
    });
    
    return (
      <div className="events-panel">
        <div className="events-panel-header">
          <h3>Events</h3>
          
          {/* Search input */}
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>
          
          <div className="event-type-filters">
            {['all','work','personal','important','other'].map(type=>(
              <button
                key={type}
                className={`filter-button ${type} ${selectedEventType===type?'active':''}`}
                onClick={()=>filterEventsByType(type)}
              >{type.charAt(0).toUpperCase()+type.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="events-panel-content">
          {Object.keys(byMonth).length===0?
            <p className="no-events">No events found</p> : Object.entries(byMonth).sort().map(([k,list])=>{
              const [yr,m]=k.split('-').map(Number);
              return (
                <div key={k} className="month-events">
                  <h4>{monthNames[m]} {yr}</h4>
                  <ul className="events-list">
                    {list.map(e=>(
                      <li key={e.id} className={`event-item category-${e.category}`}>
                        <div className="event-date">{format(new Date(e.date),'MMM d')}</div>
                        <div className="event-details">
                          <strong>{e.title}</strong>{e.time&&` - ${e.time}`}
                          {e.description&&<p>{e.description}</p>}
                          {e.recurrence&&<span className="event-recurrence">
                            {e.recurrence.type==='daily'?'Repeats daily':
                             e.recurrence.type==='weekly'?'Repeats weekly':
                             e.recurrence.type==='monthly'?'Repeats monthly':
                             `Repeats every ${e.recurrence.interval} days`}
                          </span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (calendarAnimation === 'slide-left') {
      const t = setTimeout(() => setCalendarAnimation('slide-left-done'), 300);
      return () => clearTimeout(t);
    }
  }, [calendarAnimation]);

  return (
    <div className={`calendar-container ${calendarAnimation} ${showEventsPanel?'with-events-panel':''}`}>
      <div className="calendar-main">
        <div className="calendar-header">
          <div className="year-header">
            <button onClick={(e) => { e.stopPropagation(); prevYear(); }} className="year-nav-button">&lt;</button>
            <h2 className="year-display" onClick={toggleYearSelectionMode}>{currentYear}</h2>
            <button onClick={(e) => { e.stopPropagation(); nextYear(); }} className="year-nav-button">&gt;</button>
          </div>
          <div className="month-header">
            <button onClick={prevMonth} className="month-nav-button">&lt;</button>
            <h3 className="month-display">{monthNames[currentMonth]}</h3>
            <button onClick={nextMonth} className="month-nav-button">&gt;</button>
          </div>
        </div>
        {yearSelectionMode ? renderYearSelectionGrid() : (
          <>
            <div className="calendar-days-header">
              {dayNames.map(d => <div key={d} className="day-name">{d}</div>)}
            </div>
            <div className="calendar-grid">{renderCalendarDays()}</div>
            <div className="calendar-footer">
              <button className="check-events-button" onClick={toggleEventsPanel}>
                {showEventsPanel ? 'Hide Events' : 'Check Events'}
              </button>
            </div>
          </>
        )}
        {selectedDate && !yearSelectionMode && !showEventsPanel && (
          <div className="selected-date-events">
            <h3>Events for {format(selectedDate,'MMMM d, yyyy')}</h3>
            {events.filter(e=>isSameDay(new Date(e.date), selectedDate)).length===0?
              <p>No events for this day</p> : (
              <ul>
                {events.filter(e=>isSameDay(new Date(e.date), selectedDate)).map(e=>(
                  <li key={e.id} className={`event-item category-${e.category}`}>
                    <strong>{e.title}</strong>{e.time && ` - ${e.time}`}
                    {e.description && <p>{e.description}</p>}
                    {e.recurrence && <span className="event-recurrence">
                      {e.recurrence.type==='daily'?'Repeats daily':
                       e.recurrence.type==='weekly'?'Repeats weekly':
                       e.recurrence.type==='monthly'?'Repeats monthly':
                       `Repeats every ${e.recurrence.interval} days`}
                    </span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {showEventsPanel && renderEventsPanel()}
    </div>
  );
};

export default Calendar;
