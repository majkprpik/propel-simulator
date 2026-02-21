import { PlatformLayout } from '../../components/PlatformLayout';
import type { NavItem } from '../../components/Sidebar';
import { LayoutDashboard, ShoppingCart, Webhook, Settings, Store } from 'lucide-react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/shopify/dashboard', icon: LayoutDashboard },
  { label: 'Orders', path: '/shopify/orders', icon: ShoppingCart },
  { label: 'Webhook Log', path: '/shopify/webhooks', icon: Webhook },
  { label: 'Settings', path: '/shopify/settings', icon: Settings },
];

export function ShopifyLayout() {
  return (
    <PlatformLayout
      platform="shopify"
      platformName="Shopify"
      platformIcon={Store}
      navItems={navItems}
    />
  );
}
