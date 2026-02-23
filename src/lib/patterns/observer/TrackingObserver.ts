import type { AgentUpdate } from '../../../types';

type AgentUpdateListener = (update: AgentUpdate) => void;

/**
 * Observer pattern for real-time tracking updates.
 * Decouples the update source (mock setInterval / SignalR) from the consumers (store, UI).
 */
class TrackingObserver {
  private listeners: Set<AgentUpdateListener> = new Set();

  subscribe(listener: AgentUpdateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(update: AgentUpdate): void {
    for (const listener of this.listeners) {
      try {
        listener(update);
      } catch {
        // Listeners should not throw; silently ignore
      }
    }
  }

  unsubscribeAll(): void {
    this.listeners.clear();
  }

  get subscriberCount(): number {
    return this.listeners.size;
  }
}

// Singleton
export const trackingObserver = new TrackingObserver();
export default TrackingObserver;
