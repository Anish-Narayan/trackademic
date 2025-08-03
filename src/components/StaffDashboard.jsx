import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../api/api';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batch: '', month: '', semester: '', eventType: '' });

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
  }, [user]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-blue-800">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading department records...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 font-sans max-w-7xl">
      <h2 className="text-2xl md:text-3xl font-bold text-[#004d99] border-b-2 border-[#ff9900] pb-2 mb-6">Staff Dashboard</h2>
      <p className="mb-6 text-gray-700">Welcome, Department of <span className="font-bold">{user.department}</span></p>

      <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-0">Filter Records</h3>
        <div className="flex flex-wrap items-end gap-4 md:gap-6">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-gray-600 font-semibold mb-1">Batch</label>
            <select name="batch" onChange={handleFilterChange} value={filters.batch} className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]">
              <option value="">All Batches</option>
              <option value="2022-2027">2022-2027</option>
              <option value="2021-2026">2021-2026</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-gray-600 font-semibold mb-1">Month</label>
            <select name="month" onChange={handleFilterChange} value={filters.month} className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]">
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
          <div className="flex-1 min-w-[180px]">
            <label className="block text-gray-600 font-semibold mb-1">Semester</label>
            <select name="semester" onChange={handleFilterChange} value={filters.semester} className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]">
              <option value="">All Semesters</option>
              <option value="Even">Even</option>
              <option value="Odd">Odd</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-gray-600 font-semibold mb-1">Event Type</label>
            <select name="eventType" onChange={handleFilterChange} value={filters.eventType} className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#007bff] focus:border-[#007bff]">
              <option value="">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Symposium">Symposium</option>
              <option value="Seminar">Seminar</option>
              <option value="Competition">Competition</option>
            </select>
          </div>
          <button
            onClick={handleDownload}
            disabled={filteredSubmissions.length === 0}
            className="bg-[#007bff] hover:bg-[#0056b3] text-white font-bold py-2.5 px-6 rounded-md transition-colors duration-300 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Download as Excel
          </button>
        </div>
      </section>

      <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-0">Filtered Student Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Student ID</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Event Name</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Date</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Batch</th>
                <th className="p-4 border border-gray-300 font-bold text-gray-700">Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="odd:bg-white even:bg-gray-100">
                    <td className="p-4 border border-gray-300">{sub.studentId}</td>
                    <td className="p-4 border border-gray-300">{sub.eventName}</td>
                    <td className="p-4 border border-gray-300">{sub.eventDate}</td>
                    <td className="p-4 border border-gray-300">{sub.batch}</td>
                    <td className="p-4 border border-gray-300">
                      <a href={sub.googleDriveLink} target="_blank" rel="noopener noreferrer" className="text-[#007bff] hover:underline">
                        View
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center italic text-gray-500 border border-gray-300">
                    No records found for the selected filters.
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

export default StaffDashboard;