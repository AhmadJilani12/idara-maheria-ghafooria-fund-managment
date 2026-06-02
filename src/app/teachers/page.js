'use client';

import { useState, useEffect } from 'react';
import { SearchBox, Pagination } from '@/components/SearchPagination';
import FaceEnrollment from '@/components/FaceEnrollment';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [enrollingFace, setEnrollingFace] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    designation: '',
    salary: 0,
    isActive: true,
    joiningDate: new Date().toISOString().split('T')[0]
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/teachers', { cache: 'no-store' });
      const data = await response.json();
      if (Array.isArray(data)) {
        setTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.phone?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (name === 'salary' ? Number(value) : value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/teachers/${editingId}` : '/api/teachers';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditingId(null);
        setFormData({
          name: '',
          phone: '',
          designation: '',
          salary: 0,
          isActive: true,
          joiningDate: new Date().toISOString().split('T')[0]
        });
        setShowForm(false);
        fetchTeachers();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || errorData.error || 'Failed to save teacher'}`);
      }
    } catch (error) {
      console.error("Error saving teacher:", error);
    }
  };

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name,
      phone: teacher.phone || '',
      designation: teacher.designation || '',
      salary: teacher.salary || 0,
      isActive: teacher.isActive,
      joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : ''
    });
    setEditingId(teacher._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <h1>👨‍🏫 Teacher Management</h1>
        <p>Manage all teachers and staff members</p>
      </header>

      {enrollingFace && (
        <FaceEnrollment 
          teacher={enrollingFace} 
          onComplete={() => {
            setEnrollingFace(null);
            fetchTeachers();
          }}
          onCancel={() => setEnrollingFace(null)}
        />
      )}

      {showForm && !enrollingFace && (
        <section className="card">
          <div className="card-header">
            <h3>{editingId ? '✏️ Edit Teacher' : '➕ Add New Teacher'}</h3>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Teacher's name"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="03001234567"
                />
              </div>

              <div className="form-group">
                <label>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g. Arabic Teacher, Qari"
                />
              </div>

              <div className="form-group">
                <label>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Monthly Salary (Rs)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="20000"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive" style={{ marginBottom: 0 }}>Active Member</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? '✏️ Update Teacher' : '✅ Add Teacher'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <h3>Teachers List</h3>
          {!showForm && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  name: '',
                  phone: '',
                  designation: '',
                  salary: 0,
                  isActive: true,
                  joiningDate: new Date().toISOString().split('T')[0]
                });
              }}
            >
              ➕ Add Teacher
            </button>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <SearchBox 
            value={searchTerm} 
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }} 
            placeholder="Search by name, designation, or phone..."
          />
        </div>

        <div className="table-container">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Joining Date</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.length > 0 ? (
                  paginatedTeachers.map(teacher => (
                    <tr key={teacher._id}>
                      <td style={{ fontWeight: '600' }}>{teacher.name}</td>
                      <td>{teacher.designation || '-'}</td>
                      <td>{teacher.phone || '-'}</td>
                      <td>{teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : '-'}</td>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        Rs. {teacher.salary?.toLocaleString() || '0'}
                      </td>
                      <td>
                        <span className={`badge badge-${teacher.isActive ? 'success' : 'danger'}`}>
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '0.4rem' }}
                            onClick={() => handleEdit(teacher)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ 
                              padding: '0.4rem', 
                              fontSize: '0.8rem',
                              background: (teacher.faceDescriptor && teacher.faceDescriptor.length > 50) ? '#28a745' : 'var(--primary)'
                            }}
                            onClick={() => setEnrollingFace(teacher)}
                          >
                            {(teacher.faceDescriptor && teacher.faceDescriptor.length > 50) ? '✅ Face' : '📸 Face'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No teachers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {filteredTeachers.length > itemsPerPage && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTeachers.length}
          />
        )}
      </section>
    </div>
  );
}
