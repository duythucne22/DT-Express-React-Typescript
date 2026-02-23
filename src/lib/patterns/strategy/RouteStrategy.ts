import type { RoutingApiRequest, RoutingStrategyResult } from '../../../types';

export interface RouteStrategy {
  readonly name: 'Fastest' | 'Cheapest' | 'Balanced';
  calculate(input: RoutingApiRequest): RoutingStrategyResult;
}
