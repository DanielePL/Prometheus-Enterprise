import { supabase } from '@/lib/supabase';
import { settingsService } from '@/services/settings';
import type { MockSupabaseClient } from '@/test/supabase-mock';

const mockSupabase = supabase as unknown as MockSupabaseClient;

describe('settingsService', () => {
  beforeEach(() => {
    mockSupabase.__resetAll();
  });

  describe('getGym', () => {
    it('returns gym data by id', async () => {
      const gym = { id: 'gym-1', name: 'Test Gym', address: '123 Main St' };

      mockSupabase.__getBuilder('gyms').mockResult({ data: gym, error: null });

      const result = await settingsService.getGym('gym-1');

      expect(result).toEqual(gym);
      expect(mockSupabase.from).toHaveBeenCalledWith('gyms');
      const builder = mockSupabase.__getBuilder('gyms');
      expect(builder.select).toHaveBeenCalledWith('*');
      expect(builder.eq).toHaveBeenCalledWith('id', 'gym-1');
      expect(builder.single).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('gyms').mockResult({ data: null, error: dbError });

      await expect(settingsService.getGym('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('updateGym', () => {
    it('updates gym with provided fields and adds updated_at timestamp', async () => {
      const updatedGym = { id: 'gym-1', name: 'New Name', updated_at: '2026-02-24' };

      mockSupabase.__getBuilder('gyms').mockResult({ data: updatedGym, error: null });

      const result = await settingsService.updateGym('gym-1', { name: 'New Name' } as any);

      expect(result).toEqual(updatedGym);
      const builder = mockSupabase.__getBuilder('gyms');
      expect(builder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name',
          updated_at: expect.any(String),
        })
      );
      expect(builder.eq).toHaveBeenCalledWith('id', 'gym-1');
      expect(builder.select).toHaveBeenCalled();
      expect(builder.single).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('gyms').mockResult({ data: null, error: dbError });

      await expect(settingsService.updateGym('gym-1', {} as any)).rejects.toEqual(dbError);
    });
  });

  describe('getAllSettings', () => {
    it('converts array of {key, value} to an object', async () => {
      const rows = [
        { key: 'theme', value: 'dark' },
        { key: 'lang', value: 'en' },
        { key: 'timezone', value: 'UTC' },
      ];

      mockSupabase.__getBuilder('settings').mockResult({ data: rows, error: null });

      const result = await settingsService.getAllSettings('gym-1');

      expect(result).toEqual({ theme: 'dark', lang: 'en', timezone: 'UTC' });
      expect(mockSupabase.from).toHaveBeenCalledWith('settings');
      const builder = mockSupabase.__getBuilder('settings');
      expect(builder.select).toHaveBeenCalledWith('key, value');
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
    });

    it('returns empty object when no settings exist', async () => {
      mockSupabase.__getBuilder('settings').mockResult({ data: [], error: null });

      const result = await settingsService.getAllSettings('gym-1');
      expect(result).toEqual({});
    });

    it('returns empty object when data is null', async () => {
      mockSupabase.__getBuilder('settings').mockResult({ data: null, error: null });

      const result = await settingsService.getAllSettings('gym-1');
      expect(result).toEqual({});
    });

    it('throws on database error', async () => {
      const dbError = { code: '42P01', message: 'error' };
      mockSupabase.__getBuilder('settings').mockResult({ data: null, error: dbError });

      await expect(settingsService.getAllSettings('gym-1')).rejects.toEqual(dbError);
    });
  });

  describe('getSetting', () => {
    it('returns the value for a specific key', async () => {
      mockSupabase.__getBuilder('settings').mockResult({
        data: { value: 'dark' },
        error: null,
      });

      const result = await settingsService.getSetting('gym-1', 'theme');

      expect(result).toBe('dark');
      const builder = mockSupabase.__getBuilder('settings');
      expect(builder.select).toHaveBeenCalledWith('value');
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.eq).toHaveBeenCalledWith('key', 'theme');
      expect(builder.single).toHaveBeenCalled();
    });

    it('returns null on PGRST116 (not found)', async () => {
      mockSupabase.__getBuilder('settings').mockResult({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const result = await settingsService.getSetting('gym-1', 'nonexistent');
      // data is null on PGRST116, so data?.value is undefined
      expect(result).toBeUndefined();
    });

    it('throws on non-PGRST116 errors', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' };
      mockSupabase.__getBuilder('settings').mockResult({ data: null, error: dbError });

      await expect(settingsService.getSetting('gym-1', 'theme')).rejects.toEqual(dbError);
    });
  });

  describe('setSetting', () => {
    it('upserts a key-value pair with updated_at', async () => {
      const settingRow = { gym_id: 'gym-1', key: 'theme', value: 'dark', updated_at: '2026-02-24' };

      mockSupabase.__getBuilder('settings').mockResult({ data: settingRow, error: null });

      const result = await settingsService.setSetting('gym-1', 'theme', 'dark');

      expect(result).toEqual(settingRow);
      const builder = mockSupabase.__getBuilder('settings');
      expect(builder.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          gym_id: 'gym-1',
          key: 'theme',
          value: 'dark',
          updated_at: expect.any(String),
        }),
        { onConflict: 'gym_id,key' }
      );
      expect(builder.select).toHaveBeenCalled();
      expect(builder.single).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('settings').mockResult({ data: null, error: dbError });

      await expect(settingsService.setSetting('gym-1', 'theme', 'dark')).rejects.toEqual(dbError);
    });
  });

  describe('setMultipleSettings', () => {
    it('batch upserts from object entries', async () => {
      mockSupabase.__getBuilder('settings').mockResult({ data: null, error: null });

      await settingsService.setMultipleSettings('gym-1', {
        theme: 'dark',
        lang: 'en',
        timezone: 'UTC',
      });

      const builder = mockSupabase.__getBuilder('settings');
      expect(builder.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ gym_id: 'gym-1', key: 'theme', value: 'dark', updated_at: expect.any(String) }),
          expect.objectContaining({ gym_id: 'gym-1', key: 'lang', value: 'en', updated_at: expect.any(String) }),
          expect.objectContaining({ gym_id: 'gym-1', key: 'timezone', value: 'UTC', updated_at: expect.any(String) }),
        ]),
        { onConflict: 'gym_id,key' }
      );
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('settings').mockResult({ data: null, error: dbError });

      await expect(
        settingsService.setMultipleSettings('gym-1', { theme: 'dark' })
      ).rejects.toEqual(dbError);
    });
  });

  describe('deleteSetting', () => {
    it('deletes by gym_id and key', async () => {
      mockSupabase.__getBuilder('settings').mockResult({ data: null, error: null });

      await settingsService.deleteSetting('gym-1', 'theme');

      const builder = mockSupabase.__getBuilder('settings');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(builder.eq).toHaveBeenCalledWith('key', 'theme');
    });

    it('throws on database error', async () => {
      const dbError = { code: '42501', message: 'permission denied' };
      mockSupabase.__getBuilder('settings').mockResult({ data: null, error: dbError });

      await expect(settingsService.deleteSetting('gym-1', 'theme')).rejects.toEqual(dbError);
    });
  });
});
