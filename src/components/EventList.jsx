// client/src/components/EventList.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import '../styles/EventList.css';
import ApiClient from '../services/apiClient';

const EventList = ({ userId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchEvents = async () => {
    try {
      const response = await ApiClient.fetch(`/api/events/${userId}`);
      if (response.statusCode !== 200) throw new Error('Failed to fetch events');
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="event-list">
      <h2>Your Calendar Events</h2>
      <div className="event-table-container">
        <table className="event-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.googleEventId}>
                <td>{event.title}</td>
                <td>{event.description || '-'}</td>
                <td>{format(new Date(event.startDateTime), 'PPpp')}</td>
                <td>{format(new Date(event.endDateTime), 'PPpp')}</td>
                <td>
                  <span className={`status ${event.status}`}>
                    {event.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList;