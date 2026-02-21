import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Facebook
import { FacebookLayout } from './platforms/facebook/FacebookLayout';
import { FacebookDashboard } from './platforms/facebook/DashboardPage';
import { FacebookCampaigns } from './platforms/facebook/CampaignsPage';
import { FacebookAdSets } from './platforms/facebook/AdSetsPage';
import { FacebookAds } from './platforms/facebook/AdsPage';
import { FacebookPixels } from './platforms/facebook/PixelsPage';
import { FacebookEvents } from './platforms/facebook/EventsPage';
import { FacebookSettings } from './platforms/facebook/SettingsPage';
import { FacebookFeed } from './platforms/facebook/FeedPage';

// Google
import { GoogleLayout } from './platforms/google/GoogleLayout';
import { GoogleDashboard } from './platforms/google/DashboardPage';
import { GoogleCampaigns } from './platforms/google/CampaignsPage';
import { GoogleAdGroups } from './platforms/google/AdGroupsPage';
import { GoogleAds } from './platforms/google/AdsPage';
import { GoogleConversionActions } from './platforms/google/ConversionActionsPage';
import { GoogleEvents } from './platforms/google/EventsPage';
import { GoogleSettings } from './platforms/google/SettingsPage';
import { GoogleFeed } from './platforms/google/FeedPage';

// TikTok
import { TikTokLayout } from './platforms/tiktok/TikTokLayout';
import { TikTokDashboard } from './platforms/tiktok/DashboardPage';
import { TikTokCampaigns } from './platforms/tiktok/CampaignsPage';
import { TikTokAdGroups } from './platforms/tiktok/AdGroupsPage';
import { TikTokAds } from './platforms/tiktok/AdsPage';
import { TikTokPixels } from './platforms/tiktok/PixelsPage';
import { TikTokEvents } from './platforms/tiktok/EventsPage';
import { TikTokSettings } from './platforms/tiktok/SettingsPage';
import { TikTokFeed } from './platforms/tiktok/FeedPage';

// NewsBreak
import { NewsBreakLayout } from './platforms/newsbreak/NewsBreakLayout';
import { NewsBreakDashboard } from './platforms/newsbreak/DashboardPage';
import { NewsBreakCampaigns } from './platforms/newsbreak/CampaignsPage';
import { NewsBreakAds } from './platforms/newsbreak/AdsPage';
import { NewsBreakReports } from './platforms/newsbreak/ReportsPage';
import { NewsBreakEvents } from './platforms/newsbreak/EventsPage';
import { NewsBreakSettings } from './platforms/newsbreak/SettingsPage';
import { NewsBreakFeed } from './platforms/newsbreak/FeedPage';

// Snapchat
import { SnapchatLayout } from './platforms/snapchat/SnapchatLayout';
import { SnapchatDashboard } from './platforms/snapchat/DashboardPage';
import { SnapchatCampaigns } from './platforms/snapchat/CampaignsPage';
import { SnapchatAdGroups } from './platforms/snapchat/AdGroupsPage';
import { SnapchatAds } from './platforms/snapchat/AdsPage';
import { SnapchatPixels } from './platforms/snapchat/PixelsPage';
import { SnapchatEvents } from './platforms/snapchat/EventsPage';
import { SnapchatSettings } from './platforms/snapchat/SettingsPage';
import { SnapchatFeed } from './platforms/snapchat/FeedPage';

// Everflow
import { EverflowLayout } from './platforms/everflow/EverflowLayout';
import { EverflowDashboard } from './platforms/everflow/EverflowDashboard';
import { EverflowOffersPage } from './platforms/everflow/EverflowOffersPage';
import { EverflowClicksPage } from './platforms/everflow/EverflowClicksPage';
import { EverflowPostbacksPage } from './platforms/everflow/EverflowPostbacksPage';
import { EverflowSettingsPage } from './platforms/everflow/EverflowSettingsPage';

// Admin
import { AdminLayout } from './admin/AdminLayout';
import { AdminOverview } from './admin/OverviewPage';
import { TrafficGenerator } from './admin/TrafficGeneratorPage';
import { PostbackConfig } from './admin/PostbackConfigPage';
import { ScenarioRunner } from './admin/ScenarioRunnerPage';
import { DatabasePage } from './admin/DatabasePage';

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    path: '/facebook',
    element: <FacebookLayout />,
    children: [
      { path: 'dashboard', element: <FacebookDashboard /> },
      { path: 'feed', element: <FacebookFeed /> },
      { path: 'campaigns', element: <FacebookCampaigns /> },
      { path: 'ad-sets', element: <FacebookAdSets /> },
      { path: 'ads', element: <FacebookAds /> },
      { path: 'pixels', element: <FacebookPixels /> },
      { path: 'events', element: <FacebookEvents /> },
      { path: 'settings', element: <FacebookSettings /> },
    ],
  },
  {
    path: '/google',
    element: <GoogleLayout />,
    children: [
      { path: 'dashboard', element: <GoogleDashboard /> },
      { path: 'feed', element: <GoogleFeed /> },
      { path: 'campaigns', element: <GoogleCampaigns /> },
      { path: 'ad-groups', element: <GoogleAdGroups /> },
      { path: 'ads', element: <GoogleAds /> },
      { path: 'conversion-actions', element: <GoogleConversionActions /> },
      { path: 'events', element: <GoogleEvents /> },
      { path: 'settings', element: <GoogleSettings /> },
    ],
  },
  {
    path: '/tiktok',
    element: <TikTokLayout />,
    children: [
      { path: 'dashboard', element: <TikTokDashboard /> },
      { path: 'feed', element: <TikTokFeed /> },
      { path: 'campaigns', element: <TikTokCampaigns /> },
      { path: 'ad-groups', element: <TikTokAdGroups /> },
      { path: 'ads', element: <TikTokAds /> },
      { path: 'pixels', element: <TikTokPixels /> },
      { path: 'events', element: <TikTokEvents /> },
      { path: 'settings', element: <TikTokSettings /> },
    ],
  },
  {
    path: '/newsbreak',
    element: <NewsBreakLayout />,
    children: [
      { path: 'dashboard', element: <NewsBreakDashboard /> },
      { path: 'feed', element: <NewsBreakFeed /> },
      { path: 'campaigns', element: <NewsBreakCampaigns /> },
      { path: 'ads', element: <NewsBreakAds /> },
      { path: 'reports', element: <NewsBreakReports /> },
      { path: 'events', element: <NewsBreakEvents /> },
      { path: 'settings', element: <NewsBreakSettings /> },
    ],
  },
  {
    path: '/snapchat',
    element: <SnapchatLayout />,
    children: [
      { path: 'dashboard', element: <SnapchatDashboard /> },
      { path: 'feed', element: <SnapchatFeed /> },
      { path: 'campaigns', element: <SnapchatCampaigns /> },
      { path: 'ad-groups', element: <SnapchatAdGroups /> },
      { path: 'ads', element: <SnapchatAds /> },
      { path: 'pixels', element: <SnapchatPixels /> },
      { path: 'events', element: <SnapchatEvents /> },
      { path: 'settings', element: <SnapchatSettings /> },
    ],
  },
  {
    path: '/everflow',
    element: <EverflowLayout />,
    children: [
      { path: 'dashboard', element: <EverflowDashboard /> },
      { path: 'offers', element: <EverflowOffersPage /> },
      { path: 'clicks', element: <EverflowClicksPage /> },
      { path: 'postbacks', element: <EverflowPostbacksPage /> },
      { path: 'settings', element: <EverflowSettingsPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'traffic-generator', element: <TrafficGenerator /> },
      { path: 'postback-config', element: <PostbackConfig /> },
      { path: 'scenarios', element: <ScenarioRunner /> },
      { path: 'database', element: <DatabasePage /> },
    ],
  },
]);
