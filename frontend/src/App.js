import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const handleLogin = (tokenVal, userVal) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={
            token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/dashboard" element={
            token ? <Dashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/login" />
          } />
          <Route path="/feature/:featureId" element={
            token ? <FeaturePage token={token} user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
          } />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
