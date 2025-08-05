import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const StaffOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    department: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.displayName || !formData.department) {
      setError('All fields are required.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      if (!user) throw new Error("User is not authenticated.");
      
      const userRef = doc(db, 'users', user.uid);
      
      // --- THIS IS THE MODIFIED PART ---
      // Add the appId to the object being sent to Firestore.
      await updateDoc(userRef, {
        ...formData,
        onboardingComplete: true,
        appId: 'trackademic-prod' // Storing the default appId
      });
      
      // Redirect to the main dashboard logic after successful update.
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Failed to save details. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent rendering if the user object is not yet available.
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-md text-center mt-16">
      <h2 className="text-3xl font-bold text-[#004d99] mb-4">Welcome, Staff!</h2>
      <p className="text-gray-600 mb-6">Please complete your profile to continue.</p>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md text-left">
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}
        <form onSubmit={handleSubmit}>
           <div className="mb-4">
            <label htmlFor="displayName" className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input 
              id="displayName"
              type="text" 
              name="displayName" 
              value={formData.displayName} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="department" className="block text-gray-700 font-semibold mb-2">Department</label>
            <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
                <option value="" disabled>Select Department...</option>
                <option value="Software Systems">Software Systems</option>
                <option value="Data Science">Data Science</option>
                <option value="Decision and Computing Sciences">Decision and Computing Sciences</option>
                <option value="Artificial Intelligence and machine learning">Artificial Intelligence and machine learning</option>
            </select>
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
                    Saving...
                </>
            ) : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffOnboarding;