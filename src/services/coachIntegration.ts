import { supabase } from '@/lib/supabase';
import type { CoachIntegrationRow } from '@/types/database';
import type { CoachSummary, CoachClient, CoachWorkout, CoachProgram } from '@/types/coachIntegration';
import { isDemoMode, DEMO_COACH_INTEGRATIONS, DEMO_COACH_SUMMARIES, DEMO_COACH_CLIENTS, DEMO_COACH_WORKOUTS, DEMO_COACH_PROGRAMS } from './demoData';

export const coachIntegrationService = {
  async getIntegrations(gymId: string): Promise<CoachIntegrationRow[]> {
    if (isDemoMode()) {
      return DEMO_COACH_INTEGRATIONS as unknown as CoachIntegrationRow[];
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
    const { data, error } = await supabase
      .from('coach_integrations')
      .select('*')
      .eq('coach_id', coachId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async initiateLink(gymId: string, coachId: string, email: string): Promise<CoachIntegrationRow> {
    // Upsert integration record
    const { data: integration, error: upsertError } = await supabase
      .from('coach_integrations')
      .upsert({
        gym_id: gymId,
        coach_id: coachId,
        coach_app_email: email.toLowerCase(),
        status: 'pending',
      }, {
        onConflict: 'gym_id,coach_id',
      })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // Call verify edge function
    const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('coach-link-verify', {
      body: {
        integrationId: integration.id,
        email: email.toLowerCase(),
      },
    });

    if (verifyError) throw verifyError;

    // Refetch the updated integration
    const { data: updated, error: fetchError } = await supabase
      .from('coach_integrations')
      .select('*')
      .eq('id', integration.id)
      .single();

    if (fetchError) throw fetchError;
    return updated;
  },

  async unlinkCoach(integrationId: string): Promise<void> {
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

    const { data, error } = await supabase.functions.invoke('coach-data-bridge', {
      body: { coachAppUserId, dataType: 'summary' },
    });

    if (error) throw error;
    return data;
  },

  async getCoachClients(coachAppUserId: string): Promise<CoachClient[]> {
    if (isDemoMode()) {
      return DEMO_COACH_CLIENTS[coachAppUserId] || [];
    }

    const { data, error } = await supabase.functions.invoke('coach-data-bridge', {
      body: { coachAppUserId, dataType: 'clients' },
    });

    if (error) throw error;
    return data;
  },

  async getCoachWorkouts(coachAppUserId: string): Promise<CoachWorkout[]> {
    if (isDemoMode()) {
      return DEMO_COACH_WORKOUTS[coachAppUserId] || [];
    }

    const { data, error } = await supabase.functions.invoke('coach-data-bridge', {
      body: { coachAppUserId, dataType: 'workouts' },
    });

    if (error) throw error;
    return data;
  },

  async getCoachPrograms(coachAppUserId: string): Promise<CoachProgram[]> {
    if (isDemoMode()) {
      return DEMO_COACH_PROGRAMS[coachAppUserId] || [];
    }

    const { data, error } = await supabase.functions.invoke('coach-data-bridge', {
      body: { coachAppUserId, dataType: 'programs' },
    });

    if (error) throw error;
    return data;
  },
};
