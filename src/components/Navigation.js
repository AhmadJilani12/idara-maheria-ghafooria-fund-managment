'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <div className="navbar">
      <div className="container">
        <nav>
          <div className="logo">� Idara Maheria Ghafooria</div>
          <ul>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/donors">Donors</Link></li>
            <li><Link href="/monthly-tracking">Monthly Tracking</Link></li>
            <li><Link href="/payments">Payments</Link></li>
            <li><Link href="/reports">Reports</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
