import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import AuthService from './services/authService';
import ApiClient from './services/apiClient';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(AuthService.getUser());
  const [showEventForm, setShowEventForm] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendStatus();
    const savedUser = AuthService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await ApiClient.fetch('/status');
      setBackendStatus(response.status === 'OK' ? 'connected' : 'error');
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await ApiClient.fetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ 
          tokenId: credentialResponse.credential 
        }),
      });
      if (!response.token) throw new Error('Authentication failed');

      // const data = await response.json();
      
      // // Store auth data
      AuthService.setTokens(response.token, credentialResponse.refresh_token);
      AuthService.setUser(response.user);
      setUser(response.user);

    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to sign in with Google');
    }
  };

  const handleLogout = () => {
    AuthService.clearAuth();
    setUser(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Google Calendar Integration</h1>
        <div className="status-indicator">
          Status: 
          <span className={`status-dot ${backendStatus}`}></span>
        </div>
        {!user ? (
          <div className="login-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
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
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
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
          onEventCreated={() => setShowEventForm(false)}
        />
      )}
    </div>
  );
}

export default App;