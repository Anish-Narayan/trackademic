import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import { useAuth } from '../hooks/useAuth';

/**
 * Renders the student dashboard.
 * - Displays a form to submit new event/certificate details.
 * - Shows a real-time table of the student's past submissions.
 * - Fetches user data and submissions securely based on the authenticated user.
 */
const StudentDashboard = () => {
  // --- Hooks and State Management ---
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading status from the central hook

  // State specific to this component's functionality
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [newSubmission, setNewSubmission] = useState({
    eventName: '', eventType: '', organizer: '', hostingInstitution: '',
    level: '', eventDate: '', semester: '', googleDriveLink: ''
  });

  // --- Data Fetching and Side Effects ---
  useEffect(() => {
    // If there is no authenticated user, don't fetch data.
    if (!user) {
      setSubmissions([]);
      setSubmissionsLoading(false);
      return;
    }

    setSubmissionsLoading(true);
    const submissionsCollectionPath = `/artifacts/${appId}/public/data/submissions`;
    const q = query(
      collection(db, submissionsCollectionPath),
      where("studentId", "==", user.uid) // Query by the user's unique ID for security
    );

    // onSnapshot listens for real-time updates to the query.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const submissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastModified: doc.data().lastModified ? doc.data().lastModified.toDate() : null
      }));

      submissionsData.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0)); // Show newest first
      setSubmissions(submissionsData);
      setSubmissionsLoading(false);
    }, (error) => {
      console.error("Error fetching submissions:", error);
      setSubmissionsLoading(false);
    });

    // Cleanup the listener when the component unmounts or the user changes.
    return () => unsubscribe();
  }, [user]); // Re-run this effect if the user object changes.

  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSubmission(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setFormError("You must be signed in to make a submission.");
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const submissionWithUserData = {
        ...newSubmission,
        studentId: user.uid,
        email: user.email,
        displayName: user.displayName,
        department: user.department,
        batch: user.batch,
        lastModified: serverTimestamp(),
        status: 'pending' // Default status for new submissions, ideal for a review workflow.
      };
      
      await addDoc(collection(db, `/artifacts/${appId}/public/data/submissions`), submissionWithUserData);
      
      setSuccessMessage("Submission successful! It is now pending for review.");
      // Reset the form fields after successful submission.
      setNewSubmission({
        eventName: '', eventType: '', organizer: '', hostingInstitution: '',
        level: '', eventDate: '', semester: '', googleDriveLink: ''
      });
    } catch (err) {
      console.error("Error submitting document:", err);
      setFormError('An error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- JSX Rendering Logic ---

  // 1. Show a full-page loader while useAuth confirms the user's session.
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-blue-800">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading dashboard...
      </div>
    );
  }

  // 2. Render the main dashboard content.
  return (
    <div className="container mx-auto p-4 md:p-8 font-sans max-w-7xl">
      <h2 className="text-2xl md:text-3xl font-bold text-[#004d99] border-b-2 border-[#ff9900] pb-2 mb-6">Student Dashboard</h2>
      <p className="mb-6 text-gray-700">Welcome, <span className="font-bold">{user.displayName}</span> (Batch: <span className="font-bold">{user.batch}</span>)</p>

      {/* Success Message Alert */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p className="font-bold">Success</p>
          <p>{successMessage}</p>
        </div>
      )}

      {/* Submission Form Section */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-0">Submit a New Certificate</h3>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="flex flex-col">
            <label htmlFor="eventName" className="block text-gray-600 font-semibold mb-1">Event Name</label>
            <input id="eventName" type="text" name="eventName" value={newSubmission.eventName} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="eventType" className="block text-gray-600 font-semibold mb-1">Event Type</label>
            <select id="eventType" name="eventType" value={newSubmission.eventType} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">Select...</option>
              <option value="Workshop">Workshop</option>
              <option value="Symposium">Symposium</option>
              <option value="Seminar">Seminar</option>
              <option value="Competition">Competition</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="organizer" className="block text-gray-600 font-semibold mb-1">Organizer</label>
            <input id="organizer" type="text" name="organizer" value={newSubmission.organizer} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="hostingInstitution" className="block text-gray-600 font-semibold mb-1">Hosting Institution</label>
            <input id="hostingInstitution" type="text" name="hostingInstitution" value={newSubmission.hostingInstitution} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="level" className="block text-gray-600 font-semibold mb-1">Level</label>
            <select id="level" name="level" value={newSubmission.level} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">Select...</option>
              <option value="Intra-college">Intra-college</option>
              <option value="Inter-college">Inter-college</option>
              <option value="State">State</option>
              <option value="National">National</option>
              <option value="International">International</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="eventDate" className="block text-gray-600 font-semibold mb-1">Event Date</label>
            <input id="eventDate" type="date" name="eventDate" value={newSubmission.eventDate} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="semester" className="block text-gray-600 font-semibold mb-1">Semester</label>
            <select id="semester" name="semester" value={newSubmission.semester} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">Select...</option>
              <option value="1">1</option><option value="2">2</option>
              <option value="3">3</option><option value="4">4</option>
              <option value="5">5</option><option value="6">6</option>
              <option value="7">7</option><option value="8">8</option>
            </select>
          </div>

          <div className="flex flex-col lg:col-span-2">
            <label htmlFor="googleDriveLink" className="block text-gray-600 font-semibold mb-1">Google Drive Link (Certificate)</label>
            <input id="googleDriveLink" type="url" name="googleDriveLink" placeholder="https://docs.google.com/..." value={newSubmission.googleDriveLink} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          
          {formError && <p className="text-red-500 mt-2 md:col-span-full text-center">{formError}</p>}
          
          <div className="md:col-span-full mt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center h-[42px]">
              {isSubmitting ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Submitting...
                 </>
              ) : 'Submit for Review'}
            </button>
          </div>

        </form>
      </section>

      {/* Submissions Table Section */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-0">My Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b-2 border-gray-300 font-bold text-gray-600">Event Name</th>
                <th className="p-3 border-b-2 border-gray-300 font-bold text-gray-600">Type</th>
                <th className="p-3 border-b-2 border-gray-300 font-bold text-gray-600">Date</th>
                <th className="p-3 border-b-2 border-gray-300 font-bold text-gray-600">Status</th>
                <th className="p-3 border-b-2 border-gray-300 font-bold text-gray-600">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {submissionsLoading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500 border-b border-gray-200">Loading submissions...</td>
                </tr>
              ) : submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-b border-gray-200">{sub.eventName}</td>
                    <td className="p-3 border-b border-gray-200">{sub.eventType}</td>
                    <td className="p-3 border-b border-gray-200">{sub.eventDate}</td>
                    <td className="p-3 border-b border-gray-200">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          sub.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          sub.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <a href={sub.googleDriveLink} target="_blank" rel="noopener noreferrer" className="text-[#007bff] hover:underline">
                        View
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center italic text-gray-500 border-b border-gray-200">
                    You have not made any submissions yet. Use the form above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;