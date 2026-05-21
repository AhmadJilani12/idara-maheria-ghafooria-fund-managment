'use client';

import { useState, useEffect } from 'react';
import Receipt from '@/components/Receipt';

export default function DonorAuditPage() {
  const [category, setCategory] = useState(null); // 'monthly' or 'onetime'
  const [donors, setDonors] = useState([]);
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);

  // Fetch donors when category changes
  useEffect(() => {
    if (!category) return;

    const fetchDonors = async () => {
      try {
        setLoadingDonors(true);
        const res = await fetch('/api/donors');
        const data = await res.json();
        
        if (res.ok) {
          // Filter based on selected category AND only active donors
          const filtered = data.filter(d => {
            const matchesCategory = category === 'monthly' ? d.type === 'monthly' : d.type !== 'monthly';
            return matchesCategory && d.isActive;
          });
          setDonors(filtered);
        }
      } catch (err) {
        console.error('Error fetching donors:', err);
      } finally {
        setLoadingDonors(false);
      }
    };

    fetchDonors();
    setAuditData(null);
    setSelectedDonorId('');
  }, [category]);

  const fetchAudit = async (donorId) => {
    if (!donorId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/donors/${donorId}/history`);
      const data = await res.json();
      if (res.ok) {
        setAuditData(data);
      }
    } catch (err) {
      console.error('Error fetching audit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDonorSelect = (e) => {
    const id = e.target.value;
    setSelectedDonorId(id);
    fetchAudit(id);
  };

  const resetSelection = () => {
    setCategory(null);
    setDonors([]);
    setSelectedDonorId('');
    setAuditData(null);
  };

  const handleViewReceipt = (record) => {
    setShowReceipt({
      receiptId: record.receiptId,
      donorName: record.donorName,
      amount: record.amount,
      month: record.month,
      type: record.type,
      date: new Date(record.date).toLocaleDateString(),
      madrasaName: "Idara Maheria Ghafooria"
    });
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <div>
          <h1>🔎 Donor Audit & History</h1>
          <p>Complete payment profile and lifetime contribution tracking</p>
        </div>
        {category && (
          <button className="btn btn-outline" onClick={resetSelection}>
            🔄 Change Category
          </button>
        )}
      </header>

      {!category ? (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div 
            className="card clickable-card" 
            onClick={() => setCategory('monthly')}
            style={{ textAlign: 'center', padding: '3rem', borderTop: '5px solid var(--primary)', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3>Monthly Donors</h3>
            <p style={{ color: 'var(--text-muted)' }}>Audit members with active monthly subscriptions</p>
          </div>

          <div 
            className="card clickable-card" 
            onClick={() => setCategory('onetime')}
            style={{ textAlign: 'center', padding: '3rem', borderTop: '5px solid var(--success)', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
            <h3>One-time / Others</h3>
            <p style={{ color: 'var(--text-muted)' }}>Audit occasional or single-contribution donors</p>
          </div>
        </section>
      ) : (
        <>
          <section className="card" style={{ marginBottom: '2rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Select Donor ({category.toUpperCase()})</label>
              <select 
                value={selectedDonorId} 
                onChange={handleDonorSelect}
                disabled={loadingDonors}
              >
                <option value="">-- Choose a donor to view history --</option>
                {donors.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.phone || 'No phone'})</option>
                ))}
              </select>
              {loadingDonors && <small>Loading donor list...</small>}
            </div>
          </section>

          {loading && <div className="spinner"></div>}

          {auditData && (
            <>
              {/* Summary Stats */}
              <div className="stats-grid">
                <div className="stat-card primary">
                  <span className="stat-label">Donor Name</span>
                  <span className="stat-value" style={{ fontSize: '1.5rem' }}>{auditData.donor.name}</span>
                  <span className="stat-sub">{auditData.donor.email || 'No Email'} | {auditData.donor.phone || 'No Phone'}</span>
                </div>
                <div className="stat-card success">
                  <span className="stat-label">Lifetime Total</span>
                  <span className="stat-value">Rs. {auditData.lifetimeTotal.toLocaleString()}</span>
                  <span className="stat-sub">Total amount contributed to date</span>
                </div>
                <div className="stat-card info">
                  <span className="stat-label">Total Transactions</span>
                  <span className="stat-value">{auditData.transactionCount}</span>
                  <span className="stat-sub">Successful payments recorded</span>
                </div>
              </div>

              {/* Detailed Table */}
              <section className="card">
                <div className="card-header">
                  <h3>Payment Timeline</h3>
                  <span className="badge badge-info">Latest first</span>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Period/Month</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Receipt ID</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditData.history.length > 0 ? (
                        auditData.history.map(record => (
                          <tr key={record._id}>
                            <td>{new Date(record.date).toLocaleDateString()}</td>
                            <td style={{ fontWeight: '600' }}>{record.month}</td>
                            <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                              Rs. {record.amount.toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge badge-${record.type === 'monthly' ? 'primary' : 'success'}`} style={{ fontSize: '0.7rem' }}>
                                {record.type.toUpperCase()}
                              </span>
                            </td>
                            <td><code style={{ fontSize: '0.85rem' }}>{record.receiptId}</code></td>
                            <td>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleViewReceipt(record)}
                              >
                                📄 Receipt
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No payment records found for this donor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}

      {showReceipt && (
        <Receipt 
          data={showReceipt} 
          onClose={() => setShowReceipt(null)} 
        />
      )}

      <style jsx>{`
        .clickable-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow);
          background: #fdfdfd;
        }
      `}</style>
    </div>
  );
}
