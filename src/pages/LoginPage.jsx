import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.endsWith('@cit.edu.in')) {
      setError('Please use a valid @cit.edu.in email address.');
      return;
    }

    if (login(email)) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or user not found.');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 font-sans max-w-md text-center mt-20 md:mt-24">
      <h2 className="text-2xl md:text-3xl font-bold text-[#004d99] border-b-2 border-[#ff9900] pb-2 mb-6">Trackademic Login</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600 font-semibold mb-1">Official Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., student@cit.edu.in"
              required
              className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4 -mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-300"
          >
            Login
          </button>
        </form>
      </div>
      <div className="mt-8 text-left text-gray-600">
        <p className="font-semibold">You can use the following emails for the demo:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>student@cit.edu.in (CSE)</li>
          <li>student2@cit.edu.in (ECE)</li>
          <li>staff@cit.edu.in (CSE)</li>
          <li>staff2@cit.edu.in (ECE)</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginPage;