import { supabase } from '@/lib/supabase';
import type { CoachIntegrationRow } from '@/types/database';
import type { CoachSummary, CoachClient, CoachWorkout, CoachProgram } from '@/types/coachIntegration';
import { isDemoMode, DEMO_COACH_INTEGRATIONS, DEMO_COACH_SUMMARIES, DEMO_COACH_CLIENTS, DEMO_COACH_WORKOUTS, DEMO_COACH_PROGRAMS } from './demoData';

// In-memory store for demo mode mutations
let demoIntegrationOverrides: typeof DEMO_COACH_INTEGRATIONS | null = null;

function getDemoIntegrations() {
  if (demoIntegrationOverrides === null) {
    demoIntegrationOverrides = [...DEMO_COACH_INTEGRATIONS];
  }
  return demoIntegrationOverrides;
}

export const coachIntegrationService = {
  async getIntegrations(gymId: string): Promise<CoachIntegrationRow[]> {
    if (isDemoMode()) {
      return getDemoIntegrations() as unknown as CoachIntegrationRow[];
    }

    const { data, error } = await supabase
      .from('coach_integrations')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getIntegrationByCoach(coachId: string): Promise<CoachIntegrationRow | null> {
    if (isDemoMode()) {
      const integrations = getDemoIntegrations();
      return (integrations.find(i => i.coach_id === coachId) as unknown as CoachIntegrationRow) || null;
    }

    const { data, error } = await supabase
      .from('coach_integrations')
      .select('*')
      .eq('coach_id', coachId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async initiateLink(gymId: string, coachId: string, email: string): Promise<CoachIntegrationRow> {
    if (isDemoMode()) {
      const integrations = getDemoIntegrations();
      const existing = integrations.findIndex(i => i.coach_id === coachId && i.gym_id === gymId);
      const linked = {
        id: `demo-int-${Date.now()}`,
        gym_id: gymId,
        coach_id: coachId,
        coach_app_email: email.toLowerCase(),
        coach_app_user_id: `demo-user-${coachId}`,
        status: 'linked' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (existing !== -1) {
        integrations[existing] = linked;
      } else {
        integrations.push(linked);
      }
      return linked as unknown as CoachIntegrationRow;
    }

    // Look up coach profile in Coach app by email
    const { data: coachProfile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'coach')
      .ilike('full_name', `%${email.split('@')[0]}%`)
      .maybeSingle();

    // Upsert integration record
    const { data: integration, error: upsertError } = await supabase
      .from('coach_integrations')
      .upsert({
        gym_id: gymId,
        coach_id: coachId,
        coach_app_email: email.toLowerCase(),
        coach_app_user_id: coachProfile?.id || null,
        status: coachProfile ? 'linked' : 'pending',
      }, {
        onConflict: 'gym_id,coach_id',
      })
      .select()
      .single();

    if (upsertError) throw upsertError;
    return integration;
  },

  async unlinkCoach(integrationId: string): Promise<void> {
    if (isDemoMode()) {
      const integrations = getDemoIntegrations();
      const idx = integrations.findIndex(i => i.id === integrationId);
      if (idx !== -1) {
        integrations[idx] = { ...integrations[idx], status: 'unlinked', coach_app_user_id: null };
      }
      return;
    }

    const { error } = await supabase
      .from('coach_integrations')
      .update({
        status: 'unlinked',
        coach_app_user_id: null,
      })
      .eq('id', integrationId);

    if (error) throw error;
  },

  async getCoachSummary(coachAppUserId: string): Promise<CoachSummary> {
    if (isDemoMode()) {
      return DEMO_COACH_SUMMARIES[coachAppUserId] || { userId: coachAppUserId, email: '', fullName: 'Unknown', totalClients: 0, totalWorkouts: 0, totalPrograms: 0, activeSessions: 0, lastActivity: null };
    }

    // Fetch coach profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, specialization')
      .eq('id', coachAppUserId)
      .single();

    // Count clients
    const { count: clientCount } = await supabase
      .from('coach_clients')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', coachAppUserId);

    // Count workout templates
    const { count: workoutCount } = await supabase
      .from('workout_templates')
      .select('*', { count: 'exact', head: true })
      .or(`coach_id.eq.${coachAppUserId},user_id.eq.${coachAppUserId}`);

    // Count program templates
    const { count: programCount } = await supabase
      .from('program_templates')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', coachAppUserId);

    // Active coaching sessions
    const { count: sessionCount } = await supabase
      .from('coaching_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', coachAppUserId)
      .in('status', ['waiting', 'active']);

    // Last activity from coaching sessions
    const { data: lastSession } = await supabase
      .from('coaching_sessions')
      .select('started_at')
      .eq('coach_id', coachAppUserId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      userId: coachAppUserId,
      email: '',
      fullName: profile?.full_name || 'Unknown',
      totalClients: clientCount || 0,
      totalWorkouts: workoutCount || 0,
      totalPrograms: programCount || 0,
      activeSessions: sessionCount || 0,
      lastActivity: lastSession?.started_at || null,
    };
  },

  async getCoachClients(coachAppUserId: string): Promise<CoachClient[]> {
    if (isDemoMode()) {
      return DEMO_COACH_CLIENTS[coachAppUserId] || [];
    }

    // Query coach_clients joined with profiles
    const { data, error } = await supabase
      .from('coach_clients')
      .select(`
        id,
        created_at,
        status,
        client:profiles!coach_clients_client_id_fkey(id, full_name)
      `)
      .eq('coach_id', coachAppUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get last session per client
    const clientIds = (data || []).map((d: any) => d.client?.id).filter(Boolean);
    const sessionMap: Record<string, string> = {};
    if (clientIds.length > 0) {
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('client_id, started_at')
        .eq('coach_id', coachAppUserId)
        .in('client_id', clientIds)
        .order('started_at', { ascending: false });

      for (const s of sessions || []) {
        if (!sessionMap[s.client_id]) sessionMap[s.client_id] = s.started_at;
      }
    }

    return (data || []).map((d: any) => ({
      id: d.client?.id || d.id,
      name: d.client?.full_name || 'Unknown',
      email: '',
      status: d.status || 'active',
      startDate: d.created_at,
      lastSession: sessionMap[d.client?.id] || null,
    }));
  },

  async getCoachWorkouts(coachAppUserId: string): Promise<CoachWorkout[]> {
    if (isDemoMode()) {
      return DEMO_COACH_WORKOUTS[coachAppUserId] || [];
    }

    const { data, error } = await supabase
      .from('workout_templates')
      .select('id, name, sports, description, created_at, default_level')
      .or(`coach_id.eq.${coachAppUserId},user_id.eq.${coachAppUserId}`)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Count exercises per template
    const templateIds = (data || []).map(d => d.id);
    const exerciseCounts: Record<string, number> = {};
    if (templateIds.length > 0) {
      const { data: exercises } = await supabase
        .from('workout_template_exercises')
        .select('workout_template_id')
        .in('workout_template_id', templateIds);

      for (const e of exercises || []) {
        exerciseCounts[e.workout_template_id] = (exerciseCounts[e.workout_template_id] || 0) + 1;
      }
    }

    return (data || []).map(d => ({
      id: d.id,
      title: d.name,
      type: d.sports?.[0] || d.default_level || 'general',
      duration: 0,
      exerciseCount: exerciseCounts[d.id] || 0,
      createdAt: d.created_at,
    }));
  },

  async getCoachPrograms(coachAppUserId: string): Promise<CoachProgram[]> {
    if (isDemoMode()) {
      return DEMO_COACH_PROGRAMS[coachAppUserId] || [];
    }

    const { data, error } = await supabase
      .from('program_templates')
      .select('id, name, description, duration_weeks, days_per_week, created_at')
      .eq('created_by', coachAppUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      title: d.name,
      description: d.description || '',
      weekCount: d.duration_weeks || 0,
      clientCount: 0,
      createdAt: d.created_at,
    }));
  },
};
