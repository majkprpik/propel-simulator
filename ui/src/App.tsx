import { Link } from 'react-router-dom';
import {
  Facebook,
  Chrome,
  Music,
  Newspaper,
  Ghost,
  Network,
  Store,
  ShoppingBag,
  Layers,
  BarChart3,
  Settings
} from 'lucide-react';

const platforms = [
  { name: 'Facebook', path: '/facebook', icon: Facebook, subtitle: 'Mock API' },
  { name: 'Google', path: '/google', icon: Chrome, subtitle: 'Mock API' },
  { name: 'TikTok', path: '/tiktok', icon: Music, subtitle: 'Mock API' },
  { name: 'NewsBreak', path: '/newsbreak', icon: Newspaper, subtitle: 'Mock API' },
  { name: 'Snapchat', path: '/snapchat', icon: Ghost, subtitle: 'Mock API' },
  { name: 'Everflow', path: '/everflow', icon: Network, subtitle: 'Affiliate Network' },
  { name: 'Shopify', path: '/shopify', icon: Store, subtitle: 'eCommerce Webhooks' },
  { name: 'ClickBank', path: '/clickbank', icon: ShoppingBag, subtitle: 'Affiliate Network' },
  { name: 'Cake', path: '/cake', icon: Layers, subtitle: 'Affiliate Network' },
  { name: 'HasOffers', path: '/hasoffers', icon: BarChart3, subtitle: 'Affiliate Network' },
];

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Propel Simulator</h1>
        <p className="text-muted-foreground">Mock ad platform APIs for testing</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => (
          <Link
            key={p.path}
            to={`${p.path}/dashboard`}
            className="group flex items-center gap-4 rounded-lg border bg-card px-6 py-5 transition-all hover:border-primary/50 hover:bg-accent"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <p.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.subtitle}</p>
            </div>
          </Link>
        ))}

        <Link
          to="/admin"
          className="group flex items-center gap-4 rounded-lg border bg-card px-6 py-5 transition-all hover:border-primary/50 hover:bg-accent"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Admin</p>
            <p className="text-sm text-muted-foreground">Controls & config</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
