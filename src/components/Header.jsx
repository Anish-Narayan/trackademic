import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[#004d99] text-white p-4 md:p-8 flex justify-between items-center shadow-md">
      <div className="logo">
        <h1 className="text-2xl md:text-3xl font-bold">Trackademic</h1>
        <p className="text-sm md:text-base opacity-80">Digital Vault for Academic Institutions</p>
      </div>
      {user && (
        <>
          <div className="user-info text-right">
            <p className="text-sm md:text-base">Role: <strong className="capitalize">{user.role}</strong> | Dept: <strong className="capitalize">{user.department}</strong></p>
            {user.batch && <p className="text-sm md:text-base">Batch: <strong className="capitalize">{user.batch}</strong></p>}
          </div>
          <nav className="login-controls">
            <button
              onClick={handleLogout}
              className="bg-[#ff9900] hover:bg-[#e68a00] text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
            >
              Logout
            </button>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;