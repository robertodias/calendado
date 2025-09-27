/**
 * Loading state hook
 * 
 * Provides consistent loading state management
 */

import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

interface UseLoadingReturn extends LoadingState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useLoading(initialLoading = false): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setError(null); // Clear error when starting new operation
    }
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const execute = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await asyncFn();
      setError(null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    setLoading,
    setError: setErrorState,
    execute,
    reset
  };
}
