import { supabase } from '@/lib/supabase';
import type { Coach, InsertTables, UpdateTables } from '@/types/database';
import { isDemoMode, DEMO_COACHES, DEMO_COACH_STATS } from './demoData';

export type CoachInsert = InsertTables<'coaches'>;
export type CoachUpdate = UpdateTables<'coaches'>;

// In-memory store for demo mode mutations
let demoCoachOverrides: Coach[] | null = null;

function getDemoCoaches(): Coach[] {
  if (demoCoachOverrides === null) {
    demoCoachOverrides = [...DEMO_COACHES] as Coach[];
  }
  return demoCoachOverrides;
}

export const coachesService = {
  async getAll(gymId: string) {
    if (isDemoMode()) {
      return getDemoCoaches();
    }

    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('gym_id', gymId)
      .order('name');

    if (error) throw error;
    return data;
  },

  async getActive(gymId: string) {
    if (isDemoMode()) {
      return getDemoCoaches().filter(c => c.is_active);
    }

    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('gym_id', gymId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('coaches')
      .select(`
        *,
        members(id, name, avatar_url, activity_status),
        sessions(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(coach: CoachInsert) {
    if (isDemoMode()) {
      const newCoach = { ...coach, id: `demo-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), profile_id: null, avatar_url: null, rating: 0, sessions_this_month: 0, revenue_this_month: 0, client_count: 0, is_active: true } as Coach;
      getDemoCoaches().push(newCoach);
      return newCoach;
    }

    const { data, error } = await supabase
      .from('coaches')
      .insert(coach)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: CoachUpdate) {
    if (isDemoMode()) {
      const coaches = getDemoCoaches();
      const idx = coaches.findIndex(c => c.id === id);
      if (idx !== -1) {
        coaches[idx] = { ...coaches[idx], ...updates, updated_at: new Date().toISOString() } as Coach;
        return coaches[idx];
      }
      return { ...updates, id, updated_at: new Date().toISOString() } as Coach;
    }

    const { data, error } = await supabase
      .from('coaches')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    if (isDemoMode()) {
      const coaches = getDemoCoaches();
      const idx = coaches.findIndex(c => c.id === id);
      if (idx !== -1) coaches.splice(idx, 1);
      return;
    }

    const { error } = await supabase.from('coaches').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean) {
    if (isDemoMode()) {
      const coaches = getDemoCoaches();
      const idx = coaches.findIndex(c => c.id === id);
      if (idx !== -1) {
        coaches[idx] = { ...coaches[idx], is_active: isActive, updated_at: new Date().toISOString() } as Coach;
        return coaches[idx];
      }
      return { id, is_active: isActive } as Coach;
    }

    const { data, error } = await supabase
      .from('coaches')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPerformanceMetrics(coachId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('coach_id', coachId)
      .gte('start_time', startOfMonth.toISOString())
      .eq('status', 'completed');

    if (sessionsError) throw sessionsError;

    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id')
      .eq('coach_id', coachId);

    if (membersError) throw membersError;

    const totalRevenue = sessions?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;
    const totalSessions = sessions?.length || 0;

    return {
      sessionsThisMonth: totalSessions,
      revenueThisMonth: totalRevenue,
      clientCount: members?.length || 0,
      avgRevenuePerSession: totalSessions > 0 ? totalRevenue / totalSessions : 0,
    };
  },

  async getStats(gymId: string) {
    if (isDemoMode()) {
      return DEMO_COACH_STATS;
    }

    const { data, error } = await supabase
      .from('coaches')
      .select('is_active, client_count, revenue_this_month')
      .eq('gym_id', gymId);

    if (error) throw error;

    return {
      total: data.length,
      active: data.filter((c) => c.is_active).length,
      totalClients: data.reduce((sum, c) => sum + (c.client_count || 0), 0),
      totalRevenue: data.reduce((sum, c) => sum + (c.revenue_this_month || 0), 0),
    };
  },
};
