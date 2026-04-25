'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardStats, getPayments, getDonors } from '@/lib/dataStore';
import { SearchBox, Pagination } from '@/components/SearchPagination';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [allPayments, setAllPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  useEffect(() => {
    const dashboardStats = getDashboardStats();
    setStats(dashboardStats);
    
    const payments = getPayments();
    setAllPayments(payments.slice().reverse());
  }, []);

  const filteredPayments = allPayments.filter(payment =>
    payment.donorId?.toString().includes(searchTerm) ||
    payment.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.date?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  if (!stats) {
    return <div className="spinner"></div>;
  }

  return (
    <main>
      <div className="page-header">
        <h1>🕌 Dashboard</h1>
        <p>Idara Maheria Ghafooria - Fund Management & Charity Tracking</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-label">☪️ Total Donors</div>
          <div className="stat-card-value">{stats.totalDonors}</div>
          <small>Active Contributors</small>
        </div>
        
        <div className="stat-card primary">
          <div className="stat-card-label">🕌 Monthly Donors</div>
          <div className="stat-card-value">{stats.monthlyDonors}</div>
          <small>Regular Contributors</small>
        </div>
        
        <div className="stat-card success">
          <div className="stat-card-label">💰 Monthly Target</div>
          <div className="stat-card-value">Rs. {stats.totalMonthlyAmount.toLocaleString()}</div>
          <small>Expected Monthly</small>
        </div>
        
        <div className="stat-card success">
          <div className="stat-card-label">✅ Total Collected</div>
          <div className="stat-card-value">Rs. {stats.totalCollected.toLocaleString()}</div>
          <small>Amount Received</small>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-card-label">⏳ Pending Donations</div>
          <div className="stat-card-value">{stats.pendingPayments}</div>
          <small>Awaiting Confirmation</small>
        </div>
        
        <div className="stat-card success">
          <div className="stat-card-label">Confirmed Payments</div>
          <div className="stat-card-value">{stats.paidPayments}</div>
          <small>Completed</small>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="btn-group" style={{ flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/donors" className="btn btn-secondary" style={{ width: '100%' }}>
              ✏️ Manage Donors
            </Link>
            <Link href="/monthly-tracking" className="btn btn-secondary" style={{ width: '100%' }}>
              📅 Monthly Tracking
            </Link>
            <Link href="/payments" className="btn btn-secondary" style={{ width: '100%' }}>
              💳 Record Payment
            </Link>
            <Link href="/reports" className="btn btn-secondary" style={{ width: '100%' }}>
              📈 View Reports
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>System Info</h3>
          </div>
          <div className="alert alert-info" style={{ margin: 0 }}>
            <strong>ℹ️ Note:</strong> This system tracks both monthly and one-time donations. Admins manually record cash payments and mark them as paid.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3>Recent Payments</h3>
          <Link href="/reports" className="btn btn-small btn-outline">
            View All
          </Link>
        </div>

        <SearchBox 
          value={searchTerm} 
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }} 
          placeholder="Search by donor ID, month, or date..."
        />
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor ID</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Date</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map(payment => (
                  <tr key={payment.id}>
                    <td>#{payment.donorId}</td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#7f8c8d' }}>
                    No payments recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredPayments.length > 0 && totalPages > 1 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredPayments.length}
          />
        )}

        {filteredPayments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#7f8c8d' }}>
            {searchTerm ? 'No payments match your search' : 'No payments recorded'}
          </div>
        )}
      </div>
    </main>
  );
}
