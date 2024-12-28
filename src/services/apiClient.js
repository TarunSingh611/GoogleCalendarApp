// client/src/services/apiClient.js
import AuthService from './authService';

const API_URL = import.meta.env.VITE_API_URL;

class ApiClient {
  static async fetch(endpoint, options = {}) {
    try {
      const token = AuthService.getToken();
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const config = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      };

      let response = await fetch(`${API_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Update headers with new token
          config.headers.Authorization = `Bearer ${AuthService.getToken()}`;
          // Retry the original request
          response = await fetch(`${API_URL}${endpoint}`, config);
        } else {
          // Refresh failed, logout user
          AuthService.clearAuth();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Request failed');
        }
        return data;
      }

      if (!response.ok) {
        throw new Error('Request failed');
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async refreshToken() {
    const refreshToken = AuthService.getRefreshToken();
    const user = AuthService.getUser();
    
    if (!refreshToken || !user) {
      return false;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/${user._id}/refresh-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken })
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // Update stored tokens
      AuthService.setTokens(data.token, data.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

export default ApiClient;