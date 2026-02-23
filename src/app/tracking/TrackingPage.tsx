import { useState, useMemo, useCallback } from 'react';
import { Map, List, Columns2, RefreshCw, Users, Truck, Coffee, WifiOff } from 'lucide-react';
import { useTracking } from '../../hooks/useTracking';
import { trackingApi } from '../../lib/api/tracking';
import InteractiveMap from '../../components/tracking/InteractiveMap';
import AgentCard from '../../components/tracking/AgentCard';
import { AGENT_STATUS_CONFIG } from '../../lib/constants';
import type { AgentStatus, DeliveryAgent, MultiLegRoute } from '../../types';

type ViewMode = 'split' | 'map' | 'list';

const STATUS_ICON: Record<AgentStatus, typeof Users> = {
  Available: Users,
  OnDelivery: Truck,
  Break: Coffee,
  Offline: WifiOff,
};

// ============================================
// SKELETON COMPONENTS
// ============================================

function MapSkeleton() {
  return (
    <div className="w-full h-full rounded-xl bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <Map className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Loading map…</p>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-5 w-16 bg-slate-200 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-3 w-12 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ============================================
// DETAIL PANEL
// ============================================

function AgentDetailPanel({ agent, routeSummary }: { agent: DeliveryAgent; routeSummary: MultiLegRoute | null }) {
  const cfg = AGENT_STATUS_CONFIG[agent.status];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-xl">
          {agent.vehicleType === 'bike' ? '🏍️' : agent.vehicleType === 'van' ? '🚐' : '🚚'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{agent.name}</h3>
          <p className="text-xs text-slate-500">{agent.id} · {agent.phone}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
          {cfg.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500">Region</p>
          <p className="text-sm font-semibold text-slate-900">{agent.region}</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500">Rating</p>
          <p className="text-sm font-semibold text-slate-900">{'★'.repeat(Math.round(agent.rating))} {agent.rating}</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500">Total Deliveries</p>
          <p className="text-sm font-semibold text-slate-900">{agent.totalDeliveries.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500">Active Orders</p>
          <p className="text-sm font-semibold text-slate-900">{agent.assignedOrders.length}</p>
        </div>
      </div>

      {/* Location */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
        <p className="text-xs text-slate-500 mb-1">Current Location</p>
        <p className="text-sm font-mono text-slate-700">
          {agent.currentLocation.lat.toFixed(4)}°N, {agent.currentLocation.lng.toFixed(4)}°E
        </p>
      </div>

      {routeSummary && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">Destination Progress</p>
          <p className="text-sm text-slate-700">
            Remaining <span className="font-semibold text-slate-900">{routeSummary.remainingDistanceKm.toLocaleString()} km</span>
            {' '}of{' '}
            <span className="font-semibold text-slate-900">{routeSummary.totalDistanceKm.toLocaleString()} km</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Destination: {routeSummary.destination.name}</p>
        </div>
      )}

      {/* Assigned orders */}
      {agent.assignedOrders.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Assigned Orders</p>
          <div className="flex flex-wrap gap-1.5">
            {agent.assignedOrders.map((orderId) => (
              <span
                key={orderId}
                className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 text-xs font-mono border border-orange-200"
              >
                {orderId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function TrackingPage() {
  const {
    agents,
    selectedAgent,
    selectedAgentId,
    selectAgent,
    stats,
    lastUpdated,
    isLoading,
    refetch,
  } = useTracking();

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [routeGeojson, setRouteGeojson] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [routeSummary, setRouteSummary] = useState<MultiLegRoute | null>(null);
  const [internationalMode, setInternationalMode] = useState<'ship' | 'plane'>('ship');

  const filteredAgents = useMemo(() => {
    if (statusFilter === 'all') return agents;
    return agents.filter((a) => a.status === statusFilter);
  }, [agents, statusFilter]);

  const handleSelectAgent = useCallback(
    (id: string) => {
      selectAgent(id);
      setRouteGeojson(null);
      setRouteSummary(null);
    },
    [selectAgent]
  );

  const handleShowRoute = useCallback(
    async (agent: DeliveryAgent) => {
      try {
        const route = await trackingApi.getMultiLegRoute(agent.currentLocation, internationalMode);
        setRouteSummary(route);
        setRouteGeojson(null);
      } catch {
        // Silently fail for UX
      }
    },
    [internationalMode]
  );

  const viewModes: Array<{ mode: ViewMode; icon: typeof Map; label: string }> = [
    { mode: 'split', icon: Columns2, label: 'Split' },
    { mode: 'map', icon: Map, label: 'Map' },
    { mode: 'list', icon: List, label: 'List' },
  ];

  const showMap = viewMode === 'split' || viewMode === 'map';
  const showList = viewMode === 'split' || viewMode === 'list';

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title + stats */}
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Live Tracking</h1>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              {(['Available', 'OnDelivery', 'Break', 'Offline'] as const).map((status) => {
                const Icon = STATUS_ICON[status];
                return (
                  <span key={status} className="inline-flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5" />
                    {stats.byStatus[status]} {AGENT_STATUS_CONFIG[status].label}
                  </span>
                );
              })}
              <span className="text-slate-300">|</span>
              <span>{stats.total} total</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Status filter chips */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                All
              </button>
              {(['Available', 'OnDelivery', 'Break', 'Offline'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {AGENT_STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {viewModes.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  title={label}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === mode ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh agents"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-[10px] text-slate-400 mt-1">
            Last update: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map Panel */}
        {showMap && (
          <div className={`${showList ? 'flex-1 min-w-0' : 'flex-1'}`}>
            {isLoading ? (
              <MapSkeleton />
            ) : (
              <InteractiveMap
                agents={filteredAgents}
                selectedAgentId={selectedAgentId}
                onSelectAgent={handleSelectAgent}
                routeGeojson={routeGeojson}
                routeLegs={routeSummary?.legs ?? []}
              />
            )}
          </div>
        )}

        {/* List Panel */}
        {showList && (
          <div className={`${showMap ? 'w-96 flex-shrink-0' : 'flex-1 max-w-2xl mx-auto'} flex flex-col min-h-0`}>
            {/* List header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Agents <span className="text-slate-400 font-normal">({filteredAgents.length})</span>
              </h2>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              ) : filteredAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Users className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No agents match the filter.</p>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="mt-2 text-xs text-orange-600 hover:text-orange-700"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                filteredAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={agent.id === selectedAgentId}
                    onSelect={handleSelectAgent}
                  />
                ))
              )}
            </div>

            {/* Detail panel for selected agent */}
            {selectedAgent && (
              <div className="mt-3 flex-shrink-0">
                <AgentDetailPanel agent={selectedAgent} routeSummary={routeSummary} />
                {selectedAgent.status === 'OnDelivery' && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setInternationalMode('ship')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          internationalMode === 'ship'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        🚢 Ship CN↔US
                      </button>
                      <button
                        type="button"
                        onClick={() => setInternationalMode('plane')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          internationalMode === 'plane'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        ✈️ Plane CN↔US
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleShowRoute(selectedAgent)}
                      className="w-full px-3 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Show Multi-Leg Route
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
