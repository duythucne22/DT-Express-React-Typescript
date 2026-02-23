import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils/cn';

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  options: SelectOption[];
  error?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ options, className, error, ...props }, ref) => {
  return (
    <div className="space-y-1">
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2 rounded-lg border bg-white text-slate-900',
          'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
          error ? 'border-red-500' : 'border-slate-300',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
