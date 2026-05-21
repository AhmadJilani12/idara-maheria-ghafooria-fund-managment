'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Receipt from '@/components/Receipt';

function HistoryContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'others' ? 'others' : 'all';

  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState(initialFilter); 
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (initialFilter === 'others') {
      setTypeFilter('others');
    }
  }, [initialFilter]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [
    (currentYear - 1).toString(),
    currentYear.toString(),
    (currentYear + 1).toString()
  ];

  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tracking/monthly?month=${selectedMonth}&year=${selectedYear}`);
      const result = await res.json();
      if (res.ok) {
        setData(result);
        setCurrentPage(1); // Reset to first page on filter change
      }
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Filter logic based on typeFilter
  const allPaidItems = data?.paidList || [];
  const filteredPaidItems = allPaidItems.filter(item => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'monthly') return item.type === 'monthly';
    return item.type !== 'monthly'; // 'others' category
  });

  const stats = data?.stats || {};
  
  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPaidItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPaidItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShowReceipt = (item) => {
    setShowReceipt({
      receiptId: item.receiptId,
      donorName: item.name,
      amount: item.amountPaid,
      month: `${selectedMonth} ${selectedYear}`,
      type: item.type,
      date: new Date(item.paidDate).toLocaleDateString(),
      madrasaName: "Idara Maheria Ghafooria"
    });
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <div>
          <h1>📜 Payment History</h1>
          <p>Audit and verify completed subscriptions and extra donations</p>
        </div>
        <Link href="/monthly-tracking" className="btn btn-outline">
          🔙 Back to Tracking
        </Link>
      </header>

      {/* Stats Summary Section */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card primary">
          <span className="stat-label">Monthly Donors</span>
          <span className="stat-value">{stats.totalDonors || 0}</span>
          <span className="stat-sub">Active in {selectedMonth}</span>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Total Records</span>
          <span className="stat-value">{filteredPaidItems.length}</span>
          <span className="stat-sub">{typeFilter.toUpperCase()} Transactions</span>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Total Amount</span>
          <span className="stat-value">Rs. {filteredPaidItems.reduce((sum, item) => sum + item.amountPaid, 0).toLocaleString()}</span>
          <span className="stat-sub">Sum for selected period</span>
        </div>
      </div>

      {/* Filter Section */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3>Filter History</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Donation Type</label>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Donations</option>
              <option value="monthly">Monthly Subscription Only</option>
              <option value="others">Extra & One-time Only</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={fetchHistoryData}
            disabled={loading}
          >
            {loading ? '...' : '🔍 Search'}
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>{typeFilter === 'all' ? 'All' : typeFilter === 'monthly' ? 'Monthly' : 'Extra'} Records - {selectedMonth} {selectedYear}</h3>
          <span className="badge badge-info">{filteredPaidItems.length} Records</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Amount Paid</th>
                <th>Type</th>
                <th>Receipt ID</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Loading records...</td></tr>
              ) : currentItems.length > 0 ? (
                currentItems.map(item => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: '600' }}>{item.name}</td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      Rs. {item.amountPaid?.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${item.type === 'monthly' ? 'primary' : 'success'}`} style={{ fontSize: '0.65rem' }}>
                        {(item.type || 'N/A').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={{ background: 'transparent', padding: 0, fontSize: '0.85rem', color: 'inherit' }}>
                          {item.receiptId}
                        </code>
                        <button 
                          onClick={() => handleCopyId(item.receiptId)}
                          style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', 
                            fontSize: '1rem', padding: '0.25rem', borderRadius: '4px'
                          }}
                          title="Copy ID"
                        >
                          {copiedId === item.receiptId ? '✅' : '📋'}
                        </button>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(item.paidDate).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => handleShowReceipt(item)}
                      >
                        📄 View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📂</div>
                    No records found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline'}`}
                style={{ minWidth: '40px' }}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button 
              className="btn btn-outline" 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {showReceipt && (
        <Receipt 
          data={showReceipt} 
          onClose={() => setShowReceipt(null)} 
        />
      )}

      <style jsx>{`
      `}</style>
    </div>
  );
}

export default function MonthlyHistoryPage() {
  return (
    <Suspense fallback={<div className="spinner"></div>}>
      <HistoryContent />
    </Suspense>
  );
}
