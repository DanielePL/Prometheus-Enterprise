import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock import.meta.env
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_COACH_APP_URL', 'https://test-coach.app');

// Hoist the mock client creation so it's available to vi.mock factory
const { createMockSupabaseClient } = vi.hoisted(() => {
  function createQueryBuilder(defaultResult: { data: unknown; error: unknown; count?: unknown } = { data: null, error: null }) {
    let result = { ...defaultResult };
    const builder: Record<string, unknown> = {};
    const chainMethods = [
      'select', 'insert', 'update', 'upsert', 'delete',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
      'is', 'in', 'or', 'and', 'not', 'filter',
      'order', 'limit', 'range', 'offset',
      'single', 'maybeSingle', 'csv', 'returns',
    ];
    for (const method of chainMethods) {
      builder[method] = vi.fn(() => builder);
    }
    builder.then = function (resolve: (val: unknown) => unknown) {
      return Promise.resolve(result).then(resolve);
    };
    builder.mockResult = (newResult: { data?: unknown; error?: unknown; count?: unknown }) => {
      result = { data: null, error: null, ...newResult };
      return builder;
    };
    builder.mockReset = () => {
      result = { ...defaultResult };
      for (const method of chainMethods) {
        (builder[method] as ReturnType<typeof vi.fn>).mockClear();
      }
      return builder;
    };
    return builder;
  }

  function createMockSupabaseClient() {
    const tableBuilders = new Map<string, ReturnType<typeof createQueryBuilder>>();
    const getBuilder = (table: string) => {
      if (!tableBuilders.has(table)) {
        tableBuilders.set(table, createQueryBuilder());
      }
      return tableBuilders.get(table)!;
    };
    const client = {
      from: vi.fn((table: string) => getBuilder(table)),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ error: null }),
      },
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.storage/file.jpg' } }),
        })),
      },
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      __getBuilder: getBuilder,
      __resetAll: () => {
        tableBuilders.clear();
        client.from.mockClear();
        client.functions.invoke.mockClear();
        client.rpc.mockClear();
      },
    };
    return client;
  }

  return { createMockSupabaseClient };
});

// Mock the supabase client globally
vi.mock('@/lib/supabase', () => {
  return { supabase: createMockSupabaseClient() };
});

// Mock demoData's isDemoMode to return false by default in tests
vi.mock('@/services/demoData', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    isDemoMode: vi.fn(() => false),
  };
});
