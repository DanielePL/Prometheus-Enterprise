import { supabase } from '@/lib/supabase';
import { coachesService } from '@/services/coaches';

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

describe('coachesService', () => {
  // ─── getAll ────────────────────────────────────────────
  describe('getAll', () => {
    it('returns all coaches for a gym', async () => {
      const coaches = [
        { id: 'c1', name: 'Coach A', is_active: true, gym_id: 'gym-1' },
        { id: 'c2', name: 'Coach B', is_active: false, gym_id: 'gym-1' },
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: coaches, error: null }) as any,
      );

      const result = await coachesService.getAll('gym-1');
      expect(result).toEqual(coaches);
      expect(supabase.from).toHaveBeenCalledWith('coaches');
    });

    it('throws on error', async () => {
      const error = { message: 'DB error' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(coachesService.getAll('gym-1')).rejects.toEqual(error);
    });
  });

  // ─── getActive ─────────────────────────────────────────
  describe('getActive', () => {
    it('returns only active coaches', async () => {
      const activeCoaches = [
        { id: 'c1', name: 'Coach A', is_active: true },
      ];
      const chain = mockQuery({ data: activeCoaches, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await coachesService.getActive('gym-1');
      expect(result).toEqual(activeCoaches);
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('returns empty array when no active coaches', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: [], error: null }) as any,
      );

      const result = await coachesService.getActive('gym-1');
      expect(result).toEqual([]);
    });

    it('throws on error', async () => {
      const error = { message: 'Failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(coachesService.getActive('gym-1')).rejects.toEqual(error);
    });
  });

  // ─── getById ───────────────────────────────────────────
  describe('getById', () => {
    it('returns coach with member/session relations', async () => {
      const coach = {
        id: 'c1',
        name: 'Coach A',
        members: [{ id: 'm1', name: 'Alice', avatar_url: null, activity_status: 'active' }],
        sessions: [{ id: 's1', title: 'Yoga' }],
      };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: coach, error: null }) as any,
      );

      const result = await coachesService.getById('c1');
      expect(result).toEqual(coach);
      expect(supabase.from).toHaveBeenCalledWith('coaches');
    });

    it('throws when coach not found', async () => {
      const error = { message: 'Row not found', code: 'PGRST116' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(coachesService.getById('non-existent')).rejects.toEqual(error);
    });
  });

  // ─── create ────────────────────────────────────────────
  describe('create', () => {
    it('inserts and returns new coach', async () => {
      const input = { name: 'New Coach', email: 'new@coach.com', gym_id: 'gym-1' } as any;
      const created = { id: 'c-new', ...input, is_active: true };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: created, error: null }) as any,
      );

      const result = await coachesService.create(input);
      expect(result).toEqual(created);
      expect(supabase.from).toHaveBeenCalledWith('coaches');
    });

    it('throws on create error', async () => {
      const error = { message: 'Duplicate email' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(coachesService.create({} as any)).rejects.toEqual(error);
    });
  });

  // ─── update ────────────────────────────────────────────
  describe('update', () => {
    it('updates with timestamp and returns updated coach', async () => {
      const updated = { id: 'c1', name: 'Coach A Updated', updated_at: '2026-02-24T12:00:00Z' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: updated, error: null }) as any,
      );

      const result = await coachesService.update('c1', { name: 'Coach A Updated' } as any);
      expect(result).toEqual(updated);
    });

    it('throws on update error', async () => {
      const error = { message: 'Not found' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(coachesService.update('bad-id', {} as any)).rejects.toEqual(error);
    });
  });

  // ─── delete ────────────────────────────────────────────
  describe('delete', () => {
    it('deletes successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error: null }) as any,
      );

      await expect(coachesService.delete('c1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('coaches');
    });

    it('throws on delete error', async () => {
      const error = { message: 'Coach has active members' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(coachesService.delete('c1')).rejects.toEqual(error);
    });
  });

  // ─── toggleActive ──────────────────────────────────────
  describe('toggleActive', () => {
    it('sets is_active to true', async () => {
      const toggled = { id: 'c1', is_active: true, updated_at: '2026-02-24T12:00:00Z' };
      const chain = mockQuery({ data: toggled, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await coachesService.toggleActive('c1', true);
      expect(result).toEqual(toggled);
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: true }),
      );
    });

    it('sets is_active to false', async () => {
      const toggled = { id: 'c2', is_active: false, updated_at: '2026-02-24T12:00:00Z' };
      const chain = mockQuery({ data: toggled, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await coachesService.toggleActive('c2', false);
      expect(result).toEqual(toggled);
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: false }),
      );
    });

    it('throws on toggle error', async () => {
      const error = { message: 'Not found' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(coachesService.toggleActive('bad-id', true)).rejects.toEqual(error);
    });
  });

  // ─── getPerformanceMetrics ─────────────────────────────
  describe('getPerformanceMetrics', () => {
    it('computes metrics from sessions and members queries', async () => {
      const sessions = [
        { id: 's1', price: 50, status: 'completed' },
        { id: 's2', price: 75, status: 'completed' },
        { id: 's3', price: 100, status: 'completed' },
      ];
      const members = [{ id: 'm1' }, { id: 'm2' }];

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'sessions') {
          return mockQuery({ data: sessions, error: null }) as any;
        }
        if (table === 'members') {
          return mockQuery({ data: members, error: null }) as any;
        }
        return mockQuery({ data: null, error: null }) as any;
      });

      const metrics = await coachesService.getPerformanceMetrics('c1');
      expect(metrics).toEqual({
        sessionsThisMonth: 3,
        revenueThisMonth: 225,
        clientCount: 2,
        avgRevenuePerSession: 75,
      });
    });

    it('handles zero sessions gracefully', async () => {
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'sessions') {
          return mockQuery({ data: [], error: null }) as any;
        }
        if (table === 'members') {
          return mockQuery({ data: [{ id: 'm1' }], error: null }) as any;
        }
        return mockQuery({ data: null, error: null }) as any;
      });

      const metrics = await coachesService.getPerformanceMetrics('c1');
      expect(metrics.sessionsThisMonth).toBe(0);
      expect(metrics.revenueThisMonth).toBe(0);
      expect(metrics.avgRevenuePerSession).toBe(0);
      expect(metrics.clientCount).toBe(1);
    });

    it('throws when sessions query fails', async () => {
      const error = { message: 'Query failed' };
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'sessions') {
          return mockQuery({ data: null, error }) as any;
        }
        return mockQuery({ data: [], error: null }) as any;
      });

      await expect(coachesService.getPerformanceMetrics('c1')).rejects.toEqual(error);
    });

    it('throws when members query fails', async () => {
      const sessionsError = null;
      const membersError = { message: 'Members query failed' };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'sessions') {
          return mockQuery({ data: [], error: null }) as any;
        }
        if (table === 'members') {
          return mockQuery({ data: null, error: membersError }) as any;
        }
        return mockQuery({ data: null, error: null }) as any;
      });

      await expect(coachesService.getPerformanceMetrics('c1')).rejects.toEqual(membersError);
    });
  });

  // ─── getStats ──────────────────────────────────────────
  describe('getStats', () => {
    it('computes total, active, totalClients, totalRevenue', async () => {
      const data = [
        { is_active: true, client_count: 10, revenue_this_month: 500 },
        { is_active: true, client_count: 8, revenue_this_month: 400 },
        { is_active: false, client_count: 5, revenue_this_month: 0 },
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data, error: null }) as any,
      );

      const stats = await coachesService.getStats('gym-1');
      expect(stats).toEqual({
        total: 3,
        active: 2,
        totalClients: 23,
        totalRevenue: 900,
      });
    });

    it('handles null client_count and revenue_this_month', async () => {
      const data = [
        { is_active: true, client_count: null, revenue_this_month: null },
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data, error: null }) as any,
      );

      const stats = await coachesService.getStats('gym-1');
      expect(stats).toEqual({
        total: 1,
        active: 1,
        totalClients: 0,
        totalRevenue: 0,
      });
    });

    it('returns zeros for empty gym', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: [], error: null }) as any,
      );

      const stats = await coachesService.getStats('empty-gym');
      expect(stats).toEqual({
        total: 0,
        active: 0,
        totalClients: 0,
        totalRevenue: 0,
      });
    });

    it('throws on stats error', async () => {
      const error = { message: 'Connection failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(coachesService.getStats('gym-1')).rejects.toEqual(error);
    });
  });
});
