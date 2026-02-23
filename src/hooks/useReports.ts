import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../lib/api/reports';

export function useMonthlyShipments(month: string) {
  return useQuery({
    queryKey: ['reports', 'monthly-shipments', month],
    queryFn: () => reportsApi.getMonthlyShipments(month),
    enabled: Boolean(month),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueByCarrier(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'revenue-by-carrier', from, to],
    queryFn: () => reportsApi.getRevenueByCarrier(from, to),
    enabled: Boolean(from) && Boolean(to),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReports(month: string, from: string, to: string) {
  const monthlyQuery = useMonthlyShipments(month);
  const revenueQuery = useRevenueByCarrier(from, to);

  return {
    monthly: monthlyQuery,
    revenue: revenueQuery,
  };
}
