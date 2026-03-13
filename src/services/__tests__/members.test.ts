import { supabase } from '@/lib/supabase';
import { membersService } from '@/services/members';

// ---------- mockQuery helper ----------
function mockQuery(result: { data?: any; error?: any }) {
  const chain: any = {};
  const methods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'is', 'in', 'or', 'and', 'not', 'filter',
    'order', 'limit', 'range', 'offset',
    'single', 'maybeSingle', 'csv', 'returns',
  ];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  chain.then = (resolve: Function) => Promise.resolve(result).then(resolve);
  return chain;
}

// ---------- Tests ----------

beforeEach(() => {
  vi.mocked(supabase.from).mockReset();
});

describe('membersService', () => {
  // ─── getAll ────────────────────────────────────────────
  describe('getAll', () => {
    it('returns members on success', async () => {
      const members = [
        { id: '1', name: 'Alice', gym_id: 'gym-1', coach: { id: 'c1', name: 'Coach A', avatar_url: null } },
        { id: '2', name: 'Bob', gym_id: 'gym-1', coach: null },
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: members, error: null }) as any,
      );

      const result = await membersService.getAll('gym-1');
      expect(result).toEqual(members);
      expect(supabase.from).toHaveBeenCalledWith('members');
    });

    it('throws on error', async () => {
      const error = { message: 'DB error', code: '42P01' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(membersService.getAll('gym-1')).rejects.toEqual(error);
    });
  });

  // ─── getById ───────────────────────────────────────────
  describe('getById', () => {
    it('returns single member with relations', async () => {
      const member = {
        id: 'm1',
        name: 'Alice',
        coach: { id: 'c1', name: 'Coach A', avatar_url: null, email: 'coach@test.com' },
        payments: [{ id: 'p1', amount: 50 }],
        sessions: [],
      };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: member, error: null }) as any,
      );

      const result = await membersService.getById('m1');
      expect(result).toEqual(member);
      expect(supabase.from).toHaveBeenCalledWith('members');
    });

    it('throws when member not found', async () => {
      const error = { message: 'Row not found', code: 'PGRST116' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(membersService.getById('non-existent')).rejects.toEqual(error);
    });
  });

  // ─── create ────────────────────────────────────────────
  describe('create', () => {
    it('inserts and returns new member', async () => {
      const input = { name: 'New Member', email: 'new@test.com', gym_id: 'gym-1' } as any;
      const created = { id: 'm-new', ...input, created_at: '2026-01-01T00:00:00Z' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: created, error: null }) as any,
      );

      const result = await membersService.create(input);
      expect(result).toEqual(created);
      expect(supabase.from).toHaveBeenCalledWith('members');
    });

    it('throws on insert error', async () => {
      const error = { message: 'Duplicate email', code: '23505' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(membersService.create({ name: 'Dup' } as any)).rejects.toEqual(error);
    });
  });

  // ─── update ────────────────────────────────────────────
  describe('update', () => {
    it('updates with timestamp and returns updated member', async () => {
      const updated = { id: 'm1', name: 'Alice Updated', updated_at: '2026-02-24T12:00:00Z' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: updated, error: null }) as any,
      );

      const result = await membersService.update('m1', { name: 'Alice Updated' } as any);
      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('members');
    });

    it('throws on update error', async () => {
      const error = { message: 'Not found', code: 'PGRST116' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(membersService.update('bad-id', {} as any)).rejects.toEqual(error);
    });
  });

  // ─── delete ────────────────────────────────────────────
  describe('delete', () => {
    it('deletes successfully (no return value)', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error: null }) as any,
      );

      await expect(membersService.delete('m1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('members');
    });

    it('throws on delete error', async () => {
      const error = { message: 'Foreign key violation', code: '23503' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(membersService.delete('m1')).rejects.toEqual(error);
    });
  });

  // ─── search ────────────────────────────────────────────
  describe('search', () => {
    it('returns matching members using or() for name/email ilike', async () => {
      const matches = [
        { id: '1', name: 'Alice Smith', email: 'alice@test.com' },
      ];
      const chain = mockQuery({ data: matches, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await membersService.search('gym-1', 'alice');
      expect(result).toEqual(matches);
      expect(supabase.from).toHaveBeenCalledWith('members');
      expect(chain.or).toHaveBeenCalledWith('name.ilike.%alice%,email.ilike.%alice%');
      expect(chain.limit).toHaveBeenCalledWith(20);
    });

    it('throws on search error', async () => {
      const error = { message: 'Search failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(membersService.search('gym-1', 'query')).rejects.toEqual(error);
    });
  });

  // ─── getStats ──────────────────────────────────────────
  describe('getStats', () => {
    it('computes stats from member data', async () => {
      const data = [
        { activity_status: 'active', membership_type: 'basic' },
        { activity_status: 'active', membership_type: 'premium' },
        { activity_status: 'moderate', membership_type: 'vip' },
        { activity_status: 'inactive', membership_type: 'trial' },
        { activity_status: 'active', membership_type: 'basic' },
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data, error: null }) as any,
      );

      const stats = await membersService.getStats('gym-1');
      expect(stats).toEqual({
        total: 5,
        active: 3,
        moderate: 1,
        inactive: 1,
        byMembership: {
          basic: 2,
          premium: 1,
          vip: 1,
          trial: 1,
        },
      });
    });

    it('returns zeroed stats for empty gym', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: [], error: null }) as any,
      );

      const stats = await membersService.getStats('empty-gym');
      expect(stats).toEqual({
        total: 0,
        active: 0,
        moderate: 0,
        inactive: 0,
        byMembership: { basic: 0, premium: 0, vip: 0, trial: 0 },
      });
    });

    it('throws on stats error', async () => {
      const error = { message: 'Connection failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(membersService.getStats('gym-1')).rejects.toEqual(error);
    });
  });
});
