import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useOrders } from '../../hooks/useOrders';
import { useAuthStore } from '../../stores/authStore';
import { OrderFiltersBar } from '../../components/orders/OrderFilters';
import { VirtualizedOrderList } from '../../components/orders/VirtualizedOrderList';
import { exportToCsv } from '../../utils/csv';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();

  const {
    orders,
    stats,
    isLoading,
    isFetching,
    filters,
    selectedOrderId,
    setFilters,
    clearFilters,
    setSelectedOrder,
    refetch,
  } = useOrders();

  const canCreateOrder = hasPermission('canCreateOrder');
  const canExport = hasPermission('canExportCsv');

  const exportRows = useMemo(
    () => orders.map((order) => [
      order.orderNumber,
      order.customerName,
      order.status,
      order.priority,
      `${order.amount.toFixed(2)} ${order.currency}`,
      order.region,
      new Date(order.createdAt).toISOString(),
    ]),
    [orders]
  );

  const handleExport = () => {
    if (!orders.length) {
      toast.warning('No orders to export for current filters');
      return;
    }

    exportToCsv(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Order Number', 'Customer', 'Status', 'Priority', 'Amount', 'Region', 'Created At'],
      exportRows
    );

    toast.success(`Exported ${orders.length.toLocaleString()} orders`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and track shipments with filtering and virtualized performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {canExport && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}

          {canCreateOrder && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/orders/create')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              <Plus className="w-4 h-4" />
              Create Order
            </button>
          )}
        </div>
      </div>

      <OrderFiltersBar
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
        orderCount={stats.total}
        totalCount={stats.allTotal}
      />

      <VirtualizedOrderList
        orders={orders}
        selectedOrderId={selectedOrderId}
        onSelectOrder={(orderId) => {
          setSelectedOrder(orderId);
          navigate(`/orders/${orderId}`);
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
