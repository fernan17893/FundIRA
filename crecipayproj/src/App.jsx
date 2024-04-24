import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage'; // Component for the login page
import Dashboard from './Dashboard'; // Component for the user dashboard
import { AuthProvider, useAuth } from './AuthContext'; // Import AuthProvider and useAuth
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};


function PrivateRoute({ children }) {
  const { currentUser } = useAuth(); // Use your auth context to check if there's a user
  return currentUser ? children : <Navigate to="/" />;
}

export default App;