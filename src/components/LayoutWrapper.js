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
    } else if (user && pathname === '/login') {
      router.push('/dashboard');
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

  if (!mounted || loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Show login page without layout
  if (pathname === '/login') {
    return children;
  }

  // If user is not logged in and not on login page, redirect
  if (!user) {
    return children;
  }

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <Sidebar />
      <main 
        className="main-content"
        style={{ 
          marginLeft: isMobile ? '0' : '250px',
          width: isMobile ? '100%' : 'calc(100% - 250px)'
        }}
      >
        <div className="container-fluid" style={{ maxWidth: '1400px' }}>
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

