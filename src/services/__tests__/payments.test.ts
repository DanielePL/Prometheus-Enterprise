import { supabase } from '@/lib/supabase';
import { paymentsService } from '@/services/payments';

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

describe('paymentsService', () => {
  // ─── getAll ────────────────────────────────────────────
  describe('getAll', () => {
    it('returns payments with member join', async () => {
      const payments = [
        { id: 'p1', amount: 100, status: 'paid', member: { id: 'm1', name: 'Alice', avatar_url: null, email: 'a@t.com' } },
        { id: 'p2', amount: 50, status: 'pending', member: { id: 'm2', name: 'Bob', avatar_url: null, email: 'b@t.com' } },
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: payments, error: null }) as any,
      );

      const result = await paymentsService.getAll('gym-1');
      expect(result).toEqual(payments);
      expect(supabase.from).toHaveBeenCalledWith('payments');
    });

    it('throws on error', async () => {
      const error = { message: 'DB error' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(paymentsService.getAll('gym-1')).rejects.toEqual(error);
    });
  });

  // ─── create ────────────────────────────────────────────
  describe('create', () => {
    it('inserts and returns new payment', async () => {
      const input = { amount: 75, member_id: 'm1', gym_id: 'gym-1', status: 'pending' } as any;
      const created = { id: 'p-new', ...input, created_at: '2026-01-15T00:00:00Z' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: created, error: null }) as any,
      );

      const result = await paymentsService.create(input);
      expect(result).toEqual(created);
      expect(supabase.from).toHaveBeenCalledWith('payments');
    });

    it('throws on insert error', async () => {
      const error = { message: 'Invalid member_id', code: '23503' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(paymentsService.create({} as any)).rejects.toEqual(error);
    });
  });

  // ─── update ────────────────────────────────────────────
  describe('update', () => {
    it('updates with timestamp and returns updated payment', async () => {
      const updated = { id: 'p1', amount: 120, updated_at: '2026-02-24T10:00:00Z' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: updated, error: null }) as any,
      );

      const result = await paymentsService.update('p1', { amount: 120 } as any);
      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('payments');
    });

    it('throws on update error', async () => {
      const error = { message: 'Not found' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(paymentsService.update('bad-id', {} as any)).rejects.toEqual(error);
    });
  });

  // ─── delete ────────────────────────────────────────────
  describe('delete', () => {
    it('deletes successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error: null }) as any,
      );

      await expect(paymentsService.delete('p1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('payments');
    });

    it('throws on delete error', async () => {
      const error = { message: 'Cannot delete' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(paymentsService.delete('p1')).rejects.toEqual(error);
    });
  });

  // ─── markAsPaid ────────────────────────────────────────
  describe('markAsPaid', () => {
    it('updates status to paid with paid_date', async () => {
      const paid = { id: 'p1', status: 'paid', paid_date: '2026-02-24T10:00:00Z' };
      const chain = mockQuery({ data: paid, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await paymentsService.markAsPaid('p1', 'credit_card');
      expect(result).toEqual(paid);
      expect(supabase.from).toHaveBeenCalledWith('payments');
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paid',
          payment_method: 'credit_card',
        }),
      );
    });

    it('works without paymentMethod argument', async () => {
      const paid = { id: 'p2', status: 'paid', paid_date: '2026-02-24T11:00:00Z' };
      const chain = mockQuery({ data: paid, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await paymentsService.markAsPaid('p2');
      expect(result).toEqual(paid);
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paid',
          payment_method: undefined,
        }),
      );
    });

    it('throws on markAsPaid error', async () => {
      const error = { message: 'Update failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(paymentsService.markAsPaid('p1')).rejects.toEqual(error);
    });
  });

  // ─── getOverdue ────────────────────────────────────────
  describe('getOverdue', () => {
    it('returns overdue payments with member info', async () => {
      const overdue = [
        { id: 'p3', status: 'overdue', amount: 80, member: { id: 'm1', name: 'Alice', avatar_url: null, email: 'a@t.com', phone: '555-0001' } },
      ];
      const chain = mockQuery({ data: overdue, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await paymentsService.getOverdue('gym-1');
      expect(result).toEqual(overdue);
      expect(supabase.from).toHaveBeenCalledWith('payments');
      expect(chain.eq).toHaveBeenCalledWith('status', 'overdue');
    });

    it('throws on getOverdue error', async () => {
      const error = { message: 'Connection lost' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(paymentsService.getOverdue('gym-1')).rejects.toEqual(error);
    });
  });

  // ─── getStats ──────────────────────────────────────────
  describe('getStats', () => {
    it('computes revenue, pending, overdue, and totalPaid from payment data', async () => {
      const now = new Date();
      const thisMonthDate = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString();

      const allPayments = [
        { amount: 100, status: 'paid', paid_date: thisMonthDate },
        { amount: 200, status: 'paid', paid_date: thisMonthDate },
        { amount: 50, status: 'paid', paid_date: lastMonthDate },
        { amount: 75, status: 'pending', paid_date: null },
        { amount: 30, status: 'overdue', paid_date: null },
        { amount: 45, status: 'overdue', paid_date: null },
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: allPayments, error: null }) as any,
      );

      const stats = await paymentsService.getStats('gym-1');
      expect(stats.revenueThisMonth).toBe(300); // 100 + 200
      expect(stats.pendingAmount).toBe(75);
      expect(stats.overdueAmount).toBe(75); // 30 + 45
      expect(stats.totalPaid).toBe(350); // 100 + 200 + 50
    });

    it('returns zeros for empty gym', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: [], error: null }) as any,
      );

      const stats = await paymentsService.getStats('empty-gym');
      expect(stats).toEqual({
        revenueThisMonth: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        totalPaid: 0,
      });
    });

    it('throws on getStats error', async () => {
      const error = { message: 'Query failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(paymentsService.getStats('gym-1')).rejects.toEqual(error);
    });
  });
});
