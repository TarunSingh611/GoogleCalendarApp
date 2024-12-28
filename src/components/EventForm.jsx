import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/EventForm.css';
import ApiClient from '../services/apiClient';

const EventForm = ({ userId, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: new Date(),
    endDateTime: new Date(new Date().getTime() + 3600000) // Current time + 1 hour
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format dates to ISO string before sending to API
      const formattedData = {
        ...formData,
        startDateTime: formData.startDateTime.toISOString(),
        endDateTime: formData.endDateTime.toISOString()
      };

      const response = await ApiClient.fetch(`/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...formattedData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const data = await response.json();
      onEventCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="event-form-overlay">
      <div className="event-form">
        <h2>Create New Event</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Start Date & Time</label>
            <DatePicker
              selected={formData.startDateTime}
              onChange={(date) => setFormData(prev => ({ ...prev, startDateTime: date }))}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>End Date & Time</label>
            <DatePicker
              selected={formData.endDateTime}
              onChange={(date) => setFormData(prev => ({ ...prev, endDateTime: date }))}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="form-control"
              required
              minDate={formData.startDateTime}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;