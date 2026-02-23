import React from 'react';
import { cn } from '../../lib/utils/cn';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../lib/constants';
import type { OrderSummary } from '../../types';

interface OrderRowProps {
  order: OrderSummary;
  isSelected?: boolean;
  onClick: (id: string) => void;
}

function OrderRowBase({ order, isSelected = false, onClick }: OrderRowProps) {
  const status = STATUS_CONFIG[order.status];
  const priority = PRIORITY_CONFIG[order.priority];

  return (
    <button
      type="button"
      onClick={() => onClick(order.id)}
      className={cn(
        'w-full grid grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_1fr_1fr_1fr] items-center gap-3',
        'px-4 py-3 rounded-lg border text-left transition-colors',
        isSelected
          ? 'bg-orange-50 border-orange-200'
          : 'bg-white border-slate-200 hover:bg-slate-50'
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-orange-600 truncate">{order.orderNumber}</p>
      </div>

      <div className="min-w-0">
        <p className="text-sm text-slate-800 truncate">{order.customerName}</p>
      </div>

      <div>
        <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs border', status.bgColor, status.color, status.borderColor)}>
          {status.label}
        </span>
      </div>

      <div>
        <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs border', priority.bgColor, priority.color, priority.borderColor)}>
          {priority.label}
        </span>
      </div>

      <div>
        <p className="text-sm text-slate-700">
          {order.currency} {order.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="min-w-0">
        <p className="text-sm text-slate-600 truncate">{order.region}</p>
      </div>
    </button>
  );
}

export const OrderRow = React.memo(OrderRowBase, (prev, next) => {
  return (
    prev.isSelected === next.isSelected
    && prev.order.id === next.order.id
    && prev.order.status === next.order.status
    && prev.order.priority === next.order.priority
    && prev.order.amount === next.order.amount
    && prev.order.createdAt === next.order.createdAt
    && prev.order.customerName === next.order.customerName
    && prev.order.region === next.order.region
  );
});
