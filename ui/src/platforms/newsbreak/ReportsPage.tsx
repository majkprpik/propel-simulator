import { useQuery } from '@tanstack/react-query';
import { platformFetch } from '../../lib/api';
import { DataTable, type Column } from '../../components/DataTable';
import { formatCurrency } from '../../lib/utils';
import type { NewsBreakReportItem } from '@shared/types/api-contracts';

const columns: Column<NewsBreakReportItem>[] = [
  { key: 'campaign_id', label: 'Campaign ID' },
  { key: 'campaign_name', label: 'Campaign' },
  { key: 'impressions', label: 'Impressions', render: (v) => Number(v).toLocaleString() },
  { key: 'clicks', label: 'Clicks', render: (v) => Number(v).toLocaleString() },
  { key: 'spend', label: 'Spend', render: (v) => formatCurrency(Number(v)) },
  { key: 'conversions', label: 'Conversions', render: (v) => Number(v).toLocaleString() },
];

export function NewsBreakReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['newsbreak', 'reports'],
    queryFn: () => platformFetch<{ data: NewsBreakReportItem[] }>('newsbreak', '/reports'),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Reports</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <DataTable columns={columns} data={(data?.data ?? []) as NewsBreakReportItem[]} />
      )}
    </div>
  );
}
