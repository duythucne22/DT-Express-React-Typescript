import { ordersApi } from '../../../api/orders';
import { useOrdersStore } from '../../../../stores/ordersStore';
import type { OrderFilters, OrderSummary } from '../../../../types';

/**
 * CQRS Query Pattern - GetOrders
 * 
 * Encapsulates the retrieval of orders with caching and staleness checks.
 * Separates the "read" operation from commands.
 * 
 * Example usage:
 * ```typescript
 * const query = new GetOrdersQuery({ status: ['Created', 'Confirmed'] });
 * const orders = await query.execute();
 * ```
 */

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export class GetOrdersQuery {
  private filters: OrderFilters;
  private staleTime: number;
  private lastFetchTime: number = 0;

  constructor(filters: OrderFilters = {}, staleTime: number = DEFAULT_STALE_TIME) {
    this.filters = filters;
    this.staleTime = staleTime;
  }

  /**
   * Check if cached data is stale
   */
  private isStale(): boolean {
    if (this.lastFetchTime === 0) return true;
    const now = Date.now();
    return now - this.lastFetchTime > this.staleTime;
  }

  /**
   * Execute the query: check cache, fetch if stale, update store
   */
  async execute(): Promise<OrderSummary[]> {
    const store = useOrdersStore.getState();
    const cachedOrders = Array.from(store.orders.values());

    // If cache is fresh and we have data, return it
    if (!this.isStale() && cachedOrders.length > 0) {
      return this.applyFilters(cachedOrders);
    }

    // Otherwise, fetch from API
    const orders = await ordersApi.list();
    
    // Update store
    store.setOrders(orders);
    this.lastFetchTime = Date.now();

    return this.applyFilters(orders);
  }

  /**
   * Apply filters to order list
   */
  private applyFilters(orders: OrderSummary[]): OrderSummary[] {
    let filtered = [...orders];

    // Filter by status
    if (this.filters.status && this.filters.status.length > 0) {
      filtered = filtered.filter((order) => this.filters.status!.includes(order.status));
    }

    // Filter by priority
    if (this.filters.priority && this.filters.priority.length > 0) {
      filtered = filtered.filter((order) => this.filters.priority!.includes(order.priority));
    }

    // Filter by region
    if (this.filters.region && this.filters.region.length > 0) {
      filtered = filtered.filter((order) => this.filters.region!.includes(order.region));
    }

    // Filter by service level
    if (this.filters.serviceLevel && this.filters.serviceLevel.length > 0) {
      filtered = filtered.filter((order) => this.filters.serviceLevel!.includes(order.serviceLevel));
    }

    // Filter by search term
    if (this.filters.search && this.filters.search.trim().length > 0) {
      const term = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(term) ||
          order.customerName.toLowerCase().includes(term)
      );
    }

    // Filter by date range
    if (this.filters.dateRange) {
      const { start, end } = this.filters.dateRange;
      if (start) {
        const startDate = new Date(start);
        filtered = filtered.filter((order) => new Date(order.createdAt) >= startDate);
      }
      if (end) {
        const endDate = new Date(end);
        filtered = filtered.filter((order) => new Date(order.createdAt) <= endDate);
      }
    }

    return filtered;
  }

  /**
   * Force refresh (ignore staleness check)
   */
  async refresh(): Promise<OrderSummary[]> {
    this.lastFetchTime = 0; // Reset to force fetch
    return this.execute();
  }

  /**
   * Get current filters
   */
  getFilters(): OrderFilters {
    return { ...this.filters };
  }

  /**
   * Update filters (fluent interface)
   */
  withFilters(filters: OrderFilters): GetOrdersQuery {
    this.filters = { ...this.filters, ...filters };
    return this;
  }
}

/**
 * Factory function for convenience
 */
export function createOrdersQuery(filters?: OrderFilters): GetOrdersQuery {
  return new GetOrdersQuery(filters);
}
