import { supabase } from '@/lib/supabase';
import { dashboardService } from '@/services/dashboard';

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

describe('dashboardService', () => {
  // ─── getOverview ───────────────────────────────────────
  describe('getOverview', () => {
    it('aggregates data from 5 concurrent queries', async () => {
      const now = new Date();
      const thisMonthPaidDate = new Date(now.getFullYear(), now.getMonth(), 10).toISOString();
      const todaySessionTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString();

      const membersData = [
        { id: 'm1', activity_status: 'active', membership_type: 'premium', monthly_fee: 100 },
        { id: 'm2', activity_status: 'moderate', membership_type: 'basic', monthly_fee: 50 },
        { id: 'm3', activity_status: 'inactive', membership_type: 'vip', monthly_fee: 200 },
      ];
      const coachesData = [
        { id: 'c1', is_active: true, client_count: 10 },
        { id: 'c2', is_active: false, client_count: 5 },
      ];
      const paymentsData = [
        { amount: 100, status: 'paid', paid_date: thisMonthPaidDate },
        { amount: 50, status: 'pending', paid_date: null },
        { amount: 75, status: 'overdue', paid_date: null },
      ];
      const sessionsData = [
        { id: 's1', status: 'scheduled', start_time: todaySessionTime },
        { id: 's2', status: 'completed', start_time: '2026-01-15T10:00:00Z' },
      ];
      const alertsData = [
        { id: 'a1', message: 'New member', is_read: false },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        switch (table) {
          case 'members':
            return mockQuery({ data: membersData, error: null }) as any;
          case 'coaches':
            return mockQuery({ data: coachesData, error: null }) as any;
          case 'payments':
            return mockQuery({ data: paymentsData, error: null }) as any;
          case 'sessions':
            return mockQuery({ data: sessionsData, error: null }) as any;
          case 'alerts':
            return mockQuery({ data: alertsData, error: null }) as any;
          default:
            return mockQuery({ data: null, error: null }) as any;
        }
      });

      const overview = await dashboardService.getOverview('gym-1');

      expect(overview.totalMembers).toBe(3);
      expect(overview.activeMembers).toBe(1);
      expect(overview.moderateMembers).toBe(1);
      expect(overview.inactiveMembers).toBe(1);
      expect(overview.totalCoaches).toBe(2);
      expect(overview.activeCoaches).toBe(1);
      expect(overview.mrr).toBe(350); // 100 + 50 + 200
      expect(overview.revenueThisMonth).toBe(100);
      expect(overview.pendingPayments).toBe(1);
      expect(overview.overduePayments).toBe(1);
      expect(overview.overdueAmount).toBe(75);
      expect(overview.todaySessionsCount).toBe(1);
      expect(overview.totalSessions).toBe(2);
      expect(overview.alerts).toEqual(alertsData);
    });

    it('handles empty data gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: [], error: null }) as any,
      );

      const overview = await dashboardService.getOverview('empty-gym');

      expect(overview.totalMembers).toBe(0);
      expect(overview.activeMembers).toBe(0);
      expect(overview.totalCoaches).toBe(0);
      expect(overview.mrr).toBe(0);
      expect(overview.revenueThisMonth).toBe(0);
      expect(overview.pendingPayments).toBe(0);
      expect(overview.overduePayments).toBe(0);
      expect(overview.todaySessionsCount).toBe(0);
    });

    it('handles null data from queries (falls back to empty arrays)', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error: null }) as any,
      );

      const overview = await dashboardService.getOverview('gym-1');

      // data || [] means null becomes []
      expect(overview.totalMembers).toBe(0);
      expect(overview.totalCoaches).toBe(0);
      expect(overview.mrr).toBe(0);
      expect(overview.totalSessions).toBe(0);
    });
  });

  // ─── getRecentActivity ─────────────────────────────────
  describe('getRecentActivity', () => {
    it('returns member visits with member join', async () => {
      const visits = [
        { id: 'v1', check_in: '2026-02-24T09:00:00Z', member: { id: 'm1', name: 'Alice', avatar_url: null } },
        { id: 'v2', check_in: '2026-02-24T08:30:00Z', member: { id: 'm2', name: 'Bob', avatar_url: null } },
      ];
      const chain = mockQuery({ data: visits, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      const result = await dashboardService.getRecentActivity('gym-1');
      expect(result).toEqual(visits);
      expect(supabase.from).toHaveBeenCalledWith('member_visits');
      expect(chain.limit).toHaveBeenCalledWith(10);
    });

    it('respects custom limit parameter', async () => {
      const chain = mockQuery({ data: [], error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as any);

      await dashboardService.getRecentActivity('gym-1', 5);
      expect(chain.limit).toHaveBeenCalledWith(5);
    });

    it('throws on error', async () => {
      const error = { message: 'Query failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(dashboardService.getRecentActivity('gym-1')).rejects.toEqual(error);
    });
  });

  // ─── getOccupancyData ──────────────────────────────────
  describe('getOccupancyData', () => {
    it('groups visits by hour and returns averaged data', async () => {
      // 7 visits at 9am across the week = avg 1 per day
      const visits = Array.from({ length: 7 }, (_, i) => ({
        check_in: new Date(2026, 1, 17 + i, 9, 30).toISOString(),
      }));
      // 14 visits at 17:00 = avg 2 per day
      const eveningVisits = Array.from({ length: 14 }, (_, i) => ({
        check_in: new Date(2026, 1, 17 + (i % 7), 17, 0).toISOString(),
      }));

      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: [...visits, ...eveningVisits], error: null }) as any,
      );

      const result = await dashboardService.getOccupancyData('gym-1');

      // Result is an array of { hour, visits } from 6:00 to 22:00
      expect(result).toHaveLength(17); // hours 6-22 inclusive
      expect(result[0].hour).toBe('6:00');
      expect(result[result.length - 1].hour).toBe('22:00');

      // 9:00 slot (index 3) should be ~1 (7 visits / 7 days)
      const nineAm = result.find((r: any) => r.hour === '9:00');
      expect(nineAm?.visits).toBe(1);

      // 17:00 slot (index 11) should be ~2 (14 visits / 7 days)
      const fivePm = result.find((r: any) => r.hour === '17:00');
      expect(fivePm?.visits).toBe(2);
    });

    it('returns zeroed hours for no visits', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: [], error: null }) as any,
      );

      const result = await dashboardService.getOccupancyData('gym-1');
      expect(result).toHaveLength(17);
      result.forEach((slot: any) => {
        expect(slot.visits).toBe(0);
      });
    });

    it('ignores visits outside 6-22 range', async () => {
      const visits = [
        { check_in: new Date(2026, 1, 20, 3, 0).toISOString() },  // 3am - out of range
        { check_in: new Date(2026, 1, 20, 23, 0).toISOString() }, // 11pm - out of range
      ];
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: visits, error: null }) as any,
      );

      const result = await dashboardService.getOccupancyData('gym-1');
      result.forEach((slot: any) => {
        expect(slot.visits).toBe(0);
      });
    });

    it('throws on error', async () => {
      const error = { message: 'Connection failed' };
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error }) as any,
      );

      await expect(dashboardService.getOccupancyData('gym-1')).rejects.toEqual(error);
    });
  });

  // ─── getGrowthMetrics ──────────────────────────────────
  describe('getGrowthMetrics', () => {
    it('compares current vs last month member counts', async () => {
      let callIndex = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          // First call: current month members
          return mockQuery({ data: [{ id: '1' }, { id: '2' }, { id: '3' }], error: null }) as any;
        }
        // Second call: last month members
        return mockQuery({ data: [{ id: '4' }, { id: '5' }], error: null }) as any;
      });

      const growth = await dashboardService.getGrowthMetrics('gym-1');
      expect(growth.newMembersThisMonth).toBe(3);
      expect(growth.newMembersLastMonth).toBe(2);
      expect(growth.growthRate).toBe(50); // ((3-2)/2)*100 = 50
    });

    it('returns 0 growth rate when last month had no members', async () => {
      let callIndex = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockQuery({ data: [{ id: '1' }], error: null }) as any;
        }
        return mockQuery({ data: [], error: null }) as any;
      });

      const growth = await dashboardService.getGrowthMetrics('gym-1');
      expect(growth.newMembersThisMonth).toBe(1);
      expect(growth.newMembersLastMonth).toBe(0);
      expect(growth.growthRate).toBe(0); // Avoid division by zero
    });

    it('handles negative growth rate', async () => {
      let callIndex = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          return mockQuery({ data: [{ id: '1' }], error: null }) as any;
        }
        return mockQuery({ data: [{ id: '2' }, { id: '3' }, { id: '4' }], error: null }) as any;
      });

      const growth = await dashboardService.getGrowthMetrics('gym-1');
      expect(growth.newMembersThisMonth).toBe(1);
      expect(growth.newMembersLastMonth).toBe(3);
      expect(growth.growthRate).toBe(-66.7); // ((1-3)/3)*100 = -66.666... rounded
    });

    it('handles null data from queries', async () => {
      vi.mocked(supabase.from).mockReturnValue(
        mockQuery({ data: null, error: null }) as any,
      );

      const growth = await dashboardService.getGrowthMetrics('gym-1');
      expect(growth.newMembersThisMonth).toBe(0);
      expect(growth.newMembersLastMonth).toBe(0);
      expect(growth.growthRate).toBe(0);
    });
  });
});
