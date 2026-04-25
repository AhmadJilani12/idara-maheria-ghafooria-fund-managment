'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && isOpen) {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isOpen]);

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsOpen(false);
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/donors', label: 'Manage Donors', icon: '☪️' },
    { href: '/monthly-tracking', label: 'Monthly Tracking', icon: '📅' },
    { href: '/payments', label: 'Record Payment', icon: '💰' },
  //  { href: '/reports', label: 'Reports', icon: '📊' }
  ];

  if (!mounted) {
    return <div style={{ width: '250px' }} />;
  }

  // Mobile version
  if (isMobile) {
    return (
      <>
        {/* Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            top: '0.75rem',
            left: '0.75rem',
            zIndex: 201,
            background: '#1a5f3d',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 0.9rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          aria-label="Toggle menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        {/* Backdrop */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 150
            }}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '250px',
            height: '100vh',
            background: 'linear-gradient(135deg, #1a5f3d, #27ae60)',
            color: '#fff',
            overflowY: 'auto',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            zIndex: 160,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Logo */}
          <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🕌</div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>Idara</h2>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>Maheria Ghafooria</p>
          </div>

          {/* Menu */}
          <nav style={{ marginTop: '1rem' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.9rem 1.2rem',
                      color: isActive(item.href) ? '#fff' : '#d0e8e1',
                      textDecoration: 'none',
                      borderLeft: isActive(item.href) ? '4px solid #ffd700' : '4px solid transparent',
                      background: isActive(item.href) ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                      transition: 'all 0.2s',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </aside>
      </>
    );
  }

  // Desktop version
  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '250px',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a5f3d, #27ae60)',
      color: '#fff',
      padding: '2rem 0',
      overflowY: 'auto',
      boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>🕌</div>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>Idara</h2>
        <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>Maheria Ghafooria</p>
      </div>

      {/* Menu */}
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 1.5rem',
                  color: isActive(item.href) ? '#fff' : '#d0e8e1',
                  textDecoration: 'none',
                  borderLeft: isActive(item.href) ? '4px solid #ffd700' : '4px solid transparent',
                  background: isActive(item.href) ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
