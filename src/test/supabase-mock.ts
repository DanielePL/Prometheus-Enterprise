import { vi } from 'vitest';

/**
 * Creates a chainable mock that simulates the Supabase query builder.
 * Each method returns the same builder so you can chain .from().select().eq() etc.
 * Call `mockResult()` on the builder to set what the terminal method returns.
 */
export function createQueryBuilder(defaultResult: { data: unknown; error: unknown; count?: unknown } = { data: null, error: null }) {
  let result = { ...defaultResult };

  const builder: Record<string, unknown> = {};

  const chainMethods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'is', 'in', 'or', 'and', 'not', 'filter',
    'order', 'limit', 'range', 'offset',
    'single', 'maybeSingle',
    'csv', 'returns',
  ];

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  // Terminal method: when awaited, returns the result
  builder.then = function (resolve: (val: unknown) => unknown) {
    return Promise.resolve(result).then(resolve);
  };

  // Helper to set the result for the next query
  builder.mockResult = (newResult: { data?: unknown; error?: unknown; count?: unknown }) => {
    result = { data: null, error: null, ...newResult };
    return builder;
  };

  // Helper to reset all mocks
  builder.mockReset = () => {
    result = { ...defaultResult };
    for (const method of chainMethods) {
      (builder[method] as ReturnType<typeof vi.fn>).mockClear();
    }
    return builder;
  };

  return builder;
}

export type MockQueryBuilder = ReturnType<typeof createQueryBuilder>;

/**
 * Creates a mock Supabase client with chainable query builders for each table.
 */
export function createMockSupabaseClient() {
  const tableBuilders = new Map<string, MockQueryBuilder>();

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

    // Helpers for tests
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

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
