interface StatsCardProps {
  label: string;
  value: string | number;
  change?: number;
}

export function StatsCard({ label, value, change }: StatsCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      {change != null && (
        <p
          className={`mt-1 text-sm font-medium ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(1)}%
        </p>
      )}
    </div>
  );
}
