'use client';

import { useState, useEffect } from 'react';
import { SearchBox, Pagination } from '@/components/SearchPagination';

export default function AttendanceHistoryPage() {
  const [history, setHistory] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    teacherId: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchTeachers();
    fetchHistory();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (Array.isArray(data)) setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/attendance/history?${query}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ teacherId: '', startDate: '', endDate: '' });
    setCurrentPage(1);
    setTimeout(fetchHistory, 0);
  };

  // Pagination logic
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container-fluid">
      <header className="page-header">
        <h1>📊 Attendance History</h1>
        <p>View and filter past attendance records for all teachers</p>
      </header>

      <section className="card">
        <div className="card-header">
          <h3>🔍 Filters</h3>
          <button className="btn btn-outline" onClick={resetFilters}>Reset Filters</button>
        </div>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Teacher</label>
            <select name="teacherId" value={filters.teacherId} onChange={handleFilterChange}>
              <option value="">All Teachers</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={fetchHistory}>Apply Filters</button>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Attendance Records</h3>
          <span className="badge badge-info">{history.length} Records Found</span>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Teacher Name</th>
                  <th>Designation</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.length > 0 ? (
                  paginatedHistory.map(record => (
                    <tr key={record._id}>
                      <td style={{ fontWeight: '600' }}>
                        {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: '600' }}>{record.teacherId?.name || 'Deleted Teacher'}</td>
                      <td>{record.teacherId?.designation || '-'}</td>
                      <td style={{ color: record.checkIn ? '#28a745' : '#ff4d4d', fontWeight: '500' }}>
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'Absent'}
                      </td>
                      <td style={{ color: record.checkOut ? '#28a745' : '#ff4d4d', fontWeight: '500' }}>
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                      </td>
                      <td>
                        <span className={`badge badge-${record.checkIn ? 'success' : 'danger'}`}>
                          {record.checkIn ? 'Present' : 'Missed In'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.note || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No history records found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {history.length > itemsPerPage && (
          <div style={{ marginTop: '1rem' }}>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={history.length}
            />
          </div>
        )}
      </section>
    </div>
  );
}
