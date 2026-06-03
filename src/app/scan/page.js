'use client';

import { useState, useEffect } from 'react';
import FaceRecognition from '@/components/FaceRecognition';

export default function PublicAttendancePage() {
  const [teachers, setTeachers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  
  // Get current date in Pakistan timezone (YYYY-MM-DD)
  const getTodayStr = () => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };

  const [date] = useState(getTodayStr()); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tRes = await fetch('/api/teachers', { cache: 'no-store' });
      const teachers = await tRes.json();
      const activeTeachers = Array.isArray(teachers) ? teachers.filter(t => t.isActive) : [];
      setTeachers(activeTeachers);

      const aRes = await fetch(`/api/attendance?date=${date}`, { cache: 'no-store' });
      const attendance = await aRes.json();
      setAttendanceData(Array.isArray(attendance) ? attendance : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceMatch = async (teacherId) => {
    setStatus({ type: 'loading', message: 'Processing attendance...' });
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
        await fetchData(); // Refresh list
        
        setTimeout(() => {
          setShowScanner(false);
          setStatus({ type: 'idle', message: '' });
        }, 3000);
      } else {
        setStatus({ type: 'error', message: result.error || "Failed to mark attendance" });
        setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setStatus({ type: 'error', message: 'System Error: Connection failed.' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    }
  };

  const getTeacherStatus = (teacherId) => {
    if (!Array.isArray(attendanceData)) return { checkIn: 'Not Checked In', checkOut: 'Not Checked Out' };

    const record = attendanceData.find(a => {
      const id = a.teacherId?._id || a.teacherId;
      return id?.toString() === teacherId?.toString();
    });

    if (!record) return { checkIn: 'Not Checked In', checkOut: 'Not Checked Out' };
    
    return {
      checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'Not Checked In',
      checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'Not Checked Out'
    };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '3rem' }}>
      {/* Public Header */}
      <nav style={{ background: 'var(--primary)', color: 'white', padding: '1rem 2rem', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🕌</span>
            <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>Idara Maheria Staff Portal</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600' }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Public Attendance Dashboard</div>
          </div>
        </div>
      </nav>

      <div className="container-fluid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        
        {showScanner ? (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
             <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                <div style={{ padding: '1rem', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>📸 Face Scanner</h3>
                  <button className="btn btn-outline" onClick={() => setShowScanner(false)}>Cancel</button>
                </div>
                
                <FaceRecognition 
                  teachers={teachers} 
                  onMatch={handleFaceMatch}
                  onCancel={() => setShowScanner(false)}
                />

                {status.message && (
                  <div style={{ 
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: status.type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 'rgba(255,255,255,0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    color: status.type === 'success' ? 'white' : 'inherit',
                    textAlign: 'center',
                    padding: '2rem'
                  }}>
                    {status.type === 'loading' && <div className="spinner"></div>}
                    {status.type === 'success' && <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>}
                    {status.type === 'error' && <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>⚠️</div>}
                    <h2 style={{ color: status.type === 'success' ? 'white' : 'inherit' }}>{status.message}</h2>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <>
            <section className="card" style={{ marginBottom: '2rem', borderTop: '5px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ marginBottom: '0.25rem' }}>Daily Attendance Status</h2>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Teachers are requested to mark their attendance upon arrival and departure.</p>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowScanner(true)}
                  style={{ padding: '1rem 2rem', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(15, 81, 50, 0.2)' }}
                >
                  📸 Start Face Scan
                </button>
              </div>
            </section>

            <section className="card">
              <div className="table-container">
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Teacher Name</th>
                        <th>Designation</th>
                        <th>Check-In Time</th>
                        <th>Check-Out Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.length > 0 ? (
                        teachers.map(teacher => {
                          const status = getTeacherStatus(teacher._id);
                          return (
                            <tr key={teacher._id}>
                              <td style={{ fontWeight: '600', fontSize: '1.05rem' }}>{teacher.name}</td>
                              <td>{teacher.designation || '-'}</td>
                              <td style={{ color: status.checkIn === 'Not Checked In' ? '#ff4d4d' : '#28a745', fontWeight: '600' }}>
                                {status.checkIn}
                              </td>
                              <td style={{ color: status.checkOut === 'Not Checked Out' ? '#ff4d4d' : '#28a745', fontWeight: '600' }}>
                                {status.checkOut}
                              </td>
                              <td>
                                <span className={`badge badge-${status.checkIn === 'Not Checked In' ? 'danger' : 'success'}`}>
                                  {status.checkIn === 'Not Checked In' ? 'Absent' : 'Present'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No active teachers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#888', fontSize: '0.9rem' }}>
        <p>© {new Date().getFullYear()} Idara Maheria Management System</p>
        <p>For Administrative Access, please <a href="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login here</a></p>
      </footer>
    </div>
  );
}
