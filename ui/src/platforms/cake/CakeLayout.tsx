import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import {
  Layers,
  LayoutDashboard,
  Tag,
  MousePointerClick,
  ArrowDownToLine,
  Settings,
} from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/cake/dashboard', icon: LayoutDashboard },
  { label: 'Offers', path: '/cake/offers', icon: Tag },
  { label: 'Clicks', path: '/cake/clicks', icon: MousePointerClick },
  { label: 'Postbacks', path: '/cake/postbacks', icon: ArrowDownToLine },
  { label: 'Settings', path: '/cake/settings', icon: Settings },
];

export function CakeLayout() {
  return (
    <PlatformLayout
      platform="cake"
      platformName="Cake"
      platformIcon={Layers}
      navItems={navItems}
    />
  );
}
