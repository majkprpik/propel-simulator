import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import {
  BarChart3,
  LayoutDashboard,
  Tag,
  MousePointerClick,
  ArrowDownToLine,
  Settings,
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/hasoffers/dashboard', icon: LayoutDashboard },
  { label: 'Offers', path: '/hasoffers/offers', icon: Tag },
  { label: 'Clicks', path: '/hasoffers/clicks', icon: MousePointerClick },
  { label: 'Postbacks', path: '/hasoffers/postbacks', icon: ArrowDownToLine },
  { label: 'Settings', path: '/hasoffers/settings', icon: Settings },
];

export function HasOffersLayout() {
  return (
    <PlatformLayout
      platform="hasoffers"
      platformName="HasOffers"
      platformIcon={BarChart3}
      navItems={navItems}
    />
  );
}
