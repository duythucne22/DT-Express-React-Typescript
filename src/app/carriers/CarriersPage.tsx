import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useCarriers } from '../../hooks/useCarriers';
import { useAuthStore } from '../../stores/authStore';
import CarrierCard from '../../components/carriers/CarrierCard';
import QuoteComparison from '../../components/carriers/QuoteComparison';
import type { CarrierBookRequest, CarrierQuoteRequest } from '../../types';

export default function CarriersPage() {
  const { hasPermission, user } = useAuthStore();
  const role = user?.role ?? 'Viewer';

  const {
    carriers,
    isLoading,
    isFetching,
    error,
    refetch,
    getQuotes,
    isGettingQuotes,
    bookCarrier,
    isBooking,
    quoteResult,
  } = useCarriers();

  const [lastBookPayload, setLastBookPayload] = useState<CarrierBookRequest | null>(null);

  const canBook = hasPermission('canBookCarrier');

  const handleGetQuote = async (quotePayload: CarrierQuoteRequest, bookPayload: CarrierBookRequest) => {
    try {
      await getQuotes(quotePayload);
      setLastBookPayload(bookPayload);
      toast.success('Quotes loaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get quotes';
      toast.error(message);
    }
  };

  const handleBook = async (code: string, payload: CarrierBookRequest) => {
    try {
      const booked = await bookCarrier(code, payload);
      toast.success(`Booked ${booked.carrierCode} successfully. Tracking: ${booked.trackingNumber}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to book carrier';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Carriers</h1>
          <p className="text-sm text-slate-500 mt-0.5">Compare carrier quotes and book shipments.</p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load carriers. Try refresh.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : carriers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No carriers available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {carriers.map((carrier) => (
            <CarrierCard
              key={carrier.carrierCode}
              carrier={carrier}
              onGetQuote={handleGetQuote}
              isGettingQuotes={isGettingQuotes}
            />
          ))}
        </div>
      )}

      {quoteResult && (
        <QuoteComparison
          quoteResult={quoteResult}
          role={role}
          canBook={canBook}
          onBook={handleBook}
          lastBookPayload={lastBookPayload}
          isBooking={isBooking}
        />
      )}
    </div>
  );
}
