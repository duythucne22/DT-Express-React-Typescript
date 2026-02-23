import StrategyCard from './StrategyCard';
import type { RoutingStrategyResult } from '../../types';

interface RouteComparisonProps {
  results: RoutingStrategyResult[];
}

export default function RouteComparison({ results }: RouteComparisonProps) {
  if (!results.length) return null;

  const sorted = [...results].sort((a, b) => {
    const order = { Fastest: 0, Cheapest: 1, Balanced: 2 };
    return order[a.strategyUsed] - order[b.strategyUsed];
  });

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Strategy Comparison</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.map((result) => (
          <StrategyCard key={result.strategyUsed} result={result} />
        ))}
      </div>
    </section>
  );
}
