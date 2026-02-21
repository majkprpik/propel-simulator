import { PlatformLayout } from '../components/PlatformLayout';
import type { NavItem } from '../components/Sidebar';
import {
  Settings,
  LayoutDashboard,
  Activity,
  Webhook,
  Clapperboard,
  Database
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Traffic', path: '/admin/traffic-generator', icon: Activity },
  { label: 'Postbacks', path: '/admin/postback-config', icon: Webhook },
  { label: 'Scenarios', path: '/admin/scenarios', icon: Clapperboard },
  { label: 'Database', path: '/admin/database', icon: Database },
];

export function AdminLayout() {
  return (
    <PlatformLayout
      platformName="Admin"
      platformIcon={Settings}
      navItems={navItems}
    />
  );
}
