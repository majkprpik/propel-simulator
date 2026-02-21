import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import {
  Network,
  LayoutDashboard,
  Tag,
  MousePointerClick,
  ArrowDownToLine,
  Settings,
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/everflow/dashboard', icon: LayoutDashboard },
  { label: 'Offers', path: '/everflow/offers', icon: Tag },
  { label: 'Clicks', path: '/everflow/clicks', icon: MousePointerClick },
  { label: 'Postbacks', path: '/everflow/postbacks', icon: ArrowDownToLine },
  { label: 'Settings', path: '/everflow/settings', icon: Settings },
];

export function EverflowLayout() {
  return (
    <PlatformLayout
      platform="everflow"
      platformName="Everflow"
      platformIcon={Network}
      navItems={navItems}
    />
  );
}
