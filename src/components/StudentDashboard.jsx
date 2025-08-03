import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../api/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newSubmission, setNewSubmission] = useState({
    eventName: '', eventType: '', organizer: '', hostingInstitution: '',
    level: '', eventDate: '', semester: '', googleDriveLink: '',
    email: user?.email || '',
    department: user?.department || '',
    batch: user?.batch || ''
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setSubmissions([]);
      return;
    }

    setLoading(true);
    mockApi.fetchSubmissionsByStudent(user.email)
      .then(data => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch student submissions:", err);
        setLoading(false);
      });
  }, [user]);

  const handleChange = (e) => {
    setNewSubmission({ ...newSubmission, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    mockApi.submitNewEntry(newSubmission)
      .then(response => {
        console.log(response.message);
        if (response.data) {
          setSubmissions(prev => [...prev, response.data]);
        }
        alert(response.message);
      })
      .catch(err => {
        if (err.message === 'DUPLICATE_ENTRY') {
          setFormError('An identical entry already exists. No new entry will be created.');
        } else {
          setFormError('An error occurred during submission.');
        }
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
        setNewSubmission({
          ...newSubmission,
          eventName: '', eventType: '', organizer: '', hostingInstitution: '',
          level: '', eventDate: '', semester: '', googleDriveLink: ''
        });
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-blue-800">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading submissions...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 font-sans max-w-7xl">
      <h2 className="text-2xl md:text-3xl font-bold text-[#004d99] border-b-2 border-[#ff9900] pb-2 mb-6">Student Dashboard</h2>
      <p className="mb-6 text-gray-700">Welcome, <span className="font-bold">{user.email}</span> (Batch: <span className="font-bold">{user.batch}</span>)</p>

      <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-0">Submit a New Certificate</h3>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="eventName" className="block text-gray-600 font-semibold mb-1">Event Name</label>
            <input id="eventName" type="text" name="eventName" value={newSubmission.eventName} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="eventType" className="block text-gray-600 font-semibold mb-1">Event Type</label>
            <select id="eventType" name="eventType" value={newSubmission.eventType} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]">
              <option value="">Select...</option>
              <option value="Workshop">Workshop</option>
              <option value="Symposium">Symposium</option>
              <option value="Seminar">Seminar</option>
              <option value="Competition">Competition</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="organizer" className="block text-gray-600 font-semibold mb-1">Organizer</label>
            <input id="organizer" type="text" name="organizer" value={newSubmission.organizer} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="hostingInstitution" className="block text-gray-600 font-semibold mb-1">Hosting Institution</label>
            <input id="hostingInstitution" type="text" name="hostingInstitution" value={newSubmission.hostingInstitution} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="level" className="block text-gray-600 font-semibold mb-1">Level</label>
            <select id="level" name="level" value={newSubmission.level} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]">
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
            <input id="eventDate" type="date" name="eventDate" value={newSubmission.eventDate} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="semester" className="block text-gray-600 font-semibold mb-1">Semester</label>
            <select id="semester" name="semester" value={newSubmission.semester} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]">
              <option value="">Select...</option>
              <option value="Even">Even</option>
              <option value="Odd">Odd</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="googleDriveLink" className="block text-gray-600 font-semibold mb-1">Google Drive Link</label>
            <input id="googleDriveLink" type="url" name="googleDriveLink" value={newSubmission.googleDriveLink} onChange={handleChange} required className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]" />
          </div>
          {formError && <p className="text-red-500 mt-2">{formError}</p>}
          <div className="md:col-span-2 mt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-0">My Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Event Name</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Type</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Date</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Level</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Link</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr key={sub.id} className="odd:bg-white even:bg-gray-100">
                    <td className="p-4 border border-gray-300">{sub.eventName}</td>
                    <td className="p-4 border border-gray-300">{sub.eventType}</td>
                    <td className="p-4 border border-gray-300">{sub.eventDate}</td>
                    <td className="p-4 border border-gray-300">{sub.level}</td>
                    <td className="p-4 border border-gray-300">
                      <a href={sub.googleDriveLink} target="_blank" rel="noopener noreferrer" className="text-[#007bff] hover:underline">
                        View Certificate
                      </a>
                    </td>
                    <td className="p-4 border border-gray-300">{sub.lastModified}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center italic text-gray-500 border border-gray-300">
                    You have not made any submissions yet.
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