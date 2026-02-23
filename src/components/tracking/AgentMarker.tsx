import { memo } from 'react';
import type { AgentStatus } from '../../types';

const STATUS_COLORS: Record<AgentStatus, { ring: string; dot: string; pulse: string }> = {
  Available:  { ring: 'border-green-400',  dot: 'bg-green-500',  pulse: 'bg-green-400' },
  OnDelivery: { ring: 'border-orange-400', dot: 'bg-orange-500', pulse: 'bg-orange-400' },
  Offline:    { ring: 'border-slate-400',  dot: 'bg-slate-400',  pulse: 'bg-slate-300' },
  Break:      { ring: 'border-blue-400',   dot: 'bg-blue-500',   pulse: 'bg-blue-400' },
};

const VEHICLE_EMOJI: Record<string, string> = {
  bike: '🏍️',
  van: '🚐',
  truck: '🚚',
};

interface AgentMarkerProps {
  status: AgentStatus;
  vehicleType: 'bike' | 'van' | 'truck';
  isSelected: boolean;
  onClick: () => void;
}

const AgentMarker = memo(function AgentMarker({ status, vehicleType, isSelected, onClick }: AgentMarkerProps) {
  const colors = STATUS_COLORS[status];
  const shouldPulse = status !== 'Offline';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center group"
      style={{ width: 36, height: 36 }}
    >
      {/* Pulse ring */}
      {shouldPulse && (
        <span
          className={`absolute inset-0 rounded-full ${colors.pulse} opacity-40 animate-ping`}
          style={{ animationDuration: '2s' }}
        />
      )}

      {/* Outer ring */}
      <span
        className={`
          absolute inset-0 rounded-full border-2 ${colors.ring} bg-white
          transition-transform duration-200
          ${isSelected ? 'scale-125 shadow-lg' : 'group-hover:scale-110'}
        `}
      />

      {/* Inner dot with vehicle icon */}
      <span className="relative z-10 text-sm leading-none">
        {VEHICLE_EMOJI[vehicleType] || '📦'}
      </span>
    </button>
  );
});

export default AgentMarker;
