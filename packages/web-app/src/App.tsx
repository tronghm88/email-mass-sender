import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Dashboard';
import { UserProvider } from './UserContext';
import './App.css';

function App() {
  return (
    <Router>
      <UserProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
