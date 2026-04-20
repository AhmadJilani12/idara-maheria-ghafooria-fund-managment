'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '�' },
    { href: '/donors', label: 'Manage Donors', icon: '☪️' },
    { href: '/monthly-tracking', label: 'Monthly Tracking', icon: '📅' },
    { href: '/payments', label: 'Record Payment', icon: '💰' },
    { href: '/reports', label: 'Reports', icon: '📊' }
  ];

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
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      zIndex: '100'
    }}>
      {/* Logo */}
      <div style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>🕌</div>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', letterSpacing: '0.5px' }}>Idara</h2>
        <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#ffffff', fontWeight: '500' }}>Maheria Ghafooria</p>
      </div>

      {/* Navigation Menu */}
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                style={{
                  display: 'block',
                  padding: '1rem 1.5rem',
                  color: isActive(item.href) ? '#fff' : '#d0e8e1',
                  textDecoration: 'none',
                  borderLeft: isActive(item.href) ? '4px solid #ffd700' : '4px solid transparent',
                  background: isActive(item.href) ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
              >
                <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
            fontWeight: '500',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}
        >
          🚪 Logout
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          aside {
            width: 200px;
          }
          aside h2 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </aside>
  );
}
