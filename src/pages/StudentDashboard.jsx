import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // No longer need 'storage'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import InputField from '../components/InputField';
import Button from '../components/Button';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [googleDriveLink, setGoogleDriveLink] = useState(''); // Changed from 'file'
  const [documentType, setDocumentType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fetchError, setFetchError] = useState('');

  const fetchDocuments = async () => {
    if (!currentUser) return;
    setFetchError('');
    try {
      const q = query(collection(db, 'documents'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const fetchedDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(fetchedDocs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setFetchError("Failed to fetch your documents. Please try again.");
    }
  };

  useEffect(() => {
    if (currentUser) fetchDocuments();
  }, [currentUser]);


  const handleDocumentSubmit = async (e) => { // Renamed from handleFileUpload for clarity
    e.preventDefault();
    setUploadError('');

    if (!googleDriveLink.trim()) {
      setUploadError("Please provide a Google Drive link.");
      return;
    }
    // Basic URL validation
    try {
      new URL(googleDriveLink);
    } catch (err) {
      setUploadError("Please enter a valid URL for the Google Drive link.");
      return;
    }

    if (!documentType.trim()) {
      setUploadError("Please specify a document type (e.g., 'Marksheet', 'Certificate').");
      return;
    }
    if (!currentUser) {
      setUploadError("You must be logged in to submit documents.");
      return;
    }

    setUploading(true);
    try {
      // 1. You might want to extract file name from the Google Drive link if possible,
      // or prompt the user for it. For now, we'll use a generic name or part of the URL.
      // A more robust solution might involve Google Drive API to get file details.
      const fileNameFromLink = googleDriveLink.substring(googleDriveLink.lastIndexOf('/') + 1) || 'Google Drive Document';

      // 2. Store document metadata in Firestore
      await addDoc(collection(db, 'documents'), {
        userId: currentUser.uid,
        fileName: fileNameFromLink, // Using part of the link as file name
        fileUrl: googleDriveLink, // Storing the Google Drive link directly
        documentType: documentType.trim(),
        uploadDate: serverTimestamp(),
        status: 'pending', // Initial status
      });

      alert('Document link submitted successfully!');
      setGoogleDriveLink('');
      setDocumentType('');
      await fetchDocuments(); // Refresh the list of documents
    } catch (err) {
      console.error("Error submitting document link:", err);
      setUploadError(`Failed to submit document link: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1>Welcome, Student!</h1>

      <div className={styles.uploadSection}>
        <h2>Submit New Document Link</h2>
        {uploadError && <p className={styles.errorText}>{uploadError}</p>}
        <form onSubmit={handleDocumentSubmit} className={styles.uploadForm}> {/* Changed onSubmit handler */}
          <InputField
            label="Document Type (e.g., Marksheet, Certificate)"
            type="text"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="e.g., Academic Transcript"
            required
          />
          <InputField
            label="Google Drive Link"
            type="url" // Use type="url" for better browser validation
            value={googleDriveLink}
            onChange={(e) => setGoogleDriveLink(e.target.value)}
            placeholder="e.g., https://drive.google.com/file/d/..."
            required
          />
          <Button type="submit" disabled={uploading} variant="primary">
            {uploading ? 'Submitting...' : 'Submit Document Link'}
          </Button>
        </form>
      </div>

      <div className={styles.documentsSection}>
        <h2>Your Submitted Documents</h2>
        {fetchError && <p className={styles.errorText}>{fetchError}</p>}
        {documents.length === 0 ? (
          <p>You haven't submitted any document links yet.</p>
        ) : (
          <table className={styles.documentsTable}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Submission Date</th> {/* Changed from Upload Date */}
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.fileName}</td>
                  <td>{doc.documentType}</td>
                  <td>{doc.uploadDate ? new Date(doc.uploadDate.toDate()).toLocaleDateString() : 'N/A'}</td>
                  <td>{doc.status}</td>
                  <td>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;