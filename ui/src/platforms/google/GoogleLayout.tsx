import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import {
  Chrome,
  LayoutDashboard,
  Search,
  Megaphone,
  Layers,
  FileText,
  Target,
  Zap,
  Settings
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/google/dashboard', icon: LayoutDashboard },
  { label: 'Search', path: '/google/feed', icon: Search },
  { label: 'Campaigns', path: '/google/campaigns', icon: Megaphone },
  { label: 'Ad Groups', path: '/google/ad-groups', icon: Layers },
  { label: 'Ads', path: '/google/ads', icon: FileText },
  { label: 'Conversions', path: '/google/conversion-actions', icon: Target },
  { label: 'Events', path: '/google/events', icon: Zap },
  { label: 'Settings', path: '/google/settings', icon: Settings },
];

export function GoogleLayout() {
  return (
    <PlatformLayout
      platform="google"
      platformName="Google"
      platformIcon={Chrome}
      navItems={navItems}
    />
  );
}
