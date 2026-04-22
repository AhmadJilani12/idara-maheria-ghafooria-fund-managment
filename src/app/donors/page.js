'use client';

import { useState, useEffect } from 'react';
import { getDonors, addDonor, updateDonor, deleteDonor } from '@/lib/dataStore';
import { SearchBox, Pagination } from '@/components/SearchPagination';

export default function DonorsPage() {
  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'monthly',
    monthlyAmount: 0,
    status: 'active'
  });

  const itemsPerPage = 10;

  useEffect(() => {
    setDonors(getDonors());
  }, []);

  const filteredDonors = donors.filter(donor =>
    donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.phone?.includes(searchTerm)
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      updateDonor(editingId, formData);
      setEditingId(null);
    } else {
      addDonor(formData);
    }
    
    setDonors(getDonors());
    setCurrentPage(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'monthly',
      monthlyAmount: 0,
      status: 'active'
    });
    setShowForm(false);
  };

  const handleEdit = (donor) => {
    setFormData(donor);
    setEditingId(donor.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this donor?')) {
      deleteDonor(id);
      setDonors(getDonors());
    }
  };

  return (
    <main>
      <div className="page-header">
        <h1>☪️ Donor Management</h1>
        <p>Manage all donors and their contribution information</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Donors List</h3>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
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
            {showForm ? '✖️ Close Form' : '+ Add New Donor'}
          </button>
        </div>

        {showForm && (
          <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
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

              <div className="btn-group">
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
          </div>
        )}

        <SearchBox 
          value={searchTerm} 
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }} 
          placeholder="Search by name, email, or phone..."
        />

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDonors.length > 0 ? (
                paginatedDonors.map(donor => (
                  <tr key={donor.id}>
                    <td>#{donor.id}</td>
                    <td>{donor.name}</td>
                    <td>{donor.phone}</td>
                    <td>{donor.email || '-'}</td>
                    <td>
                      <span className="badge badge-info">
                        {donor.type === 'monthly' ? 'Monthly' : 'One-time'}
                      </span>
                    </td>
                    <td>
                      {donor.type === 'monthly'
                        ? `Rs. ${donor.monthlyAmount?.toLocaleString() || '0'}`
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge badge-${donor.status === 'active' ? 'success' : 'danger'}`}>
                        {donor.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" style={{ gap: '0.25rem' }}>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleEdit(donor)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDelete(donor.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#7f8c8d' }}>
                    No donors found - Add a new one
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredDonors.length > 0 && totalPages > 1 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
          />
        )}

        {filteredDonors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            {searchTerm ? 'No donors match your search' : 'No donors found - Add a new one'}
          </div>
        )}
      </div>
    </main>
  );
}
