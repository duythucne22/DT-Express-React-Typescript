import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Select from '../../components/ui/Select';
import RouteComparison from '../../components/routing/RouteComparison';
import RouteMap from '../../components/routing/RouteMap';
import { useRouting } from '../../hooks/useRouting';
import type { RoutingCompareInput, ServiceLevel, WeightUnit } from '../../types';

const cityOptions = [
  { label: 'Shanghai', value: 'Shanghai' },
  { label: 'Beijing', value: 'Beijing' },
  { label: 'Guangzhou', value: 'Guangzhou' },
  { label: 'Shenzhen', value: 'Shenzhen' },
  { label: 'Chengdu', value: 'Chengdu' },
];

const serviceLevelOptions = [
  { label: 'Express', value: 'Express' },
  { label: 'Standard', value: 'Standard' },
  { label: 'Economy', value: 'Economy' },
];

const weightUnitOptions = [
  { label: 'Kg', value: 'Kg' },
  { label: 'G', value: 'G' },
  { label: 'Jin', value: 'Jin' },
  { label: 'Lb', value: 'Lb' },
];

export default function RoutingPage() {
  const { results, compareRoutes, isComparing } = useRouting();

  const [originCity, setOriginCity] = useState('Shanghai');
  const [destinationCity, setDestinationCity] = useState('Beijing');
  const [weightValue, setWeightValue] = useState(2.5);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('Kg');
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>('Express');

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500';

  const hasResults = results.length > 0;

  const bestByCost = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((min, item) =>
      item.estimatedCost.amount < min.estimatedCost.amount ? item : min
    );
  }, [results]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: RoutingCompareInput = {
      originCity,
      destinationCity,
      packageWeight: {
        value: Number(weightValue),
        unit: weightUnit,
      },
      serviceLevel,
    };

    try {
      await compareRoutes(payload);
      toast.success('Route strategies calculated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate routes';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Routing</h1>
        <p className="text-sm text-slate-500 mt-0.5">Compare Fastest, Cheapest, and Balanced route strategies.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-slate-600">Origin</label>
            <Select options={cityOptions} value={originCity} onChange={(e) => setOriginCity(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-slate-600">Destination</label>
            <Select options={cityOptions} value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-slate-600">Weight</label>
            <input
              type="number"
              min={0}
              step="0.1"
              className={inputClass}
              value={weightValue}
              onChange={(e) => setWeightValue(Number(e.target.value || 0))}
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Unit</label>
            <Select options={weightUnitOptions} value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as WeightUnit)} />
          </div>

          <div>
            <label className="text-xs text-slate-600">Service Level</label>
            <Select options={serviceLevelOptions} value={serviceLevel} onChange={(e) => setServiceLevel(e.target.value as ServiceLevel)} />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isComparing}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
          >
            {isComparing ? 'Calculating...' : 'Calculate Routes'}
          </button>
        </div>
      </form>

      {/* Interactive map showing all route strategies */}
      <RouteMap routes={results} />

      {hasResults && <RouteComparison results={results} />}

      {hasResults && bestByCost && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-base font-semibold text-slate-900">Best Cost Recommendation</h3>
          <p className="text-sm text-slate-600 mt-1">
            {bestByCost.strategyUsed} via {bestByCost.carrierName ?? bestByCost.carrierCode ?? 'N/A'} at {bestByCost.estimatedCost.amount.toFixed(2)} {bestByCost.estimatedCost.currency}.
          </p>
        </div>
      )}
    </div>
  );
}
