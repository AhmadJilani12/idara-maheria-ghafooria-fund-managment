'use client';

import { useState, useEffect } from 'react';

import Receipt from '@/components/Receipt';

export default function PaymentsPage() {
  const [donors, setDonors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentCategory, setPaymentCategory] = useState(null); // 'monthly' or 'onetime'
  const [showReceipt, setShowReceipt] = useState(null);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  const [formData, setFormData] = useState({
    donorId: '',
    amount: '',
    type: 'monthly',
    month: currentMonth,
    year: currentYear.toString(),
    note: ''
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [
    (currentYear - 1).toString(),
    currentYear.toString(),
    (currentYear + 1).toString()
  ];

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [donorsRes, paymentsRes] = await Promise.all([
        fetch('/api/donors'),
        fetch('/api/payments')
      ]);
      
      const donorsData = await donorsRes.json();
      const paymentsData = await paymentsRes.json();
      
      setDonors(Array.isArray(donorsData) ? donorsData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleStartRecording = (category) => {
    setPaymentCategory(category);
    setFormData({
      donorId: '',
      amount: '',
      type: category === 'monthly' ? 'monthly' : 'extra',
      month: currentMonth,
      year: currentYear.toString(),
      note: ''
    });
  };

  const handleCancel = () => {
    setPaymentCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'donorId' && value) {
      const selectedDonor = donors.find(d => d._id === value);
      if (selectedDonor) {
        setFormData(prev => ({
          ...prev,
          donorId: value,
          amount: selectedDonor.monthlyAmount || prev.amount
        }));
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.donorId || !formData.amount) {
      alert('Please fill all required fields');
      return;
    }

    const payload = {
      ...formData,
      month: `${formData.month} ${formData.year}`
    };

    try {
      setSubmitting(true);
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        await fetchInitialData();
        setPaymentCategory(null);
        
        // Show the receipt immediately
        handleShowReceipt(result);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to record payment'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDonors = donors.filter(donor => {
    // Only show active donors
    if (!donor.isActive) return false;
    
    if (paymentCategory === 'monthly') return donor.type === 'monthly';
    return true; // Show all active for one-time/extra
  });

  const handleShowReceipt = (payment) => {
    setShowReceipt({
      receiptId: payment.receiptId,
      donorName: payment.donorName,
      amount: payment.amount,
      month: payment.month,
      date: new Date(payment.date).toLocaleDateString(),
      madrasaName: "Idara Maheria Ghafooria"
    });
  };

  if (loading) {
    return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  }

  return (
    <div className="container-fluid">
      <header className="page-header">
        <div>
          <h1>💰 Record Payment</h1>
          <p>Manage and record donor contributions for Idara Maheria Ghafooria</p>
        </div>
      </header>

      {!paymentCategory ? (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div 
            className="card clickable-card" 
            onClick={() => handleStartRecording('monthly')}
            style={{ 
              textAlign: 'center', 
              padding: '2.5rem', 
              borderTop: '5px solid var(--primary)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h2 style={{ color: 'var(--primary)' }}>Monthly Donation</h2>
            <p style={{ color: 'var(--text-muted)' }}>Record regular monthly subscription for registered donors</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Select Monthly</button>
          </div>

          <div 
            className="card clickable-card" 
            onClick={() => handleStartRecording('onetime')}
            style={{ 
              textAlign: 'center', 
              padding: '2.5rem', 
              borderTop: '5px solid var(--success)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
            <h2 style={{ color: 'var(--success)' }}>One-time / Extra</h2>
            <p style={{ color: 'var(--text-muted)' }}>Record extra donations, guest contributions, or one-time gifts</p>
            <button className="btn btn-success" style={{ marginTop: '1.5rem', width: '100%' }}>Select One-time</button>
          </div>
        </section>
      ) : (
        <section className="card" style={{ 
          borderLeft: `5px solid ${paymentCategory === 'monthly' ? 'var(--primary)' : 'var(--success)'}`,
          marginBottom: '2rem'
        }}>
          <div className="card-header">
            <h3>Recording {paymentCategory === 'monthly' ? 'Monthly' : 'One-time'} Payment</h3>
            <button className="btn btn-outline" onClick={handleCancel}>✕ Close</button>
          </div>
          
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
                  {filteredDonors.map(donor => (
                    <option key={donor._id} value={donor._id}>
                      {donor.name} ({donor.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>

              {paymentCategory === 'onetime' && (
                <div className="form-group">
                  <label>Payment Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="extra">Extra Donation</option>
                    <option value="guest">Guest Donation</option>
                    <option value="internal">Internal Collection</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Amount (Rs) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter amount"
                />
              </div>

              <div className="form-group">
                <label>Payment Period (Month/Year) *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    style={{ flex: 2 }}
                    required
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                    required
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Additional Notes</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Details about this contribution..."
                rows="2"
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                className={`btn ${paymentCategory === 'monthly' ? 'btn-primary' : 'btn-success'}`} 
                disabled={submitting}
              >
                {submitting ? 'Recording...' : `✅ Save ${paymentCategory === 'monthly' ? 'Monthly' : 'One-time'} Payment`}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <h3>Recent Transactions</h3>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Period</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map(payment => (
                  <tr key={payment._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{payment.donorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{payment.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${payment.type === 'monthly' ? 'primary' : 'success'}`} style={{ fontSize: '0.7rem' }}>
                        {payment.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      Rs. {payment.amount.toLocaleString()}
                    </td>
                    <td>{payment.month}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.4rem' }}
                        onClick={() => handleShowReceipt(payment)}
                      >
                        📄
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No payment records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showReceipt && (
        <Receipt 
          data={showReceipt} 
          onClose={() => setShowReceipt(null)} 
        />
      )}

      <style jsx>{`
        .clickable-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
