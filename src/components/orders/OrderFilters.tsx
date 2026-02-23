import React, { useEffect, useMemo, useState } from 'react';
import { Search, FilterX, CalendarDays } from 'lucide-react';
import { ORDER_STATUSES, ORDER_PRIORITIES } from '../../lib/constants';
import { cn } from '../../lib/utils/cn';
import type { OrderFilters, OrderStatus, OrderPriority } from '../../types';

interface OrderFiltersProps {
  filters: OrderFilters;
  onFilterChange: (next: Partial<OrderFilters>) => void;
  onClearFilters: () => void;
  orderCount: number;
  totalCount: number;
}

function ToggleChip<T extends string>({
  value,
  selected,
  onToggle,
}: {
  value: T;
  selected: boolean;
  onToggle: (value: T) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={cn(
        'px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
        selected
          ? 'bg-orange-50 border-orange-200 text-orange-700'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      )}
    >
      {value}
    </button>
  );
}

export function OrderFiltersBar({
  filters,
  onFilterChange,
  onClearFilters,
  orderCount,
  totalCount,
}: OrderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [showDatePopover, setShowDatePopover] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchInput.trim() });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onFilterChange]);

  const toggleStatus = (status: OrderStatus) => {
    const current = filters.status ?? [];
    const next = current.includes(status)
      ? current.filter((item) => item !== status)
      : [...current, status];
    onFilterChange({ status: next });
  };

  const togglePriority = (priority: OrderPriority) => {
    const current = filters.priority ?? [];
    const next = current.includes(priority)
      ? current.filter((item) => item !== priority)
      : [...current, priority];
    onFilterChange({ priority: next });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search?.trim()) count += 1;
    if (filters.status?.length) count += 1;
    if (filters.priority?.length) count += 1;
    if (filters.dateRange?.start || filters.dateRange?.end) count += 1;
    return count;
  }, [filters]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 min-w-[320px] flex-1">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order #, customer, region..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePopover((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              <CalendarDays className="w-4 h-4" />
              Date Range
            </button>

            {showDatePopover && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-20 space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange?.start ?? ''}
                    onChange={(e) => onFilterChange({ dateRange: { ...filters.dateRange, start: e.target.value || undefined } })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange?.end ?? ''}
                    onChange={(e) => onFilterChange({ dateRange: { ...filters.dateRange, end: e.target.value || undefined } })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{orderCount.toLocaleString()}</span> / {totalCount.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              onClearFilters();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            <FilterX className="w-4 h-4" />
            Clear{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
          {ORDER_STATUSES.map((status) => (
            <ToggleChip<OrderStatus>
              key={status}
              value={status}
              selected={(filters.status ?? []).includes(status)}
              onToggle={toggleStatus}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</span>
          {ORDER_PRIORITIES.map((priority) => (
            <ToggleChip<OrderPriority>
              key={priority}
              value={priority}
              selected={(filters.priority ?? []).includes(priority)}
              onToggle={togglePriority}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
