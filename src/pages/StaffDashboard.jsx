import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db, appId } from '../../firebase';

// A simple modal component for the review workflow
const ReviewModal = ({ submission, onUpdate, onClose, isUpdating }) => {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Review Submission</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Student:</strong> {submission.displayName} ({submission.email})</p>
          <p><strong>Event:</strong> {submission.eventName}</p>
          <p><strong>Date:</strong> {submission.eventDate}</p>
          <p><strong>Certificate:</strong> <a href={submission.googleDriveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Link</a></p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} disabled={isUpdating} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
          <button onClick={() => onUpdate(submission.id, 'rejected')} disabled={isUpdating} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50">Reject</button>
          <button onClick={() => onUpdate(submission.id, 'approved')} disabled={isUpdating} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50">Approve</button>
        </div>
      </div>
    </div>
  );
};

const StaffDashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const [allSubmissions, setAllSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // --- CHANGED 1: State now includes all time filters ---
  const [filters, setFilters] = useState({ 
    batch: '', 
    month: '', 
    startDate: '', 
    endDate: '', 
    semester: '', 
    eventType: '', 
    status: '' 
  });
  
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'staff') {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const submissionsRef = collection(db, `artifacts/${appId}/public/data/submissions`);
    const q = query(submissionsRef, where('department', '==', user.department));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllSubmissions(data);
      setDataLoading(false);
    }, (error) => {
      console.error("Failed to fetch submissions:", error);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- CHANGED 2: Filtering logic updated for both month and date range ---
  useEffect(() => {
    let filtered = allSubmissions;

    if (filters.status) filtered = filtered.filter((sub) => sub.status === filters.status);
    if (filters.batch) filtered = filtered.filter((sub) => sub.batch === filters.batch);
    if (filters.semester) filtered = filtered.filter((sub) => sub.semester === filters.semester);
    if (filters.eventType) filtered = filtered.filter((sub) => sub.eventType === filters.eventType);

    // Time-based filtering: either by month OR by date range
    if (filters.month) {
      const month = parseInt(filters.month, 10);
      filtered = filtered.filter((sub) => sub.eventDate && new Date(sub.eventDate).getMonth() + 1 === month);
    } else if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      // Set time to the end of the day to include all events on the end date
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter((sub) => {
        if (!sub.eventDate) return false;
        const eventDate = new Date(sub.eventDate);
        return eventDate >= start && eventDate <= end;
      });
    }
    
    setFilteredSubmissions(filtered);
  }, [filters, allSubmissions]);

  // --- CHANGED 3: Handler now resets conflicting filters ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Create a mutable copy of the filters
    const newFilters = { ...filters, [name]: value };

    // If a month is selected, clear the date range
    if (name === 'month' && value !== '') {
      newFilters.startDate = '';
      newFilters.endDate = '';
    }
    
    // If a date is selected, clear the month
    if ((name === 'startDate' || name === 'endDate') && value !== '') {
      newFilters.month = '';
    }

    setFilters(newFilters);
  };


  const handleUpdateStatus = async (submissionId, newStatus) => {
    setIsUpdating(true);
    const submissionRef = doc(db, `artifacts/${appId}/public/data/submissions`, submissionId);
    try {
      await updateDoc(submissionRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
      setSelectedSubmission(null);
    }
  };

  const handleDownload = () => {
    const dataToExport = filteredSubmissions.map(({ id, studentId, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Records');
    XLSX.writeFile(wb, `Trackademic_${user.department}_Records.xlsx`);
  };

  if (authLoading) {
    return <div className="text-center p-10">Loading Authentication...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 font-sans max-w-full">
      <ReviewModal 
        submission={selectedSubmission} 
        onUpdate={handleUpdateStatus}
        onClose={() => setSelectedSubmission(null)}
        isUpdating={isUpdating}
      />
      
      <h2 className="text-2xl md:text-3xl font-bold text-[#004d99] border-b-2 border-[#ff9900] pb-2 mb-6">Staff Dashboard</h2>
      <p className="mb-6 text-gray-700">Welcome, <span className="font-bold">{user.displayName}</span> | Department of <span className="font-bold">{user.department}</span></p>

      {/* --- Filter Section --- */}
      <section className="bg-white border rounded-lg p-6 mb-8 shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter Records</h3>
        {/* --- CHANGED 4: Updated grid layout for more filters --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          
          <div>
            <label className="block text-gray-600 font-semibold mb-1 text-sm">Status</label>
            <select name="status" onChange={handleFilterChange} value={filters.status} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1 text-sm">Batch</label>
            <select name="batch" onChange={handleFilterChange} value={filters.batch} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
              <option value="">All Batches</option>
              <option value="2022-2027">2022-2027</option>
              <option value="2023-2028">2023-2028</option>
              <option value="2024-2029">2024-2029</option>
              <option value="2025-2030">2025-2030</option>
            </select>
          </div>

          {/* --- NEW: Month and Date Range inputs --- */}
          <div>
            <label className="block text-gray-600 font-semibold mb-1 text-sm">Month</label>
            <select 
              name="month" 
              onChange={handleFilterChange} 
              value={filters.month} 
              disabled={!!filters.startDate || !!filters.endDate}
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
            >
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 font-semibold mb-1 text-sm">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                onChange={handleFilterChange}
                value={filters.startDate}
                disabled={!!filters.month}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200" 
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1 text-sm">End Date</label>
              <input 
                type="date" 
                name="endDate" 
                onChange={handleFilterChange}
                value={filters.endDate}
                disabled={!!filters.month}
                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-600 font-semibold mb-1 text-sm">Semester</label>
            <select name="semester" onChange={handleFilterChange} value={filters.semester} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
              <option value="">All Semesters</option>
              {[...Array(8)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1 text-sm">Event Type</label>
            <select name="eventType" onChange={handleFilterChange} value={filters.eventType} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Symposium">Symposium</option>
              <option value="Seminar">Seminar</option>
              <option value="Competition">Competition</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          
          <div className="lg:col-start-5 xl:col-start-auto">
            <button
              onClick={handleDownload}
              disabled={filteredSubmissions.length === 0}
              className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-2 px-4 rounded-md transition-colors whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed h-[42px]"
            >
              Download Excel
            </button>
          </div>
        </div>
      </section>

      {/* --- Table Section (No changes needed here) --- */}
      <section className="bg-white border rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Student Submissions ({filteredSubmissions.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 font-bold text-gray-600">Student Name</th>
                <th className="p-3 font-bold text-gray-600">Event Name</th>
                <th className="p-3 font-bold text-gray-600">Event Date</th>
                <th className="p-3 font-bold text-gray-600">Batch</th>
                <th className="p-3 font-bold text-gray-600">Status</th>
                <th className="p-3 font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataLoading ? (
                <tr><td colSpan="6" className="text-center p-4">Loading submissions...</td></tr>
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{sub.displayName}</td>
                    <td className="p-3">{sub.eventName}</td>
                    <td className="p-3">{sub.eventDate}</td>
                    <td className="p-3">{sub.batch}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        sub.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        sub.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sub.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => setSelectedSubmission(sub)} className="text-blue-600 hover:underline font-semibold">
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center p-4 italic text-gray-500">No records found for the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StaffDashboard;