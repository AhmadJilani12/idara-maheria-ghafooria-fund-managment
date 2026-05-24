'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Receipt({ data, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling on body when receipt is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const receiptContent = (
    <div className="receipt-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 99999, 
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div className="receipt-modal-container" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        margin: 'auto',
        position: 'relative',
        animation: 'modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Receipt Body */}
        <div id="receipt-content" className="receipt-printable-area" style={{ 
          background: 'white', 
          color: '#1a1a1a',
          padding: '3rem', 
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Circular Verified Stamp */}
          <div className="verified-stamp" style={{
            position: 'absolute',
            top: '40px',
            right: '25px',
            width: '100px',
            height: '100px',
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
              width: '85px',
              height: '85px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#28a745',
              fontWeight: '900',
              fontSize: '0.75rem',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              <span style={{ fontSize: '1rem' }}>VERIFIED</span>
              <span style={{ fontSize: '0.5rem', opacity: 0.8 }}>OFFICIAL</span>
              <span style={{ fontSize: '0.5rem', opacity: 0.8 }}>RECORD</span>
            </div>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🕌</div>
            <h2 style={{ margin: 0, color: '#0f5132', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
              {madrasaName}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#555', margin: '0.4rem 0', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>
              Official Payment Receipt
            </p>
            <div style={{ width: '80px', height: '4px', background: '#0f5132', margin: '1.2rem auto', borderRadius: '2px' }}></div>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
              <span style={{ color: '#666', fontSize: '0.95rem', fontWeight: '500' }}>Receipt No:</span>
              <span style={{ fontWeight: '800', color: '#000', fontSize: '1.05rem' }}>{receiptId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
              <span style={{ color: '#666', fontSize: '0.95rem', fontWeight: '500' }}>Donor Name:</span>
              <span style={{ fontWeight: '800', color: '#000', fontSize: '1.05rem' }}>{donorName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f5132', paddingBottom: '0.8rem', background: 'rgba(15, 81, 50, 0.03)', padding: '0.8rem', margin: '0 -0.8rem', borderRadius: '8px' }}>
              <span style={{ color: '#0f5132', fontSize: '1rem', fontWeight: '700' }}>Amount Paid:</span>
              <span style={{ fontWeight: '900', color: '#0f5132', fontSize: '1.6rem' }}>Rs. {amount?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
              <span style={{ color: '#666', fontSize: '0.95rem', fontWeight: '500' }}>For Period:</span>
              <span style={{ fontWeight: '800', color: '#000', fontSize: '1.05rem' }}>{month} <small style={{ fontWeight: '400', color: '#888', fontSize: '0.8rem' }}>({type})</small></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
              <span style={{ color: '#666', fontSize: '0.95rem', fontWeight: '500' }}>Payment Date:</span>
              <span style={{ fontWeight: '800', color: '#000', fontSize: '1.05rem' }}>{date}</span>
            </div>
          </div>

          <div style={{ 
            marginTop: '3.5rem', 
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#666',
            fontStyle: 'italic',
            borderTop: '2px dashed #eee',
            paddingTop: '2rem'
          }}>
            <p style={{ margin: 0, fontWeight: '500' }}>JazakAllah Khair for your generous support.</p>
            <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#aaa', fontStyle: 'normal' }}>
              This is a computer-generated official receipt. No signature required.
              <br />
              Generated on {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Buttons - Hidden during print */}
        <div className="no-print" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-primary"
            style={{ 
              flex: 2, 
              padding: '1.2rem', 
              borderRadius: '12px', 
              fontSize: '1.1rem',
              fontWeight: '700',
              boxShadow: '0 10px 20px rgba(15, 81, 50, 0.3)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🖨️ Print Official Receipt
          </button>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ 
              flex: 1, 
              padding: '1.2rem', 
              borderRadius: '12px', 
              background: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: '2px solid #eee',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media print {
          /* 1. COMPLETELY HIDE EVERYTHING ELSE */
          html, body, #__next, .RootLayoutWrapper, main, .main-content, .sidebar, aside, nav, header, footer, .container-fluid, .page-header, .card, section {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 2. SHOW ONLY THE PORTALED OVERLAY */
          body > .receipt-overlay {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            z-index: 999999 !important;
          }

          .receipt-modal-container {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            visibility: visible !important;
            box-shadow: none !important;
            animation: none !important;
          }

          /* 3. FORMAT RECEIPT CONTENT */
          #receipt-content {
            display: block !important;
            visibility: visible !important;
            box-shadow: none !important;
            border: 2px solid #111 !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
            width: 18cm !important;
            padding: 2cm !important;
            background: white !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            page-break-inside: avoid !important;
          }

          #receipt-content * {
            visibility: visible !important;
            color: black !important;
          }

          /* Force Colors */
          .verified-stamp, .verified-stamp * {
            color: #28a745 !important;
            border-color: #28a745 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #receipt-content h2, #receipt-content span {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide Buttons */
          .no-print, .btn, button {
            display: none !important;
            visibility: hidden !important;
          }

          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>
    </div>
  );

  if (!mounted) return null;

  return createPortal(receiptContent, document.body);
}
