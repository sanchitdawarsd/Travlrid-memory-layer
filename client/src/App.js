import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5001';
// Removed withCredentials - using token-based auth instead

// Helper function to encode to base64 (browser-compatible)
const encodeBase64 = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

// Helper function to decode from base64 (browser-compatible)
const decodeBase64 = (str) => {
  return decodeURIComponent(escape(atob(str)));
};

// Add axios interceptor to send auth token with requests
axios.interceptors.request.use((config) => {
  const authData = localStorage.getItem('authData');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      // Encode auth data and send as header
      config.headers['x-auth-token'] = encodeBase64(JSON.stringify(parsed));
    } catch (e) {
      console.error('Error parsing auth data:', e);
      localStorage.removeItem('authData');
    }
  }
  return config;
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [provider, setProvider] = useState('');

  useEffect(() => {
    // Check if auth data exists in localStorage
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setIsAuthenticated(true);
        setUserEmail(parsed.email);
        setProvider(parsed.provider);
      } catch (e) {
        console.error('Error parsing auth data:', e);
        localStorage.removeItem('authData');
      }
    }
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const auth = urlParams.get('auth');
    const error = urlParams.get('error');

    if (auth) {
      try {
        const authData = JSON.parse(decodeBase64(auth));
        // Store in localStorage
        localStorage.setItem('authData', JSON.stringify(authData));
        setIsAuthenticated(true);
        setUserEmail(authData.email);
        setProvider(authData.provider);
        window.history.replaceState({}, document.title, '/');
      } catch (e) {
        console.error('Error parsing auth data:', e);
        alert('Authentication failed');
        window.history.replaceState({}, document.title, '/');
      }
    } else if (error) {
      alert('Authentication failed: ' + error);
      window.history.replaceState({}, document.title, '/');
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authData');
    setIsAuthenticated(false);
    setUserEmail('');
    setProvider('');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard 
                userEmail={userEmail} 
                provider={provider}
                onLogout={handleLogout}
              /> : 
              <Navigate to="/" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
