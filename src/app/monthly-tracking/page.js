'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function MonthlyTrackingPage() {
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tracking/monthly?month=${currentMonthName}&year=${currentYear}`);
      const result = await res.json();
      if (res.ok) {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonthName, currentYear]);

  useEffect(() => {
    fetchTrackingData();
  }, [fetchTrackingData]);

  if (loading && !data) {
    return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  }

  const { stats, paidList, pendingList } = data || { stats: {}, paidList: [], pendingList: [] };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <div>
          <h1>📅 Monthly Tracking - {currentMonthName} {currentYear}</h1>
          <p>Current month status of monthly donor subscriptions</p>
        </div>
        <Link href="/monthly-tracking/history" className="btn btn-outline">
          📜 View Payment History
        </Link>
      </header>

      {/* Stats Section */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card primary">
          <span className="stat-label">Expected Donors</span>
          <span className="stat-value">{stats.paidCount + pendingList.length}</span>
          <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${(stats.paidCount / ((stats.paidCount + pendingList.length) || 1)) * 100}%`, background: 'white' }}
            ></div>
          </div>
        </div>

        <div className="stat-card success">
          <span className="stat-label">Paid</span>
          <span className="stat-value">{stats.paidCount}</span>
          <span className="stat-sub">Payments Received</span>
        </div>

        <div className="stat-card warning">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{pendingList.length}</span>
          <span className="stat-sub">Active Donors Remaining</span>
        </div>

        <div className="stat-card success">
          <span className="stat-label">Collected</span>
          <span className="stat-value">Rs. {stats.totalCollected?.toLocaleString()}</span>
          <span className="stat-sub">Total for {currentMonthName}</span>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Pending List */}
        <section className="card" style={{ borderTop: '4px solid var(--warning)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⏳</span>
              <div>
                <h3 style={{ margin: 0 }}>Pending Payments</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Donors who haven't paid for {currentMonthName}</p>
              </div>
            </div>
            <span className="badge badge-warning">{pendingList.length}</span>
          </div>
          
          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table className="compact-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.length > 0 ? (
                  pendingList.map(donor => (
                    <tr key={donor._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{donor.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{donor.phone || 'No phone'}</div>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--warning)' }}>
                        Rs. {donor.monthlyAmount?.toLocaleString()}
                      </td>
                      <td>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => window.location.href='/payments'}
                        >
                          💸 Pay
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--success)', fontWeight: '600' }}>
                      🎉 All monthly donors have paid!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Paid List */}
        <section className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <h3 style={{ margin: 0 }}>Recently Paid</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly subscriptions received for {currentMonthName}</p>
              </div>
            </div>
            <span className="badge badge-success">{paidList.filter(p => p.type === 'monthly').length}</span>
          </div>

          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table className="compact-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Received</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paidList.filter(p => p.type === 'monthly').length > 0 ? (
                  paidList.filter(p => p.type === 'monthly').map(donor => (
                    <tr key={donor._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{donor.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {donor.receiptId}</div>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--success)' }}>
                        Rs. {donor.amountPaid?.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(donor.paidDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No payments received for this month yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style jsx>{`
        .compact-table th {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.5rem;
        }
        .compact-table td {
          padding: 0.75rem 0.5rem;
          font-size: 0.9rem;
        }
        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}

