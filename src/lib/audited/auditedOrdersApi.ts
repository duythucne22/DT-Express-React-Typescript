import { withAudit } from '../patterns/decorator/AuditDecorator';
import { ordersApi } from '../api/orders';
import type { CreateOrderRequest, CreateOrderResponse, OrderTransitionResponse } from '../../types';

/**
 * Audited versions of order API methods.
 * These wrap the raw API calls with the audit decorator for logging and tracing.
 */

export const auditedOrdersApi = {
  /**
   * Create order with audit logging
   */
  create: (payload: CreateOrderRequest): Promise<CreateOrderResponse> => {
    return withAudit(
      (correlationId: string) => ordersApi.create(payload, correlationId),
      'CreateOrder'
    )();
  },

  /**
   * Confirm order with audit logging
   */
  confirm: (orderId: string): Promise<OrderTransitionResponse> => {
    return withAudit(
      (correlationId: string) => ordersApi.confirm(orderId, correlationId),
      'ConfirmOrder'
    )();
  },

  /**
   * Ship order with audit logging
   */
  ship: (orderId: string): Promise<OrderTransitionResponse> => {
    return withAudit(
      (correlationId: string) => ordersApi.ship(orderId, correlationId),
      'ShipOrder'
    )();
  },

  /**
   * Deliver order with audit logging
   */
  deliver: (orderId: string): Promise<OrderTransitionResponse> => {
    return withAudit(
      (correlationId: string) => ordersApi.deliver(orderId, correlationId),
      'DeliverOrder'
    )();
  },

  /**
   * Cancel order with audit logging
   */
  cancel: (orderId: string, reason?: string): Promise<OrderTransitionResponse> => {
    return withAudit(
      (correlationId: string) => ordersApi.cancel(orderId, reason, correlationId),
      'CancelOrder'
    )();
  },
};
