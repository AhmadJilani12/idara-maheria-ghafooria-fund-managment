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

      const result = await response.json();

      if (response.ok) {
        // Show what actually happened
        if (result.checkOut && !result.checkIn) {
          alert("Check-out marked! (Note: Check-in was missed)");
        } else if (result.checkOut) {
          alert("Check-out marked successfully!");
        } else {
          alert("Check-in marked successfully!");
        }
        
        await fetchData(); // Refresh list
        setShowScanner(false);
      } else {
        alert(result.error || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("System Error: Could not connect to attendance server.");
    }
  };

  const getTeacherStatus = (teacherId) => {
    // Ensure we compare strings to strings
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
    <div className="container-fluid">
      <header className="page-header">
        <h1>📝 Daily Attendance ({new Date().toLocaleDateString()})</h1>
        <p>Teachers Check-in (5 AM - 12 PM) & Check-out (12 PM - 11 PM)</p>
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
