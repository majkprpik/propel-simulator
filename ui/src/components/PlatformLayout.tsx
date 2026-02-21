import { Outlet } from 'react-router-dom';
import { Sidebar, type NavItem } from './Sidebar';
import type { LucideIcon } from 'lucide-react';
import type { Platform } from '@shared/types/database';

export type { Platform };

interface PlatformLayoutProps {
  platform?: Platform;
  platformName: string;
  platformIcon: LucideIcon;
  navItems: NavItem[];
}

const platformBackgrounds: Record<Platform, string> = {
  facebook: 'bg-gradient-to-br from-facebook/5 via-background to-background',
  google: 'bg-gradient-to-br from-google/5 via-background to-background',
  tiktok: 'bg-gradient-to-br from-tiktok/5 via-background to-background',
  snapchat: 'bg-gradient-to-br from-snapchat/5 via-background to-background',
  newsbreak: 'bg-gradient-to-br from-newsbreak/5 via-background to-background',
  everflow: 'bg-gradient-to-br from-everflow/5 via-background to-background',
  shopify: 'bg-gradient-to-br from-shopify/5 via-background to-background',
  clickbank: 'bg-gradient-to-br from-clickbank/5 via-background to-background',
  cake: 'bg-gradient-to-br from-cake/5 via-background to-background',
  hasoffers: 'bg-gradient-to-br from-hasoffers/5 via-background to-background',
};

export function PlatformLayout({ platform, platformName, platformIcon, navItems }: PlatformLayoutProps) {
  const bg = platform ? platformBackgrounds[platform] : 'bg-background';
  return (
    <div className={`flex h-screen ${bg}`}>
      <Sidebar platform={platform} platformName={platformName} platformIcon={platformIcon} navItems={navItems} />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
