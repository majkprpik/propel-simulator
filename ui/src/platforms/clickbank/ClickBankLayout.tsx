import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import { LayoutDashboard, Tag, ShoppingBag, ArrowDownToLine, Settings } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/clickbank/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/clickbank/products', icon: Tag },
  { label: 'Orders', path: '/clickbank/orders', icon: ShoppingBag },
  { label: 'Postbacks', path: '/clickbank/postbacks', icon: ArrowDownToLine },
  { label: 'Settings', path: '/clickbank/settings', icon: Settings },
];

export function ClickBankLayout() {
  return (
    <PlatformLayout
      platform="clickbank"
      platformName="ClickBank"
      platformIcon={ShoppingBag}
      navItems={navItems}
    />
  );
}
