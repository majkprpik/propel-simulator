const scenarios = [
  { name: 'Full Click-to-Conversion Flow', description: 'Generate click, then fire conversion event' },
  { name: 'Multi-Platform Burst', description: 'Generate 100 events across all platforms simultaneously' },
  { name: 'Rate Limit Test', description: 'Enable rate limiting and verify 429 responses' },
  { name: 'Delayed Conversion', description: 'Click now, convert after 24h simulated delay' },
  { name: 'Duplicate Event Test', description: 'Send same event_id twice, verify deduplication' },
  { name: 'Invalid Pixel Test', description: 'Send events to non-existent pixel, verify error handling' },
];

export function ScenarioRunner() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Scenarios</h1>
      <div className="space-y-3">
        {scenarios.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between rounded-lg border border bg-card px-6 py-4"
          >
            <div>
              <p className="font-medium text-foreground">{s.name}</p>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
            <button
              disabled
              className="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
            >
              Run
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
