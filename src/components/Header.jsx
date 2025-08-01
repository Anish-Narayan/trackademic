import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="logo">
        <h1>Trackademic</h1>
        <p>Digital Vault for Academic Institutions</p>
      </div>
      {user && (
        <>
          <div className="user-info">
            <p>Role: <strong>{user.role}</strong> | Dept: <strong>{user.department}</strong></p>
            {user.batch && <p>Batch: <strong>{user.batch}</strong></p>}
          </div>
          <nav className="login-controls">
            <button onClick={handleLogout}>Logout</button>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;