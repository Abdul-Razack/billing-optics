import { useState, useEffect, useCallback } from "react";
import { fetchClient, ApiError } from "@/lib/api-client";

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useFetch<T>(endpoint: string, options: UseFetchOptions<T> = {}) {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (abortController?: AbortController) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchClient<T>(endpoint, {
        signal: abortController?.signal,
      });
      setData(result);
      onSuccess?.(result);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    const abortController = new AbortController();
    fetchData(abortController);

    return () => {
      abortController.abort();
    };
  }, [fetchData, enabled]);

  return { data, isLoading, error, refetch: () => fetchData() };
}
