import { memo } from 'react';
import type { DeliveryAgent, AgentStatus } from '../../types';
import { AGENT_STATUS_CONFIG } from '../../lib/constants';

const VEHICLE_EMOJI: Record<string, string> = {
  bike: '🏍️',
  van: '🚐',
  truck: '🚚',
};

interface AgentCardProps {
  agent: DeliveryAgent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const AgentCard = memo(function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  const statusCfg = AGENT_STATUS_CONFIG[agent.status as AgentStatus];

  return (
    <button
      type="button"
      onClick={() => onSelect(agent.id)}
      className={`
        w-full p-4 rounded-xl border text-left transition-all duration-200
        ${isSelected
          ? 'border-orange-400 bg-orange-50 shadow-md'
          : 'border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm'}
      `}
    >
      {/* Top row: name + status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{VEHICLE_EMOJI[agent.vehicleType] || '📦'}</span>
          <span className="font-semibold text-slate-900 text-sm">{agent.name}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.bgColor} ${statusCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-500">
        <div>Region: <span className="text-slate-700">{agent.region}</span></div>
        <div>Rating: <span className="text-slate-700">{'★'.repeat(Math.round(agent.rating))} {agent.rating}</span></div>
        <div>Deliveries: <span className="text-slate-700">{agent.totalDeliveries.toLocaleString()}</span></div>
        <div>Active: <span className="text-slate-700">{agent.assignedOrders.length} orders</span></div>
      </div>

      {/* Phone */}
      <p className="mt-2 text-xs text-slate-400 truncate">{agent.phone}</p>
    </button>
  );
});

export default AgentCard;
