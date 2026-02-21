import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import {
  Music,
  LayoutDashboard,
  Smartphone,
  Megaphone,
  Layers,
  FileText,
  Box,
  Zap,
  Settings
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/tiktok/dashboard', icon: LayoutDashboard },
  { label: 'For You', path: '/tiktok/feed', icon: Smartphone },
  { label: 'Campaigns', path: '/tiktok/campaigns', icon: Megaphone },
  { label: 'Ad Groups', path: '/tiktok/ad-groups', icon: Layers },
  { label: 'Ads', path: '/tiktok/ads', icon: FileText },
  { label: 'Pixels', path: '/tiktok/pixels', icon: Box },
  { label: 'Events', path: '/tiktok/events', icon: Zap },
  { label: 'Settings', path: '/tiktok/settings', icon: Settings },
];

export function TikTokLayout() {
  return (
    <PlatformLayout
      platform="tiktok"
      platformName="TikTok"
      platformIcon={Music}
      navItems={navItems}
    />
  );
}
