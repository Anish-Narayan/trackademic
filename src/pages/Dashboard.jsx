// src/pages/Dashboard.js

import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  // A simple check in case the component renders before user is available
  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img
            className="h-20 w-20 rounded-full object-cover"
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=0D8ABC&color=fff`}
            alt="User avatar"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.displayName}!</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your Profile Details:</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li><strong>Role:</strong> <span className="capitalize">{user.role}</span></li>
            {/* Conditionally render fields based on role */}
            {user.role === 'student' && (
              <>
                <li><strong>Department:</strong> {user.department}</li>
                <li><strong>Batch:</strong> {user.batch}</li>
                <li><strong>Roll Number:</strong> {user.rollNumber}</li>
              </>
            )}
             {user.role === 'staff' && (
              <>
                <li><strong>Department:</strong> {user.department}</li>
              </>
            )}
          </ul>
        </div>
        
        <button
          onClick={logout}
          className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;