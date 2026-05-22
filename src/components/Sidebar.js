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
      if (!mobile && isOpen) setIsOpen(false);
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
    { href: '/monthly-tracking/history?filter=others', label: 'Extra Donations', icon: '🎁' },
    { href: '/payments', label: 'Record Payment', icon: '💰' },
    { href: '/donors/audit', label: 'Donor History', icon: '🔎' },
    { href: '/monthly-tracking/verify', label: 'Verify Receipt', icon: '🧾' },
  ];

  if (!mounted) return <div style={{ width: isMobile ? '0' : '250px' }} />;

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1000,
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: 'var(--shadow)',
            cursor: 'pointer'
          }}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 900
          }}
        />
      )}

      {/* Sidebar Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '250px',
          height: '100vh',
          background: 'var(--bg-sidebar)',
          color: 'white',
          zIndex: 950,
          transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Logo Section */}
        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>🕌</div>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.25rem', letterSpacing: '1px' }}>Idara Maheria</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Ghafooria Fund System</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ul style={{ listStyle: 'none', padding: '1.5rem 0', margin: 0, flex: 1, overflowY: 'auto' }}>
            {menuItems.map((item) => (
              <li key={item.href} style={{ marginBottom: '0.5rem' }}>
                <Link
                  href={item.href}
                  onClick={() => isMobile && setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem 1.5rem',
                    color: isActive(item.href) ? 'white' : 'rgba(255,255,255,0.7)',
                    background: isActive(item.href) ? 'rgba(255,255,255,0.15)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: isActive(item.href) ? '600' : '400',
                    borderLeft: `4px solid ${isActive(item.href) ? 'var(--accent)' : 'transparent'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Footer / Logout */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                width: '100%',
                background: 'rgba(220, 53, 69, 0.2)',
                color: '#ff8a93',
                border: '1px solid rgba(220, 53, 69, 0.4)',
                justifyContent: 'center',
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </nav>


      </aside>
    </>
  );
}

