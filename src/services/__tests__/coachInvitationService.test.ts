import { supabase } from '@/lib/supabase';
import { coachInvitationService } from '@/services/coachInvitationService';
import type { MockSupabaseClient } from '@/test/supabase-mock';

vi.mock('@/config/coachIntegration', () => ({
  COACH_APP_URL: 'https://test-coach.app',
}));

const mockSupabase = supabase as unknown as MockSupabaseClient;

// Stub crypto.getRandomValues so token generation is deterministic
vi.stubGlobal('crypto', {
  getRandomValues: (arr: Uint8Array) => {
    arr.fill(0xab);
    return arr;
  },
});

const expectedToken = 'ab'.repeat(32); // 32 bytes, each 0xab → "ab" hex

describe('coachInvitationService', () => {
  beforeEach(() => {
    mockSupabase.__resetAll();
  });

  describe('create', () => {
    const params = {
      gym_id: 'gym-1',
      coach_id: 'coach-1',
      coach_name: 'John Coach',
      coach_email: 'john@coach.app',
      gym_name: 'Test Gym',
      created_by: 'owner-1',
    };

    it('generates token, revokes old invitations, inserts new, and returns data', async () => {
      const invitation = {
        id: 'inv-1',
        ...params,
        token: expectedToken,
        status: 'pending',
        expires_at: '2026-03-03T00:00:00.000Z',
        accepted_at: null,
        created_at: '2026-02-24T00:00:00.000Z',
        updated_at: '2026-02-24T00:00:00.000Z',
      };

      // The update chain (revoke old) and insert chain use the same builder
      // since both call supabase.from('coach_invitations')
      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: invitation,
        error: null,
      });

      const result = await coachInvitationService.create(params);

      // Verify supabase.from was called for coach_invitations
      expect(mockSupabase.from).toHaveBeenCalledWith('coach_invitations');

      const builder = mockSupabase.__getBuilder('coach_invitations');

      // Verify the revoke step called update with revoked status
      expect(builder.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'revoked' }),
      );

      // Verify the insert step was called with the generated token and params
      expect(builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          gym_id: params.gym_id,
          coach_id: params.coach_id,
          token: expectedToken,
          coach_name: params.coach_name,
          coach_email: params.coach_email,
          gym_name: params.gym_name,
          status: 'pending',
          created_by: params.created_by,
        }),
      );

      // Verify select().single() were called on the insert chain
      expect(builder.select).toHaveBeenCalled();
      expect(builder.single).toHaveBeenCalled();

      expect(result).toEqual(invitation);
    });

    it('throws when insert returns an error', async () => {
      const dbError = { code: '23505', message: 'Unique violation' };
      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: null,
        error: dbError,
      });

      await expect(coachInvitationService.create(params)).rejects.toEqual(dbError);
    });
  });

  describe('getByCoach', () => {
    it('returns invitations for a given coach', async () => {
      const invitations = [
        { id: 'inv-1', coach_id: 'coach-1', status: 'pending' },
        { id: 'inv-2', coach_id: 'coach-1', status: 'accepted' },
      ];

      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: invitations,
        error: null,
      });

      const result = await coachInvitationService.getByCoach('coach-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('coach_invitations');
      const builder = mockSupabase.__getBuilder('coach_invitations');
      expect(builder.select).toHaveBeenCalledWith('*');
      expect(builder.eq).toHaveBeenCalledWith('coach_id', 'coach-1');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(invitations);
    });

    it('returns empty array when data is null', async () => {
      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: null,
        error: null,
      });

      const result = await coachInvitationService.getByCoach('coach-1');
      expect(result).toEqual([]);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: null,
        error: dbError,
      });

      await expect(coachInvitationService.getByCoach('coach-1')).rejects.toEqual(dbError);
    });
  });

  describe('getAll', () => {
    it('returns all invitations for a gym', async () => {
      const invitations = [
        { id: 'inv-1', gym_id: 'gym-1', status: 'pending' },
        { id: 'inv-2', gym_id: 'gym-1', status: 'revoked' },
      ];

      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: invitations,
        error: null,
      });

      const result = await coachInvitationService.getAll('gym-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('coach_invitations');
      const builder = mockSupabase.__getBuilder('coach_invitations');
      expect(builder.select).toHaveBeenCalledWith('*');
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(invitations);
    });

    it('returns empty array when data is null', async () => {
      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: null,
        error: null,
      });

      const result = await coachInvitationService.getAll('gym-1');
      expect(result).toEqual([]);
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: null,
        error: dbError,
      });

      await expect(coachInvitationService.getAll('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('revoke', () => {
    it('updates invitation status to revoked', async () => {
      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: null,
        error: null,
      });

      await coachInvitationService.revoke('inv-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('coach_invitations');
      const builder = mockSupabase.__getBuilder('coach_invitations');
      expect(builder.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'revoked' }),
      );
      expect(builder.eq).toHaveBeenCalledWith('id', 'inv-1');
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('coach_invitations').mockResult({
        data: null,
        error: dbError,
      });

      await expect(coachInvitationService.revoke('inv-1')).rejects.toEqual(dbError);
    });
  });

  describe('getInviteUrl', () => {
    it('returns the correct invite URL using COACH_APP_URL', () => {
      const url = coachInvitationService.getInviteUrl('abc123');
      expect(url).toBe('https://test-coach.app/invite/abc123');
    });

    it('includes the full token in the URL', () => {
      const token = 'deadbeef'.repeat(8);
      const url = coachInvitationService.getInviteUrl(token);
      expect(url).toBe(`https://test-coach.app/invite/${token}`);
    });
  });
});
