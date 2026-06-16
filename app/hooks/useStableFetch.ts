"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

interface FetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  immediate?: boolean;
  retryCount?: number;
  retryDelay?: number;
  cacheKey?: string; // Simple local caching to prevent over-fetching
}

const fetchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export function useStableFetch<T>(fetchFn: () => Promise<T>, options: FetchOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [manualRetryCount, setManualRetryCount] = useState(0);

  const retryLimit = options.retryCount ?? 0;
  const currentRetryRef = useRef(0);

  // Use refs for callbacks to prevent them from triggering re-effects
  const onSuccessRef = useRef(options.onSuccess);
  const onErrorRef = useRef(options.onError);

  useEffect(() => {
    onSuccessRef.current = options.onSuccess;
    onErrorRef.current = options.onError;
  }, [options.onSuccess, options.onError]);

  const execute = useCallback(async (force = false) => {
    // Check Cache
    if (!force && options.cacheKey) {
      const cached = fetchCache.get(options.cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setData(cached.data);
        return cached.data;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);

      if (options.cacheKey) {
        fetchCache.set(options.cacheKey, { data: result, timestamp: Date.now() });
      }

      onSuccessRef.current?.(result);
      currentRetryRef.current = 0; // Reset on success
      return result;
    } catch (err: any) {
      if (currentRetryRef.current < retryLimit) {
        currentRetryRef.current++;
        setTimeout(() => execute(true), options.retryDelay ?? 2000);
      } else {
        setError(err);
        onErrorRef.current?.(err);
      }
    } finally {
      if (currentRetryRef.current === 0 || currentRetryRef.current >= retryLimit) {
        setLoading(false);
      }
    }
  }, [fetchFn, retryLimit, options.retryDelay, options.cacheKey]);

  const retry = useCallback(() => {
    currentRetryRef.current = 0;
    setManualRetryCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, [execute, manualRetryCount, options.immediate]);

  return { data, loading, error, execute, retry, setData };
}
