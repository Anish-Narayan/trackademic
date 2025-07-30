// src/pages/Auth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import InputField from '../components/InputField';
import Button from '../components/Button';
import styles from './Auth.module.css'; // New CSS module for Auth page

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); // State for name
  const [department, setDepartment] = useState(''); // State for department
  const [year, setYear] = useState(''); // State for year
  const [role, setRole] = useState('student'); // Default role for signup is student
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = ['M.Sc., SS', 'M.Sc., DS', 'M.Sc., DCS', 'M.Sc., AIML'];
  const years = ['1', '2', '3', '4', '5'];

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Common validation for both login and signup
    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    // Validation specific to Sign Up
    if (!isLogin) {
      if (!name) {
        setError('Name is required.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      // Additional validation for 'student' role
      if (role === 'student') {
        if (!department) {
          setError('Department is required for students.');
          setLoading(false);
          return;
        }
        if (!year) {
          setError('Year is required for students.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      if (isLogin) {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password);
        // AuthContext will handle redirection based on role
      } else {
        // Sign Up logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
          email: user.email,
          name: name,
          role: role,
          createdAt: new Date(),
          isOnline: true, // Initial status
        };

        // Add department and year only if the role is 'student'
        if (role === 'student') {
          userData.department = department;
          userData.year = year;
        }

        // Store user data in Firestore
        await setDoc(doc(db, 'users', user.uid), userData);
        // AuthContext will handle redirection based on role
      }
    } catch (err) {
      console.error("Authentication error:", err.message);
      let errorMessage = "An unexpected error occurred.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Try logging in.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleAuth}>
          {error && <p className={styles.errorText}>{error}</p>}

          {/* Render Email and Password always, but manage order for signup */}
          {isLogin ? (
            <>
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </>
          ) : ( /* Sign Up fields */
            <>
              {/* Name Input */}
              <InputField
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />

              {/* Department and Year - Only for Student Role */}
              {role === 'student' && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="department">Department</label>
                    <select
                      id="department"
                      className={styles.selectField}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required={role === 'student'}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="year">Year</label>
                    <select
                      id="year"
                      className={styles.selectField}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required={role === 'student'}
                    >
                      <option value="">Select Year</option>
                      {years.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Email Input */}
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              {/* Password Input */}
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              {/* Confirm Password Input */}
              <InputField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />

              {/* Role Selection (Student/Staff) - Moved to bottom for Sign Up */}
              <div className={styles.roleSelection}>
                <label>
                  <input
                    type="radio"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => {
                      setRole('student');
                      setDepartment(''); // Clear if switching from staff
                      setYear(''); // Clear if switching from staff
                    }}
                  />
                  Student
                </label>
                <label>
                  <input
                    type="radio"
                    value="staff"
                    checked={role === 'staff'}
                    onChange={() => {
                      setRole('staff');
                      setDepartment(''); // Clear when staff is selected
                      setYear(''); // Clear when staff is selected
                    }}
                  />
                  Staff
                </label>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} variant="primary">
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </Button>
        </form>
        <p className={styles.toggleAuth}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;