'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="page-header">
        <h1>🕌 Idara Maheria Ghafooria</h1>
        <p>Islamic Charity & Fund Management System</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 style={{ margin: 0 }}>👋 Getting Started</h2>
        </div>
        <p>This system helps you manage:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1.5rem' }}>
          <li>Monthly donor subscriptions & tracking</li>
          <li>One-time charitable donations</li>
          <li>Donor information management</li>
          <li>Monthly payment status monitoring</li>
          <li>Detailed reports and payment history</li>
          <li>Automatic receipt generation</li>
          <li>Cash & digital payment management</li>
        </ul>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>🚀 Quick Start</h3>
          </div>
          <p>Add donors and start tracking payments through the system.</p>
          <Link href="/donors" className="btn btn-primary" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
            Manage Donors
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📊 Dashboard</h3>
          </div>
          <p>View summary statistics and important metrics at a glance.</p>
          <Link href="/dashboard" className="btn btn-primary" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
            View Dashboard
          </Link>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3>👥 Donor Management</h3>
          </div>
          <p>Add, edit, or remove donors and manage their information.</p>
          <Link href="/donors" className="btn btn-secondary" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
            Go to Donors
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📅 Monthly Tracking</h3>
          </div>
          <p>See which donors have paid in each month.</p>
          <Link href="/monthly-tracking" className="btn btn-secondary" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
            View Tracking
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>💳 Record Payments</h3>
          </div>
          <p>Record cash payments and generate receipts.</p>
          <Link href="/payments" className="btn btn-secondary" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
            Record Payment
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📊 Reports</h3>
          </div>
          <p>View detailed history and analytical reports.</p>
          <Link href="/reports" className="btn btn-secondary" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
            View Reports
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>⚙️ Features</h3>
          </div>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: 0 }}>
            <li>Monthly subscriptions</li>
            <li>One-time donations</li>
            <li>Auto receipts</li>
            <li>Monthly tracking</li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>📱 Responsive Design</h3>
          </div>
          <p>Works perfectly on mobile, tablet, and desktop devices.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d', marginBottom: 0 }}>
            Full support for all screen sizes
          </p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginTop: '2rem' }}>
        <strong>ℹ️ Note:</strong> This system uses cash payment model where admins manually record donations and generate receipts for donors.
      </div>
    </main>
  );
}
