import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Renders a login and sign-up page for users.
 * - Supports authentication via email/password and Google Sign-In.
 * - Toggles between 'Login' and 'Sign Up' modes.
 * - Validates that the email domain is '@cit.edu.in'.
 * - Reactively navigates the user to the correct page (onboarding or dashboard) after a successful login.
 */
const LoginPage = () => {
  // State for form inputs and UI feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Auth context and navigation hooks
  const { user, loading, emailSignIn, emailSignUp, googleSignIn, logout } = useAuth();
  const navigate = useNavigate();

  // --- Effect for Reactive Navigation ---
  // This is the core logic for redirecting a user after they log in.
  // It waits for the auth state to be confirmed and then checks the user's profile.
  useEffect(() => {
    // Only proceed after the initial auth check is complete.
    if (!loading && user) {
      if (user.onboardingComplete) {
        // If the user has already completed the onboarding form, send them to the dashboard.
        navigate('/dashboard', { replace: true });
      } else {
        // If it's a new user, direct them to the correct onboarding form based on their role.
        if (user.role === 'student') {
          navigate('/onboarding/student', { replace: true });
        } else if (user.role === 'staff') {
          navigate('/onboarding/staff', { replace: true });
        } else {
          // A fallback in case the role wasn't determined correctly.
          setError('Could not determine user role. Please contact support.');
          logout();
        }
      }
    }
  }, [user, loading, navigate, logout]);


  /**
   * Handles form submission for both login and sign-up with email/password.
   */
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side domain validation for immediate feedback
    if (!email.toLowerCase().endsWith('@cit.edu.in')) {
      setError('Please use a valid @cit.edu.in email address.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLoginMode) {
        await emailSignIn(email, password);
      } else {
        await emailSignUp(email, password);
      }
      // On success, the `useEffect` hook above will handle the navigation.
    } catch (err) {
      // Map Firebase error codes to user-friendly messages
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Try logging in.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
          console.error('Authentication Error:', err);
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the Google Sign-In process.
   */
  const handleGoogleAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      await googleSignIn();
      // On success, the `useEffect` hook above will handle navigation.
    } catch (err) {
      // Don't show an error if the user simply closes the Google popup.
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to sign in with Google. Please try again.');
        console.error('Google Sign-In Error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md text-center mt-16 md:mt-20">
      <h2 className="text-3xl font-bold text-[#004d99] border-b-2 border-[#ff9900] pb-2 mb-6">
        Trackademic {isLoginMode ? 'Login' : 'Sign Up'}
      </h2>
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-md">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-left" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailAuth}>
          <div className="mb-4 text-left">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              Official Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., student@cit.edu.in"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-transparent"
            />
          </div>
          <div className="mb-6 text-left">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center h-[42px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : isLoginMode ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm font-semibold">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-md transition-colors duration-300 flex items-center justify-center space-x-3 hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M43.611 20.083H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#34A853" d="M11.303 36c-1.649-4.657-6.08-8-11.303-8 6.627 0 12 5.373 12 12s-5.373 12-12 12c-3.059 0-5.842-1.154-7.961-3.039l-5.657 5.657C10.046 41.947 14.832 44 20 44c11.045 0 20-8.955 20-20s-8.955-20-20-20c-5.168 0-9.954 1.947-13.697 5.283l5.657 5.657C13.842 27.154 11.059 26 8 26c-6.627 0-12 5.373-12 12z" transform="translate(24,24) scale(1,-1) translate(-24,-24)"></path><path fill="#FBBC05" d="M10.45 27.73l-5.657-5.657C3.046 20.053 0 22.832 0 28s3.046 7.947 6.789 9.917l5.657-5.657C11.158 30.158 10 32.842 10 36c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12z" transform="rotate(-90 24 24)"></path><path fill="#EA4335" d="M43.611 20.083H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c5.168 0 9.954-1.947 13.697-5.283l-5.657-5.657C30.158 34.846 27.375 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12z"></path>
          </svg>
          <span>Sign In with Google</span>
        </button>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className="font-semibold text-[#007bff] hover:underline focus:outline-none"
            >
              {isLoginMode ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;