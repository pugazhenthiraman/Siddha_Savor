import { useState, useCallback } from 'react';
import { ApiException } from '@/lib/services/api';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

interface ErrorState {
  message: string;
  code?: string;
  field?: string;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: unknown, field?: string) => {
    console.error('Error occurred:', error);

    if (error instanceof ApiException) {
      setError({
        message: error.message,
        code: error.code,
        field,
      });
    } else if (error instanceof Error) {
      setError({
        message: error.message,
        field,
      });
    } else if (typeof error === 'string') {
      setError({
        message: error,
        field,
      });
    } else {
      setError({
        message: ERROR_MESSAGES.SOMETHING_WENT_WRONG,
        field,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasError = error !== null;

  return {
    error,
    hasError,
    handleError,
    clearError,
  };
}
