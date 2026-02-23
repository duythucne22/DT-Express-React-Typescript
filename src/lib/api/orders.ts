import apiClient, { unwrapResponse } from './index';
import type {
  AuditEntry,
  OrderSummary,
  OrderDetail,
  OrderFilters,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderTransitionResponse,
  OrderPriority,
  OrderStatus,
  ServiceLevel,
} from '../../types';

const MIN_LATENCY = 120;
const MAX_LATENCY = 420;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomLatency() {
  return Math.floor(Math.random() * (MAX_LATENCY - MIN_LATENCY + 1)) + MIN_LATENCY;
}

function maybeThrowMockFailure() {
  if (Math.random() < 0.05) {
    const error = new Error('Simulated network error');
    (error as Error & { code?: string }).code = 'MOCK_NETWORK_ERROR';
    throw error;
  }
}

function shouldUseMock() {
  return import.meta.env.VITE_API_MODE === 'mock';
}

function isNetworkError(error: unknown) {
  const candidate = error as { code?: string; message?: string; response?: unknown };
  return !candidate?.response || candidate?.code === 'ERR_NETWORK' || candidate?.message === 'Network Error';
}

const priorities: OrderPriority[] = ['Low', 'Normal', 'High', 'Urgent'];
const statuses: OrderStatus[] = ['Created', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const serviceLevels: ServiceLevel[] = ['Express', 'Standard', 'Economy'];
const regions = ['East China', 'South China', 'North China', 'West China', 'Central China'];

function pseudoRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function generateMockOrders(count = 10000): OrderSummary[] {
  const random = pseudoRandom(20260214);
  const baseDate = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const dayOffset = Math.floor(random() * 120);
    const timestamp = new Date(baseDate - dayOffset * 24 * 60 * 60 * 1000 - Math.floor(random() * 86400000)).toISOString();
    const status = statuses[Math.floor(random() * statuses.length)];
    const priority = priorities[Math.floor(random() * priorities.length)];
    const serviceLevel = serviceLevels[Math.floor(random() * serviceLevels.length)];
    const region = regions[Math.floor(random() * regions.length)];
    const amount = Math.round((80 + random() * 4200) * 100) / 100;

    const customerNumericId = (index % 350) + 1;
    const customerId = `customer-${String(customerNumericId).padStart(4, '0')}`;
    const assignedDriverId = `driver-${String((index % 75) + 1).padStart(3, '0')}`;

    return {
      id: `order-${String(index + 1).padStart(6, '0')}`,
      orderNumber: `DT-2026${String((index % 12) + 1).padStart(2, '0')}-${String(index + 1).padStart(5, '0')}`,
      customerName: `客户 ${customerNumericId}`,
      status,
      priority,
      serviceLevel,
      amount,
      currency: 'CNY',
      region,
      customerId,
      assignedDriverId,
      createdAt: timestamp,
    };
  });
}

let mockOrdersCache: OrderSummary[] | null = null;

function getMockOrdersStore() {
  if (!mockOrdersCache) {
    mockOrdersCache = generateMockOrders(10000);
  }
  return mockOrdersCache;
}

async function mockList(filters?: OrderFilters): Promise<OrderSummary[]> {
  await wait(randomLatency());
  maybeThrowMockFailure();

  const source = getMockOrdersStore();
  if (!filters) return source;

  return source.filter((order) => {
    if (filters.status?.length && !filters.status.includes(order.status)) return false;
    if (filters.serviceLevel?.length && !filters.serviceLevel.includes(order.serviceLevel)) return false;
    return true;
  });
}

async function mockGetById(id: string): Promise<OrderDetail> {
  await wait(randomLatency());
  maybeThrowMockFailure();

  const summary = getMockOrdersStore().find((order) => order.id === id);
  if (!summary) {
    const error = new Error(`Order ${id} not found.`);
    (error as Error & { code?: string }).code = 'NOT_FOUND';
    throw error;
  }

  return {
    id: summary.id,
    orderNumber: summary.orderNumber,
    customerName: summary.customerName,
    origin: '浦东新区陆家嘴环路1000号, 上海, Shanghai 200120, CN',
    destination: '天河区珠江新城花城大道18号, 广州, Guangdong 510623, CN',
    status: summary.status,
    serviceLevel: summary.serviceLevel,
    trackingNumber: summary.status === 'Shipped' || summary.status === 'Delivered' ? `SF${summary.id.slice(-10)}` : null,
    carrierCode: summary.status === 'Shipped' || summary.status === 'Delivered' ? 'SF' : null,
    items: [
      {
        description: '电子产品 - 笔记本电脑',
        quantity: 1,
        weight: { value: 2.5, unit: 'Kg' },
        dimensions: { lengthCm: 35, widthCm: 25, heightCm: 3 },
      },
    ],
    createdAt: summary.createdAt,
    updatedAt: summary.createdAt,
  };
}

async function mockCreate(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  await wait(randomLatency());
  maybeThrowMockFailure();

  const store = getMockOrdersStore();
  const seq = store.length + 1;
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const orderId = `order-${String(seq).padStart(6, '0')}`;
  const orderNumber = `DT-${now.getFullYear()}${month}-${String(seq).padStart(5, '0')}`;

  const summary: OrderSummary = {
    id: orderId,
    orderNumber,
    customerName: payload.customerName,
    status: 'Created',
    priority: 'Normal',
    serviceLevel: payload.serviceLevel,
    amount: 0,
    currency: 'CNY',
    region: payload.destination.province || payload.destination.city || 'Unknown',
    customerId: `customer-${String((seq % 350) + 1).padStart(4, '0')}`,
    createdAt: now.toISOString(),
  };

  store.unshift(summary);

  return {
    orderId,
    orderNumber,
    status: 'Created',
  };
}

export const ordersApi = {
  async list(filters?: OrderFilters): Promise<OrderSummary[]> {
    if (shouldUseMock()) {
      return mockList(filters);
    }

    const query = new URLSearchParams();
    if (filters?.status?.length) query.set('status', filters.status[0]);
    if (filters?.serviceLevel?.length) query.set('serviceLevel', filters.serviceLevel[0]);
    if (filters?.dateRange?.start) query.set('fromDate', new Date(filters.dateRange.start).toISOString());
    if (filters?.dateRange?.end) query.set('toDate', new Date(filters.dateRange.end).toISOString());
    const qs = query.toString();
    const path = qs ? `/api/orders?${qs}` : '/api/orders';

    try {
      return await unwrapResponse<OrderSummary[]>(apiClient.get(path));
    } catch (error) {
      if (isNetworkError(error)) {
        return mockList(filters);
      }
      throw error;
    }
  },

  async getById(id: string): Promise<OrderDetail> {
    if (shouldUseMock()) {
      return mockGetById(id);
    }

    try {
      return await unwrapResponse<OrderDetail>(apiClient.get(`/api/orders/${id}`));
    } catch (error) {
      if (isNetworkError(error)) {
        return mockGetById(id);
      }
      throw error;
    }
  },

  async create(payload: CreateOrderRequest, correlationId?: string): Promise<CreateOrderResponse> {
    if (shouldUseMock()) {
      return mockCreate(payload);
    }

    try {
      return await unwrapResponse<CreateOrderResponse>(
        apiClient.post('/api/orders', payload, {
          headers: correlationId ? { 'X-Correlation-ID': correlationId } : undefined,
        })
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockCreate(payload);
      }
      throw error;
    }
  },

  confirm(id: string, correlationId?: string): Promise<OrderTransitionResponse> {
    return unwrapResponse<OrderTransitionResponse>(
      apiClient.put(`/api/orders/${id}/confirm`, undefined, {
        headers: correlationId ? { 'X-Correlation-ID': correlationId } : undefined,
      })
    );
  },

  ship(id: string, correlationId?: string): Promise<OrderTransitionResponse> {
    return unwrapResponse<OrderTransitionResponse>(
      apiClient.put(`/api/orders/${id}/ship`, undefined, {
        headers: correlationId ? { 'X-Correlation-ID': correlationId } : undefined,
      })
    );
  },

  deliver(id: string, correlationId?: string): Promise<OrderTransitionResponse> {
    return unwrapResponse<OrderTransitionResponse>(
      apiClient.put(`/api/orders/${id}/deliver`, undefined, {
        headers: correlationId ? { 'X-Correlation-ID': correlationId } : undefined,
      })
    );
  },

  cancel(id: string, reason?: string, correlationId?: string): Promise<OrderTransitionResponse> {
    return unwrapResponse<OrderTransitionResponse>(
      apiClient.put(`/api/orders/${id}/cancel`, reason ? { reason } : undefined, {
        headers: correlationId ? { 'X-Correlation-ID': correlationId } : undefined,
      })
    );
  },

  async getAuditByOrder(orderId: string): Promise<AuditEntry[]> {
    if (shouldUseMock()) {
      return [
        {
          id: `audit-${orderId}-1`,
          action: 'OrderViewed',
          entityType: 'Order',
          entityId: orderId,
          userId: 'system',
          username: 'System',
          timestamp: new Date().toISOString(),
          details: 'Mock audit event',
        },
      ];
    }

    try {
      return await unwrapResponse<AuditEntry[]>(apiClient.get(`/api/audit/entity/Order/${orderId}`));
    } catch {
      return [];
    }
  },
};
