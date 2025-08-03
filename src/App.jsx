import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import StudentPage from './pages/StudentPage';
import StaffPage from './pages/StaffPage';

function App() {
  const { user, loading } = useAuth();
  
  // Wait for the authentication status to be confirmed before rendering the app.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-blue-800">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading authentication...
      </div>
    );
  }
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow p-4 md:p-8">
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
