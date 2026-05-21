'use client';

export default function Receipt({ data, onClose }) {
  if (!data) return null;

  const { 
    receiptId, 
    donorName, 
    amount, 
    month, 
    date, 
    madrasaName = "Idara Maheria Ghafooria",
    type = "monthly",
  } = data;

  return (
    <div className="receipt-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 5000, 
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div className="receipt-modal-container" style={{ 
        maxWidth: '480px', 
        width: '100%', 
        margin: 'auto',
        position: 'relative'
      }}>
        {/* Receipt Body */}
        <div id="receipt-content" style={{ 
          background: 'white', 
          color: '#333',
          padding: '2.5rem', 
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #eee'
        }}>
          {/* Circular Verified Stamp */}
          <div style={{
            position: 'absolute',
            top: '40px',
            right: '20px',
            width: '90px',
            height: '90px',
            border: '3px double rgba(40, 167, 69, 0.4)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-15deg)',
            zIndex: 5,
            pointerEvents: 'none'
          }}>
            <div style={{
              border: '1px solid rgba(40, 167, 69, 0.6)',
              borderRadius: '50%',
              width: '75px',
              height: '75px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#28a745',
              fontWeight: 'bold',
              fontSize: '0.65rem',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              <span style={{ fontSize: '0.85rem' }}>VERIFIED</span>
              <span style={{ fontSize: '0.45rem', opacity: 0.8 }}>SYSTEM</span>
              <span style={{ fontSize: '0.45rem', opacity: 0.8 }}>RECORD</span>
            </div>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🕌</div>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '800' }}>
              {madrasaName}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: '0.2rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Official Payment Receipt
            </p>
            <div style={{ width: '50px', height: '2px', background: 'var(--primary)', margin: '1rem auto' }}></div>
          </div>

          {/* Table */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>Receipt No:</span>
              <span style={{ fontWeight: '600' }}>{receiptId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>Donor Name:</span>
              <span style={{ fontWeight: '600' }}>{donorName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>Amount:</span>
              <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.2rem' }}>Rs. {amount?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>For Month:</span>
              <span style={{ fontWeight: '600' }}>{month} <small style={{ fontWeight: 'normal', color: '#999' }}>({type})</small></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>Date:</span>
              <span style={{ fontWeight: '600' }}>{date}</span>
            </div>
          </div>

          <div style={{ 
            marginTop: '2.5rem', 
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#999',
            fontStyle: 'italic'
          }}>
            JazakAllah Khair for your generous support.
          </div>
        </div>

        {/* Buttons - Outside the printable area */}
        <div className="no-print" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-primary"
            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px' }}
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'white' }}
          >
            Close
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* 1. General page cleanup */
          @page { margin: 0; }
          body { background: white !important; }
          
          /* 2. Hide all common layout elements */
          nav, aside, footer, .sidebar, .no-print, button, .btn {
            display: none !important;
          }

          /* 3. Reset all parent containers to not interfere with positioning */
          html, body, main, .main-content, .receipt-overlay, .receipt-modal-container {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* 4. Style the specific receipt for printing */
          #receipt-content {
            display: block !important;
            margin: 0 auto !important;
            width: 17cm !important;
            padding: 1.5cm !important;
            border: 4px double #000 !important;
            background: white !important;
            visibility: visible !important;
            position: relative !important;
            top: 1cm !important; /* Small gap from paper edge */
          }

          /* 5. Ensure text is black and crisp */
          #receipt-content * {
            color: black !important;
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
