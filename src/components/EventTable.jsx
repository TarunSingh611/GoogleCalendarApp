// client/src/components/EventTable.js
import React, { useState, useEffect } from 'react';
import '../styles/EventTable.css';

function EventTable({ userId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${userId}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="event-table-container">
      <table className="event-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.googleEventId}>
              <td>{event.title}</td>
              <td>{event.description}</td>
              <td>{new Date(event.startDateTime).toLocaleString()}</td>
              <td>{new Date(event.endDateTime).toLocaleString()}</td>
              <td>{event.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventTable;