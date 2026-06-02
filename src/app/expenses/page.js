'use client';

import { useState, useEffect } from 'react';
import { SearchBox, Pagination } from '@/components/SearchPagination';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    'Utilities (Electricity, Water)',
    'Salaries',
    'Maintenance',
    'Stationery',
    'Food/Kitchen',
    'Events',
    'Furniture',
    'Construction',
    'Other'
  ];

  const itemsPerPage = 10;

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      if (Array.isArray(data)) {
        setExpenses(data);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          category: '',
          amount: '',
          description: '',
          paymentMethod: 'Cash',
          date: new Date().toISOString().split('T')[0]
        });
        setShowForm(false);
        fetchExpenses();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || errorData.error || 'Failed to save expense'}`);
      }
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <h1>📉 Expense Management</h1>
        <p>Record and track all institutional expenses</p>
      </header>

      {showForm && (
        <section className="card">
          <div className="card-header">
            <h3>➕ Record New Expense</h3>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Amount (Rs) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 5000"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Details about the expense..."
                  rows="3"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                ></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">✅ Record Expense</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <h3>Expense History</h3>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ Add Expense</button>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <SearchBox 
            value={searchTerm} 
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }} 
            placeholder="Search by category or description..."
          />
        </div>

        <div className="table-container">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map(expense => (
                    <tr key={expense._id}>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td style={{ fontWeight: '600' }}>{expense.category}</td>
                      <td style={{ fontWeight: '600', color: '#ff4d4d' }}>
                        Rs. {expense.amount?.toLocaleString()}
                      </td>
                      <td><span className="badge badge-info">{expense.paymentMethod}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{expense.description || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No expenses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {filteredExpenses.length > itemsPerPage && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredExpenses.length}
          />
        )}
      </section>

      <section className="card" style={{ marginTop: '2rem', background: 'var(--primary)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Total Expenses</h3>
          <h2 style={{ margin: 0 }}>
            Rs. {expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toLocaleString()}
          </h2>
        </div>
      </section>
    </div>
  );
}
