import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useReports } from '../../hooks/useReports';
import MonthlyShipmentsChart from '../../components/reports/MonthlyShipmentsChart';
import RevenuePieChart from '../../components/reports/RevenuePieChart';
import DateRangePicker from '../../components/reports/DateRangePicker';
import { downloadCsv, objectsToCsv } from '../../lib/utils/csv';

type ReportsTab = 'monthly' | 'revenue';

function toMonthInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportsTab>('monthly');
  const [month, setMonth] = useState(toMonthInputValue());

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [fromDate, setFromDate] = useState(toDateInputValue(monthStart));
  const [toDate, setToDate] = useState(toDateInputValue(now));

  const { monthly, revenue } = useReports(month, fromDate, toDate);

  const shipmentBars = useMemo(() => {
    const shipments = monthly.data?.shipments ?? [];
    const weekBuckets = new Map<number, number>();

    for (const item of shipments) {
      const day = new Date(item.createdAt).getUTCDate();
      const week = Math.floor((day - 1) / 7) + 1;
      weekBuckets.set(week, (weekBuckets.get(week) ?? 0) + 1);
    }

    return Array.from(weekBuckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([week, shipments]) => ({ label: `W${week}`, shipments }));
  }, [monthly.data]);

  const averageCost = useMemo(() => {
    const total = monthly.data?.totalShipments ?? 0;
    if (!total) return 0;
    return (monthly.data?.totalRevenue ?? 0) / total;
  }, [monthly.data]);

  const handleDownloadCsv = () => {
    const shipments = monthly.data?.shipments ?? [];

    if (!shipments.length) {
      toast.error('No shipments available to export');
      return;
    }

    const rows = shipments.map((item) => ({
      orderNumber: item.orderNumber,
      customerName: item.customerName,
      origin: item.origin,
      destination: item.destination,
      status: item.status,
      serviceLevel: item.serviceLevel,
      carrierCode: item.carrierCode,
      trackingNumber: item.trackingNumber,
      cost: item.cost,
      currency: item.costCurrency,
      createdAt: item.createdAt,
    }));

    const csv = objectsToCsv(rows, [
      { key: 'orderNumber', header: 'Order Number' },
      { key: 'customerName', header: 'Customer' },
      { key: 'origin', header: 'Origin' },
      { key: 'destination', header: 'Destination' },
      { key: 'status', header: 'Status' },
      { key: 'serviceLevel', header: 'Service Level' },
      { key: 'carrierCode', header: 'Carrier' },
      { key: 'trackingNumber', header: 'Tracking Number' },
      { key: 'cost', header: 'Cost' },
      { key: 'currency', header: 'Currency' },
      { key: 'createdAt', header: 'Created At' },
    ]);

    downloadCsv(csv, `monthly-shipments-${month}.csv`);
    toast.success('CSV downloaded');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monthly shipments and carrier revenue analytics.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            activeTab === 'monthly'
              ? 'bg-orange-50 border-orange-200 text-orange-700'
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Monthly Shipments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            activeTab === 'revenue'
              ? 'bg-orange-50 border-orange-200 text-orange-700'
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Revenue by Carrier
        </button>
      </div>

      {activeTab === 'monthly' && (
        <section className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex flex-col md:flex-row md:items-end gap-3 md:justify-between">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Month</label>
                <input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>
          </div>

          {monthly.isLoading ? (
            <div className="h-80 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
          ) : monthly.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load monthly shipments report.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Total Shipments</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{monthly.data?.totalShipments ?? 0}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">
                    {(monthly.data?.totalRevenue ?? 0).toFixed(2)} {monthly.data?.currency ?? 'CNY'}
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Average Cost</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">
                    {averageCost.toFixed(2)} {monthly.data?.currency ?? 'CNY'}
                  </p>
                </div>
              </div>

              <MonthlyShipmentsChart data={shipmentBars} />
            </>
          )}
        </section>
      )}

      {activeTab === 'revenue' && (
        <section className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <DateRangePicker
              from={fromDate}
              to={toDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
            />
          </div>

          {revenue.isLoading ? (
            <div className="h-80 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
          ) : revenue.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load revenue breakdown report.
            </div>
          ) : (
            <>
              <RevenuePieChart data={revenue.data?.carriers ?? []} />

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-left text-slate-600">
                        <th className="px-4 py-3 font-medium">Carrier</th>
                        <th className="px-4 py-3 font-medium">Orders</th>
                        <th className="px-4 py-3 font-medium">Total Revenue</th>
                        <th className="px-4 py-3 font-medium">Avg Order Value</th>
                        <th className="px-4 py-3 font-medium">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(revenue.data?.carriers ?? []).map((carrier) => (
                        <tr key={carrier.carrierCode} className="border-b border-slate-100 text-slate-700">
                          <td className="px-4 py-3 font-medium">{carrier.carrierName}</td>
                          <td className="px-4 py-3">{carrier.orderCount}</td>
                          <td className="px-4 py-3">{carrier.totalRevenue.toFixed(2)} {revenue.data?.currency ?? 'CNY'}</td>
                          <td className="px-4 py-3">{carrier.averageOrderValue.toFixed(2)} {revenue.data?.currency ?? 'CNY'}</td>
                          <td className="px-4 py-3">{carrier.percentageOfTotal.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
