import type { OrderStatus } from '../../types';

const STEPS: OrderStatus[] = ['Created', 'Confirmed', 'Shipped', 'Delivered'];

function statusIndex(status: OrderStatus) {
  return STEPS.indexOf(status);
}

const getStatusMessage = (status: OrderStatus) => {
  if (status === 'Cancelled') {
    return 'This order has been cancelled and the workflow has stopped.';
  }

  if (status === 'Delivered') {
    return 'Order delivered. Everything is complete.';
  }

  return 'The order is on the move—check back for the next milestone.';
};

export function OrderTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const current = statusIndex(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';
  const progress = current >= 0 ? (current / (STEPS.length - 1)) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 rounded-full" />
        {!isCancelled && current >= 0 && (
          <div
            className="absolute top-4 left-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        )}

        <div className="relative grid grid-cols-4 gap-3 z-10">
          {STEPS.map((step, idx) => {
            const done = !isCancelled && idx < current;
            const now = !isCancelled && idx === current;

            return (
              <div key={step} className="flex flex-col items-center text-center">
                <div
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    done
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : now
                        ? 'border-orange-600 bg-white text-orange-600 animate-pulse'
                        : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {done ? '✓' : idx + 1}
                </div>
                <p
                  className={`mt-2 text-[10px] uppercase tracking-wide transition-colors duration-200 ${
                    done
                      ? 'text-slate-700'
                      : now
                        ? 'text-orange-600'
                        : 'text-slate-400'
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`rounded-lg p-4 border ${
          isCancelled ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200'
        }`}
      >
        <h3 className={`font-medium ${isCancelled ? 'text-red-800' : 'text-orange-800'}`}>
          Current Status: {currentStatus}
        </h3>
        <p className={`text-sm mt-1 ${isCancelled ? 'text-red-600' : 'text-orange-600'}`}>
          {getStatusMessage(currentStatus)}
        </p>
      </div>
    </div>
  );
}
