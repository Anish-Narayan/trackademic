// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar'; // Import Navbar
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import NotFound from './pages/NotFound';
import styles from './App.module.css'; // For general app layout

function App() {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.appContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Navbar /> {/* Render Navbar on all pages */}
      <main style={{ flexGrow: 1, padding: '20px' }}> {/* Main content area */}
        <Routes>
          <Route path="/auth" element={!currentUser ? <Auth /> : <Navigate to={userRole === 'student' ? "/student-dashboard" : "/staff-dashboard"} />} />

          {/* Protected routes for students */}
          <Route
            path="/student-dashboard"
            element={currentUser && userRole === 'student' ? <StudentDashboard /> : <Navigate to="/auth" />}
          />

          {/* Protected routes for staff */}
          <Route
            path="/staff-dashboard"
            element={currentUser && userRole === 'staff' ? <StaffDashboard /> : <Navigate to="/auth" />}
          />

          {/* Redirect authenticated users based on role, otherwise to auth */}
          <Route
            path="/"
            element={
              currentUser
                ? (userRole === 'student' ? <Navigate to="/student-dashboard" /> : <Navigate to="/staff-dashboard" />)
                : <Navigate to="/auth" />
            }
          />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;