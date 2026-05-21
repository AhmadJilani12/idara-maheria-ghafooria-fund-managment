'use client';

import { useState } from 'react';

import Receipt from '@/components/Receipt';

export default function VerifyReceiptPage() {
  const [receiptId, setReceiptId] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!receiptId.trim()) return;

    try {
      setLoading(true);
      setError('');
      setReceipt(null);
      
      const res = await fetch(`/api/tracking/receipt/${receiptId.trim()}`);
      const data = await res.json();

      if (res.ok) {
        setReceipt({
          receiptId: data.receiptId,
          donorName: data.donorName,
          amount: data.amount,
          month: data.month,
          type: data.type,
          date: new Date(data.date).toLocaleString(),
          note: data.note,
          madrasaName: "Idara Maheria Ghafooria"
        });
      } else {
        setError(data.error || 'Receipt not found');
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <div>
          <h1>🧾 Verify Receipt</h1>
          <p>Instantly lookup donor and payment details using Receipt ID</p>
        </div>
      </header>

      <section className="card" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Enter Receipt ID</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                placeholder="e.g. RCP-1716..."
                style={{ flex: 1 }}
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Searching...' : '🔍 Lookup'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {error && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', borderLeft: '4px solid var(--danger)', padding: '1rem' }}>
          <p style={{ color: 'var(--danger)', margin: 0, fontWeight: '600' }}>❌ {error}</p>
        </div>
      )}

      {receipt && (
        <Receipt 
          data={receipt} 
          onClose={() => {setReceipt(null); setReceiptId('');}} 
        />
      )}

      <style jsx>{`
      `}</style>
    </div>
  );
}
