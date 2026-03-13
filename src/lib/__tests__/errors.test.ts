import { AppError, toAppError, getUserMessage, isNonRetryable } from '@/lib/errors';

describe('errors', () => {
  describe('AppError', () => {
    it('constructs with message, code, statusCode, and originalError', () => {
      const original = new Error('original');
      const appError = new AppError('Not found', 'NOT_FOUND', 404, original);

      expect(appError).toBeInstanceOf(Error);
      expect(appError).toBeInstanceOf(AppError);
      expect(appError.message).toBe('Not found');
      expect(appError.code).toBe('NOT_FOUND');
      expect(appError.statusCode).toBe(404);
      expect(appError.originalError).toBe(original);
      expect(appError.name).toBe('AppError');
    });

    it('constructs without originalError', () => {
      const appError = new AppError('Forbidden', 'FORBIDDEN', 403);

      expect(appError.message).toBe('Forbidden');
      expect(appError.code).toBe('FORBIDDEN');
      expect(appError.statusCode).toBe(403);
      expect(appError.originalError).toBeUndefined();
    });
  });

  describe('toAppError', () => {
    it('returns the same AppError if already an AppError', () => {
      const existing = new AppError('Already mapped', 'CONFLICT', 409);
      const result = toAppError(existing);

      expect(result).toBe(existing);
    });

    it('maps Supabase PGRST116 to NOT_FOUND/404', () => {
      const supabaseError = { message: 'No rows found', code: 'PGRST116' };
      const result = toAppError(supabaseError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe('NOT_FOUND');
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Record not found');
      expect(result.originalError).toBe(supabaseError);
    });

    it('maps Supabase 23505 (unique violation) to CONFLICT/409', () => {
      const supabaseError = { message: 'duplicate key value', code: '23505' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('CONFLICT');
      expect(result.statusCode).toBe(409);
      expect(result.message).toBe('A record with this data already exists');
      expect(result.originalError).toBe(supabaseError);
    });

    it('maps Supabase 23503 (foreign key violation) to VALIDATION/400', () => {
      const supabaseError = { message: 'foreign key violation', code: '23503' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('VALIDATION');
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Referenced record does not exist');
    });

    it('maps Supabase 42501 (insufficient privilege) to FORBIDDEN/403', () => {
      const supabaseError = { message: 'permission denied', code: '42501' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('FORBIDDEN');
      expect(result.statusCode).toBe(403);
    });

    it('maps Supabase 42P01 (undefined table) to NOT_FOUND/404', () => {
      const supabaseError = { message: 'relation does not exist', code: '42P01' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('NOT_FOUND');
      expect(result.statusCode).toBe(404);
    });

    it('maps "Invalid login credentials" to UNAUTHORIZED/401', () => {
      const supabaseError = { message: 'Invalid login credentials', code: 'auth_error' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.statusCode).toBe(401);
      expect(result.message).toBe('Invalid email or password');
    });

    it('maps "Email not confirmed" to UNAUTHORIZED/401', () => {
      const supabaseError = { message: 'Email not confirmed', code: 'auth_error' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.statusCode).toBe(401);
      expect(result.message).toBe('Please confirm your email before signing in');
    });

    it('maps "JWT expired" to UNAUTHORIZED/401', () => {
      const supabaseError = { message: 'JWT expired', code: 'auth_error' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.statusCode).toBe(401);
      expect(result.message).toBe('Your session has expired. Please sign in again.');
    });

    it('maps "token is expired" to UNAUTHORIZED/401', () => {
      const supabaseError = { message: 'token is expired', code: 'auth_error' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('UNAUTHORIZED');
      expect(result.statusCode).toBe(401);
    });

    it('maps TypeError("Failed to fetch") to NETWORK/0', () => {
      const networkError = new TypeError('Failed to fetch');
      const result = toAppError(networkError);

      expect(result.code).toBe('NETWORK');
      expect(result.statusCode).toBe(0);
      expect(result.message).toBe('Unable to connect to the server. Please check your internet connection.');
      expect(result.originalError).toBe(networkError);
    });

    it('maps generic Error to UNKNOWN/500', () => {
      const genericError = new Error('Something broke');
      const result = toAppError(genericError);

      expect(result.code).toBe('UNKNOWN');
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Something broke');
      expect(result.originalError).toBe(genericError);
    });

    it('maps non-Error values to UNKNOWN/500', () => {
      const result = toAppError('a string error');

      expect(result.code).toBe('UNKNOWN');
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.originalError).toBe('a string error');
    });

    it('maps null to UNKNOWN/500', () => {
      const result = toAppError(null);

      expect(result.code).toBe('UNKNOWN');
      expect(result.statusCode).toBe(500);
    });

    it('maps unmapped Supabase error codes to UNKNOWN/500 with original message', () => {
      const supabaseError = { message: 'Some unknown DB error', code: '99999' };
      const result = toAppError(supabaseError);

      expect(result.code).toBe('UNKNOWN');
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Some unknown DB error');
    });
  });

  describe('getUserMessage', () => {
    it('returns user-friendly message for AppError', () => {
      const appError = new AppError('Not found', 'NOT_FOUND', 404);
      expect(getUserMessage(appError)).toBe('Not found');
    });

    it('returns user-friendly message for Supabase error', () => {
      const supabaseError = { message: 'Invalid login credentials', code: 'auth_error' };
      expect(getUserMessage(supabaseError)).toBe('Invalid email or password');
    });

    it('returns user-friendly message for network error', () => {
      const networkError = new TypeError('Failed to fetch');
      expect(getUserMessage(networkError)).toBe(
        'Unable to connect to the server. Please check your internet connection.',
      );
    });

    it('returns generic message for unknown values', () => {
      expect(getUserMessage(42)).toBe('An unexpected error occurred');
    });

    it('returns the Error message for generic errors', () => {
      expect(getUserMessage(new Error('Custom message'))).toBe('Custom message');
    });
  });

  describe('isNonRetryable', () => {
    it('returns true for NOT_FOUND', () => {
      expect(isNonRetryable(new AppError('nf', 'NOT_FOUND', 404))).toBe(true);
    });

    it('returns true for UNAUTHORIZED', () => {
      expect(isNonRetryable(new AppError('ua', 'UNAUTHORIZED', 401))).toBe(true);
    });

    it('returns true for FORBIDDEN', () => {
      expect(isNonRetryable(new AppError('fb', 'FORBIDDEN', 403))).toBe(true);
    });

    it('returns true for VALIDATION', () => {
      expect(isNonRetryable(new AppError('val', 'VALIDATION', 400))).toBe(true);
    });

    it('returns true for CONFLICT', () => {
      expect(isNonRetryable(new AppError('dup', 'CONFLICT', 409))).toBe(true);
    });

    it('returns false for NETWORK', () => {
      expect(isNonRetryable(new AppError('net', 'NETWORK', 0))).toBe(false);
    });

    it('returns false for UNKNOWN', () => {
      expect(isNonRetryable(new AppError('unk', 'UNKNOWN', 500))).toBe(false);
    });

    it('returns false for RATE_LIMIT', () => {
      expect(isNonRetryable(new AppError('rl', 'RATE_LIMIT', 429))).toBe(false);
    });

    it('correctly evaluates raw Supabase errors via toAppError mapping', () => {
      // PGRST116 maps to NOT_FOUND, which is non-retryable
      expect(isNonRetryable({ message: 'no rows', code: 'PGRST116' })).toBe(true);

      // TypeError("Failed to fetch") maps to NETWORK, which is retryable
      expect(isNonRetryable(new TypeError('Failed to fetch'))).toBe(false);
    });
  });
});
