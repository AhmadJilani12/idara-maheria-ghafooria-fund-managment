'use client';

import { useState, useEffect } from 'react';
import FaceRecognition from '@/components/FaceRecognition';

export default function PublicScanPage() {
  const [teachers, setTeachers] = useState([]);
  const [date] = useState(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
  }).format(new Date())); 
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: 'idle', message: 'Please wait, initializing...' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const tRes = await fetch('/api/teachers', { cache: 'no-store' });
      const data = await tRes.json();
      if (Array.isArray(data)) {
        const activeTeachers = data.filter(t => t.isActive);
        setTeachers(activeTeachers);
        setStatus({ type: 'idle', message: 'Ready to Scan' });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setStatus({ type: 'error', message: 'Failed to load teacher data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFaceMatch = async (teacherId) => {
    setStatus({ type: 'loading', message: 'Marking attendance...' });
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, date })
      });

      const result = await response.json();

      if (response.ok) {
        let msg = "Attendance marked successfully!";
        if (result.checkOut && !result.checkIn) msg = "Check-out marked! (Note: Check-in was missed)";
        else if (result.checkOut) msg = "Check-out marked successfully!";
        
        setStatus({ type: 'success', message: msg });
        
        // Auto reset scanner after 5 seconds
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        setStatus({ type: 'error', message: result.error || "Failed to mark attendance" });
        setTimeout(() => setStatus({ type: 'idle', message: 'Ready to Scan' }), 4000);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setStatus({ type: 'error', message: 'System Error: Connection failed.' });
      setTimeout(() => setStatus({ type: 'idle', message: 'Ready to Scan' }), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p>Initializing Face Scanner...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem', padding: '1rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>🕌 Idara Maheria</h1>
        <h2>Staff Attendance Kiosk</h2>
        <p style={{ color: '#666' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </header>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {status.type === 'success' ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem', borderTop: '5px solid var(--success)' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Thank You!</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{status.message}</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>The scanner will restart in a few seconds...</p>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => window.location.reload()}>Scan Next Person</button>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <FaceRecognition 
              teachers={teachers} 
              onMatch={handleFaceMatch}
              onCancel={() => {}} // No cancel in public kiosk
            />
            {status.type === 'error' && (
              <div style={{ 
                background: '#fff5f5', 
                color: '#c53030', 
                padding: '1rem', 
                textAlign: 'center',
                borderTop: '1px solid #feb2b2',
                fontWeight: '600'
              }}>
                ⚠️ {status.message}
              </div>
            )}
            {status.type === 'loading' && (
              <div style={{ 
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(255,255,255,0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100
              }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', fontWeight: '600' }}>{status.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#888', fontSize: '0.8rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Admin Login</a>
        </p>
        <p>© {new Date().getFullYear()} Idara Maheria Management System</p>
        <p>Please ensure proper lighting for accurate recognition.</p>
      </footer>
    </div>
  );
}
