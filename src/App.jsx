import React, { useState, useEffect } from 'react';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import AuthService from './services/authService';
import ApiClient from './services/apiClient';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(AuthService.getUser());
  const [showEventForm, setShowEventForm] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [googleClient, setGoogleClient] = useState(null);

  useEffect(() => {
    checkBackendStatus();
    const savedUser = AuthService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }

    // Initialize Google Identity Services
    const initializeGoogleClient = () => {
      if (window.google) {
        const client = window.google.accounts.oauth2.initCodeClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'email profile https://www.googleapis.com/auth/calendar',
          ux_mode: 'popup', // Use 'popup' or 'redirect' based on your preference
          redirect_uri: `${window.location.origin}/auth/callback`,
          callback: async (response) => {
            console.log('Authorization Code:', response.code);

            try {
              // Send the authorization code to the backend
              const backendResponse = await ApiClient.fetch('/api/auth/google', {
                method: 'POST',
                body: JSON.stringify({ code: response.code }),
              });

              if (!backendResponse.token) throw new Error('Authentication failed');

              // Store auth data
              AuthService.setTokens(backendResponse.token, backendResponse.refresh_token);
              AuthService.setUser(backendResponse.user);
              setUser(backendResponse.user);
            } catch (error) {
              console.error('Login error:', error);
              alert('Failed to sign in with Google');
            }
          },
        });
        setGoogleClient(client);
      } else {
        console.error('Google Identity Services library not loaded');
      }
    };

    initializeGoogleClient();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await ApiClient.fetch('/status');
      setBackendStatus(response.status === 'OK' ? 'connected' : 'error');
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const handleLogin = () => {
    if (googleClient) {
      googleClient.requestCode(); // Trigger the Google login flow
    } else {
      console.error('Google client not initialized');
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
            <button onClick={handleLogin} className="login-btn">
              Login with Google
            </button>
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
        />
      )}
    </div>
  );
}

export default App;