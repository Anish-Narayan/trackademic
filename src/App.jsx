import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// --- Import All Components & Pages ---
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import StudentOnboarding from './pages/StudentOnboarding';
import StaffOnboarding from './pages/StaffOnboarding';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ForbiddenPage from './pages/ForbiddenPage';

// --- Reusable Helper Components ---

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen text-xl text-blue-800">
    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Loading...
  </div>
);

const ProtectedLayout = () => (
  <div className="flex flex-col min-h-screen bg-gray-100">
    <Header />
    <main className="flex-grow p-4 md:p-8">
      <Outlet />
    </main>
  </div>
);

const DashboardRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    let destination;
    if (!user.onboardingComplete) {
      destination = user.role === 'student' ? '/onboarding/student' : '/onboarding/staff';
    } else {
      destination = user.role === 'student' ? '/student-dashboard' : '/staff-dashboard';
    }
    navigate(destination, { replace: true });
  }, [user, navigate]);

  return <LoadingScreen />;
};

// --- THE FINAL, CORRECTED ROLE GUARD ---
const RoleGuard = ({ allowedRole }) => {
  const { user } = useAuth();

  // If the user object isn't loaded yet, render nothing. This prevents
  // the guard from making a premature "forbidden" decision during login redirects.
  if (!user) {
    return null;
  }

  // Once the user is loaded, we can safely check their role.
  if (user.role !== allowedRole) {
    return <ForbiddenPage />;
  }

  // If the user exists and has the correct role, render the child route.
  return <Outlet />;
};


// --- Main App Component ---

function App() {
  const { user, loading } = useAuth();
  
  // This initial loading is for checking a stored session on app startup.
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <Router>
      <Routes>
        {/* === PUBLIC ROUTE === */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />

        {/* === PROTECTED ROUTES (Authentication Gatekeeper) === */}
        <Route 
          path="/" 
          element={user ? <ProtectedLayout /> : <Navigate to="/login" />}
        >
          {/* --- Student-Only Routes (Role Gatekeeper) --- */}
          <Route element={<RoleGuard allowedRole="student" />}>
            <Route path="student-dashboard" element={<StudentDashboard />} />
            <Route path="onboarding/student" element={<StudentOnboarding />} />
          </Route>

          {/* --- Staff-Only Routes (Role Gatekeeper) --- */}
          <Route element={<RoleGuard allowedRole="staff" />}>
            <Route path="staff-dashboard" element={<StaffDashboard />} />
            <Route path="onboarding/staff" element={<StaffOnboarding />} />
          </Route>
          
          {/* --- Central Dispatcher for Logged-in Users --- */}
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* === CATCH-ALL ROUTE === */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;