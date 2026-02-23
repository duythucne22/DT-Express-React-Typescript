import type { CarrierBookRequest, CarrierQuoteResponse, UserRole } from '../../types';

interface QuoteComparisonProps {
  quoteResult: CarrierQuoteResponse;
  role: UserRole;
  canBook: boolean;
  onBook: (code: string, payload: CarrierBookRequest) => void;
  lastBookPayload: CarrierBookRequest | null;
  isBooking: boolean;
}

export default function QuoteComparison({
  quoteResult,
  canBook,
  onBook,
  lastBookPayload,
  isBooking,
}: QuoteComparisonProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Quote Comparison</h2>
        <span className="text-xs text-slate-500">
          Recommended: <span className="font-medium text-slate-700">{quoteResult.recommended.carrierCode}</span> ({quoteResult.recommended.reason})
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left px-4 py-2 border-b border-slate-200">Carrier</th>
              <th className="text-left px-4 py-2 border-b border-slate-200">Price</th>
              <th className="text-left px-4 py-2 border-b border-slate-200">Estimated Days</th>
              <th className="text-left px-4 py-2 border-b border-slate-200">Service Level</th>
              <th className="text-left px-4 py-2 border-b border-slate-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {quoteResult.quotes.map((quote) => (
              <tr key={quote.carrierCode} className="hover:bg-slate-50">
                <td className="px-4 py-2 border-b border-slate-100 font-medium text-slate-800">{quote.carrierCode}</td>
                <td className="px-4 py-2 border-b border-slate-100">{quote.price.amount.toFixed(2)} {quote.price.currency}</td>
                <td className="px-4 py-2 border-b border-slate-100">{quote.estimatedDays}</td>
                <td className="px-4 py-2 border-b border-slate-100">{quote.serviceLevel}</td>
                <td className="px-4 py-2 border-b border-slate-100">
                  {canBook ? (
                    <button
                      type="button"
                      disabled={!lastBookPayload || isBooking}
                      onClick={() => lastBookPayload && onBook(quote.carrierCode, lastBookPayload)}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isBooking ? 'Booking...' : 'Book'}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Admin/Dispatcher only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
