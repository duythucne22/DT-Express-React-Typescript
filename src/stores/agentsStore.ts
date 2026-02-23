import { create } from 'zustand';
import type { DeliveryAgent } from '../types';

interface AgentsState {
  agents: Map<string, DeliveryAgent>;
  selectedAgentId: string | null;
  lastUpdated: string | null;

  // Actions
  setAgents: (agents: DeliveryAgent[]) => void;
  upsertAgent: (agent: DeliveryAgent) => void;
  updateLocation: (agentId: string, lat: number, lng: number) => void;
  setSelectedAgent: (id: string | null) => void;
  getAgent: (id: string) => DeliveryAgent | undefined;
  getAgentsList: () => DeliveryAgent[];
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: new Map(),
  selectedAgentId: null,
  lastUpdated: null,

  setAgents: (agents) => {
    const map = new Map<string, DeliveryAgent>();
    for (const agent of agents) {
      map.set(agent.id, agent);
    }
    set({ agents: map, lastUpdated: new Date().toISOString() });
  },

  upsertAgent: (agent) => {
    set((state) => {
      const next = new Map(state.agents);
      next.set(agent.id, agent);
      return { agents: next, lastUpdated: new Date().toISOString() };
    });
  },

  updateLocation: (agentId, lat, lng) => {
    set((state) => {
      const existing = state.agents.get(agentId);
      if (!existing) return state;
      const next = new Map(state.agents);
      next.set(agentId, { ...existing, currentLocation: { lat, lng } });
      return { agents: next, lastUpdated: new Date().toISOString() };
    });
  },

  setSelectedAgent: (id) => set({ selectedAgentId: id }),

  getAgent: (id) => get().agents.get(id),

  getAgentsList: () => Array.from(get().agents.values()),
}));
