'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (login(email, password)) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1a5f3d, #27ae60)', padding: '1rem' }}>
      <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🕌</div>
          <h1 style={{ fontSize: '1.4rem', color: '#1a5f3d', margin: 0, marginBottom: '0.3rem', fontWeight: '700' }}>Idara Maheria Ghafooria</h1>
          <p style={{ fontSize: '0.8rem', color: '#27ae60', margin: '0.25rem 0 0', fontWeight: '500' }}>Fund Management System</p>
        </div>

        {error && (
          <div style={{ background: '#fadbd8', border: '2px solid #e74c3c', color: '#c0392b', padding: '0.9rem', borderRadius: '4px', marginBottom: '1.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#1a5f3d', fontSize: '0.9rem' }}>📧 Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{ width: '100%', padding: '0.65rem', border: '2px solid #d0e8e1', borderRadius: '4px', fontFamily: 'inherit', fontSize: '0.95rem', transition: 'border-color 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#27ae60'}
              onBlur={(e) => e.target.style.borderColor = '#d0e8e1'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#1a5f3d', fontSize: '0.9rem' }}>🔐 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ width: '100%', padding: '0.65rem', border: '2px solid #d0e8e1', borderRadius: '4px', fontFamily: 'inherit', fontSize: '0.95rem', transition: 'border-color 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#27ae60'}
              onBlur={(e) => e.target.style.borderColor = '#d0e8e1'}
            />
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '0.7rem', background: 'linear-gradient(135deg, #1a5f3d, #27ae60)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.3s' }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(26, 95, 61, 0.4)'}
            onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
          >
            Login 
          </button>
        </form>

        <div style={{ marginTop: '1.2rem', padding: '0.9rem', backgroundColor: '#f0f4f1', border: '1px solid #d0e8e1', borderRadius: '4px', fontSize: '0.8rem', color: '#1a5f3d' }}>
          <p style={{ margin: '0 0 0.4rem', fontWeight: '600', fontSize: '0.8rem' }}>Demo Credentials:</p>
          <p style={{ margin: '0.2rem 0', fontSize: '0.75rem' }}>Email: <strong>admin@example.com</strong></p>
          <p style={{ margin: '0.2rem 0', fontSize: '0.75rem' }}>Password: <strong>any value</strong></p>
        </div>
      </div>
    </div>
  );
}
