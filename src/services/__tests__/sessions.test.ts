import { supabase } from '@/lib/supabase';
import { sessionsService } from '@/services/sessions';

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
  vi.mocked(supabase.rpc).mockReset();
});

describe('sessionsService', () => {
  // ─── getAll ────────────────────────────────────────────
  describe('getAll', () => {
    it('returns sessions with coach/member joins', async () => {
      const sessions = [
        {
          id: 's1',
          title: 'Yoga',
          start_time: '2026-02-24T09:00:00Z',
          coach: { id: 'c1', name: 'Coach A', avatar_url: null },
          member: { id: 'm1', name: 'Alice', avatar_url: null },
        },
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: sessions, error: null }) as any,
      );

      const result = await sessionsService.getAll('gym-1');
      expect(result).toEqual(sessions);
      expect(supabase.from).toHaveBeenCalledWith('sessions');
    });

    it('throws on error', async () => {
      const error = { message: 'DB error' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(sessionsService.getAll('gym-1')).rejects.toEqual(error);
    });
  });

  // ─── getByDateRange ────────────────────────────────────
  describe('getByDateRange', () => {
    it('uses gte/lte on start_time and returns sessions', async () => {
      const sessions = [
        { id: 's1', start_time: '2026-02-20T09:00:00Z' },
        { id: 's2', start_time: '2026-02-22T14:00:00Z' },
      ];
      const chain = mockQuery({ data: sessions, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const startDate = new Date('2026-02-19');
      const endDate = new Date('2026-02-25');
      const result = await sessionsService.getByDateRange('gym-1', startDate, endDate);

      expect(result).toEqual(sessions);
      expect(supabase.from).toHaveBeenCalledWith('sessions');
      expect(chain.gte).toHaveBeenCalledWith('start_time', startDate.toISOString());
      expect(chain.lte).toHaveBeenCalledWith('start_time', endDate.toISOString());
    });

    it('throws on error', async () => {
      const error = { message: 'Range query failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(
        sessionsService.getByDateRange('gym-1', new Date(), new Date()),
      ).rejects.toEqual(error);
    });
  });

  // ─── create ────────────────────────────────────────────
  describe('create', () => {
    it('inserts and returns new session', async () => {
      const input = { title: 'HIIT', gym_id: 'gym-1', coach_id: 'c1', start_time: '2026-03-01T10:00:00Z' } as any;
      const created = { id: 's-new', ...input };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: created, error: null }) as any,
      );

      const result = await sessionsService.create(input);
      expect(result).toEqual(created);
      expect(supabase.from).toHaveBeenCalledWith('sessions');
    });

    it('throws on insert error', async () => {
      const error = { message: 'Missing required field' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(sessionsService.create({} as any)).rejects.toEqual(error);
    });
  });

  // ─── update ────────────────────────────────────────────
  describe('update', () => {
    it('updates with timestamp and returns updated session', async () => {
      const updated = { id: 's1', title: 'Advanced Yoga', updated_at: '2026-02-24T12:00:00Z' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: updated, error: null }) as any,
      );

      const result = await sessionsService.update('s1', { title: 'Advanced Yoga' } as any);
      expect(result).toEqual(updated);
    });

    it('throws on update error', async () => {
      const error = { message: 'Not found' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(sessionsService.update('bad-id', {} as any)).rejects.toEqual(error);
    });
  });

  // ─── delete ────────────────────────────────────────────
  describe('delete', () => {
    it('deletes successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error: null }) as any,
      );

      await expect(sessionsService.delete('s1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('sessions');
    });

    it('throws on delete error', async () => {
      const error = { message: 'Session in use' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(sessionsService.delete('s1')).rejects.toEqual(error);
    });
  });

  // ─── addParticipant ────────────────────────────────────
  describe('addParticipant', () => {
    it('inserts session_participants and calls rpc to increment count', async () => {
      const participant = { id: 'sp1', session_id: 's1', member_id: 'm1' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: participant, error: null }) as any,
      );
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as any);

      const result = await sessionsService.addParticipant('s1', 'm1');
      expect(result).toEqual(participant);
      expect(supabase.from).toHaveBeenCalledWith('session_participants');
      expect(supabase.rpc).toHaveBeenCalledWith('increment_session_participants', { session_id: 's1' });
    });

    it('throws on insert error without calling rpc', async () => {
      const error = { message: 'Already enrolled' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(sessionsService.addParticipant('s1', 'm1')).rejects.toEqual(error);
      expect(supabase.rpc).not.toHaveBeenCalled();
    });
  });

  // ─── removeParticipant ─────────────────────────────────
  describe('removeParticipant', () => {
    it('deletes participant and calls rpc to decrement count', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error: null }) as any,
      );
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as any);

      await sessionsService.removeParticipant('s1', 'm1');
      expect(supabase.from).toHaveBeenCalledWith('session_participants');
      expect(supabase.rpc).toHaveBeenCalledWith('decrement_session_participants', { session_id: 's1' });
    });

    it('throws on delete error without calling rpc', async () => {
      const error = { message: 'Not found' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(sessionsService.removeParticipant('s1', 'm1')).rejects.toEqual(error);
      expect(supabase.rpc).not.toHaveBeenCalled();
    });
  });

  // ─── markAttendance ────────────────────────────────────
  describe('markAttendance', () => {
    it('updates attended flag and returns result', async () => {
      const updated = { session_id: 's1', member_id: 'm1', attended: true };
      const chain = mockQuery({ data: updated, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await sessionsService.markAttendance('s1', 'm1', true);
      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('session_participants');
      expect(chain.update).toHaveBeenCalledWith({ attended: true });
    });

    it('marks as not attended', async () => {
      const updated = { session_id: 's1', member_id: 'm2', attended: false };
      const chain = mockQuery({ data: updated, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await sessionsService.markAttendance('s1', 'm2', false);
      expect(result).toEqual(updated);
      expect(chain.update).toHaveBeenCalledWith({ attended: false });
    });

    it('throws on error', async () => {
      const error = { message: 'Update failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(sessionsService.markAttendance('s1', 'm1', true)).rejects.toEqual(error);
    });
  });
});
