import { v4 as uuidv4 } from 'uuid'; // npm install uuid

// Hardcoded data acting as our "database"
const db = [
  {
    id: 's1', studentId: '2022123', department: 'CSE', batch: '2022-2027', email: 'student1@cit.edu.in',
    eventName: 'AI/ML Workshop', eventType: 'Workshop', organizer: 'CSE Dept, CIT', hostingInstitution: 'CIT',
    level: 'Intra-college', eventDate: '2024-03-15', semester: 'Even', googleDriveLink: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j',
    lastModified: '2024-03-16'
  },
  {
    id: 's2', studentId: '2022123', department: 'CSE', batch: '2022-2027', email: 'student1@cit.edu.in',
    eventName: 'National Coding Challenge', eventType: 'Symposium', organizer: 'Tech Innovators', hostingInstitution: 'IIT Madras',
    level: 'National', eventDate: '2024-04-20', semester: 'Even', googleDriveLink: 'https://drive.google.com/drive/folders/9j8i7h6g5f4e3d2c1b0a',
    lastModified: '2024-04-22'
  },
  {
    id: 's3', studentId: '2022123', department: 'ECE', batch: '2021-2026', email: 'student1@cit.edu.in',
    eventName: 'National Testing Challenge', eventType: 'Symposium', organizer: 'Someone', hostingInstitution: 'IIT Kanpur',
    level: 'National', eventDate: '2024-04-20', semester: 'Odd', googleDriveLink: 'https://drive.google.com/drive/folders/9j8i7h6g5f4e3d2c1b0a',
    lastModified: '2024-04-22'
  },
  {
    id: 's3', studentId: '2022124', department: 'ECE', batch: '2022-2027', email: 'student2@cit.edu.in',
    eventName: 'Electronics Seminar', eventType: 'Seminar', organizer: 'ECE Dept, CIT', hostingInstitution: 'CIT',
    level: 'Intra-college', eventDate: '2024-02-10', semester: 'Even', googleDriveLink: 'https://drive.google.com/drive/folders/x1y2z3a4b5c6d7e8f9g0',
    lastModified: '2024-02-11'
  },
  {
    id: 's4', studentId: '2022125', department: 'ECE', batch: '2022-2027', email: 'student3@cit.edu.in',
    eventName: '5G Technology Symposium', eventType: 'Symposium', organizer: 'ECE Dept, CIT', hostingInstitution: 'CIT',
    level: 'Intra-college', eventDate: '2024-05-01', semester: 'Even', googleDriveLink: 'https://drive.google.com/drive/folders/x1y2z3a4b5c6d7e8f9g1',
    lastModified: '2024-05-02'
  }
];

export const mockApi = {
  // Simulates fetching submissions for a specific department
  fetchSubmissionsByDepartment: (department) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const submissions = db.filter(sub => sub.department === department);
        resolve(submissions);
      }, 500); // Simulate network latency
    });
  },

  // Simulates fetching submissions for a specific student
  fetchSubmissionsByStudent: (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const submissions = db.filter(sub => sub.email === email);
        resolve(submissions);
      }, 500);
    });
  },

  // Simulates submitting a new entry
  submitNewEntry: (newEntry) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingEntry = db.find(
          (sub) =>
            sub.email === newEntry.email &&
            sub.eventName === newEntry.eventName
        );

        if (existingEntry) {
          // Check if all fields are identical
          const isIdentical = Object.keys(newEntry).every(key => newEntry[key] === existingEntry[key]);

          if (isIdentical) {
            reject(new Error('DUPLICATE_ENTRY')); // Return a specific error
          } else {
            // Silently overwrite
            Object.assign(existingEntry, { ...newEntry, lastModified: new Date().toISOString().split('T')[0] });
            resolve({ message: 'Entry updated successfully (overwritten).' });
          }
        } else {
          // Create new entry
          const entryWithId = {
            id: uuidv4(),
            ...newEntry,
            lastModified: new Date().toISOString().split('T')[0],
            studentId: newEntry.email.split('@')[0].slice(-7) // Derive studentId from email
          };
          db.push(entryWithId);
          resolve({ message: 'New entry added successfully.', data: entryWithId });
        }
      }, 1000); // Longer delay for form submission
    });
  }
};