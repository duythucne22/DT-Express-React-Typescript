import apiClient, { unwrapResponse } from './index';
import type {
  RoutingApiRequest,
  RoutingCompareInput,
  RoutingStrategy,
  RoutingStrategyResult,
} from '../../types';
import { FastestStrategy } from '../patterns/strategy/FastestStrategy';
import { CheapestStrategy } from '../patterns/strategy/CheapestStrategy';
import { BalancedStrategy } from '../patterns/strategy/BalancedStrategy';

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

const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  上海: { latitude: 31.2304, longitude: 121.4737 },
  Shanghai: { latitude: 31.2304, longitude: 121.4737 },
  北京: { latitude: 39.9042, longitude: 116.4074 },
  Beijing: { latitude: 39.9042, longitude: 116.4074 },
  广州: { latitude: 23.1291, longitude: 113.2644 },
  Guangzhou: { latitude: 23.1291, longitude: 113.2644 },
  深圳: { latitude: 22.5431, longitude: 114.0579 },
  Shenzhen: { latitude: 22.5431, longitude: 114.0579 },
  成都: { latitude: 30.5728, longitude: 104.0668 },
  Chengdu: { latitude: 30.5728, longitude: 104.0668 },
};

const strategyImpls = {
  Fastest: new FastestStrategy(),
  Cheapest: new CheapestStrategy(),
  Balanced: new BalancedStrategy(),
};

function toApiRequest(input: RoutingCompareInput): RoutingApiRequest {
  const origin = CITY_COORDINATES[input.originCity] ?? CITY_COORDINATES.Shanghai;
  const destination = CITY_COORDINATES[input.destinationCity] ?? CITY_COORDINATES.Beijing;

  return {
    origin,
    destination,
    packageWeight: input.packageWeight,
    serviceLevel: input.serviceLevel,
  };
}

async function mockCompare(input: RoutingCompareInput): Promise<RoutingStrategyResult[]> {
  await wait(randomLatency());
  maybeThrowMockFailure();

  const req = toApiRequest(input);
  return [
    strategyImpls.Fastest.calculate(req),
    strategyImpls.Cheapest.calculate(req),
    strategyImpls.Balanced.calculate(req),
  ];
}

async function mockCalculate(input: RoutingCompareInput, strategy: RoutingStrategy): Promise<RoutingStrategyResult> {
  await wait(randomLatency());
  maybeThrowMockFailure();

  const req = toApiRequest(input);
  return strategyImpls[strategy].calculate(req);
}

export const routingApi = {
  async compareRoutes(input: RoutingCompareInput): Promise<RoutingStrategyResult[]> {
    if (shouldUseMock()) {
      return mockCompare(input);
    }

    const payload = toApiRequest(input);

    try {
      return await unwrapResponse<RoutingStrategyResult[]>(
        apiClient.post('/api/routing/compare', payload)
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockCompare(input);
      }
      throw error;
    }
  },

  async calculateRoute(input: RoutingCompareInput, strategy: RoutingStrategy): Promise<RoutingStrategyResult> {
    if (shouldUseMock()) {
      return mockCalculate(input, strategy);
    }

    const payload = {
      ...toApiRequest(input),
      strategy,
    };

    try {
      return await unwrapResponse<RoutingStrategyResult>(
        apiClient.post('/api/routing/calculate', payload)
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockCalculate(input, strategy);
      }
      throw error;
    }
  },

  async listStrategies(): Promise<RoutingStrategy[]> {
    if (shouldUseMock()) {
      return ['Fastest', 'Cheapest', 'Balanced'];
    }

    try {
      return await unwrapResponse<RoutingStrategy[]>(apiClient.get('/api/routing/strategies'));
    } catch (error) {
      if (isNetworkError(error)) {
        return ['Fastest', 'Cheapest', 'Balanced'];
      }
      throw error;
    }
  },
};
