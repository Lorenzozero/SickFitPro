import { useState, useCallback } from 'react';

export function useRtdbWrite<TArgs extends any[], TResult>( 
  mutationFn: (...args: TArgs) => Promise<TResult>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const execute = useCallback(async (...args: TArgs) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await mutationFn(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'An unknown error occurred'));
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn]);

  return { execute, data, isLoading, error };
}
