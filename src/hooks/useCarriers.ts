import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { carriersApi } from '../lib/api/carriers';
import type {
  CarrierBookRequest,
  CarrierBookResponse,
  CarrierListItem,
  CarrierQuoteRequest,
  CarrierQuoteResponse,
} from '../types';

export function useCarriers() {
  const [quoteResult, setQuoteResult] = useState<CarrierQuoteResponse | null>(null);

  const listQuery = useQuery<CarrierListItem[]>({
    queryKey: ['carriers'],
    queryFn: () => carriersApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  const getQuoteMutation = useMutation({
    mutationFn: (payload: CarrierQuoteRequest) => carriersApi.getQuotes(payload),
    onSuccess: (result) => {
      setQuoteResult(result);
    },
  });

  const bookMutation = useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: CarrierBookRequest }) =>
      carriersApi.book(code, payload),
  });

  const quotes = quoteResult?.quotes ?? [];
  const recommended = quoteResult?.recommended ?? null;

  const quoteByCarrierCode = useMemo(() => {
    const map = new Map<string, CarrierQuoteResponse['quotes'][number]>();
    for (const quote of quotes) {
      map.set(quote.carrierCode, quote);
    }
    return map;
  }, [quotes]);

  return {
    carriers: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    error: listQuery.error,
    refetch: listQuery.refetch,

    getQuotes: getQuoteMutation.mutateAsync,
    isGettingQuotes: getQuoteMutation.isPending,

    bookCarrier: async (code: string, payload: CarrierBookRequest): Promise<CarrierBookResponse> =>
      bookMutation.mutateAsync({ code, payload }),
    isBooking: bookMutation.isPending,

    quoteResult,
    quotes,
    recommended,
    quoteByCarrierCode,
  };
}
