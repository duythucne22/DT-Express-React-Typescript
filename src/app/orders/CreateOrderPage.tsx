import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';
import { ROLE_PERMISSIONS } from '../../lib/constants';
import { useOrders } from '../../hooks/useOrders';
import { auditedOrdersApi } from '../../lib/audited/auditedOrdersApi';
// import { CreateOrderCommand } from '../../lib/patterns/cqrs/commands/CreateOrderCommand';
import {
  customerStepSchema,
  addressesStepSchema,
  itemsStepSchema,
  reviewStepSchema,
  zodErrorToFieldMap,
} from '../../lib/utils/validation';
import {
  CustomerInfoStep,
  AddressesStep,
  ItemsStep,
  ReviewStep,
  type CreateOrderFormState,
  type StepErrors,
} from '../../components/orders/CreateOrderSteps';
import type { CreateOrderRequest } from '../../types';

const STEPS = ['Customer', 'Addresses', 'Items', 'Review'] as const;

const initialState: CreateOrderFormState = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  origin: {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'CN',
  },
  destination: {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'CN',
  },
  items: [
    {
      description: '',
      quantity: 1,
      weight: { value: 1, unit: 'Kg' },
      dimensions: { lengthCm: '', widthCm: '', heightCm: '' },
    },
  ],
  serviceLevel: 'Standard',
};

function getItemDimensions(dimensions: CreateOrderFormState['items'][number]['dimensions']) {
  const values = [dimensions.lengthCm, dimensions.widthCm, dimensions.heightCm];
  const provided = values.filter((value) => value !== '');

  if (provided.length === 0) return null;
  if (provided.length < 3) return 'ALL_OR_NONE';

  return {
    lengthCm: Number(dimensions.lengthCm),
    widthCm: Number(dimensions.widthCm),
    heightCm: Number(dimensions.heightCm),
  };
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateOrderFormState>(initialState);
  const [errors, setErrors] = useState<StepErrors>({});

  const role = useAuthStore((s) => s.user?.role ?? 'Viewer');
  const { isCreating } = useOrders();
  const canCreate = ROLE_PERMISSIONS[role].canCreateOrder;

  const stepProgress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  const validateCurrentStep = () => {
    let validationResult:
      | ReturnType<typeof customerStepSchema.safeParse>
      | ReturnType<typeof addressesStepSchema.safeParse>
      | ReturnType<typeof itemsStepSchema.safeParse>
      | ReturnType<typeof reviewStepSchema.safeParse>;

    if (step === 0) {
      validationResult = customerStepSchema.safeParse({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
      });
    } else if (step === 1) {
      validationResult = addressesStepSchema.safeParse({
        origin: form.origin,
        destination: form.destination,
      });
    } else if (step === 2) {
      const parsedItems = form.items.map((item) => {
        const parsedDimensions = getItemDimensions(item.dimensions);
        return {
          ...item,
          dimensions: parsedDimensions === 'ALL_OR_NONE' ? null : parsedDimensions,
        };
      });

      validationResult = itemsStepSchema.safeParse({ items: parsedItems });

      const nextErrors = !validationResult.success ? zodErrorToFieldMap(validationResult.error) : {};
      parsedItems.forEach((item, index) => {
        if (item.dimensions === null) {
          const raw = form.items[index].dimensions;
          const hasPartial = [raw.lengthCm, raw.widthCm, raw.heightCm].some((v) => v !== '')
            && [raw.lengthCm, raw.widthCm, raw.heightCm].some((v) => v === '');
          if (hasPartial) {
            nextErrors[`items.${index}.dimensions`] = 'Please provide all 3 dimension values or leave all empty';
          }
        }
      });

      setErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    } else {
      validationResult = reviewStepSchema.safeParse({
        serviceLevel: form.serviceLevel,
      });
    }

    if (!validationResult.success) {
      setErrors(zodErrorToFieldMap(validationResult.error));
      return false;
    }

    setErrors({});
    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const submit = async () => {
    if (!validateCurrentStep()) return;

    const payload: CreateOrderRequest = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail || undefined,
      origin: form.origin,
      destination: form.destination,
      serviceLevel: form.serviceLevel,
      items: form.items.map((item) => {
        const parsedDimensions = getItemDimensions(item.dimensions);
        if (parsedDimensions === 'ALL_OR_NONE') {
          throw new Error('Invalid dimensions');
        }

        return {
          description: item.description,
          quantity: item.quantity,
          weight: item.weight,
          dimensions: parsedDimensions,
        };
      }),
    };

    try {
      // Option 1: Use audited API directly (with decorator)
      const created = await auditedOrdersApi.create(payload);
      
      // Option 2: Use CQRS Command (uncomment to test)
      // const command = new CreateOrderCommand(payload);
      // const created = await command.execute();
      
      toast.success('Order created successfully');
      navigate(`/orders/${created.orderId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      toast.error(message);
    }
  };

  if (!canCreate) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-900">Create Order</h1>
        <p className="text-slate-500 mt-2">You do not have permission to create orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-slate-900">Create Order</h1>
          <button
            type="button"
            onClick={() => navigate('/dashboard/orders')}
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            Back to Orders
          </button>
        </div>

        <div className="mt-5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${stepProgress}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-slate-600">
            {STEPS.map((label, index) => (
              <div key={label} className={index === step ? 'font-semibold text-orange-600' : ''}>
                {index + 1}. {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {step === 0 && <CustomerInfoStep form={form} setForm={setForm} errors={errors} />}
        {step === 1 && <AddressesStep form={form} setForm={setForm} errors={errors} />}
        {step === 2 && <ItemsStep form={form} setForm={setForm} errors={errors} />}
        {step === 3 && <ReviewStep form={form} setForm={setForm} errors={errors} />}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0 || isCreating}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50"
          >
            Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={isCreating}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={isCreating}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isCreating ? 'Submitting...' : 'Submit Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
