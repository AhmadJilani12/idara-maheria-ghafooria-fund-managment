'use client';

import { useState, useEffect } from 'react';
import FaceRecognition from '@/components/FaceRecognition';

export default function AttendancePage() {
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState({}); // { teacherId: { status, note } }
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active teachers with NO CACHE
      const tRes = await fetch('/api/teachers', { cache: 'no-store' });
      const tData = await tRes.json();
      const activeTeachers = tData.filter(t => t.isActive);
      setTeachers(activeTeachers);

      // Fetch attendance with NO CACHE
      const aRes = await fetch(`/api/attendance?date=${date}`, { cache: 'no-store' });
      const aData = await aRes.json();
      
      const attMap = {};
      activeTeachers.forEach(t => {
        const existing = aData.find(a => (a.teacherId?._id || a.teacherId) === t._id);
        attMap[t._id] = {
          status: existing ? existing.status : 'Present',
          note: existing ? existing.note : ''
        };
      });
      setAttendance(attMap);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (teacherId, status) => {
    setAttendance(prev => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], status }
    }));
  };

  const handleNoteChange = (teacherId, note) => {
    setAttendance(prev => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], note }
    }));
  };

  const handleFaceMatch = (teacherId) => {
    setAttendance(prev => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], status: 'Present', note: 'Marked via Face Scan' }
    }));
    setShowScanner(false);
    alert("Attendance marked for recognized teacher!");
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([teacherId, data]) => ({
        teacherId,
        status: data.status,
        note: data.note,
        date: date
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records)
      });

      if (response.ok) {
        alert("Attendance saved successfully!");
      } else {
        alert("Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenScanner = async () => {
    setLoading(true);
    try {
      const tRes = await fetch('/api/teachers', { cache: 'no-store' });
      const tData = await tRes.json();
      const filtered = tData.filter(t => t.isActive);
      
      // SUPER DEBUG LOG
      const facesCount = filtered.filter(t => t.faceDescriptor && (t.faceDescriptor.length > 0 || Object.keys(t.faceDescriptor).length > 0)).length;
      console.log(`ATTENDANCE PAGE DEBUG: Fetched ${filtered.length} teachers, Faces found: ${facesCount}`);
      
      setTeachers(filtered);
      setShowScanner(true);
    } catch (error) {
      alert("Error refreshing teacher data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <header className="page-header">
        <h1>📝 Teacher Attendance</h1>
        <p>Record daily attendance for teachers and staff</p>
      </header>

      {showScanner && (
        <FaceRecognition 
          teachers={teachers} 
          onMatch={handleFaceMatch}
          onCancel={() => setShowScanner(false)}
        />
      )}

      <section className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ marginBottom: 0, fontWeight: '600' }}>Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: 'auto' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleOpenScanner}
              style={{ background: 'var(--accent)' }}
            >
              📸 Face Scan
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : '💾 Save Attendance'}
            </button>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? (
                  teachers.map(teacher => (
                    <tr key={teacher._id}>
                      <td style={{ fontWeight: '600' }}>{teacher.name}</td>
                      <td>{teacher.designation || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {['Present', 'Absent', 'Leave'].map(status => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(teacher._id, status)}
                              className={`btn ${attendance[teacher._id]?.status === status ? 
                                (status === 'Present' ? 'btn-primary' : status === 'Absent' ? 'btn-danger' : 'btn-warning') 
                                : 'btn-outline'}`}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={attendance[teacher._id]?.note || ''}
                          onChange={(e) => handleNoteChange(teacher._id, e.target.value)}
                          style={{ margin: 0, padding: '0.4rem' }}
                        />
                      </td>
                    </tr>
                  ))
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
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
           <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : '💾 Save Attendance'}
          </button>
        </div>
      </section>
    </div>
  );
}
