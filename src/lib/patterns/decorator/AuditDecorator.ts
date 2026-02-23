import { toast } from 'sonner';

/**
 * Decorator pattern for audit logging.
 * Wraps async functions to add correlation IDs, timing, and logging.
 * 
 * Example usage:
 * ```typescript
 * const createOrderWithAudit = withAudit(
 *   () => ordersApi.create(data),
 *   'CreateOrder'
 * );
 * await createOrderWithAudit();
 * ```
 */

// Generate UUID v4 correlation ID
function generateCorrelationId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface AuditLogEntry {
  correlationId: string;
  action: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: string;
}

// Store recent audit logs (last 50)
const auditLogs: AuditLogEntry[] = [];
const MAX_AUDIT_LOGS = 50;

/**
 * Decorator function that adds audit logging to any async operation
 */
export function withAudit<T>(
  fn: (correlationId: string) => Promise<T>,
  action: string
): () => Promise<T> {
  return async () => {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    
    const logEntry: AuditLogEntry = {
      correlationId,
      action,
      startTime,
    };

    // Show toast in dev mode
    if (import.meta.env.DEV) {
      toast.info(`${action} started`, {
        description: `Correlation ID: ${correlationId.substring(0, 8)}...`,
        duration: 2000,
      });
    }

    try {
      const result = await fn(correlationId);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logEntry.endTime = endTime;
      logEntry.duration = duration;
      logEntry.success = true;
      
      if (import.meta.env.DEV) {
        toast.success(`${action} completed`, {
          description: `Duration: ${duration}ms`,
          duration: 2000,
        });
      }
      
      // Store audit log
      auditLogs.push(logEntry);
      if (auditLogs.length > MAX_AUDIT_LOGS) {
        auditLogs.shift();
      }
      
      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logEntry.endTime = endTime;
      logEntry.duration = duration;
      logEntry.success = false;
      logEntry.error = errorMessage;
      
      if (import.meta.env.DEV) {
        toast.error(`${action} failed`, {
          description: errorMessage,
          duration: 3000,
        });
      }
      
      // Store audit log
      auditLogs.push(logEntry);
      if (auditLogs.length > MAX_AUDIT_LOGS) {
        auditLogs.shift();
      }
      
      throw error;
    }
  };
}

/**
 * Get recent audit logs
 */
export function getAuditLogs(): AuditLogEntry[] {
  return [...auditLogs];
}

/**
 * Clear all audit logs
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0;
}

/**
 * Get audit statistics
 */
export function getAuditStats() {
  const total = auditLogs.length;
  const successful = auditLogs.filter((log) => log.success === true).length;
  const failed = auditLogs.filter((log) => log.success === false).length;
  const avgDuration =
    auditLogs.length > 0
      ? auditLogs.reduce((sum, log) => sum + (log.duration ?? 0), 0) / auditLogs.length
      : 0;

  return {
    total,
    successful,
    failed,
    avgDuration: Math.round(avgDuration),
  };
}
