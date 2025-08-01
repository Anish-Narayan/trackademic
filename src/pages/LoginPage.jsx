import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../components/Dashboard.css'; // Re-use styling

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
    <div className="dashboard-container" style={{ textAlign: 'center', maxWidth: '400px', margin: '5rem auto' }}>
      <h2>Trackademic Login</h2>
      <div className="submission-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Official Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., student@cit.edu.in"
              required
            />
          </div>
          {error && <p style={{ color: 'red', marginTop: '-0.5rem' }}>{error}</p>}
          <button type="submit" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <p>You can use the following emails for the demo:</p>
        <ul>
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