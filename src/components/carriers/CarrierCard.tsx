import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, Truck } from 'lucide-react';
import QuoteForm from './QuoteForm';
import type { CarrierBookRequest, CarrierListItem, CarrierQuoteRequest } from '../../types';

interface CarrierCardProps {
  carrier: CarrierListItem;
  onGetQuote: (quotePayload: CarrierQuoteRequest, bookPayload: CarrierBookRequest) => void;
  isGettingQuotes: boolean;
}

export default function CarrierCard({ carrier, onGetQuote, isGettingQuotes }: CarrierCardProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{carrier.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Code: {carrier.carrierCode}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          Get Quote
          {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className={`w-4 h-4 ${idx < Math.round(carrier.rating) ? 'fill-current' : 'text-slate-300'}`} />
          ))}
          <span className="ml-2 text-xs text-slate-500">{carrier.rating.toFixed(1)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {carrier.services.map((service) => (
            <span
              key={service}
              className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200"
            >
              {service}
            </span>
          ))}
        </div>

        <p className="text-sm text-slate-600">
          Price Range: <span className="font-medium text-slate-900">{carrier.priceRange}</span>
        </p>
      </div>

      {showForm && (
        <QuoteForm
          onSubmit={onGetQuote}
          isSubmitting={isGettingQuotes}
        />
      )}
    </div>
  );
}
