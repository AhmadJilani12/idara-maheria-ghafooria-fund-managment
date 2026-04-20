'use client';

import { useState, useEffect } from 'react';
import { getDonors, addPayment, revertPayment, getPayments, generateReceipt } from '@/lib/dataStore';
import Link from 'next/link';

export default function PaymentsPage() {
  const [donors, setDonors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);
  const [formData, setFormData] = useState({
    donorId: '',
    amount: '',
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    notes: ''
  });

  const months = [
    "January 2026", "February 2026", "March 2026", "April 2026",
    "May 2026", "June 2026", "July 2026", "August 2026",
    "September 2026", "October 2026", "November 2026", "December 2026"
  ];

  useEffect(() => {
    setDonors(getDonors());
    setPayments(getPayments());
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseInt(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newPayment = addPayment({
      donorId: parseInt(formData.donorId),
      amount: formData.amount,
      month: formData.month,
      notes: formData.notes
    });

    setPayments(getPayments());
    setFormData({
      donorId: '',
      amount: '',
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      notes: ''
    });
    setShowForm(false);
  };

  const handleRevert = (paymentId) => {
    if (confirm('Are you sure you want to mark this as pending?')) {
      revertPayment(paymentId);
      setPayments(getPayments());
    }
  };

  const handleShowReceipt = (paymentId) => {
    const receipt = generateReceipt(paymentId);
    setShowReceipt(receipt);
  };

  const getDonorName = (id) => {
    const donor = donors.find(d => d.id === id);
    return donor ? donor.name : 'Unknown';
  };

  return (
    <main>
      <div className="page-header">
        <h1>💰 Record Payment</h1>
        <p>Record cash donations received from donors for Idara Maheria Ghafooria</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Record New Payment</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Close' : '➕ New Payment'}
          </button>
        </div>

        {showForm && (
          <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Select Donor *</label>
                  <select
                    name="donorId"
                    value={formData.donorId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Choose Donor --</option>
                    {donors.map(donor => (
                      <option key={donor.id} value={donor.id}>
                        {donor.name} (ID: {donor.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Month *</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  >
                    {months.map(month => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
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
                    placeholder="5000"
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Payment notes (optional)"
                  />
                </div>
              </div>

              <div className="btn-group">
                <button type="submit" className="btn btn-primary">
                  ✅ Record Payment
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Payments</h3>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Date</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{getDonorName(payment.donorId)}</td>
                    <td>Rs. {payment.amount.toLocaleString()}</td>
                    <td>{payment.month}</td>
                    <td>{payment.date}</td>
                    <td>
                      <span className={`badge badge-${payment.status === 'paid' ? 'success' : 'pending'}`}>
                        {payment.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      {payment.receiptId ? (
                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                          {payment.receiptId}
                        </span>
                      ) : (
                        <span style={{ color: '#7f8c8d' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group" style={{ gap: '0.25rem' }}>
                        {payment.status === 'paid' && (
                          <>
                            <button
                              className="btn btn-small btn-secondary"
                              onClick={() => handleShowReceipt(payment.id)}
                              title="View Receipt"
                            >
                              📄
                            </button>
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleRevert(payment.id)}
                              title="Mark as Pending"
                            >
                              ↩️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#7f8c8d' }}>
                    No payments recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showReceipt && (
        <div className="modal open">
          <div className="modal-content">
            <span
              className="close-btn"
              onClick={() => setShowReceipt(null)}
              style={{ cursor: 'pointer' }}
            >
              ✕
            </span>
            <h2 style={{ marginBottom: '1rem', marginTop: 0 }}>📄 Payment Receipt</h2>
            
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
              <p><strong>Receipt ID:</strong> {showReceipt.receiptId}</p>
              <p><strong>Donor Name:</strong> {showReceipt.donorName}</p>
              <p><strong>Phone:</strong> {showReceipt.donorPhone}</p>
              <p><strong>Amount:</strong> Rs. {showReceipt.amount.toLocaleString()}</p>
              <p><strong>Month:</strong> {showReceipt.month}</p>
              <p><strong>Date:</strong> {showReceipt.date}</p>
              <p><strong>Organization:</strong> {showReceipt.madrasaName}</p>
              <p><strong>Payment Method:</strong> {showReceipt.paymentMethod}</p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.1rem' }}>
                ✅ Payment Confirmed
              </p>
            </div>

            <div className="btn-group" style={{ justifyContent: 'center' }}>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setShowReceipt(null)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
