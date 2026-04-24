'use client';

import { AuthProvider, useAuth } from '@/lib/authContext';
import Sidebar from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function LayoutContent({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [mounted, user, loading, pathname, router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading only during initial auth check
  if (!mounted || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        fontSize: '1.2rem',
        background: '#ecf0f1'
      }}>
        Loading...
      </div>
    );
  }

  // Show login page without layout
  if (pathname === '/login') {
    return children;
  }

  // If user is not logged in and not on login page, redirect (but render login page first)
  if (!user) {
    return children;
  }

  // Show layout for authenticated users
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <Sidebar />
      <main style={{ 
        marginLeft: isMobile ? '0' : '250px', 
        flex: 1, 
        minHeight: '100vh', 
        background: '#ecf0f1', 
        padding: isMobile ? '3.5rem 0 1rem 0' : '1rem 0',
        width: '100%',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: isMobile ? '0 0.75rem' : '0 1rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export function RootLayoutWrapper({ children }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
