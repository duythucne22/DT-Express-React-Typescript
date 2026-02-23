# Design Patterns Implementation Guide

This document describes the design patterns implemented in the DTEx Logistics application and how to use them.

---

## 1. State Pattern - Order State Machine

**Location:** `src/lib/patterns/state/OrderStateMachine.ts`

**Purpose:** Encapsulates order lifecycle transitions and validates state changes based on business rules.

### Features

- **Transition Map:** Defines valid state transitions (e.g., Created → Confirmed → Shipped → Delivered)
- **Role-Based Actions:** Restricts actions based on user roles (Admin, Dispatcher, Driver)
- **Action Helpers:** Provides labels and styling for UI buttons

### Usage Example

```typescript
import { OrderStateMachine } from '@/lib/patterns/state/OrderStateMachine';

// Check if transition is valid
const canConfirm = OrderStateMachine.canTransition('Created', 'Confirmed'); // true

// Get available actions for current order status and user role
const actions = OrderStateMachine.getAvailableActions('Created', 'Admin');
// Returns: ['Confirm', 'Cancel']

// Get button styling
const colors = OrderStateMachine.getActionColor('Confirm');
// Returns: { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-white' }

// Get action label
const label = OrderStateMachine.getActionLabel('Confirm');
// Returns: 'Confirm Order'
```

### Integration Points

- **OrderDetailPage**: Uses state machine to determine which action buttons to show
- **ActionButtons Component**: Uses state machine for button styling and labels
- **useOrder Hook**: Computes available actions based on order status and user role

---

## 2. Observer Pattern - Tracking Updates

**Location:** `src/lib/patterns/observer/TrackingObserver.ts`

**Purpose:** Decouples real-time tracking update sources (mock interval, SignalR) from consumers (store, UI).

### Features

- **Event-Driven:** Listeners subscribe to agent updates
- **Singleton Instance:** One global observer manages all subscriptions
- **Clean Unsubscribe:** Returns unsubscribe function from subscribe call
- **Error Isolation:** Listener errors don't affect other listeners

### Usage Example

```typescript
import { trackingObserver } from '@/lib/patterns/observer/TrackingObserver';

// Subscribe to updates
const unsubscribe = trackingObserver.subscribe((update: AgentUpdate) => {
  console.log(`Agent ${update.agentId} moved to`, update.location);
  // Update store or UI
});

// Notify all listeners (called by update source)
trackingObserver.notify({
  agentId: 'agent-001',
  location: { lat: 31.2304, lng: 121.4737 },
  timestamp: new Date().toISOString(),
});

// Cleanup
unsubscribe();
```

### Integration Points

- **useTracking Hook**: Subscribes to observer on mount, unsubscribes on unmount
- **Mock Tracking Generator**: Calls `observer.notify()` when location changes
- **AgentsStore**: Receives updates via observer subscription

---

## 3. Decorator Pattern - Audit Logging

**Location:** `src/lib/patterns/decorator/AuditDecorator.ts`

**Purpose:** Wraps API operations with logging, timing, and correlation ID tracking without modifying original functions.

### Features

- **Correlation IDs:** Generates UUID v4 for request tracing
- **Performance Timing:** Measures and logs operation duration
- **Error Logging:** Captures and logs failures with stack traces
- **Visual Feedback:** Shows toasts in dev mode for operation status
- **Audit History:** Stores last 50 operations in memory

### Usage Example

```typescript
import { withAudit } from '@/lib/patterns/decorator/AuditDecorator';
import { ordersApi } from '@/lib/api/orders';

// Wrap API call with audit decorator
const createOrderWithAudit = withAudit(
  (correlationId: string) => ordersApi.create(data, correlationId),
  'CreateOrder'
);

// Execute (will log start, duration, success/failure)
const result = await createOrderWithAudit();

// Console output:
// [AUDIT] CreateOrder started — a1b2c3d4-e5f6-7890-abcd-ef1234567890
// [AUDIT] CreateOrder completed — a1b2c3d4-e5f6-7890-abcd-ef1234567890 — 234ms
```

### Audit Log API

```typescript
import { getAuditLogs, getAuditStats, clearAuditLogs } from '@/lib/patterns/decorator/AuditDecorator';

// Get recent logs
const logs = getAuditLogs(); // Returns last 50 audit entries

// Get statistics
const stats = getAuditStats();
// Returns: { total: 42, successful: 40, failed: 2, avgDuration: 187 }

// Clear logs
clearAuditLogs();
```

### Integration Points

- **auditedOrdersApi**: Wrapper module applying decorator to all order mutations
- **useOrder Hook**: Uses audited API for Confirm, Ship, Deliver, Cancel actions
- **CreateOrderPage**: Uses audited API for order creation
- **API Headers**: Correlation ID passed as `X-Correlation-ID` header

---

## 4. CQRS - Command Query Responsibility Segregation

**Location:** `src/lib/patterns/cqrs/`

**Purpose:** Separates read operations (queries) from write operations (commands) for cleaner architecture.

### 4.1 Commands

**Location:** `src/lib/patterns/cqrs/commands/CreateOrderCommand.ts`

#### Features

- **Validation:** Uses Zod schemas to validate data before API call
- **Encapsulation:** Bundles data, validation, API call, and store update
- **Reusability:** Can be used in hooks or directly in components

#### Usage Example

```typescript
import { CreateOrderCommand } from '@/lib/patterns/cqrs/commands/CreateOrderCommand';

const command = new CreateOrderCommand({
  customerName: 'John Doe',
  customerPhone: '+86 138 1234 5678',
  origin: { /* ... */ },
  destination: { /* ... */ },
  serviceLevel: 'Express',
  items: [/* ... */],
});

try {
  const result = await command.execute();
  console.log('Order created:', result.orderId);
} catch (error) {
  // Validation or API error
  console.error(error.message);
}
```

### 4.2 Queries

**Location:** `src/lib/patterns/cqrs/queries/GetOrdersQuery.ts`

#### Features

- **Caching:** Checks store for fresh data before fetching from API
- **Staleness:** Respects 5-minute stale time (configurable)
- **Filtering:** Applies filters client-side (status, priority, search, etc.)
- **Fluent Interface:** Chainable `withFilters()` method

#### Usage Example

```typescript
import { GetOrdersQuery } from '@/lib/patterns/cqrs/queries/GetOrdersQuery';

// Create query with filters
const query = new GetOrdersQuery({
  status: ['Created', 'Confirmed'],
  search: 'John',
});

// Execute (uses cache if fresh)
const orders = await query.execute();

// Force refresh
const freshOrders = await query.refresh();

// Chain filters
const filteredQuery = query.withFilters({ priority: ['Urgent'] });
const urgentOrders = await filteredQuery.execute();
```

### Integration Points

- **CreateOrderPage**: Can optionally use `CreateOrderCommand` (demo code included, commented out)
- **Standalone Usage**: Both patterns can be used outside React hooks for server-side logic or tests

---

## Pattern Benefits

| Pattern | Primary Benefit | Testability | Extensibility |
|---------|----------------|-------------|---------------|
| **State Machine** | Type-safe state transitions, business rules enforcement | High - pure functions | Easy - add new statuses/roles |
| **Observer** | Decoupled real-time updates, multiple listeners | Medium - requires mocking | Easy - add more event types |
| **Decorator** | Non-invasive logging, correlation tracking | High - wrapper pattern | Easy - add more decorators |
| **CQRS** | Separation of concerns, clear data flow | High - isolated logic | Medium - add new commands/queries |

---

## Dev Tools Integration

### Audit Logs in Console

When running in dev mode (`npm run dev`), all audited operations will:

1. Log to browser console with correlation IDs
2. Show toast notifications for operation status
3. Store recent history accessible via `getAuditLogs()`

### React Query DevTools

View query caching behavior to see CQRS queries in action:

```bash
# Open React Query DevTools (bottom-left icon)
# Watch 'orders' query cache
# Notice how GetOrdersQuery checks staleness before refetching
```

---

## Testing Patterns

### Unit Testing State Machine

```typescript
import { OrderStateMachine } from '@/lib/patterns/state/OrderStateMachine';

test('should allow Created → Confirmed transition', () => {
  expect(OrderStateMachine.canTransition('Created', 'Confirmed')).toBe(true);
});

test('should prevent Delivered → Shipped transition', () => {
  expect(OrderStateMachine.canTransition('Delivered', 'Shipped')).toBe(false);
});

test('Admin should see Confirm and Cancel actions for Created order', () => {
  const actions = OrderStateMachine.getAvailableActions('Created', 'Admin');
  expect(actions).toEqual(['Confirm', 'Cancel']);
});
```

### Testing Observer

```typescript
import { trackingObserver } from '@/lib/patterns/observer/TrackingObserver';

test('should notify all subscribers', () => {
  const listener1 = jest.fn();
  const listener2 = jest.fn();
  
  trackingObserver.subscribe(listener1);
  trackingObserver.subscribe(listener2);
  
  const update = { agentId: 'agent-1', location: { lat: 31, lng: 121 }, timestamp: '2026-02-16T10:00:00Z' };
  trackingObserver.notify(update);
  
  expect(listener1).toHaveBeenCalledWith(update);
  expect(listener2).toHaveBeenCalledWith(update);
});
```

### Testing Decorator

```typescript
import { withAudit, getAuditLogs, clearAuditLogs } from '@/lib/patterns/decorator/AuditDecorator';

beforeEach(() => clearAuditLogs());

test('should log successful operation', async () => {
  const mockFn = jest.fn(() => Promise.resolve({ id: '123' }));
  const audited = withAudit(mockFn, 'TestAction');
  
  await audited();
  
  const logs = getAuditLogs();
  expect(logs).toHaveLength(1);
  expect(logs[0].action).toBe('TestAction');
  expect(logs[0].success).toBe(true);
});
```

---

## Performance Considerations

### State Machine
- **Cost:** O(1) - hashmap lookups
- **Memory:** < 1KB - static transition map
- **Recommendation:** No optimization needed

### Observer
- **Cost:** O(n) per notification - iterates all listeners
- **Memory:** Proportional to listener count
- **Recommendation:** Unsubscribe on unmount, avoid memory leaks

### Decorator
- **Cost:** Minimal - adds ~2-5ms per operation for logging
- **Memory:** Stores last 50 logs (~10KB)
- **Recommendation:** Consider disabling detailed logging in production

### CQRS
- **Cost:** Varies - Query has cache overhead, Command has validation overhead
- **Memory:** Query stores lastFetchTime (8 bytes per instance)
- **Recommendation:** Use singleton queries or manage instance lifecycle

---

## Future Enhancements

1. **State Machine:** Add state transition history tracking
2. **Observer:** Add event filtering (subscribe to specific agents only)
3. **Decorator:** Send audit logs to analytics service in production
4. **CQRS:** Add optimistic updates to commands, reactive queries with RxJS

---

## References

- **Gang of Four Patterns:** [Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns)
- **CQRS Pattern:** [Martin Fowler - CQRS](https://martinfowler.com/bliki/CQRS.html)
- **TypeScript Best Practices:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
