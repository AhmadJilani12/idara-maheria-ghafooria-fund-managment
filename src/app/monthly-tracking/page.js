'use client';

import { useState, useEffect } from 'react';
import { getMonthlySchedule, getDonors } from '@/lib/dataStore';

export default function MonthlyTrackingPage() {
  const [monthlySchedule, setMonthlySchedule] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  useEffect(() => {
    setMonthlySchedule(getMonthlySchedule());
  }, []);

  const currentMonthData = monthlySchedule.find(s => s.month === selectedMonth);

  const calculateStats = (donors) => {
    const total = donors?.length || 0;
    const paid = donors?.filter(d => d.status === 'paid').length || 0;
    const pending = total - paid;
    const totalExpected = donors?.reduce((sum, d) => sum + d.expectedAmount, 0) || 0;
    const totalPaid = donors?.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.expectedAmount, 0) || 0;

    return { total, paid, pending, totalExpected, totalPaid };
  };

  const stats = currentMonthData ? calculateStats(currentMonthData.donors) : {};

  return (
    <main>
      <div className="page-header">
        <h1>📅 Monthly Tracking</h1>
        <p>Track which donors have paid this month for Idara</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Select Month</h3>
        </div>
        <div className="form-group">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            {monthlySchedule.map(schedule => (
              <option key={schedule.month} value={schedule.month}>
                {schedule.month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentMonthData && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-card-label">Total Donors</div>
              <div className="stat-card-value">{stats.total}</div>
              <small>Monthly Donors</small>
            </div>

            <div className="stat-card success">
              <div className="stat-card-label">Paid</div>
              <div className="stat-card-value">{stats.paid}</div>
              <small>Payments Received</small>
            </div>

            <div className="stat-card warning">
              <div className="stat-card-label">Pending</div>
              <div className="stat-card-value">{stats.pending}</div>
              <small>Awaiting Payment</small>
            </div>

            <div className="stat-card primary">
              <div className="stat-card-label">Expected Amount</div>
              <div className="stat-card-value">Rs. {stats.totalExpected?.toLocaleString()}</div>
              <small>Target Collection</small>
            </div>

            <div className="stat-card success">
              <div className="stat-card-label">Collected</div>
              <div className="stat-card-value">Rs. {stats.totalPaid?.toLocaleString()}</div>
              <small>Amount Received</small>
            </div>

            <div className="stat-card warning">
              <div className="stat-card-label">Remaining</div>
              <div className="stat-card-value">Rs. {(stats.totalExpected - stats.totalPaid)?.toLocaleString()}</div>
              <small>Outstanding</small>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>{selectedMonth} - Details</h3>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Expected Amount</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthData.donors && currentMonthData.donors.length > 0 ? (
                    currentMonthData.donors.map((donor, index) => (
                      <tr key={index}>
                        <td>{donor.donorName}</td>
                        <td>Rs. {donor.expectedAmount?.toLocaleString()}</td>
                        <td>
                          <span className={`badge badge-${donor.status === 'paid' ? 'success' : 'pending'}`}>
                            {donor.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>{donor.paidDate || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#7f8c8d' }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
