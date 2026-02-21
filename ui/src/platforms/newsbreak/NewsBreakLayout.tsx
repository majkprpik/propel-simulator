import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import {
  Newspaper,
  LayoutDashboard,
  Megaphone,
  FileText,
  TrendingUp,
  Zap,
  Settings
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/newsbreak/dashboard', icon: LayoutDashboard },
  { label: 'Feed', path: '/newsbreak/feed', icon: Newspaper },
  { label: 'Campaigns', path: '/newsbreak/campaigns', icon: Megaphone },
  { label: 'Ads', path: '/newsbreak/ads', icon: FileText },
  { label: 'Reports', path: '/newsbreak/reports', icon: TrendingUp },
  { label: 'Events', path: '/newsbreak/events', icon: Zap },
  { label: 'Settings', path: '/newsbreak/settings', icon: Settings },
];

export function NewsBreakLayout() {
  return (
    <PlatformLayout
      platform="newsbreak"
      platformName="NewsBreak"
      platformIcon={Newspaper}
      navItems={navItems}
    />
  );
}
