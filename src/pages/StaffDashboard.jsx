// src/pages/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import styles from './StaffDashboard.module.css'; // New CSS module for StaffDashboard

const StaffDashboard = () => {
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllDocuments = async () => {
    setError('');
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'documents'));
      const fetchedDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // For a real app, you'd fetch user details (email/name) separately for each doc's userId
      // For this example, we'll just display the userId
      setAllDocuments(fetchedDocs);
    } catch (err) {
      console.error("Error fetching all documents:", err);
      setError("Failed to fetch documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboardContainer} style={{ textAlign: 'center' }}>
        <p>Loading documents for staff...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1>Staff Dashboard</h1>
      {error && <p className={styles.errorText}>{error}</p>}
      {allDocuments.length === 0 ? (
        <p>No documents have been uploaded yet.</p>
      ) : (
        <table className={styles.documentsTable}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>File Name</th>
              <th>Type</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allDocuments.map(doc => (
              <tr key={doc.id}>
                <td>{doc.userId}</td> {/* In a real app, fetch user's email/name */}
                <td>{doc.fileName}</td>
                <td>{doc.documentType}</td>
                <td>{doc.uploadDate ? new Date(doc.uploadDate.toDate()).toLocaleDateString() : 'N/A'}</td>
                <td>{doc.status}</td>
                <td>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                  {/* Future: Add buttons for changing status, commenting, etc. */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffDashboard;