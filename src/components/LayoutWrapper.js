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

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem' }}>
        Loading...
      </div>
    );
  }

  if (!user && pathname !== '/login') {
    return null;
  }

  if (pathname === '/login') {
    return children;
  }

  return (
    <div style={{ display: 'flex' }}>
      {!isMobile && <Sidebar />}
      <main style={{ marginLeft: isMobile ? '0' : '250px', flex: 1, minHeight: '100vh', background: '#ecf0f1', padding: '1rem 0', width: '100%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
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
