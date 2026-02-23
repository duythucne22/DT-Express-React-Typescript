import React, { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { OrderRow } from './OrderRow';
import type { OrderSummary } from '../../types';

interface VirtualizedOrderListProps {
  orders: OrderSummary[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  isLoading?: boolean;
}

const HEADER = ['Order #', 'Customer', 'Status', 'Priority', 'Amount', 'Date', 'Region'];

export function VirtualizedOrderList({ orders, selectedOrderId, onSelectOrder, isLoading }: VirtualizedOrderListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 62,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  const emptyState = useMemo(() => {
    if (isLoading) return 'Loading orders...';
    return 'No orders found for current filters.';
  }, [isLoading]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_1fr_1fr_1fr] gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
        {HEADER.map((label) => (
          <p key={label} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
        ))}
      </div>

      <div ref={parentRef} className="h-[65vh] overflow-auto custom-scrollbar">
        {orders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            {emptyState}
          </div>
        ) : (
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            {virtualItems.map((virtualRow) => {
              const order = orders[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="px-2 py-1"
                >
                  <OrderRow
                    order={order}
                    isSelected={selectedOrderId === order.id}
                    onClick={onSelectOrder}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
