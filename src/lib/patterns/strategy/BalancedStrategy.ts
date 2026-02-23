import type { RouteStrategy } from './RouteStrategy';
import type { RoutingApiRequest, RoutingStrategyResult } from '../../../types';
import { generateRealisticRoute } from '../../utils/routeGeometry';

function haversineKm(input: RoutingApiRequest): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(input.destination.latitude - input.origin.latitude);
  const dLon = toRad(input.destination.longitude - input.origin.longitude);
  const lat1 = toRad(input.origin.latitude);
  const lat2 = toRad(input.destination.latitude);

  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toDuration(hours: number): string {
  const total = Math.max(1, Math.round(hours * 3600));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export class BalancedStrategy implements RouteStrategy {
  readonly name = 'Balanced' as const;

  calculate(input: RoutingApiRequest): RoutingStrategyResult {
    const directDistance = haversineKm(input);
    const distanceKm = Number((directDistance * 1.05).toFixed(1));
    const avgSpeedKmH = 66;
    const hours = distanceKm / avgSpeedKmH;

    // Generate route with moderate deviation (balanced between speed and cost)
    const geometry = generateRealisticRoute(
      { lat: input.origin.latitude, lng: input.origin.longitude },
      { lat: input.destination.latitude, lng: input.destination.longitude },
      0.45, // Moderate variation factor for balanced route
      19    // 19 waypoints for smooth path
    );

    return {
      strategyUsed: this.name,
      waypointNodeIds: ['NODE-ORIGIN', 'NODE-BALANCED', 'NODE-DEST'],
      distanceKm,
      estimatedDuration: toDuration(hours),
      estimatedCost: {
        amount: Number((distanceKm * 0.034 + input.packageWeight.value * 2.0).toFixed(2)),
        currency: 'CNY',
      },
      carrierCode: 'SF',
      carrierName: 'SF Express (顺丰速运)',
      geometry,
    };
  }
}
