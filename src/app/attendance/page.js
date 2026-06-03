'use client';

import { useState, useEffect } from 'react';
import FaceRecognition from '@/components/FaceRecognition';

export default function AttendancePage() {
  const [teachers, setTeachers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [date] = useState(new Date().toISOString().split('T')[0]); // Force current date
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tRes = await fetch('/api/teachers', { cache: 'no-store' });
      const teachers = await tRes.json();
      const activeTeachers = teachers.filter(t => t.isActive);
      setTeachers(activeTeachers);

      const aRes = await fetch(`/api/attendance?date=${date}`, { cache: 'no-store' });
      const attendance = await aRes.json();
      setAttendanceData(attendance);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceMatch = async (teacherId) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, date })
      });

      if (response.ok) {
        await fetchData(); // Refresh list
        setShowScanner(false);
      } else {
        const err = await response.json();
        alert(err.error || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  };

  const getTeacherStatus = (teacherId) => {
    const record = attendanceData.find(a => (a.teacherId?._id || a.teacherId) === teacherId);
    if (!record) return { checkIn: 'Not Checked In', checkOut: 'Not Checked Out' };
    
    return {
      checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'Not Checked In',
      checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'Not Checked Out'
    };
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <h1>📝 Daily Attendance ({new Date().toLocaleDateString()})</h1>
        <p>Teachers Check-in (after 6 AM) & Check-out (after 8 AM)</p>
      </header>

      {showScanner && (
        <FaceRecognition 
          teachers={teachers} 
          onMatch={handleFaceMatch}
          onCancel={() => setShowScanner(false)}
        />
      )}

      <section className="card">
        <div className="card-header">
          <h3>Attendance Status</h3>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowScanner(true)}
            style={{ background: 'var(--accent)' }}
          >
            📸 Scan Face for Attendance
          </button>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Teacher Name</th>
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
                        <td style={{ fontWeight: '600' }}>{teacher.name}</td>
                        <td style={{ color: status.checkIn === 'Not Checked In' ? '#ff4d4d' : '#28a745', fontWeight: '500' }}>
                          {status.checkIn}
                        </td>
                        <td style={{ color: status.checkOut === 'Not Checked Out' ? '#ff4d4d' : '#28a745', fontWeight: '500' }}>
                          {status.checkOut}
                        </td>
                        <td>
                          <span className={`badge badge-${status.checkIn === 'Not Checked In' ? 'danger' : 'success'}`}>
                            {status.checkIn === 'Not Checked In' ? 'Absent/Pending' : 'Present'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No active teachers found. Please add teachers first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
