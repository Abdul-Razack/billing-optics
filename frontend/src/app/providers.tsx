/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import { restoreQueryCache, persistQueryCache } from '../core/db/query-cache';
import { initializeEventHandlers } from '../core/api/event-handlers';
import { queueWorker } from '../core/queue/queue.worker';
import DiagnosticsPanel from '../core/performance/DiagnosticsPanel';

import { apiClient } from '../core/api/client';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query Error:', error);
      toast.error('Failed to fetch data. Please check your connection.');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation Error:', error);
      toast.error(error.message || 'An error occurred while saving.');
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey }) => {
        console.warn(`Fallback queryFn called for key:`, queryKey);
        return null;
      },
    },
  },
});

queryClient.setQueryDefaults(['invoices', 'detail'], {
  queryFn: async ({ queryKey }) => {
    const response = await apiClient.get(`/invoices/${queryKey[2]}`);
    return response.data;
  },
});

queryClient.setQueryDefaults(['products', 'search'], {
  queryFn: async ({ queryKey }) => {
    const response = await apiClient.get(`/products?search=${encodeURIComponent(String(queryKey[2] || ''))}`);
    return response.data;
  },
});

queryClient.setQueryDefaults(['customers', 'search'], {
  queryFn: async ({ queryKey }) => {
    const response = await apiClient.get(`/customers?search=${encodeURIComponent(String(queryKey[2] || ''))}`);
    return response.data;
  },
});

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' || event.type === 'added') {
    persistQueryCache(queryClient);
  }
});

export default function AppProviders({ children }: { children: React.ReactNode }): JSX.Element {
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    restoreQueryCache(queryClient).finally(() => {
      setIsRestored(true);
      initializeEventHandlers(queryClient);
      queueWorker.start();
    });
  }, []);

  if (!isRestored) {
    return <div>Loading application...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium', duration: 3000 }} />
      {children}
      <DiagnosticsPanel />
    </QueryClientProvider>
  );
}
