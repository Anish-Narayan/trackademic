import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import StudentPage from './pages/StudentPage';
import StaffPage from './pages/StaffPage';
import './index.css';

function App() {
  const { user, loading } = useAuth();
  
  // This is the crucial fix. We wait for the authentication status to be confirmed.
  if (loading) {
    return <div className="loading-spinner">Loading authentication...</div>;
  }
  
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'staff']}>
                  {user && user.role === 'student' ? <StudentPage /> : <StaffPage />}
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;