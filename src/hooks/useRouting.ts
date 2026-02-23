import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { routingApi } from '../lib/api/routing';
import type { RoutingCompareInput, RoutingStrategy, RoutingStrategyResult } from '../types';

export function useRouting() {
  const [results, setResults] = useState<RoutingStrategyResult[]>([]);

  const strategiesQuery = useQuery({
    queryKey: ['routing-strategies'],
    queryFn: () => routingApi.listStrategies(),
    staleTime: 5 * 60 * 1000,
  });

  const compareMutation = useMutation({
    mutationFn: (input: RoutingCompareInput) => routingApi.compareRoutes(input),
    onSuccess: (data) => {
      setResults(data);
    },
  });

  const calculateMutation = useMutation({
    mutationFn: ({ input, strategy }: { input: RoutingCompareInput; strategy: RoutingStrategy }) =>
      routingApi.calculateRoute(input, strategy),
  });

  return {
    strategies: strategiesQuery.data ?? ['Fastest', 'Cheapest', 'Balanced'],
    isLoadingStrategies: strategiesQuery.isLoading,

    results,
    compareRoutes: compareMutation.mutateAsync,
    isComparing: compareMutation.isPending,

    calculateRoute: async (input: RoutingCompareInput, strategy: RoutingStrategy) =>
      calculateMutation.mutateAsync({ input, strategy }),
    isCalculating: calculateMutation.isPending,
  };
}
