interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export default function DateRangePicker({ from, to, onFromChange, onToChange }: DateRangePickerProps) {
  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-slate-600 mb-1">From</label>
        <input
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-600 mb-1">To</label>
        <input
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
