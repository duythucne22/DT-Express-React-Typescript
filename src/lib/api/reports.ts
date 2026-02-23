import apiClient, { unwrapResponse } from './index';
import type {
  MonthlyShipmentItem,
  MonthlyShipmentsReport,
  RevenueByCarrierItem,
  RevenueByCarrierReport,
  ServiceLevel,
  OrderStatus,
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

function pseudoRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function monthToSeed(month: string) {
  const normalized = month.replace(/[^\d]/g, '');
  let sum = 0;
  for (let i = 0; i < normalized.length; i++) {
    sum += normalized.charCodeAt(i) * (i + 1);
  }
  return 202600 + sum;
}

const serviceLevels: ServiceLevel[] = ['Express', 'Standard', 'Economy'];
const statuses: OrderStatus[] = ['Created', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const carriers = [
  { carrierCode: 'SF', carrierName: 'SF Express 顺丰速运' },
  { carrierCode: 'JD', carrierName: 'JD Logistics 京东物流' },
];

function generateMonthlyShipments(month: string): MonthlyShipmentsReport {
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr || new Date().getFullYear());
  const monthNumber = Number(monthStr || new Date().getMonth() + 1);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  const random = pseudoRandom(monthToSeed(month));
  const count = 24 + Math.floor(random() * 18);

  const shipments: MonthlyShipmentItem[] = Array.from({ length: count }, (_, index) => {
    const day = 1 + Math.floor(random() * daysInMonth);
    const hour = Math.floor(random() * 24);
    const minute = Math.floor(random() * 60);
    const serviceLevel = serviceLevels[Math.floor(random() * serviceLevels.length)];
    const status = statuses[Math.floor(random() * statuses.length)];
    const carrier = carriers[Math.floor(random() * carriers.length)];
    const cost = Number((80 + random() * 680).toFixed(2));

    const createdAt = new Date(
      Date.UTC(year, monthNumber - 1, day, hour, minute, 0)
    ).toISOString();

    return {
      orderId: `ord-${month.replace('-', '')}-${String(index + 1).padStart(4, '0')}`,
      orderNumber: `ORD-${month.replace('-', '')}-${String(index + 1).padStart(4, '0')}`,
      customerName: `客户 ${String((index % 16) + 1).padStart(2, '0')}`,
      origin: ['上海, 上海市', '广州, 广东省', '深圳, 广东省'][Math.floor(random() * 3)],
      destination: ['北京, 北京市', '成都, 四川省', '杭州, 浙江省'][Math.floor(random() * 3)],
      status,
      serviceLevel,
      carrierCode: carrier.carrierCode,
      trackingNumber: `${carrier.carrierCode}${month.replace('-', '')}${String(index + 1).padStart(6, '0')}`,
      cost,
      costCurrency: 'CNY',
      createdAt,
    };
  });

  const totalRevenue = Number(
    shipments.reduce((sum, item) => sum + item.cost, 0).toFixed(2)
  );

  return {
    year,
    month: monthNumber,
    totalShipments: shipments.length,
    totalRevenue,
    currency: 'CNY',
    shipments,
  };
}

function generateRevenueByCarrier(from: string, to: string): RevenueByCarrierReport {
  const seed = monthToSeed(`${from}-${to}`);
  const random = pseudoRandom(seed);

  const sfOrders = 18 + Math.floor(random() * 14);
  const jdOrders = 14 + Math.floor(random() * 12);

  const sfAverage = 620 + random() * 240;
  const jdAverage = 480 + random() * 220;

  const sfTotal = Number((sfOrders * sfAverage).toFixed(2));
  const jdTotal = Number((jdOrders * jdAverage).toFixed(2));
  const grandTotal = Number((sfTotal + jdTotal).toFixed(2));

  const carriersReport: RevenueByCarrierItem[] = [
    {
      carrierCode: 'SF',
      carrierName: 'SF Express 顺丰速运',
      orderCount: sfOrders,
      totalRevenue: sfTotal,
      averageOrderValue: Number((sfTotal / sfOrders).toFixed(2)),
      percentageOfTotal: Number(((sfTotal / grandTotal) * 100).toFixed(1)),
    },
    {
      carrierCode: 'JD',
      carrierName: 'JD Logistics 京东物流',
      orderCount: jdOrders,
      totalRevenue: jdTotal,
      averageOrderValue: Number((jdTotal / jdOrders).toFixed(2)),
      percentageOfTotal: Number(((jdTotal / grandTotal) * 100).toFixed(1)),
    },
  ];

  return {
    fromDate: new Date(`${from}T00:00:00.000Z`).toISOString(),
    toDate: new Date(`${to}T00:00:00.000Z`).toISOString(),
    grandTotal,
    currency: 'CNY',
    carriers: carriersReport,
  };
}

async function mockMonthlyShipments(month: string): Promise<MonthlyShipmentsReport> {
  await wait(randomLatency());
  maybeThrowMockFailure();
  return generateMonthlyShipments(month);
}

async function mockRevenueByCarrier(from: string, to: string): Promise<RevenueByCarrierReport> {
  await wait(randomLatency());
  maybeThrowMockFailure();
  return generateRevenueByCarrier(from, to);
}

export const reportsApi = {
  async getMonthlyShipments(month: string): Promise<MonthlyShipmentsReport> {
    if (shouldUseMock()) {
      return mockMonthlyShipments(month);
    }

    try {
      return await unwrapResponse<MonthlyShipmentsReport>(
        apiClient.get('/api/reports/shipments/monthly', {
          params: { month, format: 'json' },
        })
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockMonthlyShipments(month);
      }
      throw error;
    }
  },

  async getRevenueByCarrier(from: string, to: string): Promise<RevenueByCarrierReport> {
    if (shouldUseMock()) {
      return mockRevenueByCarrier(from, to);
    }

    try {
      return await unwrapResponse<RevenueByCarrierReport>(
        apiClient.get('/api/reports/revenue/by-carrier', {
          params: { from, to },
        })
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockRevenueByCarrier(from, to);
      }
      throw error;
    }
  },
};
