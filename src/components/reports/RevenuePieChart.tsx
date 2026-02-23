import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenuePieChartProps {
  data: Array<{
    carrierName: string;
    totalRevenue: number;
    percentageOfTotal: number;
  }>;
}

const COLORS = ['#f97316', '#2563eb', '#22c55e', '#7c3aed', '#ec4899'];

export default function RevenuePieChart({ data }: RevenuePieChartProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-base font-semibold text-slate-900">Revenue Share</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="totalRevenue"
              nameKey="carrierName"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ payload }) => `${payload.percentageOfTotal.toFixed(1)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`${entry.carrierName}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(2)} CNY`, 'Revenue']}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
