'use client';

import { useState, useEffect } from 'react';
import { getPayments, getDonors, getDashboardStats } from '@/lib/dataStore';

export default function ReportsPage() {
  const [payments, setPayments] = useState([]);
  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterDonor, setFilterDonor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    setPayments(getPayments());
    setDonors(getDonors());
    setStats(getDashboardStats());
  }, []);

  const filteredPayments = payments.filter(p => {
    if (filterDonor && p.donorId !== parseInt(filterDonor)) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const confirmedAmount = filteredPayments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main>
      <div className="page-header">
        <h1>📊 Reports & History</h1>
        <p>View payment history and donor analytics for Idara</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-card-label">کل رقم وصول</div>
            <div className="stat-card-value">Rs. {stats.totalCollected.toLocaleString()}</div>
            <small style={{ color: '#7f8c8d' }}>Total Collected</small>
          </div>

          <div className="stat-card success">
            <div className="stat-card-label">تصدیق شدہ</div>
            <div className="stat-card-value">{stats.confirmedPayments}</div>
            <small style={{ color: '#7f8c8d' }}>Confirmed</small>
          </div>

          <div className="stat-card warning">
            <div className="stat-card-label">زیر التوا</div>
            <div className="stat-card-value">{stats.pendingPayments}</div>
            <small style={{ color: '#7f8c8d' }}>Pending</small>
          </div>

          <div className="stat-card primary">
            <div className="stat-card-label">کل ڈونرز</div>
            <div className="stat-card-value">{stats.totalDonors}</div>
            <small style={{ color: '#7f8c8d' }}>Total Donors</small>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>فلٹر تفصیلات</h3>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>ڈونر کے ذریعے تلاش کریں</label>
            <select
              value={filterDonor}
              onChange={(e) => setFilterDonor(e.target.value)}
            >
              <option value="">-- تمام ڈونرز --</option>
              {donors.map(donor => (
                <option key={donor.id} value={donor.id}>
                  {donor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>حالت کے ذریعے تلاش کریں</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">-- تمام --</option>
              <option value="confirmed">✅ تصدیق شدہ</option>
              <option value="pending">⏳ زیر التوا</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>ادائیگی کی تاریخ</h3>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            کل: Rs. {totalAmount.toLocaleString()} | تصدیق شدہ: Rs. {confirmedAmount.toLocaleString()}
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>ڈونر</th>
                <th>رقم</th>
                <th>ماہ</th>
                <th>تاریخ</th>
                <th>حالت</th>
                <th>رسید</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(payment => {
                  const donor = donors.find(d => d.id === payment.donorId);
                  return (
                    <tr key={payment.id}>
                      <td>#{payment.id}</td>
                      <td>{donor?.name || 'نہیں ملا'}</td>
                      <td>Rs. {payment.amount.toLocaleString()}</td>
                      <td>{payment.month}</td>
                      <td>{payment.date}</td>
                      <td>
                        <span className={`badge badge-${payment.status === 'confirmed' ? 'success' : 'pending'}`}>
                          {payment.status === 'confirmed' ? '✅ تصدیق شدہ' : '⏳ زیر التوا'}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#7f8c8d' }}>
                    کوئی نتیجہ نہیں ملا
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>📈 ڈونر سمری</h3>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ڈونر نام</th>
                <th>کل رقم</th>
                <th>ادائیگیاں</th>
                <th>اوسط</th>
              </tr>
            </thead>
            <tbody>
              {donors.length > 0 ? (
                donors.map(donor => {
                  const donorPayments = payments.filter(p => p.donorId === donor.id);
                  const total = donorPayments.reduce((sum, p) => sum + p.amount, 0);
                  const avg = donorPayments.length > 0 ? Math.round(total / donorPayments.length) : 0;
                  
                  return (
                    <tr key={donor.id}>
                      <td>{donor.name}</td>
                      <td>Rs. {total.toLocaleString()}</td>
                      <td>{donorPayments.length}</td>
                      <td>Rs. {avg.toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#7f8c8d' }}>
                    کوئی ڈونر نہیں
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
