'use client';

import { useState, useEffect } from 'react';
import { SearchBox, Pagination } from '@/components/SearchPagination';

export default function DonorsPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'monthly',
    monthlyAmount: 0,
    status: 'active'
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/donors');
      const data = await response.json();
      if (Array.isArray(data)) {
        setDonors(data);
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = donors.filter(donor =>
    donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.phone?.includes(searchTerm) ||
    donor.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDonors = filteredDonors.slice(startIndex, startIndex + itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'monthlyAmount' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/donors/${editingId}` : '/api/donors';
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
          email: '',
          phone: '',
          address: '',
          type: 'monthly',
          monthlyAmount: 0,
          status: 'active'
        });
        setShowForm(false);
        fetchDonors();
        setCurrentPage(1);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || errorData.error || 'Failed to save donor'}`);
      }
    } catch (error) {
      console.error("Error saving donor:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleEdit = (donor) => {
    setFormData({
      name: donor.name,
      email: donor.email || '',
      phone: donor.phone || '',
      address: donor.address || '',
      type: donor.type,
      monthlyAmount: donor.monthlyAmount,
      status: donor.isActive ? 'active' : 'inactive'
    });
    setEditingId(donor._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this donor?')) {
      try {
        const response = await fetch(`/api/donors/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchDonors();
        } else {
          alert("Failed to delete donor");
        }
      } catch (error) {
        console.error("Error deleting donor:", error);
      }
    }
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <h1>☪️ Donor Management</h1>
        <p>Manage all donors and their contribution information</p>
      </header>

      {showForm && (
        <section className="card">
          <div className="card-header">
            <h3>{editingId ? '✏️ Edit Donor' : '➕ Add New Donor'}</h3>
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
                  placeholder="Donor's name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="03001234567"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, City, Area..."
                />
              </div>

              {!editingId && (
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="onetime">One-time</option>
                  </select>
                </div>
              )}

              {formData.type === 'monthly' && (
                <div className="form-group">
                  <label>Monthly Amount (Rs) *</label>
                  <input
                    type="number"
                    name="monthlyAmount"
                    value={formData.monthlyAmount}
                    onChange={handleInputChange}
                    required
                    placeholder="5000"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? '✏️ Update Donor' : '✅ Add Donor'}
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
          <h3>Donors List</h3>
          {!showForm && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  type: 'monthly',
                  monthlyAmount: 0,
                  status: 'active'
                });
              }}
            >
              ➕ Add Donor
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
            placeholder="Search by name, email, or phone..."
          />
        </div>

        <div className="table-container">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDonors.length > 0 ? (
                  paginatedDonors.map(donor => (
                    <tr key={donor._id}>
                      <td><span className="badge badge-info">#{donor._id.substring(donor._id.length - 4)}</span></td>
                      <td style={{ fontWeight: '600' }}>{donor.name}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{donor.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{donor.email}</div>
                        {donor.address && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                            📍 {donor.address}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {donor.type === 'monthly' ? 'Monthly' : 'One-time'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {donor.type === 'monthly'
                          ? `Rs. ${donor.monthlyAmount?.toLocaleString() || '0'}`
                          : '-'}
                      </td>
                      <td>
                        <span className={`badge badge-${donor.isActive ? 'success' : 'danger'}`}>
                          {donor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '0.4rem' }}
                            onClick={() => handleEdit(donor)}
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No donors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {filteredDonors.length > itemsPerPage && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredDonors.length}
          />
        )}
      </section>
    </div>
  );
}

