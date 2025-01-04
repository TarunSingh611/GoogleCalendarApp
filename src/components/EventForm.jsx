import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/EventForm.css';
import ApiClient from '../services/apiClient';

const EventForm = ({ userId, onClose, eventToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: new Date(),
    endDateTime: new Date(new Date().getTime() + 3600000)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isEditing = !!eventToEdit;

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || '',
        description: eventToEdit.description || '',
        startDateTime: new Date(eventToEdit.startDateTime),
        endDateTime: new Date(eventToEdit.endDateTime)
      });
    }
  }, [eventToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedData = {
        ...formData,
        startDateTime: formData.startDateTime.toISOString(),
        endDateTime: formData.endDateTime.toISOString()
      };

      let response;
      if (isEditing) {
        // Update existing event
        response = await ApiClient.fetch(`/api/events/${eventToEdit._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            ...formattedData
          }),
        });
      } else {
        // Create new event
        response = await ApiClient.fetch(`/api/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            ...formattedData
          }),
        });
      }

      if (!response.success) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} event`);
      }

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

  const validateDates = () => {
    return formData.endDateTime > formData.startDateTime;
  };

  return (
    <div className="event-form-overlay">
      <div className="event-form">
        <h2>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
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
              placeholder="Enter event title"
              className="form-control"
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
              placeholder="Enter event description"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Start Date & Time</label>
            <DatePicker
              selected={formData.startDateTime}
              onChange={(date) => {
                setFormData(prev => ({
                  ...prev,
                  startDateTime: date,
                  // Automatically adjust end time if it's before start time
                  endDateTime: prev.endDateTime < date ? 
                    new Date(date.getTime() + 3600000) : 
                    prev.endDateTime
                }));
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="form-control"
              required
              placeholderText="Select start date and time"
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
              placeholderText="Select end date and time"
            />
          </div>

          {!validateDates() && (
            <div className="error-message">
              End time must be after start time
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || !validateDates()}
            >
              {loading ? (
                <span>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditing ? 'Update Event' : 'Create Event'
              )}
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