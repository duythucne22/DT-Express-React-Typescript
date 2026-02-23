import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../lib/api/orders';
import { useOrdersStore } from '../stores/ordersStore';
import { useAuthStore } from '../stores/authStore';
import type { CreateOrderRequest, CreateOrderResponse, OrderSummary, OrderStatus } from '../types';

export function useOrders() {
  const queryClient = useQueryClient();

  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const userId = user?.userId;

  const ordersMap = useOrdersStore((s) => s.orders);
  const filters = useOrdersStore((s) => s.filters);
  const sort = useOrdersStore((s) => s.sort);
  const selectedOrderId = useOrdersStore((s) => s.selectedOrderId);

  const setOrders = useOrdersStore((s) => s.setOrders);
  const upsertOrder = useOrdersStore((s) => s.upsertOrder);
  const setFilters = useOrdersStore((s) => s.setFilters);
  const clearFilters = useOrdersStore((s) => s.clearFilters);
  const setSort = useOrdersStore((s) => s.setSort);
  const setSelectedOrder = useOrdersStore((s) => s.setSelectedOrder);
  const getFilteredSorted = useOrdersStore((s) => s.getFilteredSorted);

  const query = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  if (query.data) {
    const currentSize = ordersMap.size;
    if (currentSize !== query.data.length) {
      setOrders(query.data);
    }
  }

  const orders = useMemo(
    () => getFilteredSorted(role, userId),
    [getFilteredSorted, role, userId, filters, sort, ordersMap]
  );

  const stats = useMemo(() => {
    const all = Array.from(ordersMap.values());
    const total = orders.length;
    const allTotal = all.length;
    const byStatus = orders.reduce<Record<OrderStatus, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {
      Created: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    });

    return {
      total,
      allTotal,
      byStatus,
    };
  }, [orders, ordersMap]);

  const optimisticStatusMutation = useMutation({
    mutationFn: async ({ orderId, nextStatus }: { orderId: string; nextStatus: OrderStatus }) => {
      switch (nextStatus) {
        case 'Confirmed':
          return ordersApi.confirm(orderId);
        case 'Shipped':
          return ordersApi.ship(orderId);
        case 'Delivered':
          return ordersApi.deliver(orderId);
        case 'Cancelled':
          return ordersApi.cancel(orderId);
        default:
          throw new Error(`Unsupported transition: ${nextStatus}`);
      }
    },
    onMutate: async ({ orderId, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previous = queryClient.getQueryData<OrderSummary[]>(['orders']);

      const existing = useOrdersStore.getState().getOrder(orderId);
      if (existing) {
        upsertOrder({ ...existing, status: nextStatus });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        setOrders(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateOrderRequest) => ordersApi.create(payload),
    onSuccess: (created: CreateOrderResponse, payload: CreateOrderRequest) => {
      const optimisticSummary: OrderSummary = {
        id: created.orderId,
        orderNumber: created.orderNumber,
        customerName: payload.customerName,
        status: created.status,
        priority: 'Normal',
        serviceLevel: payload.serviceLevel,
        amount: 0,
        currency: 'CNY',
        region: payload.destination.province || payload.destination.city || 'Unknown',
        customerId: 'unknown',
        createdAt: new Date().toISOString(),
      };

      upsertOrder(optimisticSummary);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders,
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    filters,
    sort,
    selectedOrderId,

    setFilters,
    clearFilters,
    setSort,
    setSelectedOrder,

    refetch: query.refetch,
    updateStatusOptimistic: optimisticStatusMutation.mutateAsync,
    createOrder: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
