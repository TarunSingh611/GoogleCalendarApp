// client/src/App.jsx
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tokenId: credentialResponse.credential 
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to sign in with Google');
    }
  };

  const handleEventCreated = () => {
    setShowEventForm(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Google Calendar Integration</h1>
        {!user ? (
          <div className="login-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </div>
        ) : (
          <div className="user-container">
            <p>Welcome, {user.email}</p>
            <button 
              className="create-event-btn"
              onClick={() => setShowEventForm(true)}
            >
              Create Calendar Event
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {user && <EventList userId={user._id} />}
      </main>

      {showEventForm && (
        <EventForm
          userId={user._id}
          onClose={() => setShowEventForm(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}

export default App;