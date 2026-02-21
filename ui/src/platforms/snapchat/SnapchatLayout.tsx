import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import {
  Ghost,
  LayoutDashboard,
  Compass,
  Megaphone,
  Layers,
  FileText,
  Box,
  Zap,
  Settings
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/snapchat/dashboard', icon: LayoutDashboard },
  { label: 'Discover', path: '/snapchat/feed', icon: Compass },
  { label: 'Campaigns', path: '/snapchat/campaigns', icon: Megaphone },
  { label: 'Ad Squads', path: '/snapchat/ad-groups', icon: Layers },
  { label: 'Ads', path: '/snapchat/ads', icon: FileText },
  { label: 'Pixels', path: '/snapchat/pixels', icon: Box },
  { label: 'Events', path: '/snapchat/events', icon: Zap },
  { label: 'Settings', path: '/snapchat/settings', icon: Settings },
];

export function SnapchatLayout() {
  return (
    <PlatformLayout
      platform="snapchat"
      platformName="Snapchat"
      platformIcon={Ghost}
      navItems={navItems}
    />
  );
}
