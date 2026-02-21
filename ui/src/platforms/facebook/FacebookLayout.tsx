import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import {
  Facebook,
  LayoutDashboard,
  Eye,
  Megaphone,
  Layers,
  FileText,
  Box,
  Zap,
  Settings
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/facebook/dashboard', icon: LayoutDashboard },
  { label: 'Feed', path: '/facebook/feed', icon: Eye },
  { label: 'Campaigns', path: '/facebook/campaigns', icon: Megaphone },
  { label: 'Ad Sets', path: '/facebook/ad-sets', icon: Layers },
  { label: 'Ads', path: '/facebook/ads', icon: FileText },
  { label: 'Pixels', path: '/facebook/pixels', icon: Box },
  { label: 'Events', path: '/facebook/events', icon: Zap },
  { label: 'Settings', path: '/facebook/settings', icon: Settings },
];

export function FacebookLayout() {
  return (
    <PlatformLayout
      platform="facebook"
      platformName="Facebook"
      platformIcon={Facebook}
      navItems={navItems}
    />
  );
}
