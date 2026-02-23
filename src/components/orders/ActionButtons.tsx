import { cn } from '../../lib/utils/cn';
import { OrderStateMachine, type OrderAction } from '../../lib/patterns/state/OrderStateMachine';

interface ActionButtonsProps {
  actions: OrderAction[];
  disabled?: boolean;
  onAction: (action: OrderAction) => void;
}

export function ActionButtons({ actions, disabled, onAction }: ActionButtonsProps) {
  if (!actions.length) {
    return <p className="text-sm text-slate-500">No actions available for this order.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => {
        const label = OrderStateMachine.getActionLabel(action);
        const colors = OrderStateMachine.getActionColor(action);
        
        return (
          <button
            key={action}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
              colors.bg,
              colors.hover,
              colors.text
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
