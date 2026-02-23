import type { OrderStatus, UserRole } from '../../../types';

export type OrderAction = 'Confirm' | 'Ship' | 'Deliver' | 'Cancel';

const ACTION_TO_STATUS: Record<OrderAction, OrderStatus> = {
  Confirm: 'Confirmed',
  Ship: 'Shipped',
  Deliver: 'Delivered',
  Cancel: 'Cancelled',
};

const ACTION_ROLE_RULES: Record<OrderAction, UserRole[]> = {
  Confirm: ['Admin', 'Dispatcher'],
  Ship: ['Admin', 'Dispatcher'],
  Deliver: ['Admin', 'Driver'],
  Cancel: ['Admin', 'Dispatcher'],
};

export class OrderStateMachine {
  private static transitions: Record<OrderStatus, OrderStatus[]> = {
    Created: ['Confirmed', 'Cancelled'],
    Confirmed: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],
    Cancelled: [],
  };

  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return this.transitions[from].includes(to);
  }

  static getAvailableNextStatuses(status: OrderStatus): OrderStatus[] {
    return this.transitions[status] ?? [];
  }

  static getAvailableActions(status: OrderStatus, role: UserRole): OrderAction[] {
    const next = this.getAvailableNextStatuses(status);

    return (Object.keys(ACTION_TO_STATUS) as OrderAction[]).filter((action) => {
      const target = ACTION_TO_STATUS[action];
      const canDoByRole = ACTION_ROLE_RULES[action].includes(role);
      const canDoByState = next.includes(target);
      return canDoByRole && canDoByState;
    });
  }

  static getTargetStatus(action: OrderAction): OrderStatus {
    return ACTION_TO_STATUS[action];
  }

  /**
   * Get a human-readable label for an action
   */
  static getActionLabel(action: OrderAction): string {
    const labels: Record<OrderAction, string> = {
      Confirm: 'Confirm Order',
      Ship: 'Ship Order',
      Deliver: 'Mark as Delivered',
      Cancel: 'Cancel Order',
    };
    return labels[action];
  }

  /**
   * Get Tailwind color classes for action buttons
   */
  static getActionColor(action: OrderAction): { bg: string; hover: string; text: string } {
    const colors: Record<OrderAction, { bg: string; hover: string; text: string }> = {
      Confirm: { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-white' },
      Ship: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white' },
      Deliver: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-white' },
      Cancel: { bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-white' },
    };
    return colors[action];
  }
}
