import apiClient, { unwrapResponse } from './index';
import type {
  CarrierBookRequest,
  CarrierBookResponse,
  CarrierListItem,
  CarrierQuoteRequest,
  CarrierQuoteResponse,
  CarrierTrackResponse,
} from '../../types';
import { CarrierFactory } from '../patterns/factory/CarrierFactory';

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

async function mockListCarriers(): Promise<CarrierListItem[]> {
  await wait(randomLatency());
  maybeThrowMockFailure();
  return CarrierFactory.listAll().map((adapter) => adapter.getMetadata());
}

async function mockGetQuotes(payload: CarrierQuoteRequest): Promise<CarrierQuoteResponse> {
  await wait(randomLatency());
  maybeThrowMockFailure();

  const adapters = CarrierFactory.listAll();
  const quotes = await Promise.all(adapters.map((adapter) => adapter.getQuote(payload)));

  const recommended = quotes.reduce((min, current) =>
    current.price.amount < min.price.amount ? current : min
  );

  return {
    quotes,
    recommended: {
      carrierCode: recommended.carrierCode,
      reason: 'Cheapest',
    },
  };
}

async function mockBookCarrier(code: string, payload: CarrierBookRequest): Promise<CarrierBookResponse> {
  await wait(randomLatency());
  maybeThrowMockFailure();
  const adapter = CarrierFactory.create(code);
  return adapter.book(payload);
}

async function mockTrackCarrier(code: string, trackingNo: string): Promise<CarrierTrackResponse> {
  await wait(randomLatency());
  maybeThrowMockFailure();

  return {
    trackingNumber: trackingNo,
    status: 'InTransit',
    currentLocation: code.toUpperCase() === 'SF' ? 'Shanghai Distribution Center' : 'Beijing Fulfillment Hub',
    updatedAt: new Date().toISOString(),
  };
}

export const carriersApi = {
  async list(): Promise<CarrierListItem[]> {
    if (shouldUseMock()) {
      return mockListCarriers();
    }

    try {
      return await unwrapResponse<CarrierListItem[]>(apiClient.get('/api/carriers'));
    } catch (error) {
      if (isNetworkError(error)) {
        return mockListCarriers();
      }
      throw error;
    }
  },

  async getQuotes(payload: CarrierQuoteRequest): Promise<CarrierQuoteResponse> {
    if (shouldUseMock()) {
      return mockGetQuotes(payload);
    }

    try {
      return await unwrapResponse<CarrierQuoteResponse>(apiClient.post('/api/carriers/quotes', payload));
    } catch (error) {
      if (isNetworkError(error)) {
        return mockGetQuotes(payload);
      }
      throw error;
    }
  },

  async book(code: string, payload: CarrierBookRequest): Promise<CarrierBookResponse> {
    if (shouldUseMock()) {
      return mockBookCarrier(code, payload);
    }

    try {
      return await unwrapResponse<CarrierBookResponse>(apiClient.post(`/api/carriers/${code}/book`, payload));
    } catch (error) {
      if (isNetworkError(error)) {
        return mockBookCarrier(code, payload);
      }
      throw error;
    }
  },

  async track(code: string, trackingNo: string): Promise<CarrierTrackResponse> {
    if (shouldUseMock()) {
      return mockTrackCarrier(code, trackingNo);
    }

    try {
      return await unwrapResponse<CarrierTrackResponse>(apiClient.get(`/api/carriers/${code}/track/${trackingNo}`));
    } catch (error) {
      if (isNetworkError(error)) {
        return mockTrackCarrier(code, trackingNo);
      }
      throw error;
    }
  },
};
