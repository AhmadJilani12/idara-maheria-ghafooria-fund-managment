'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const result = await res.json();
      if (res.ok) {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  }

  const { counts, currentMonth, lifetimeTotal, recentPayments } = data || { 
    counts: { totalDonors: 0, monthlyDonors: 0 }, 
    currentMonth: { total: 0, count: 0 }, 
    lifetimeTotal: 0,
    recentPayments: []
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <div>
          <h1>🕌 Dashboard Overview</h1>
          <p>Idara Maheria Ghafooria - Real-time Donation & Donor Analytics</p>
        </div>
        <button className="btn btn-outline" onClick={fetchDashboardData} disabled={loading}>
          {loading ? '...' : '🔄 Refresh Stats'}
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card primary">
          <span className="stat-label">☪️ Total Active Donors</span>
          <span className="stat-value">{counts.totalDonors}</span>
          <span className="stat-sub">Overall Members</span>
        </div>
        
        <div className="stat-card primary">
          <span className="stat-label">📅 Monthly Subscribers</span>
          <span className="stat-value">{counts.monthlyDonors}</span>
          <span className="stat-sub">Regular Contributors</span>
        </div>
        
        <div className="stat-card success">
          <span className="stat-label">✅ Total Collected ({currentMonth.label})</span>
          <span className="stat-value">Rs. {currentMonth.total.toLocaleString()}</span>
          <span className="stat-sub">{currentMonth.count} Total Payments in {currentMonth.label}</span>
        </div>
        
        <div className="stat-card success" style={{ background: 'var(--primary-dark)', color: 'white' }}>
          <span className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>💰 Lifetime Collection</span>
          <span className="stat-value" style={{ color: 'white' }}>Rs. {lifetimeTotal.toLocaleString()}</span>
          <span className="stat-sub" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Fund to Date</span>
        </div>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-header">
            <h3>Quick Management</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Link href="/donors" className="btn btn-primary" style={{ padding: '1rem' }}>
              ✏️ Manage Donors
            </Link>
            <Link href="/payments" className="btn btn-secondary" style={{ padding: '1rem' }}>
              💳 Record Payment
            </Link>
            <Link href="/monthly-tracking" className="btn btn-outline" style={{ padding: '1rem' }}>
              📅 Monthly Tracking
            </Link>
            <Link href="/donors/audit" className="btn btn-outline" style={{ padding: '1rem' }}>
              🔎 Donor History
            </Link>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h3>Recent Transactions</h3>
          </div>
          <div className="table-container" style={{ border: 'none' }}>
            <table style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length > 0 ? (
                  recentPayments.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: '600' }}>{p.donorName}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: '700' }}>Rs. {p.amount.toLocaleString()}</td>
                      <td><span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{p.type.toUpperCase()}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>No recent records</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Link href="/monthly-tracking/history" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
            View Full Transaction History →
          </Link>
        </section>
      </div>
    </div>
  );
}

