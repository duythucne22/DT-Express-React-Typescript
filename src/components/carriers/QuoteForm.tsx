import { useState } from 'react';
import Select from '../ui/Select';
import type { CarrierBookRequest, CarrierQuoteRequest, ServiceLevel, WeightUnit } from '../../types';

interface QuoteFormProps {
  defaultServiceLevel?: ServiceLevel;
  onSubmit: (quotePayload: CarrierQuoteRequest, bookPayload: CarrierBookRequest) => void;
  isSubmitting?: boolean;
}

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

export default function QuoteForm({ defaultServiceLevel = 'Standard', onSubmit, isSubmitting = false }: QuoteFormProps) {
  const [originStreet, setOriginStreet] = useState('浦东新区陆家嘴环路1000号');
  const [originCity, setOriginCity] = useState('上海');
  const [originProvince, setOriginProvince] = useState('Shanghai');
  const [originPostalCode, setOriginPostalCode] = useState('200120');

  const [destinationStreet, setDestinationStreet] = useState('朝阳区建国门外大街1号');
  const [destinationCity, setDestinationCity] = useState('北京');
  const [destinationProvince, setDestinationProvince] = useState('Beijing');
  const [destinationPostalCode, setDestinationPostalCode] = useState('100020');

  const [weightValue, setWeightValue] = useState(2.5);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('Kg');
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>(defaultServiceLevel);

  const [senderName, setSenderName] = useState('张三');
  const [senderPhone, setSenderPhone] = useState('13812345678');
  const [senderEmail, setSenderEmail] = useState('zhangsan@example.com');

  const [recipientName, setRecipientName] = useState('李四');
  const [recipientPhone, setRecipientPhone] = useState('13987654321');
  const [recipientEmail, setRecipientEmail] = useState('lisi@example.com');

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quotePayload: CarrierQuoteRequest = {
      origin: {
        street: originStreet,
        city: originCity,
        province: originProvince,
        postalCode: originPostalCode,
        country: 'CN',
      },
      destination: {
        street: destinationStreet,
        city: destinationCity,
        province: destinationProvince,
        postalCode: destinationPostalCode,
        country: 'CN',
      },
      weight: {
        value: Number(weightValue),
        unit: weightUnit,
      },
      serviceLevel,
    };

    const bookPayload: CarrierBookRequest = {
      ...quotePayload,
      sender: { name: senderName, phone: senderPhone, email: senderEmail },
      recipient: { name: recipientName, phone: recipientPhone, email: recipientEmail },
    };

    onSubmit(quotePayload, bookPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800">Origin</h4>
          <input className={inputClass} value={originStreet} onChange={(e) => setOriginStreet(e.target.value)} placeholder="Street" />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} value={originCity} onChange={(e) => setOriginCity(e.target.value)} placeholder="City" />
            <input className={inputClass} value={originProvince} onChange={(e) => setOriginProvince(e.target.value)} placeholder="Province" />
          </div>
          <input className={inputClass} value={originPostalCode} onChange={(e) => setOriginPostalCode(e.target.value)} placeholder="Postal code" />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800">Destination</h4>
          <input className={inputClass} value={destinationStreet} onChange={(e) => setDestinationStreet(e.target.value)} placeholder="Street" />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder="City" />
            <input className={inputClass} value={destinationProvince} onChange={(e) => setDestinationProvince(e.target.value)} placeholder="Province" />
          </div>
          <input className={inputClass} value={destinationPostalCode} onChange={(e) => setDestinationPostalCode(e.target.value)} placeholder="Postal code" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          <label className="text-xs text-slate-600">Weight Unit</label>
          <Select options={weightUnitOptions} value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as WeightUnit)} />
        </div>
        <div>
          <label className="text-xs text-slate-600">Service Level</label>
          <Select options={serviceLevelOptions} value={serviceLevel} onChange={(e) => setServiceLevel(e.target.value as ServiceLevel)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800">Sender</h4>
          <input className={inputClass} value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Name" />
          <input className={inputClass} value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="Phone" />
          <input className={inputClass} value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="Email" />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-800">Recipient</h4>
          <input className={inputClass} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Name" />
          <input className={inputClass} value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="Phone" />
          <input className={inputClass} value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Email" />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
        >
          {isSubmitting ? 'Loading Quotes...' : 'Get Quotes'}
        </button>
      </div>
    </form>
  );
}
