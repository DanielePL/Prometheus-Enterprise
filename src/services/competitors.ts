import { supabase } from '@/lib/supabase';
import { isDemoMode } from './demoData';
import { DEMO_COMPETITORS } from './locationDemoData';
import type { CompetitorData } from './locationDemoData';

export const competitorsService = {
  async getAll(gymId: string): Promise<CompetitorData[]> {
    if (isDemoMode()) {
      return DEMO_COMPETITORS;
    }

    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('gym_id', gymId)
      .order('name');

    if (error) throw error;
    return data as CompetitorData[];
  },

  async create(data: Omit<CompetitorData, 'id'> & { gym_id: string }): Promise<CompetitorData> {
    if (isDemoMode()) {
      // Return the input with a generated id for optimistic UI
      return { id: `comp-demo-${Date.now()}`, ...data } as CompetitorData;
    }

    const { data: result, error } = await supabase
      .from('competitors')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as CompetitorData;
  },

  async update(id: string, updates: Partial<CompetitorData>): Promise<CompetitorData> {
    if (isDemoMode()) {
      const existing = DEMO_COMPETITORS.find(c => c.id === id);
      return { ...existing, ...updates } as CompetitorData;
    }

    const { data, error } = await supabase
      .from('competitors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CompetitorData;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      return; // no-op in demo mode
    }

    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
