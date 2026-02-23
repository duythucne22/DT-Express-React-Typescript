import { create } from 'zustand';
import type {
  OrderSummary,
  OrderFilters,
  SortConfig,
  SortDirection,
  SortField,
  OrderStatus,
  OrderPriority,
  UserRole,
} from '../types';

const STATUS_ORDER: Record<OrderStatus, number> = {
  Created: 0,
  Confirmed: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: 4,
};

const PRIORITY_ORDER: Record<OrderPriority, number> = {
  Low: 0,
  Normal: 1,
  High: 2,
  Urgent: 3,
};

const defaultFilters: OrderFilters = {
  status: [],
  priority: [],
  region: [],
  serviceLevel: [],
  search: '',
  dateRange: {},
};

const defaultSort: SortConfig = {
  field: 'createdAt',
  direction: 'desc',
};

function compareByField(a: OrderSummary, b: OrderSummary, field: SortField): number {
  switch (field) {
    case 'orderNumber':
      return a.orderNumber.localeCompare(b.orderNumber);
    case 'customerName':
      return a.customerName.localeCompare(b.customerName);
    case 'status':
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    case 'priority':
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    case 'serviceLevel':
      return a.serviceLevel.localeCompare(b.serviceLevel);
    case 'amount':
      return a.amount - b.amount;
    case 'region':
      return a.region.localeCompare(b.region);
    case 'updatedAt':
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    case 'createdAt':
    default:
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }
}

function isWithinRange(valueIso: string, start?: string, end?: string) {
  const value = new Date(valueIso).getTime();
  if (Number.isNaN(value)) return false;

  if (start) {
    const startValue = new Date(start).getTime();
    if (!Number.isNaN(startValue) && value < startValue) return false;
  }

  if (end) {
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    const endValue = endDate.getTime();
    if (!Number.isNaN(endValue) && value > endValue) return false;
  }

  return true;
}

export function filterAndSortOrders(
  ordersMap: Map<string, OrderSummary>,
  filters: OrderFilters,
  sort: SortConfig,
  role?: UserRole,
  userId?: string
): OrderSummary[] {
  let items = Array.from(ordersMap.values());

  if (role === 'Driver' && userId) {
    items = items.filter((order) => order.assignedDriverId === userId);
  } else if (role === 'Viewer' && userId) {
    items = items.filter((order) => order.customerId === userId);
  }

  if (filters.status?.length) {
    const set = new Set(filters.status);
    items = items.filter((order) => set.has(order.status));
  }

  if (filters.priority?.length) {
    const set = new Set(filters.priority);
    items = items.filter((order) => set.has(order.priority));
  }

  if (filters.region?.length) {
    const set = new Set(filters.region);
    items = items.filter((order) => set.has(order.region));
  }

  if (filters.serviceLevel?.length) {
    const set = new Set(filters.serviceLevel);
    items = items.filter((order) => set.has(order.serviceLevel));
  }

  if (filters.search?.trim()) {
    const keyword = filters.search.trim().toLowerCase();
    items = items.filter((order) =>
      order.orderNumber.toLowerCase().includes(keyword)
      || order.customerName.toLowerCase().includes(keyword)
      || order.region.toLowerCase().includes(keyword)
    );
  }

  if (filters.dateRange?.start || filters.dateRange?.end) {
    items = items.filter((order) =>
      isWithinRange(order.createdAt, filters.dateRange?.start, filters.dateRange?.end)
    );
  }

  const directionFactor = sort.direction === 'asc' ? 1 : -1;
  items.sort((a, b) => compareByField(a, b, sort.field) * directionFactor);

  return items;
}

interface OrdersState {
  orders: Map<string, OrderSummary>;
  filters: OrderFilters;
  sort: SortConfig;
  selectedOrderId: string | null;

  setOrders: (orders: OrderSummary[]) => void;
  upsertOrder: (order: OrderSummary) => void;
  removeOrder: (orderId: string) => void;
  setSelectedOrder: (orderId: string | null) => void;

  setFilters: (next: Partial<OrderFilters>) => void;
  clearFilters: () => void;

  setSort: (field: SortField, direction?: SortDirection) => void;

  getOrder: (orderId: string) => OrderSummary | undefined;
  getFilteredSorted: (role?: UserRole, userId?: string) => OrderSummary[];
  reset: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: new Map<string, OrderSummary>(),
  filters: defaultFilters,
  sort: defaultSort,
  selectedOrderId: null,

  setOrders: (orders) => {
    const map = new Map<string, OrderSummary>();
    for (const order of orders) {
      map.set(order.id, order);
    }
    set({ orders: map });
  },

  upsertOrder: (order) => {
    set((state) => {
      const next = new Map(state.orders);
      next.set(order.id, order);
      return { orders: next };
    });
  },

  removeOrder: (orderId) => {
    set((state) => {
      const next = new Map(state.orders);
      next.delete(orderId);
      return { orders: next };
    });
  },

  setSelectedOrder: (orderId) => set({ selectedOrderId: orderId }),

  setFilters: (next) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...next,
      },
    }));
  },

  clearFilters: () => set({ filters: defaultFilters }),

  setSort: (field, direction) => {
    set((state) => ({
      sort: {
        field,
        direction:
          direction
          ?? (state.sort.field === field
            ? (state.sort.direction === 'asc' ? 'desc' : 'asc')
            : 'asc'),
      },
    }));
  },

  getOrder: (orderId) => get().orders.get(orderId),

  getFilteredSorted: (role, userId) =>
    filterAndSortOrders(get().orders, get().filters, get().sort, role, userId),

  reset: () => set({
    orders: new Map<string, OrderSummary>(),
    filters: defaultFilters,
    sort: defaultSort,
    selectedOrderId: null,
  }),
}));
