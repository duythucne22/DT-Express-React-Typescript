import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useOrder } from '../../hooks/useOrder';
import { useOrdersStore } from '../../stores/ordersStore';
import { STATUS_CONFIG, SERVICE_LEVEL_CONFIG } from '../../lib/constants';
import { OrderTimeline } from '../../components/orders/OrderTimeline';
import { ActionButtons } from '../../components/orders/ActionButtons';
import Modal from '../../components/ui/Modal';
import type { OrderAction } from '../../lib/patterns/state/OrderStateMachine';

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const summary = useOrdersStore((s) => (id ? s.getOrder(id) : undefined));
  const { order, auditEntries, isLoading, isMutating, availableActions, performAction } = useOrder(id);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const statusConfig = useMemo(() => order ? STATUS_CONFIG[order.status] : null, [order]);
  const serviceConfig = useMemo(() => order ? SERVICE_LEVEL_CONFIG[order.serviceLevel] : null, [order]);

  const handleAction = async (action: OrderAction) => {
    if (action === 'Cancel') {
      setCancelModalOpen(true);
      return;
    }

    try {
      await performAction({ action });
      toast.success(`Order action successful: ${action}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed';
      toast.error(message);
    }
  };

  const confirmCancel = async () => {
    try {
      await performAction({ action: 'Cancel', reason: cancelReason || undefined });
      toast.success('Order cancelled successfully');
      setCancelModalOpen(false);
      setCancelReason('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cancellation failed';
      toast.error(message);
    }
  };

  if (isLoading || !order) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-500">
        Loading order detail...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <h1 className="text-2xl font-semibold text-slate-900">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Order detail and workflow actions</p>
        </div>

        <div className="flex items-center gap-2">
          {statusConfig && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor}`}>
              {statusConfig.label}
            </span>
          )}
          {summary && (
            <span className="text-sm text-slate-600">{summary.currency} {summary.amount.toFixed(2)}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Customer Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Customer Name</p>
                <p className="text-slate-800 font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-slate-500">Service Level</p>
                {serviceConfig && (
                  <span className={`inline-flex items-center mt-1 px-2 py-1 rounded-full text-xs border ${serviceConfig.bgColor} ${serviceConfig.color} ${serviceConfig.borderColor}`}>
                    {serviceConfig.label}
                  </span>
                )}
              </div>
              <div>
                <p className="text-slate-500">Tracking Number</p>
                <p className="text-slate-800">{order.trackingNumber ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Carrier</p>
                <p className="text-slate-800">{order.carrierCode ?? '—'}</p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2">Description</th>
                    <th className="py-2 pr-2">Qty</th>
                    <th className="py-2 pr-2">Weight</th>
                    <th className="py-2 pr-2">Dimensions</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={`${item.description}-${idx}`} className="border-b last:border-0 border-slate-100">
                      <td className="py-2 pr-2 text-slate-800">{item.description}</td>
                      <td className="py-2 pr-2 text-slate-700">{item.quantity}</td>
                      <td className="py-2 pr-2 text-slate-700">{item.weight.value} {item.weight.unit}</td>
                      <td className="py-2 pr-2 text-slate-700">
                        {item.dimensions
                          ? `${item.dimensions.lengthCm}×${item.dimensions.widthCm}×${item.dimensions.heightCm} cm`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Metadata</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Created At</p>
                <p className="text-slate-800">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Updated At</p>
                <p className="text-slate-800">{new Date(order.updatedAt).toLocaleString()}</p>
              </div>
              {summary && (
                <>
                  <div>
                    <p className="text-slate-500">Region</p>
                    <p className="text-slate-800">{summary.region}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Priority</p>
                    <p className="text-slate-800">{summary.priority}</p>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Status Timeline</h2>
            <OrderTimeline currentStatus={order.status} />
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Actions</h2>
            <ActionButtons actions={availableActions} disabled={isMutating} onAction={handleAction} />
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Addresses</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Origin</p>
                <p className="text-slate-800">{order.origin}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Destination</p>
                <p className="text-slate-800">{order.destination}</p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Audit Trail</h2>
            {auditEntries.length === 0 ? (
              <p className="text-sm text-slate-500">No audit logs available.</p>
            ) : (
              <ul className="space-y-2">
                {auditEntries.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <p className="text-slate-800 font-medium">{entry.action}</p>
                    <p className="text-slate-500 text-xs">{new Date(entry.timestamp).toLocaleString()} · {entry.username}</p>
                    <p className="text-slate-600 text-xs mt-1">{entry.details}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Modal
        open={cancelModalOpen}
        title="Cancel Order"
        onClose={() => setCancelModalOpen(false)}
        footer={(
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              disabled={isMutating}
              className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
            >
              Confirm Cancel
            </button>
          </div>
        )}
      >
        <p className="text-sm text-slate-600 mb-2">Optional reason for cancellation:</p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="客户要求取消"
        />
      </Modal>
    </div>
  );
}
