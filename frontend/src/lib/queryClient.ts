import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0, // Always consider data stale - no caching
      cacheTime: 0, // Don't cache queries at all
      refetchOnMount: true, // Always refetch on mount
      refetchOnReconnect: true,
      networkMode: 'online', // Only run queries when online
    },
  },
});

