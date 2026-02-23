import apiClient, { unwrapResponse } from './index';
import type { DeliveryAgent, MultiLegRoute, TrackingInfo, TrackingRouteLeg } from '../../types';
import { generateMockAgents, generateMockRoute } from '../mock/trackingGenerator';

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

// ============================================
// MOCK DATA CACHE
// ============================================

let mockAgentsCache: DeliveryAgent[] | null = null;

function getMockAgents(): DeliveryAgent[] {
  if (!mockAgentsCache) {
    mockAgentsCache = generateMockAgents(60);
  }
  return mockAgentsCache;
}

// ============================================
// MOCK IMPLEMENTATIONS
// ============================================

async function mockListAgents(): Promise<DeliveryAgent[]> {
  await wait(randomLatency());
  maybeThrowMockFailure();
  return getMockAgents();
}

async function mockGetTrackingSnapshot(trackingNumber: string): Promise<TrackingInfo> {
  await wait(randomLatency());
  maybeThrowMockFailure();

  return {
    trackingNumber,
    carrierCode: 'SF',
    currentStatus: 'InTransit',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    events: [
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'InTransit',
        location: '上海浦东分拣中心',
        description: 'Package arrived at sorting center',
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'PickedUp',
        location: '上海闵行收件站',
        description: 'Package picked up from sender',
      },
    ],
  };
}

async function mockGetDirections(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<GeoJSON.Feature<GeoJSON.LineString>> {
  await wait(randomLatency());
  return generateMockRoute(from, to);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function makeLeg(
  id: string,
  legType: TrackingRouteLeg['legType'],
  label: string,
  icon: TrackingRouteLeg['icon'],
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  geometry?: GeoJSON.Feature<GeoJSON.LineString>
): TrackingRouteLeg {
  const line = geometry ?? generateMockRoute(from, to);
  const distanceKm = Number(haversineDistanceKm(from, to).toFixed(1));
  return {
    id,
    legType,
    label,
    icon,
    distanceKm,
    geometry: line,
  };
}

// ============================================
// PUBLIC API
// ============================================

export const trackingApi = {
  async listAgents(): Promise<DeliveryAgent[]> {
    if (shouldUseMock()) {
      return mockListAgents();
    }

    try {
      return await unwrapResponse<DeliveryAgent[]>(apiClient.get('/api/agents'));
    } catch (error) {
      if (isNetworkError(error)) {
        return mockListAgents();
      }
      throw error;
    }
  },

  async getTrackingSnapshot(trackingNumber: string): Promise<TrackingInfo> {
    if (shouldUseMock()) {
      return mockGetTrackingSnapshot(trackingNumber);
    }

    try {
      return await unwrapResponse<TrackingInfo>(
        apiClient.get(`/api/tracking/${trackingNumber}/snapshot`)
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockGetTrackingSnapshot(trackingNumber);
      }
      throw error;
    }
  },

  async getDirections(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
  ): Promise<GeoJSON.Feature<GeoJSON.LineString>> {
    // Always use mock directions to avoid external service dependency
    return mockGetDirections(from, to);
  },

  async getMultiLegRoute(
    from: { lat: number; lng: number },
    internationalMode: 'ship' | 'plane'
  ): Promise<MultiLegRoute> {
    await wait(randomLatency());

    const cnHub = internationalMode === 'ship'
      ? { lat: 31.3202, lng: 121.5503, name: 'Shanghai Port' }
      : { lat: 31.1443, lng: 121.8083, name: 'Shanghai Pudong Airport' };

    const usHub = internationalMode === 'ship'
      ? { lat: 33.7361, lng: -118.2631, name: 'Port of Los Angeles' }
      : { lat: 33.9416, lng: -118.4085, name: 'Los Angeles Airport' };

    const destination = {
      name: 'Los Angeles Local Hub',
      lat: 34.0522,
      lng: -118.2437,
    };

    const localPickup = await mockGetDirections(from, { lat: cnHub.lat, lng: cnHub.lng });

    const internationalCustomLine = generateMockRoute(
      { lat: cnHub.lat, lng: cnHub.lng },
      { lat: usHub.lat, lng: usHub.lng },
      12
    );

    const localDropoff = await mockGetDirections({ lat: usHub.lat, lng: usHub.lng }, destination);

    const legs: TrackingRouteLeg[] = [
      makeLeg(
        'leg-pickup',
        'LocalPickup',
        `Pickup to ${cnHub.name}`,
        'van',
        from,
        { lat: cnHub.lat, lng: cnHub.lng },
        localPickup
      ),
      makeLeg(
        'leg-international',
        internationalMode === 'ship' ? 'InternationalShip' : 'InternationalPlane',
        internationalMode === 'ship' ? 'Ocean Freight CN→US' : 'Air Freight CN→US',
        internationalMode,
        { lat: cnHub.lat, lng: cnHub.lng },
        { lat: usHub.lat, lng: usHub.lng },
        internationalCustomLine
      ),
      makeLeg(
        'leg-dropoff',
        'LocalDropoff',
        'US Local Dropoff',
        'truck',
        { lat: usHub.lat, lng: usHub.lng },
        destination,
        localDropoff
      ),
    ];

    const totalDistanceKm = Number(legs.reduce((sum, leg) => sum + leg.distanceKm, 0).toFixed(1));
    const completedRatio = internationalMode === 'ship' ? 0.32 : 0.58;
    const remainingDistanceKm = Number((totalDistanceKm * (1 - completedRatio)).toFixed(1));

    return {
      routeId: `route-${internationalMode}-${Date.now()}`,
      totalDistanceKm,
      remainingDistanceKm,
      destination,
      legs,
    };
  },
};
