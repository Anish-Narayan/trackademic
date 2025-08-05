// src/pages/ForbiddenPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const ForbiddenPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-24 w-24 text-red-500 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        <path d="M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0" />
      </svg>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
        403 - Access Denied
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Sorry, you do not have the necessary permissions to access this page.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Return to Your Dashboard
      </Link>
    </div>
  );
};

export default ForbiddenPage;