'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileNav(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="navbar" style={{
      background: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: '50',
      marginBottom: isMobileNav ? '0' : '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobileNav ? '0 0.75rem' : '0 1.5rem'
      }}>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobileNav ? '0.8rem 0' : '1rem 0',
          position: 'relative'
        }}>
          <div style={{
            fontSize: isMobileNav ? '1rem' : '1.3rem',
            fontWeight: '700',
            color: '#1a5f3d',
            letterSpacing: '0.5px'
          }}>
            🕌 Idara
          </div>

          {/* Mobile Menu Toggle */}
          {isMobileNav && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#1a5f3d'
              }}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          )}

          {/* Desktop Menu */}
          {!isMobileNav && (
            <ul style={{
              listStyle: 'none',
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              margin: 0,
              padding: 0
            }}>
              <li><Link href="/dashboard" style={{ color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.95rem' }}>Dashboard</Link></li>
              <li><Link href="/donors" style={{ color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.95rem' }}>Donors</Link></li>
              <li><Link href="/monthly-tracking" style={{ color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.95rem' }}>Tracking</Link></li>
              <li><Link href="/payments" style={{ color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.95rem' }}>Payments</Link></li>
              <li><Link href="/reports" style={{ color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.95rem' }}>Reports</Link></li>
            </ul>
          )}

          {/* Mobile Menu */}
          {isMobileNav && isMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              borderTop: '1px solid #ddd',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: '40'
            }}>
              <ul style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                margin: 0,
                padding: '0.5rem 0'
              }}>
                <li><Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '0.7rem 1rem', color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.85rem' }}>Dashboard</Link></li>
                <li><Link href="/donors" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '0.7rem 1rem', color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.85rem' }}>Donors</Link></li>
                <li><Link href="/monthly-tracking" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '0.7rem 1rem', color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.85rem' }}>Tracking</Link></li>
                <li><Link href="/payments" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '0.7rem 1rem', color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.85rem' }}>Payments</Link></li>
                <li><Link href="/reports" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '0.7rem 1rem', color: '#1a3a2d', fontWeight: '500', textDecoration: 'none', fontSize: '0.85rem' }}>Reports</Link></li>
              </ul>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
