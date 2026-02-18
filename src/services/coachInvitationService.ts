import { supabase } from '@/lib/supabase';
import type { CoachInvitation, CreateInvitationParams } from '@/types/coachInvitation';
import { isDemoMode, DEMO_COACH_INVITATIONS } from './demoData';
import { COACH_APP_URL } from '@/config/coachIntegration';

export const coachInvitationService = {
  /**
   * Create a new coach invitation.
   * Generates a secure random token, auto-revokes any previous pending
   * invitations for the same coach, and sets expiry to 7 days.
   */
  async create(params: CreateInvitationParams): Promise<CoachInvitation> {
    if (isDemoMode()) {
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return {
        id: `inv-demo-${Date.now()}`,
        gym_id: params.gym_id,
        coach_id: params.coach_id,
        token: 'demo-token-new-' + Date.now(),
        coach_name: params.coach_name,
        coach_email: params.coach_email,
        gym_name: params.gym_name,
        status: 'pending',
        expires_at: expiresAt,
        accepted_at: null,
        created_by: params.created_by,
        created_at: now,
        updated_at: now,
      };
    }

    // Generate a cryptographically secure 32-byte token, hex-encoded
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Auto-revoke any previous pending invitations for this coach
    await supabase
      .from('coach_invitations')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('coach_id', params.coach_id)
      .eq('gym_id', params.gym_id)
      .eq('status', 'pending');

    // Set expiry to 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('coach_invitations')
      .insert({
        gym_id: params.gym_id,
        coach_id: params.coach_id,
        token,
        coach_name: params.coach_name,
        coach_email: params.coach_email,
        gym_name: params.gym_name,
        status: 'pending',
        expires_at: expiresAt,
        created_by: params.created_by,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all invitations for a specific coach.
   */
  async getByCoach(coachId: string): Promise<CoachInvitation[]> {
    if (isDemoMode()) {
      return DEMO_COACH_INVITATIONS.filter((inv) => inv.coach_id === coachId);
    }

    const { data, error } = await supabase
      .from('coach_invitations')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all invitations for a gym.
   */
  async getAll(gymId: string): Promise<CoachInvitation[]> {
    if (isDemoMode()) {
      return DEMO_COACH_INVITATIONS;
    }

    const { data, error } = await supabase
      .from('coach_invitations')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Revoke a pending invitation by setting its status to 'revoked'.
   */
  async revoke(invitationId: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }

    const { error } = await supabase
      .from('coach_invitations')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('id', invitationId);

    if (error) throw error;
  },

  /**
   * Build the deep link URL that the coach uses to accept the invitation.
   */
  getInviteUrl(token: string): string {
    return `${COACH_APP_URL}/invite/${token}`;
  },
};
