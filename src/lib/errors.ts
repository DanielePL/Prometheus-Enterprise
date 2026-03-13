export type ErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'NETWORK'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly originalError?: unknown;

  constructor(message: string, code: ErrorCode, statusCode: number, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

// Supabase PostgREST error codes
const POSTGREST_MAP: Record<string, { code: ErrorCode; status: number; message: string }> = {
  'PGRST116': { code: 'NOT_FOUND', status: 404, message: 'Record not found' },
  '23505': { code: 'CONFLICT', status: 409, message: 'A record with this data already exists' },
  '23503': { code: 'VALIDATION', status: 400, message: 'Referenced record does not exist' },
  '42501': { code: 'FORBIDDEN', status: 403, message: 'You do not have permission for this action' },
  '42P01': { code: 'NOT_FOUND', status: 404, message: 'Resource not found' },
};

/**
 * Converts any error into an AppError with a user-friendly message.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  // Supabase error shape: { message, code, details, hint }
  if (isSupabaseError(error)) {
    const mapped = POSTGREST_MAP[error.code];
    if (mapped) {
      return new AppError(mapped.message, mapped.code, mapped.status, error);
    }

    // Auth errors
    if (error.message?.includes('Invalid login credentials')) {
      return new AppError('Invalid email or password', 'UNAUTHORIZED', 401, error);
    }
    if (error.message?.includes('Email not confirmed')) {
      return new AppError('Please confirm your email before signing in', 'UNAUTHORIZED', 401, error);
    }
    if (error.message?.includes('JWT expired') || error.message?.includes('token is expired')) {
      return new AppError('Your session has expired. Please sign in again.', 'UNAUTHORIZED', 401, error);
    }

    return new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN',
      500,
      error,
    );
  }

  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new AppError(
      'Unable to connect to the server. Please check your internet connection.',
      'NETWORK',
      0,
      error,
    );
  }

  // Generic Error
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN', 500, error);
  }

  return new AppError('An unexpected error occurred', 'UNKNOWN', 500, error);
}

/**
 * Returns a user-friendly message for any error.
 */
export function getUserMessage(error: unknown): string {
  return toAppError(error).message;
}

/**
 * Returns true if an error should NOT be retried.
 */
export function isNonRetryable(error: unknown): boolean {
  const appError = toAppError(error);
  return appError.code === 'NOT_FOUND'
    || appError.code === 'UNAUTHORIZED'
    || appError.code === 'FORBIDDEN'
    || appError.code === 'VALIDATION'
    || appError.code === 'CONFLICT';
}

function isSupabaseError(error: unknown): error is { message: string; code: string; details?: string; hint?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
}
