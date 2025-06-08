import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that debounces a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that provides a debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...deps]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook for debouncing async functions with cancellation support
 */
export function useDebouncedAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  asyncFn: T,
  delay: number,
  deps: React.DependencyList = []
): {
  debouncedFn: (...args: Parameters<T>) => Promise<ReturnType<T>>;
  cancel: () => void;
  isPending: boolean;
} {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const resolveRef = useRef<((value: ReturnType<T>) => void) | null>(null);
  const rejectRef = useRef<((reason?: unknown) => void) | null>(null);
  const [isPending, setIsPending] = useState(false);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (rejectRef.current) {
      rejectRef.current(new Error('Debounced async call was cancelled'));
      rejectRef.current = null;
      resolveRef.current = null;
    }
    setIsPending(false);
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise<ReturnType<T>>((resolve, reject) => {
        // Cancel previous call
        cancel();

        setIsPending(true);
        resolveRef.current = resolve;
        rejectRef.current = reject;

        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await asyncFn(...args);
            if (resolveRef.current === resolve) {
              resolve(result);
              setIsPending(false);
            }
          } catch (error) {
            if (rejectRef.current === reject) {
              reject(error);
              setIsPending(false);
            }
          } finally {
            resolveRef.current = null;
            rejectRef.current = null;
          }
        }, delay);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFn, delay, cancel, ...deps]
  ) as (...args: Parameters<T>) => Promise<ReturnType<T>>;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    debouncedFn,
    cancel,
    isPending
  };
}

/**
 * Hook that provides debounced state updates
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T) => void] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(immediateValue, delay);

  return [immediateValue, debouncedValue, setImmediateValue];
}

/**
 * Hook for debounced search functionality
 */
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay = 300
): {
  query: string;
  results: T[];
  isSearching: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  clearResults: () => void;
} {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { debouncedFn: debouncedSearch } = useDebouncedAsync(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return [];
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await searchFn(searchQuery);
        setResults(searchResults);
        return searchResults;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        setResults([]);
        throw err;
      } finally {
        setIsSearching(false);
      }
    },
    delay
  );

  const handleSetQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery).catch(() => {
      // Error is already handled in the debounced function
    });
  }, [debouncedSearch]);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsSearching(false);
  }, []);

  return {
    query,
    results,
    isSearching,
    error,
    setQuery: handleSetQuery,
    clearResults
  };
}