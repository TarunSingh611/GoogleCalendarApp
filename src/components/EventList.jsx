import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCalendarAlt, FaClock, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import '../styles/EventList.css';
import ApiClient from '../services/apiClient';
import EventForm from './EventForm';

const EventList = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const fetchEvents = async () => {
    try {
      const response = await ApiClient.fetch(`/api/events/${userId}`);
      if (response.statusCode !== 200) throw new Error('Failed to fetch events');
      setEvents(response.data || []); // Ensure events is always an array
      setError(null);
    } catch (err) {
      setError(err.message);
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (event) => {
    const eventId = event?.id;
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await ApiClient.fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          body: JSON.stringify({
            userId,
          }),
        });
        
        if (response.success) {
          setEvents(events.filter(event => event.id !== eventId));
        } else {
          throw new Error('Failed to delete event');
        }
      } catch (error) {
        console.error('Delete failed:', error);
        setError('Failed to delete event. Please try again.');
      }
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedEvent(null);
    fetchEvents(); // Refresh the list after form closes
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your calendar events...</p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h2 className="event-list-title">Your Calendar Events</h2>

      </div>

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="event-cards">
        {events.map((event) => (
          <div key={event.googleEventId} className="event-card">
            <div className="event-header">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEdit(event)}
                  aria-label="Edit event"
                >
                  <FaEdit />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(event)}
                  aria-label="Delete event"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <p className="event-description">{event.description || 'No description provided'}</p>
            <div className="event-details">
              <div className="event-time">
                <FaCalendarAlt className="icon" />
                <span>
                  {format(new Date(event.startDateTime), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="event-time">
                <FaClock className="icon" />
                <span>
                  {format(new Date(event.startDateTime), 'h:mm a')} -{' '}
                  {format(new Date(event.endDateTime), 'h:mm a')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <EventForm
          userId={userId}
          onClose={handleFormClose}
          eventToEdit={selectedEvent}
        />
      )}
    </div>
  );
};

export default EventList;