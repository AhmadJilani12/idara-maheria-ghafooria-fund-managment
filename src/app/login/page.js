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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'var(--bg-sidebar)', 
      padding: '1rem' 
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem', margin: 0 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🕌</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Idara Maheria</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fund Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📧 Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>🔐 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            Sign In
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: 'var(--bg-main)', 
          borderRadius: 'var(--radius)', 
          fontSize: '0.85rem',
          border: '1px solid var(--border)'
        }}>
          <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Demo Credentials:</p>
          <div style={{ display: 'grid', gap: '0.25rem', color: 'var(--text-muted)' }}>
            <p>Email: <strong>admin@example.com</strong></p>
            <p>Password: <strong>admin123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

