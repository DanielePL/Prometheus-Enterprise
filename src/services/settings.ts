import { supabase } from '@/lib/supabase';
import type { Gym, Profile, InsertTables, UpdateTables, StaffRole } from '@/types/database';

export type GymUpdate = UpdateTables<'gyms'>;
export type ProfileUpdate = UpdateTables<'profiles'>;

export const settingsService = {
  // Get gym profile
  async getGym(gymId: string) {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .single();

    if (error) throw error;
    return data as Gym;
  },

  // Update gym profile
  async updateGym(gymId: string, updates: GymUpdate) {
    const { data, error } = await supabase
      .from('gyms')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gymId)
      .select()
      .single();

    if (error) throw error;
    return data as Gym;
  },

  // Upload gym logo
  async uploadLogo(gymId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${gymId}/logo.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('gym-logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gym-logos')
      .getPublicUrl(fileName);

    // Update gym with logo URL
    await settingsService.updateGym(gymId, { logo_url: publicUrl });

    return publicUrl;
  },

  // Get all staff members for a gym
  async getStaff(gymId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Profile[];
  },

  // Update staff member role
  async updateStaffRole(profileId: string, role: StaffRole) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Update staff member profile
  async updateStaff(profileId: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Remove staff from gym (set gym_id to null)
  async removeStaff(profileId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({
        gym_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    if (error) throw error;
  },

  // Get all settings for a gym (key-value store)
  async getAllSettings(gymId: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('gym_id', gymId);

    if (error) throw error;

    // Convert array to object
    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }
    return settings;
  },

  // Get a specific setting
  async getSetting<T = unknown>(gymId: string, key: string): Promise<T | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('gym_id', gymId)
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.value as T | null;
  },

  // Set a specific setting (upsert)
  async setSetting(gymId: string, key: string, value: unknown) {
    const { data, error } = await supabase
      .from('settings')
      .upsert(
        {
          gym_id: gymId,
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'gym_id,key' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Set multiple settings at once
  async setMultipleSettings(gymId: string, settings: Record<string, unknown>) {
    const rows = Object.entries(settings).map(([key, value]) => ({
      gym_id: gymId,
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('settings')
      .upsert(rows, { onConflict: 'gym_id,key' });

    if (error) throw error;
  },

  // Delete a setting
  async deleteSetting(gymId: string, key: string) {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('gym_id', gymId)
      .eq('key', key);

    if (error) throw error;
  },

  // Notification preferences helpers
  async getNotificationPreferences(gymId: string) {
    return this.getSetting<NotificationPreferences>(gymId, 'notification_preferences');
  },

  async setNotificationPreferences(gymId: string, preferences: NotificationPreferences) {
    return this.setSetting(gymId, 'notification_preferences', preferences);
  },
};

// Type definitions for settings
export interface NotificationPreferences {
  newMemberSignups: boolean;
  paymentAlerts: boolean;
  sessionReminders: boolean;
  marketingEmails: boolean;
}
