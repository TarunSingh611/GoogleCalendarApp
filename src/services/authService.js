// client/src/services/authService.js
class AuthService {
    static getToken() {
      return localStorage.getItem('token');
    }
  
    static getRefreshToken() {
      return localStorage.getItem('refreshToken');
    }
  
    static setTokens(token, refreshToken) {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
  
    static setUser(user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  
    static getUser() {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
  
    static clearAuth() {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
  
  export default AuthService;