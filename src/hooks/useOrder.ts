import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { auditedOrdersApi } from '../lib/audited/auditedOrdersApi';
import { ordersApi } from '../lib/api/orders';
import { OrderStateMachine, type OrderAction } from '../lib/patterns/state/OrderStateMachine';
import { useAuthStore } from '../stores/authStore';
import type { AuditEntry, OrderDetail } from '../types';

export function useOrder(orderId: string | undefined) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const orderQuery = useQuery({
    queryKey: ['order', orderId],
    enabled: Boolean(orderId),
    queryFn: () => ordersApi.getById(orderId as string),
  });

  const auditQuery = useQuery({
    queryKey: ['order-audit', orderId],
    enabled: Boolean(orderId),
    queryFn: async (): Promise<AuditEntry[]> => {
      try {
        return await ordersApi.getAuditByOrder(orderId as string);
      } catch {
        return [];
      }
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, reason }: { action: OrderAction; reason?: string }) => {
      if (!orderId) throw new Error('Missing order id');

      // Use audited API methods for tracking
      switch (action) {
        case 'Confirm':
          return auditedOrdersApi.confirm(orderId);
        case 'Ship':
          return auditedOrdersApi.ship(orderId);
        case 'Deliver':
          return auditedOrdersApi.deliver(orderId);
        case 'Cancel':
          return auditedOrdersApi.cancel(orderId, reason);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['order-audit', orderId] }),
      ]);
    },
  });

  const order = orderQuery.data as OrderDetail | undefined;
  const availableActions = order && user
    ? OrderStateMachine.getAvailableActions(order.status, user.role)
    : [];

  return {
    order,
    auditEntries: auditQuery.data ?? [],
    isLoading: orderQuery.isLoading,
    isAuditLoading: auditQuery.isLoading,
    isMutating: actionMutation.isPending,
    error: orderQuery.error,
    availableActions,
    performAction: actionMutation.mutateAsync,
  };
}
