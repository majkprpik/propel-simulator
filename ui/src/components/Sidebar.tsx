import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Facebook, Chrome, Music, Camera, Newspaper, Network, ShoppingBag, Store, Layers, BarChart3, ChevronDown, Home } from 'lucide-react';
import type { Platform } from './PlatformLayout';

export interface NavItem {
  label: string;
  path: string;
  icon?: LucideIcon;
}

interface SidebarProps {
  platform?: Platform;
  platformName: string;
  platformIcon: LucideIcon;
  navItems: NavItem[];
}

const platformHeaderStyles: Record<Platform, string> = {
  facebook: 'bg-facebook/10 hover:bg-facebook/20 border-facebook/20',
  google: 'bg-google/10 hover:bg-google/20 border-google/20',
  tiktok: 'bg-tiktok/10 hover:bg-tiktok/20 border-tiktok/20',
  snapchat: 'bg-snapchat/10 hover:bg-snapchat/20 border-snapchat/20',
  newsbreak: 'bg-newsbreak/10 hover:bg-newsbreak/20 border-newsbreak/20',
  everflow: 'bg-everflow/10 hover:bg-everflow/20 border-everflow/20',
  shopify: 'bg-shopify/10 hover:bg-shopify/20 border-shopify/20',
  clickbank: 'bg-clickbank/10 hover:bg-clickbank/20 border-clickbank/20',
  cake: 'bg-cake/10 hover:bg-cake/20 border-cake/20',
  hasoffers: 'bg-hasoffers/10 hover:bg-hasoffers/20 border-hasoffers/20',
};

const platformActiveStyles: Record<Platform, string> = {
  facebook: 'bg-facebook text-white',
  google: 'bg-google text-white',
  tiktok: 'bg-tiktok text-gray-900',
  snapchat: 'bg-snapchat text-gray-900',
  newsbreak: 'bg-newsbreak text-white',
  everflow: 'bg-everflow text-white',
  shopify: 'bg-shopify text-white',
  clickbank: 'bg-clickbank text-gray-900',
  cake: 'bg-cake text-white',
  hasoffers: 'bg-hasoffers text-white',
};

const platforms = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Facebook', path: '/facebook/dashboard', icon: Facebook },
  { name: 'Google', path: '/google/dashboard', icon: Chrome },
  { name: 'TikTok', path: '/tiktok/dashboard', icon: Music },
  { name: 'Snapchat', path: '/snapchat/dashboard', icon: Camera },
  { name: 'NewsBreak', path: '/newsbreak/dashboard', icon: Newspaper },
  { name: 'Everflow', path: '/everflow/dashboard', icon: Network },
  { name: 'Shopify', path: '/shopify/dashboard', icon: Store },
  { name: 'ClickBank', path: '/clickbank/dashboard', icon: ShoppingBag },
  { name: 'Cake', path: '/cake/dashboard', icon: Layers },
  { name: 'HasOffers', path: '/hasoffers/dashboard', icon: BarChart3 },
];

export function Sidebar({ platform = 'facebook', platformName, platformIcon: PlatformIcon, navItems }: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="group flex h-screen w-16 flex-col border-r bg-card transition-all duration-200 hover:w-48">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={cn(
            "flex h-14 w-full items-center justify-center border-b px-3 transition-colors",
            platformHeaderStyles[platform]
          )}
        >
          <PlatformIcon className="h-5 w-5 shrink-0 group-hover:hidden" />
          <span className="hidden truncate text-sm font-semibold group-hover:flex group-hover:items-center group-hover:gap-2">
            {platformName}
            <ChevronDown className="h-3 w-3" />
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute left-16 top-0 z-50 w-48 rounded-md border bg-card shadow-lg">
            {platforms.map((platform) => (
              <button
                key={platform.path}
                onClick={() => {
                  navigate(platform.path);
                  setDropdownOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-accent first:rounded-t-md last:rounded-b-md',
                  platform.name === platformName && 'bg-muted font-semibold'
                )}
              >
                <platform.icon className="h-4 w-4" />
                {platform.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.endsWith('dashboard') || item.path === '/admin'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? platformActiveStyles[platform]
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
            <span className="truncate opacity-0 transition-opacity group-hover:opacity-100">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
