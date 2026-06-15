import { useState, useEffect, useCallback, useRef } from "react";
import { fetchClient, ApiError } from "@/lib/api-client";

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useFetch<T>(endpoint: string, options: UseFetchOptions<T> = {}) {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const dataRef = useRef<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isFetching, setIsFetching] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  // Store latest callbacks in refs to prevent infinite re-renders
  // when users pass inline functions as options
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const fetchData = useCallback(async (abortController?: AbortController) => {
    await Promise.resolve(); // yield before any setState (React Compiler requirement)
    setIsFetching(true);
    if (!dataRef.current) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await fetchClient<T>(endpoint, {
        signal: abortController?.signal,
      });
      if (abortController?.signal.aborted) return;
      setData(result);
      dataRef.current = result;
      onSuccessRef.current?.(result);
      setIsLoading(false);
      setIsFetching(false);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === "AbortError" || abortController?.signal.aborted) return;
      setError(error);
      onErrorRef.current?.(error);
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const abortController = new AbortController();
    Promise.resolve().then(() => {
      if (!abortController.signal.aborted) {
        void fetchData(abortController);
      }
    });

    return () => {
      abortController.abort();
    };
  }, [fetchData, enabled]);

  return { data, isLoading, isFetching, error, refetch: () => fetchData() };
}
