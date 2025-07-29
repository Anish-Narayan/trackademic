// src/pages/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import styles from './StaffDashboard.module.css';

const StaffDashboard = () => {
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllDocuments = async () => {
    setError('');
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'documents'));
      const fetchedDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllDocuments(fetchedDocs);
    } catch (err) {
      console.error("Error fetching all documents:", err);
      setError("Failed to fetch documents. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <h1>Staff Dashboard</h1>

      {loading && <p>Loading documents...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && !error && allDocuments.length === 0 && (
        <p>No documents have been uploaded yet.</p>
      )}

      {!loading && !error && allDocuments.length > 0 && (
        <div className={styles.tableWrapper}>
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
                  <td>{doc.userId}</td>
                  <td>{doc.fileName}</td>
                  <td>{doc.documentType}</td>
                  <td>{doc.uploadDate?.toDate?.().toLocaleDateString() || 'N/A'}</td>
                  <td>{doc.status || 'pending'}</td>
                  <td>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                    {/* Future: Add Approve/Reject controls, comments, etc. */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
