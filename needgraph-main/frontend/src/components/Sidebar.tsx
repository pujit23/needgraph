import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, GitBranch, Users, Bell,
  BarChart2, PlusCircle, Settings
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',          path: '/dashboard',           icon: LayoutDashboard },
  { label: 'Need Map',           path: '/dashboard/map',       icon: Map },
  { label: 'Graph Explorer',     path: '/graph',               icon: GitBranch },
  { label: 'Volunteer Mgmt',     path: '/volunteers',          icon: Users },
  { label: 'Alerts & Predictions', path: '/alerts',            icon: Bell },
  { label: 'Reports',            path: '/reports',             icon: BarChart2 },
  { label: 'Submit Need',        path: '/submit',              icon: PlusCircle },
  { label: 'Settings',           path: '/settings',            icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={{
      width: '240px',
      background: '#0D0D14',
      borderRight: '1px solid #1E1E2E',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      <div style={{
        height: '52px',
        borderBottom: '1px solid #1E1E2E',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px'
      }}>
        <div style={{ width: '16px', height: '16px', background: '#6C63FF' }} />
        <span style={{ color: '#F0F0F5', fontWeight: 600, fontSize: '15px' }}>NeedGraph</span>
      </div>

      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              textDecoration: 'none',
              fontSize: '14px',
              borderRadius: '6px',
              margin: '4px 12px',
              color: location.pathname === item.path ? '#F0F0F5' : '#8A8A9A',
              background: location.pathname === item.path ? '#1A1A2E' : 'transparent',
              borderLeft: location.pathname === item.path ? '2px solid #6C63FF' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{
        padding: '16px',
        borderTop: '1px solid #1E1E2E',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px', height: '32px', background: '#1E1E2E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#F0F0F5', fontSize: '12px', fontWeight: 600, borderRadius: '4px'
        }}>
          AC
        </div>
        <div>
          <div style={{ color: '#F0F0F5', fontSize: '13px', fontWeight: 500 }}>Anika Coordinator</div>
          <div style={{ color: '#55556A', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead</div>
        </div>
      </div>
    </aside>
  );
}
