import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../api/api';
import './Dashboard.css';

const StudentDashboard = () => {
  // All Hooks must be at the top of the component
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newSubmission, setNewSubmission] = useState({
    eventName: '', eventType: '', organizer: '', hostingInstitution: '',
    level: '', eventDate: '', semester: '', googleDriveLink: '',
    // Use optional chaining or a null check to prevent errors
    email: user?.email || '', 
    department: user?.department || '', 
    batch: user?.batch || ''
  });

  // Use useEffect to handle data fetching based on the user object
  // This will run when the component mounts and when the user object changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setSubmissions([]); // Clear submissions if no user
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
  }, [user]); // The useEffect dependency array is crucial here

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

  // The conditional loading state should be inside the component's render logic
  if (loading) {
    return <div className="loading-spinner">Loading submissions...</div>;
  }

  // Final check to ensure user is available before rendering the dashboard content
  if (!user) {
    return null; // or some other fallback UI
  }
  
  return (
    <div className="dashboard-container">
      <h2>Student Dashboard</h2>
      <p>Welcome, {user.email} (Batch: {user.batch})</p>

      <section className="submission-form">
        <h3>Submit a New Certificate</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name</label>
            <input type="text" name="eventName" value={newSubmission.eventName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Event Type</label>
            <select name="eventType" value={newSubmission.eventType} onChange={handleChange} required>
              <option value="">Select...</option>
              <option value="Workshop">Workshop</option>
              <option value="Symposium">Symposium</option>
              <option value="Seminar">Seminar</option>
              <option value="Competition">Competition</option>
            </select>
          </div>
          <div className="form-group">
            <label>Organizer</label>
            <input type="text" name="organizer" value={newSubmission.organizer} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Hosting Institution</label>
            <input type="text" name="hostingInstitution" value={newSubmission.hostingInstitution} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Level</label>
            <select name="level" value={newSubmission.level} onChange={handleChange} required>
              <option value="">Select...</option>
              <option value="Intra-college">Intra-college</option>
              <option value="Inter-college">Inter-college</option>
              <option value="State">State</option>
              <option value="National">National</option>
              <option value="International">International</option>
            </select>
          </div>
          <div className="form-group">
            <label>Event Date</label>
            <input type="date" name="eventDate" value={newSubmission.eventDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Semester</label>
            <select name="semester" value={newSubmission.semester} onChange={handleChange} required>
              <option value="">Select...</option>
              <option value="Even">Even</option>
              <option value="Odd">Odd</option>
            </select>
          </div>
          <div className="form-group">
            <label>Google Drive Link</label>
            <input type="url" name="googleDriveLink" value={newSubmission.googleDriveLink} onChange={handleChange} required />
          </div>
          {formError && <p className="error-message">{formError}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </section>

      <section className="my-submissions">
        <h3>My Submissions</h3>
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Level</th>
              <th>Link</th>
              <th>Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.eventName}</td>
                <td>{sub.eventType}</td>
                <td>{sub.eventDate}</td>
                <td>{sub.level}</td>
                <td>
                  <a href={sub.googleDriveLink} target="_blank" rel="noopener noreferrer">
                    View Certificate
                  </a>
                </td>
                <td>{sub.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StudentDashboard;