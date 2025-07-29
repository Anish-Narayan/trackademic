// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import InputField from '../components/InputField';
import Button from '../components/Button';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
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
    fetchDocuments();
  }, [currentUser]); // Re-fetch when current user changes

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (!documentType.trim()) {
      setUploadError("Please specify a document type (e.g., 'Marksheet', 'Certificate').");
      return;
    }
    if (!currentUser) {
      setUploadError("You must be logged in to upload files.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload file to Firebase Storage
      const storageRef = ref(storage, `user_uploads/${currentUser.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Store document metadata in Firestore
      await addDoc(collection(db, 'documents'), {
        userId: currentUser.uid,
        fileName: file.name,
        fileUrl: downloadURL,
        documentType: documentType.trim(),
        uploadDate: serverTimestamp(),
        status: 'pending', // Initial status
      });

      alert('File uploaded successfully!');
      setFile(null);
      setDocumentType('');
      await fetchDocuments(); // Refresh the list of documents
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadError(`Failed to upload file: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1>Welcome, Student!</h1>

      <div className={styles.uploadSection}>
        <h2>Upload New Document</h2>
        {uploadError && <p className={styles.errorText}>{uploadError}</p>}
        <form onSubmit={handleFileUpload} className={styles.uploadForm}>
          <InputField
            label="Document Type (e.g., Marksheet, Certificate)"
            type="text"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="e.g., Academic Transcript"
            required
          />
          <InputField
            label="Select File"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <Button type="submit" disabled={uploading} variant="primary">
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      </div>

      <div className={styles.documentsSection}>
        <h2>Your Uploaded Documents</h2>
        {fetchError && <p className={styles.errorText}>{fetchError}</p>}
        {documents.length === 0 ? (
          <p>You haven't uploaded any documents yet.</p>
        ) : (
          <table className={styles.documentsTable}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Upload Date</th>
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