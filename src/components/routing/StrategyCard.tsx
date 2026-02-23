import { formatDuration, intervalToDuration } from 'date-fns';
import type { RoutingStrategyResult } from '../../types';

interface StrategyCardProps {
  result: RoutingStrategyResult;
}

const accentByStrategy: Record<RoutingStrategyResult['strategyUsed'], string> = {
  Fastest: 'border-t-orange-500 text-orange-700',
  Cheapest: 'border-t-green-500 text-green-700',
  Balanced: 'border-t-blue-500 text-blue-700',
};

function durationLabel(hhmmss: string): string {
  const [h, m, s] = hhmmss.split(':').map((n) => Number(n || 0));
  const seconds = h * 3600 + m * 60 + s;
  return formatDuration(intervalToDuration({ start: 0, end: seconds * 1000 })) || hhmmss;
}

export default function StrategyCard({ result }: StrategyCardProps) {
  const accent = accentByStrategy[result.strategyUsed];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 border-t-4 p-5 ${accent}`}>
      <h3 className="text-lg font-semibold">{result.strategyUsed}</h3>
      <p className="text-xs text-slate-500 mt-1">
        Carrier: <span className="font-medium text-slate-700">{result.carrierName ?? result.carrierCode ?? 'N/A'}</span>
      </p>

      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p>
          Cost: <span className="font-semibold">{result.estimatedCost.amount.toFixed(2)} {result.estimatedCost.currency}</span>
        </p>
        <p>
          Duration: <span className="font-semibold">{durationLabel(result.estimatedDuration)}</span>
        </p>
        <p>
          Distance: <span className="font-semibold">{result.distanceKm.toFixed(1)} km</span>
        </p>
      </div>
    </div>
  );
}
