import type { DeliveryAgent, AgentStatus } from '../../types';

// ============================================
// SEEDED RANDOM
// ============================================

function pseudoRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

// ============================================
// GENERATOR
// ============================================

const STATUSES: AgentStatus[] = ['Available', 'OnDelivery', 'Offline', 'Break'];
const VEHICLE_TYPES: Array<'bike' | 'van' | 'truck'> = ['bike', 'van', 'truck'];

// Realistic city clusters (Shanghai, Guangzhou, Beijing, Shenzhen, Chengdu)
const CITY_CLUSTERS: Array<{ name: string; lat: number; lng: number; spread: number }> = [
  { name: 'Shanghai',  lat: 31.2304, lng: 121.4737, spread: 0.15 },
  { name: 'Guangzhou', lat: 23.1291, lng: 113.2644, spread: 0.12 },
  { name: 'Beijing',   lat: 39.9042, lng: 116.4074, spread: 0.18 },
  { name: 'Shenzhen',  lat: 22.5431, lng: 114.0579, spread: 0.10 },
  { name: 'Chengdu',   lat: 30.5728, lng: 104.0668, spread: 0.14 },
];

const CHINESE_SURNAMES = ['张', '王', '李', '赵', '陈', '杨', '黄', '周', '吴', '刘', '孙', '马', '胡', '林'];
const CHINESE_GIVEN = ['伟', '芳', '强', '敏', '静', '磊', '洋', '勇', '艳', '杰', '娜', '军', '秀', '涛'];

export function generateMockAgents(count = 60): DeliveryAgent[] {
  const random = pseudoRandom(20260215);

  return Array.from({ length: count }, (_, index) => {
    const cluster = CITY_CLUSTERS[Math.floor(random() * CITY_CLUSTERS.length)];
    const lat = cluster.lat + (random() - 0.5) * 2 * cluster.spread;
    const lng = cluster.lng + (random() - 0.5) * 2 * cluster.spread;

    const status = STATUSES[Math.floor(random() * STATUSES.length)];
    const vehicleType = VEHICLE_TYPES[Math.floor(random() * VEHICLE_TYPES.length)];
    const surname = CHINESE_SURNAMES[Math.floor(random() * CHINESE_SURNAMES.length)];
    const given = CHINESE_GIVEN[Math.floor(random() * CHINESE_GIVEN.length)];

    const numOrders = status === 'OnDelivery' ? Math.floor(random() * 5) + 1 : 0;
    const assignedOrders = Array.from({ length: numOrders }, (__, oi) => `order-${String(index * 10 + oi + 1).padStart(6, '0')}`);

    return {
      id: `agent-${String(index + 1).padStart(3, '0')}`,
      name: `${surname}${given}`,
      phone: `138${String(Math.floor(random() * 100000000)).padStart(8, '0')}`,
      status,
      currentLocation: { lat, lng },
      assignedOrders,
      region: cluster.name,
      vehicleType,
      rating: Math.round((3.5 + random() * 1.5) * 10) / 10,
      totalDeliveries: Math.floor(random() * 3000) + 50,
    };
  });
}

/**
 * Jitter an agent's location slightly (simulates real-time movement).
 * Returns a new location object (immutable).
 */
export function jitterLocation(location: { lat: number; lng: number }, magnitude = 0.002): { lat: number; lng: number } {
  return {
    lat: location.lat + (Math.random() - 0.5) * magnitude,
    lng: location.lng + (Math.random() - 0.5) * magnitude,
  };
}

// ============================================
// MOCK ROUTE GEOJSON
// ============================================

/**
 * Generate a simple mock route GeoJSON LineString between two points.
 * In production this would come from OSRM / ORS.
 */
export function generateMockRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  segments = 8
): GeoJSON.Feature<GeoJSON.LineString> {
  const coords: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lng = from.lng + (to.lng - from.lng) * t + (Math.random() - 0.5) * 0.01;
    const lat = from.lat + (to.lat - from.lat) * t + (Math.random() - 0.5) * 0.01;
    coords.push([lng, lat]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coords,
    },
  };
}
