import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { trackingApi } from '../lib/api/tracking';
import { useAgentsStore } from '../stores/agentsStore';
import { trackingObserver } from '../lib/patterns/observer/TrackingObserver';
import { jitterLocation } from '../lib/mock/trackingGenerator';
import type { DeliveryAgent, AgentUpdate } from '../types';

const TICK_INTERVAL_MIN = 2000;
const TICK_INTERVAL_MAX = 3000;

export function useTracking() {
  const setAgents = useAgentsStore((s) => s.setAgents);
  const updateLocation = useAgentsStore((s) => s.updateLocation);
  const agentsMap = useAgentsStore((s) => s.agents);
  const selectedAgentId = useAgentsStore((s) => s.selectedAgentId);
  const setSelectedAgent = useAgentsStore((s) => s.setSelectedAgent);
  const lastUpdated = useAgentsStore((s) => s.lastUpdated);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Fetch agents list ----
  const query = useQuery<DeliveryAgent[]>({
    queryKey: ['agents'],
    queryFn: () => trackingApi.listAgents(),
    staleTime: 60 * 1000,
    retry: 2,
  });

  // Sync query data → store
  useEffect(() => {
    if (query.data) {
      setAgents(query.data);
    }
  }, [query.data, setAgents]);

  // ---- Real-time mock subscription ----
  useEffect(() => {
    // Subscribe store to observer
    const unsub = trackingObserver.subscribe((update: AgentUpdate) => {
      updateLocation(update.agentId, update.location.lat, update.location.lng);
    });

    // Start mock tick (jitter all non-offline agents)
    const tick = () => {
      const agents = useAgentsStore.getState().getAgentsList();
      for (const agent of agents) {
        if (agent.status === 'Offline') continue;
        const newLoc = jitterLocation(agent.currentLocation);
        trackingObserver.notify({
          agentId: agent.id,
          location: newLoc,
          timestamp: new Date().toISOString(),
        });
      }
    };

    const randomTick = () =>
      Math.floor(Math.random() * (TICK_INTERVAL_MAX - TICK_INTERVAL_MIN + 1)) + TICK_INTERVAL_MIN;

    // Recurring jitter with random interval
    const schedule = () => {
      tickRef.current = setTimeout(() => {
        tick();
        schedule();
      }, randomTick());
    };

    schedule();

    return () => {
      unsub();
      if (tickRef.current) clearTimeout(tickRef.current);
      tickRef.current = null;
    };
  }, [updateLocation]);

  // ---- Show toast on error ----
  useEffect(() => {
    if (query.error) {
      toast.error('Failed to load delivery agents. Retrying...');
    }
  }, [query.error]);

  // ---- Derived data ----
  const agents = useMemo(() => Array.from(agentsMap.values()), [agentsMap]);

  const selectedAgent = useMemo(
    () => (selectedAgentId ? agentsMap.get(selectedAgentId) ?? null : null),
    [selectedAgentId, agentsMap]
  );

  const stats = useMemo(() => {
    const byStatus = { Available: 0, OnDelivery: 0, Offline: 0, Break: 0 };
    for (const agent of agents) {
      byStatus[agent.status] = (byStatus[agent.status] || 0) + 1;
    }
    return { total: agents.length, byStatus };
  }, [agents]);

  const selectAgent = useCallback(
    (id: string | null) => {
      setSelectedAgent(selectedAgentId === id ? null : id);
    },
    [selectedAgentId, setSelectedAgent]
  );

  return {
    agents,
    selectedAgent,
    selectedAgentId,
    selectAgent,
    stats,
    lastUpdated,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
