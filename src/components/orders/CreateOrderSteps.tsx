import type { Dispatch, SetStateAction } from 'react';
import Select from '../ui/Select';
import { cn } from '../../lib/utils/cn';
import type { ServiceLevel, WeightUnit } from '../../types';

export interface CreateOrderFormState {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  origin: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  destination: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    weight: {
      value: number;
      unit: WeightUnit;
    };
    dimensions: {
      lengthCm: number | '';
      widthCm: number | '';
      heightCm: number | '';
    };
  }>;
  serviceLevel: ServiceLevel;
}

export type StepErrors = Record<string, string>;

interface SharedProps {
  form: CreateOrderFormState;
  setForm: Dispatch<SetStateAction<CreateOrderFormState>>;
  errors: StepErrors;
}

const inputClass = (error?: string) =>
  cn(
    'w-full px-3 py-2 rounded-lg border bg-white text-slate-900',
    'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
    error ? 'border-red-500' : 'border-slate-300'
  );

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-red-600 mt-1">{message}</p> : null;

export function CustomerInfoStep({ form, setForm, errors }: SharedProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-600">Customer Name</label>
        <input
          className={inputClass(errors.customerName)}
          value={form.customerName}
          onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
          placeholder="张三"
        />
        <FieldError message={errors.customerName} />
      </div>

      <div>
        <label className="text-sm text-slate-600">Customer Phone</label>
        <input
          className={inputClass(errors.customerPhone)}
          value={form.customerPhone}
          onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
          placeholder="13812345678"
        />
        <FieldError message={errors.customerPhone} />
      </div>

      <div>
        <label className="text-sm text-slate-600">Customer Email (optional)</label>
        <input
          className={inputClass(errors.customerEmail)}
          value={form.customerEmail}
          onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
          placeholder="zhangsan@example.com"
        />
        <FieldError message={errors.customerEmail} />
      </div>
    </div>
  );
}

function AddressFields({
  title,
  base,
  value,
  setValue,
  errors,
}: {
  title: string;
  base: 'origin' | 'destination';
  value: CreateOrderFormState['origin'];
  setValue: (next: CreateOrderFormState['origin']) => void;
  errors: StepErrors;
}) {
  const keys: Array<keyof CreateOrderFormState['origin']> = ['street', 'city', 'province', 'postalCode', 'country'];
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keys.map((field) => {
          const key = `${base}.${field}`;
          return (
            <div key={key}>
              <label className="text-sm text-slate-600 capitalize">{field}</label>
              <input
                className={inputClass(errors[key])}
                value={value[field]}
                onChange={(e) => setValue({ ...value, [field]: e.target.value })}
              />
              <FieldError message={errors[key]} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AddressesStep({ form, setForm, errors }: SharedProps) {
  return (
    <div className="space-y-6">
      <AddressFields
        title="Origin Address"
        base="origin"
        value={form.origin}
        setValue={(next) => setForm((prev) => ({ ...prev, origin: next }))}
        errors={errors}
      />
      <AddressFields
        title="Destination Address"
        base="destination"
        value={form.destination}
        setValue={(next) => setForm((prev) => ({ ...prev, destination: next }))}
        errors={errors}
      />
    </div>
  );
}

const unitOptions = [
  { label: 'Kg', value: 'Kg' },
  { label: 'G', value: 'G' },
  { label: 'Jin', value: 'Jin' },
  { label: 'Lb', value: 'Lb' },
];

export function ItemsStep({ form, setForm, errors }: SharedProps) {
  const updateItem = (index: number, updater: (item: CreateOrderFormState['items'][number]) => CreateOrderFormState['items'][number]) => {
    setForm((prev) => {
      const next = [...prev.items];
      next[index] = updater(next[index]);
      return { ...prev, items: next };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          weight: { value: 1, unit: 'Kg' },
          dimensions: { lengthCm: '', widthCm: '', heightCm: '' },
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      {form.items.map((item, index) => (
        <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Item {index + 1}</h3>
            {form.items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)} className="text-sm text-red-600 hover:text-red-700">
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-600">Description</label>
            <input
              className={inputClass(errors[`items.${index}.description`] || errors[`items.${index}`])}
              value={item.description}
              onChange={(e) => updateItem(index, (current) => ({ ...current, description: e.target.value }))}
            />
            <FieldError message={errors[`items.${index}.description`] || errors[`items.${index}`]} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-slate-600">Quantity</label>
              <input
                type="number"
                min={1}
                className={inputClass(errors[`items.${index}.quantity`])}
                value={item.quantity}
                onChange={(e) => updateItem(index, (current) => ({ ...current, quantity: Number(e.target.value || 1) }))}
              />
              <FieldError message={errors[`items.${index}.quantity`]} />
            </div>
            <div>
              <label className="text-sm text-slate-600">Weight Value</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass(errors[`items.${index}.weight.value`])}
                value={item.weight.value}
                onChange={(e) => updateItem(index, (current) => ({
                  ...current,
                  weight: { ...current.weight, value: Number(e.target.value || 0) },
                }))}
              />
              <FieldError message={errors[`items.${index}.weight.value`]} />
            </div>
            <div>
              <label className="text-sm text-slate-600">Weight Unit</label>
              <Select
                value={item.weight.unit}
                options={unitOptions}
                onChange={(e) => updateItem(index, (current) => ({
                  ...current,
                  weight: { ...current.weight, unit: e.target.value as WeightUnit },
                }))}
                error={errors[`items.${index}.weight.unit`]}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-2">Dimensions (optional, all 3 required if used)</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                placeholder="Length"
                type="number"
                min={0}
                className={inputClass(errors[`items.${index}.dimensions.lengthCm`])}
                value={item.dimensions.lengthCm}
                onChange={(e) => updateItem(index, (current) => ({
                  ...current,
                  dimensions: { ...current.dimensions, lengthCm: e.target.value === '' ? '' : Number(e.target.value) },
                }))}
              />
              <input
                placeholder="Width"
                type="number"
                min={0}
                className={inputClass(errors[`items.${index}.dimensions.widthCm`])}
                value={item.dimensions.widthCm}
                onChange={(e) => updateItem(index, (current) => ({
                  ...current,
                  dimensions: { ...current.dimensions, widthCm: e.target.value === '' ? '' : Number(e.target.value) },
                }))}
              />
              <input
                placeholder="Height"
                type="number"
                min={0}
                className={inputClass(errors[`items.${index}.dimensions.heightCm`])}
                value={item.dimensions.heightCm}
                onChange={(e) => updateItem(index, (current) => ({
                  ...current,
                  dimensions: { ...current.dimensions, heightCm: e.target.value === '' ? '' : Number(e.target.value) },
                }))}
              />
            </div>
            <FieldError message={errors[`items.${index}.dimensions`] || errors[`items.${index}`]} />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
      >
        Add Item
      </button>
    </div>
  );
}

const serviceOptions = [
  { label: 'Express', value: 'Express' },
  { label: 'Standard', value: 'Standard' },
  { label: 'Economy', value: 'Economy' },
];

export function ReviewStep({ form, setForm, errors }: SharedProps) {
  return (
    <div className="space-y-4">
      <section className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Customer</h3>
        <p>{form.customerName} · {form.customerPhone}</p>
        <p>{form.customerEmail || 'No email'}</p>
      </section>

      <section className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Addresses</h3>
        <p><span className="font-medium">Origin:</span> {form.origin.street}, {form.origin.city}, {form.origin.province}, {form.origin.postalCode}, {form.origin.country}</p>
        <p className="mt-1"><span className="font-medium">Destination:</span> {form.destination.street}, {form.destination.city}, {form.destination.province}, {form.destination.postalCode}, {form.destination.country}</p>
      </section>

      <section className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Items</h3>
        <ul className="space-y-1">
          {form.items.map((item, idx) => (
            <li key={idx}>{idx + 1}. {item.description} · Qty {item.quantity} · {item.weight.value} {item.weight.unit}</li>
          ))}
        </ul>
      </section>

      <section>
        <label className="text-sm text-slate-600">Service Level</label>
        <Select
          value={form.serviceLevel}
          options={serviceOptions}
          onChange={(e) => setForm((prev) => ({ ...prev, serviceLevel: e.target.value as ServiceLevel }))}
          error={errors.serviceLevel}
        />
      </section>
    </div>
  );
}
