import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../api/api';
import './Dashboard.css';

const StaffDashboard = () => {
  // All Hooks must be at the top of the component
  const { user } = useAuth();
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batch: '', month: '', semester: '', eventType: '' });

  // Use useEffect to handle data fetching based on the user object
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setAllSubmissions([]);
      return;
    }
    
    setLoading(true);
    mockApi.fetchSubmissionsByDepartment(user.department)
      .then(data => {
        setAllSubmissions(data);
        setFilteredSubmissions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch staff submissions:", err);
        setLoading(false);
      });
  }, [user]); // The dependency array is crucial here

  // Filtering logic runs whenever filters or allSubmissions change
  useEffect(() => {
    let filtered = allSubmissions;
    if (filters.batch) {
      filtered = filtered.filter((sub) => sub.batch === filters.batch);
    }
    if (filters.month) {
      filtered = filtered.filter((sub) => {
        const submissionMonth = new Date(sub.eventDate).getMonth() + 1;
        return submissionMonth === parseInt(filters.month, 10);
      });
    }
    if (filters.semester) {
      filtered = filtered.filter((sub) => sub.semester === filters.semester);
    }
    if (filters.eventType) {
      filtered = filtered.filter((sub) => sub.eventType === filters.eventType);
    }
    setFilteredSubmissions(filtered);
  }, [filters, allSubmissions]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDownload = () => {
    const dataToExport = filteredSubmissions.map(({ id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Records');
    XLSX.writeFile(wb, 'Trackademic_Student_Records.xlsx');
  };

  // The conditional rendering for loading and user availability
  if (loading) {
    return <div className="loading-spinner">Loading department records...</div>;
  }

  if (!user) {
    return null; // Or some other fallback UI
  }

  return (
    <div className="dashboard-container">
      <h2>Staff Dashboard</h2>
      <p>Welcome, Department of {user.department}</p>

      <section className="filter-controls">
        <h3>Filter Records</h3>
        <div className="filter-group">
          <label>Batch</label>
          <select name="batch" onChange={handleFilterChange} value={filters.batch}>
            <option value="">All Batches</option>
            <option value="2022-2027">2022-2027</option>
            <option value="2021-2026">2021-2026</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Month</label>
          <select name="month" onChange={handleFilterChange} value={filters.month}>
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Semester</label>
          <select name="semester" onChange={handleFilterChange} value={filters.semester}>
            <option value="">All Semesters</option>
            <option value="Even">Even</option>
            <option value="Odd">Odd</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Event Type</label>
          <select name="eventType" onChange={handleFilterChange} value={filters.eventType}>
            <option value="">All Types</option>
            <option value="Workshop">Workshop</option>
            <option value="Symposium">Symposium</option>
            <option value="Seminar">Seminar</option>
            <option value="Competition">Competition</option>
          </select>
        </div>
        <button onClick={handleDownload} disabled={filteredSubmissions.length === 0}>
          Download as Excel
        </button>
      </section>

      <section className="records-table">
        <h3>Filtered Student Records</h3>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Event Name</th>
              <th>Date</th>
              <th>Batch</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.studentId}</td>
                  <td>{sub.eventName}</td>
                  <td>{sub.eventDate}</td>
                  <td>{sub.batch}</td>
                  <td>
                    <a href={sub.googleDriveLink} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No records found for the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StaffDashboard;